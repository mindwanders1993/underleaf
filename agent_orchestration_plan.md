# Underleaf Agent Orchestration & Loop Engineering Plan

Based on the project's existing architecture and development plans, this document defines the multi-agent orchestration strategy, setup instructions, prompts, and "loop engineering" workflows to build the **Underleaf** application. This approach is heavily inspired by Andrej Karpathy's "spec-driven" development and agentic engineering principles.

## User Review Required
> [!IMPORTANT]
> Please review the agent setup, tools, and prompts below. Once approved, we will begin executing the `development_plan.md` using this orchestrated approach.

## Open Questions
> [!WARNING]  
> 1. Do you already have a script for the Local GitHub Agent, or would you like me to write a Python/Bash script that uses your local LLM to automate the Git/PR loop?  
> 2. For `opencode`, do you have the CLI already installed and configured with your API keys for `minimax-m3:cloud`?  
> 3. Which agent do you want to assign to **Module 0: Setup & Scaffolding** first? I recommend `aider` or I can execute it directly if you prefer.

---

## 1. Agent Roster & Architecture

We are treating software development as an autonomous system (Loop Engineering) rather than one-off prompting.

1. **The Orchestrator (Gemini 3.1 Pro)**: That's me. I maintain the global context (`GEMINI.md`, `CLAUDE.md`, AST via Graphify), break down the `development_plan.md` into atomic specs, and review the outcomes.
2. **The Primary Executor (`aider`)**: The workhorse. Runs in a local loop, executing changes across multiple files and running linters/compilers to self-correct.
3. **The Specialists (`opencode` + `qwen3-coder`)**: Used for "vibe coding" UI components or solving specific algorithms. 
4. **The GitHub Agent (Local LLM)**: A background process that watches the git status, formats commits according to project rules, pushes to branches, and raises PRs.

---

## 2. Setup Instructions & CLI Guides

### Aider Setup
Aider is excellent for "loop engineering" because it can run your build commands and self-correct errors.
```bash
# Install aider
python -m pip install aider-chat

# Run aider with a specific test command to enable the self-correction loop
aider --model openrouter/anthropic/claude-3.5-sonnet --test "npm run lint && npm run build"
```

### OpenCode & OpenRouter Setup
For `minimax-m3:cloud` and `qwen3-coder`, you will use OpenCode or Aider with OpenRouter routing.
```bash
# To use OpenCode with minimax
opencode --model minimax-m3:cloud "Your prompt here"

# To use Qwen3-Coder via Aider
aider --model openrouter/qwen/qwen-3-coder-instruct
```

---

## 3. Loop Engineering Workflow (The Karpathy Method)

Instead of manually coding, you will act as the **Manager**. The workflow follows these steps:

1. **Intent & Spec Generation**: I (Gemini) will read the `development_plan.md` and generate a strict, context-rich prompt for the target module.
2. **Execution Loop**: You copy the prompt into `aider` or `opencode`. The agent writes the code and runs the verification command (e.g., `npm run build`).
3. **Observation & Adjustment**: If it fails, the agent reads the error and fixes it. If it succeeds, it stops.
4. **Version Control Loop**: The Local GitHub Agent observes the clean working tree, creates a branch, commits, and PRs.

---

## 4. Agent Prompts

### Prompt for Aider / OpenCode (Executor Prompt)
When assigning a module to a worker agent, use this template (I will generate the specific `[MODULE_DETAILS]` for each step):

> **System Context**: Read `CLAUDE.md` and `GEMINI.md` for architectural rules. We are building Underleaf, a browser-based LaTeX editor. 
> 
> **Task**: [MODULE_DETAILS - e.g., Implement Module 1: Layout & Core Workspace UI]
> 
> **Constraints**: 
> - Use React 18, Vite, and Vanilla CSS (No Tailwind). 
> - Maintain the mint green (`#6EE7B7`) and dark navy (`#0A0E1A`) aesthetic.
> - Ensure mobile responsiveness.
> 
> **Verification**: Run `npm run lint` and `npm run build`. Do not stop until the build succeeds with 0 errors.

### Prompt for Local GitHub Agent
If you are building a wrapper script for your local LLM to handle Git operations, use this system prompt:

> **Role**: You are an autonomous Git management agent.
> **Task**: Review the output of `git diff` and `git status`. 
> 1. Determine the appropriate branch name based on the changes (e.g., `feat/monaco-integration`, `fix/pdf-viewer`).
> 2. If not on that branch, output the command to create and checkout that branch from `dev`.
> 3. Generate a conventional commit message following `CLAUDE.md` (e.g., `feat(editor): add monaco wrapper`).
> 4. Generate a PR Title and PR Description outlining the changes, why they were made, and how they map to the `development_plan.md`.

---

## 5. Branching Strategy Integration

As defined in your `development_plan.md`, the Git loop operates strictly on:
- `main`: Production
- `dev`: Integration branch
- `feat/*`, `fix/*`, `docs/*`: Ephemeral worker branches

**The PR Loop**:
1. Your local Git Agent creates `feat/module-0-setup` from `dev`.
2. Aider completes the scaffold and verifies the build.
3. Git Agent commits: `feat(core): scaffold vite react app`.
4. Git Agent pushes to `origin feat/module-0-setup` and generates the PR payload.
5. You (the Human Architect) merge via GitHub UI after a final vibe check.

## Verification Plan

### Automated Verification
- We will rely on Aider's `--test` flag to enforce `npm run build` and `npm run lint` on every execution loop.
- The Git agent will only commit if the working directory passes verification.

### Manual Verification
- Once a PR is raised by the GitHub Agent, you will open the preview deployment (via Cloudflare Pages PR previews) or test locally using `npm run dev` to verify the UI aesthetics match the design documents before merging.
