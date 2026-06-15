import type { BlogPost } from '../types'

const post: BlogPost = {
  id: 'ai-prompt-cookbook',
  title: 'AI prompt cookbook for Underleaf',
  summary:
    'Drop-in prompts and patterns that get more from the JD Match, ATS Hints, and Rewrite for impact features — including how to chain them.',
  tags: ['ai', 'prompts', 'workflow'],
  updatedAt: '2026-06-16',
  body: `# AI prompt cookbook for Underleaf

These are battle-tested patterns for getting more from Underleaf's AI features. Use them as starting points — the strongest prompts are the ones you tune against your own results.

## How Underleaf calls your LLM

- **ATS Hints** — pure local heuristic. No LLM, no key needed.
- **JD Match** — sends a strict-JSON system prompt with your resume + JD; expects scored gaps + bullet rewrites back.
- **Rewrite for impact** (\`Cmd/Ctrl + Alt + R\`) — sends the selected line (or current line) and asks for a single rewritten line.
- **Provider** — Google Gemini or local Ollama. Bring your own key for Gemini; point Ollama at \`http://localhost:11434\` after \`ollama serve\`.

## Prompt: quantify a vague bullet

In raw mode, select the line, then \`Cmd/Ctrl + Alt + R\`. If the bullet is vague the rewrite will improve but might still miss numbers. Then paste this into JD Match (with no JD) as an experiment:

\`\`\`
Rewrite this bullet to lead with a strong verb and include at least one concrete number. Stay
factual to what's described. Return ONLY the rewritten line.

Bullet: "<paste your bullet>"
\`\`\`

## Prompt: tailor for a specific JD without a full Analyze

Sometimes you want one bullet tailored, not a whole resume scored. From the Settings tab, hit Test Connection (it sends a sanity ping) — then in Rewrite for impact, select the bullet and let the model rewrite. For sharper tailoring, paste both the bullet and the JD into a structured prompt and run it manually until the inline "apply suggestion" path covers JD context (planned).

\`\`\`
Job description:
"""
<paste 3–5 lines from the JD that matter most>
"""

Bullet to rewrite:
"<paste the bullet>"

Rewrite the bullet so it lands on at least one explicit JD term, leads with an action verb,
and includes a number. Return ONLY the rewritten line.
\`\`\`

## Prompt: translate academic into industry language

For early-career candidates moving out of school. Paste into a JD Match-style request (no JD needed):

\`\`\`
Translate this academic / coursework experience into industry-style resume language. Keep the
same factual core but use industry vocabulary (built, shipped, deployed, designed). Quantify
where possible. Return ONLY the translated bullet.

Source: "<paste your raw description>"
\`\`\`

## Prompt: extract keywords from a JD

If the JD Match score is low, the gap analysis usually points at missing keywords. To do this manually before applying:

\`\`\`
Extract the 8–12 most load-bearing keywords from this job description — technologies, methods,
soft skills, scope words. Return as a JSON array of strings.

JD:
"""
<paste JD>
"""
\`\`\`

## Workflow: a 15-minute polish pass

1. Open ATS Hints — fix every error (red) before anything else. These are showstoppers.
2. Open JD Match — paste the JD, hit Analyze. Apply the suggestions whose original bullets you can defend in 30 seconds in an interview.
3. Scroll through Monaco in raw mode; on any remaining weak bullet, select + \`Cmd/Ctrl + Alt + R\`.
4. Re-run ATS Hints. The warning count should be lower.
5. Compile. Re-run JD Match against the same JD. Score should move up by at least 10 points.

If the score doesn't move, the gaps are structural (missing experience), not surface-level — at that point it's not a resume problem, it's a story-and-experience problem, and the AI can't fix it for you.

## Privacy note

Underleaf never sends your data anywhere except directly to the LLM provider you configured. No proxy, no telemetry. Your API key lives in localStorage on this device. Clear it from the Settings tab any time.
`,
}

export default post
