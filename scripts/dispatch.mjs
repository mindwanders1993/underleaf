#!/usr/bin/env node
// Underleaf agent fleet dispatcher.
// Reads WorkItems from agent_queue/in, routes to the right worker, writes WorkResults to agent_queue/out.
// Intentionally framework-free: plain Node, child_process.spawn, JSON files.

import { readdir, readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { existsSync, createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, join, basename } from "node:path";
import { argv, exit } from "node:process";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const IN_DIR = join(ROOT, "agent_queue/in");
const OUT_DIR = join(ROOT, "agent_queue/out");
const LOG_DIR = join(ROOT, "agent_queue/logs");
const DONE_DIR = join(ROOT, "agent_queue/in/.done");

const args = new Set(argv.slice(2));
const FLAG_WATCH = args.has("--watch");
const FLAG_DRY = args.has("--dry");
const FLAG_HELP = args.has("--help") || args.has("-h");
const onlyIdx = argv.indexOf("--only");
const ONLY_TYPE = onlyIdx > -1 ? argv[onlyIdx + 1] : null;

if (FLAG_HELP) {
  console.log(`Underleaf dispatcher

Usage: node scripts/dispatch.mjs [--watch] [--only <type>] [--dry] [--help]

  --watch       poll forever (1s interval)
  --only TYPE   process only items of TYPE (spec|execute|test|review|docs|graphify|ship)
  --dry         print routing decisions without executing
  --help, -h    show this help

WorkItems live in agent_queue/in/<id>.json.
Results land in agent_queue/out/<id>.result.json with full logs in agent_queue/logs/<id>.log.
`);
  exit(0);
}

// Each worker is a CLI command builder: (item) => { cmd, args, env? }.
// Implementations are intentionally minimal stubs — they shell out to the real tools
// (aider, gemini, gh, claude) using parameters from the WorkItem. Tune per your local setup.
const WORKERS = {
  spec: (item) => ({
    cmd: "gemini",
    args: [
      "--model",
      item.model_hint ?? "gemini-2.5-pro",
      "--prompt-file",
      ".claude/agents/spec.md",
      "--input",
      JSON.stringify({ module: item.module, spec_path: item.spec_path }),
    ],
  }),
  execute: (item) => ({
    cmd: "aider",
    args: [
      "--architect",
      "--model",
      item.model_hint ?? "gemini/gemini-2.5-pro",
      "--editor-model",
      "gemini/gemini-2.5-flash",
      "--test-cmd",
      (item.success_criteria ?? ["npm run lint && npm run build"]).join(" && "),
      "--auto-test",
      "--yes",
      "--message-file",
      item.spec_path,
    ],
  }),
  test: (item) => ({
    cmd: "aider",
    args: [
      "--model",
      item.model_hint ?? "ollama/qwen3-coder",
      "--message",
      `Write Vitest + Playwright tests for ${item.spec_path}. Cover all acceptance criteria.`,
    ],
  }),
  review: (item) => ({
    cmd: "gemini",
    args: [
      "--model",
      item.model_hint ?? "gemini-2.5-pro",
      "--prompt-file",
      ".claude/agents/review.md",
      "--input",
      JSON.stringify({ branch: item.branch }),
    ],
  }),
  docs: (item) => ({
    cmd: "gemini",
    args: [
      "--model",
      item.model_hint ?? "gemini-2.5-flash",
      "--prompt-file",
      ".claude/agents/docs.md",
      "--input",
      JSON.stringify({ module: item.module }),
    ],
  }),
  graphify: () => ({
    cmd: "claude",
    args: ["--print", "/graphify"],
  }),
  ship: (item) => ({
    cmd: "bash",
    args: [
      join(ROOT, "scripts/ship.sh"),
      item.branch,
      item.module ?? "agent-fleet",
    ],
  }),
};

async function ensureDirs() {
  for (const d of [IN_DIR, OUT_DIR, LOG_DIR, DONE_DIR]) {
    if (!existsSync(d)) await mkdir(d, { recursive: true });
  }
}

async function loadWorkItems() {
  const entries = await readdir(IN_DIR, { withFileTypes: true });
  const items = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".json")) continue;
    const path = join(IN_DIR, e.name);
    try {
      const item = JSON.parse(await readFile(path, "utf8"));
      item.__path = path;
      items.push(item);
    } catch (err) {
      console.error(`[dispatch] cannot parse ${e.name}: ${err.message}`);
    }
  }
  return items;
}

function depsResolved(item, completedIds) {
  return (item.depends_on ?? []).every((id) => completedIds.has(id));
}

async function runWorker(item) {
  const builder = WORKERS[item.type];
  if (!builder) {
    return { status: "fail", summary: `unknown worker type: ${item.type}`, log_path: null };
  }
  const { cmd, args: workerArgs, env } = builder(item);
  const logPath = join(LOG_DIR, `${item.id}.log`);

  if (FLAG_DRY) {
    console.log(`[dry] ${item.id} ${item.type} -> ${cmd} ${workerArgs.join(" ")}`);
    return { status: "ok", summary: "dry-run", log_path: logPath };
  }

  console.log(`[dispatch] ${item.id} ${item.type} -> ${cmd}`);
  const log = createWriteStream(logPath, { flags: "a" });
  log.write(`# ${new Date().toISOString()} ${cmd} ${workerArgs.join(" ")}\n`);

  return await new Promise((resolveRun) => {
    const child = spawn(cmd, workerArgs, {
      cwd: ROOT,
      env: { ...process.env, ...(env ?? {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    child.on("error", (err) => {
      log.write(`\n[spawn-error] ${err.message}\n`);
      log.end();
      resolveRun({
        status: "fail",
        summary: `spawn error: ${err.message}`,
        log_path: logPath,
      });
    });
    child.on("close", (code) => {
      log.end();
      resolveRun({
        status: code === 0 ? "ok" : "fail",
        summary: code === 0 ? `${item.type} succeeded` : `${item.type} exited ${code}`,
        log_path: logPath,
        exit_code: code,
      });
    });
  });
}

function nextAction(item, status) {
  if (status !== "ok") return "retry";
  switch (item.type) {
    case "spec": return "execute";
    case "execute": return "review";
    case "test": return "review";
    case "review": return "ship";
    case "ship": return "done";
    case "docs":
    case "graphify": return "done";
    default: return "done";
  }
}

async function writeResult(item, run) {
  const result = {
    id: item.id,
    type: item.type,
    status: run.status,
    artifacts: [],
    log_path: run.log_path,
    next_action: nextAction(item, run.status),
    summary: run.summary,
    started_at: item.__started,
    finished_at: new Date().toISOString(),
  };
  await writeFile(
    join(OUT_DIR, `${item.id}.result.json`),
    JSON.stringify(result, null, 2),
  );
  // Move processed item out of the inbox so it isn't re-run.
  if (existsSync(item.__path)) {
    await rename(item.__path, join(DONE_DIR, basename(item.__path)));
  }
  console.log(`[dispatch] ${item.id} -> ${run.status} (next: ${result.next_action})`);
}

async function tick() {
  const items = await loadWorkItems();
  if (!items.length) return 0;

  const doneOut = await readdir(OUT_DIR);
  const completed = new Set(
    doneOut.filter((f) => f.endsWith(".result.json")).map((f) => f.replace(".result.json", "")),
  );

  let processed = 0;
  for (const item of items) {
    if (ONLY_TYPE && item.type !== ONLY_TYPE) continue;
    if (!depsResolved(item, completed)) {
      console.log(`[dispatch] ${item.id} waiting on deps`);
      continue;
    }
    item.__started = new Date().toISOString();
    const run = await runWorker(item);
    await writeResult(item, run);
    completed.add(item.id);
    processed++;
  }
  return processed;
}

await ensureDirs();
if (FLAG_WATCH) {
  console.log("[dispatch] watching agent_queue/in (1s interval). ctrl+c to quit.");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick();
    await new Promise((r) => setTimeout(r, 1000));
  }
} else {
  const n = await tick();
  console.log(`[dispatch] processed ${n} item(s).`);
}
