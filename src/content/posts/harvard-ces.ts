import type { BlogPost } from '../types'

const post: BlogPost = {
  id: 'harvard-ces',
  title: 'Resume guidance, summarized: Harvard Career Services',
  summary:
    'The principles Harvard FAS Career Services emphasizes for resumes — distilled into a checklist you can apply directly in Underleaf.',
  tags: ['guide', 'principles', 'harvard'],
  source: {
    label: 'Harvard FAS Mignone Center for Career Success',
    url: 'https://careerservices.fas.harvard.edu/resources/create-a-resume/',
  },
  updatedAt: '2026-06-16',
  body: `# Resume guidance, summarized: Harvard Career Services

Harvard's career services guidance has stayed remarkably stable for two decades. The core thesis: a resume is a **scannable proof artifact**, not a biography. Reviewers spend ~30 seconds in the first pass. Treat every line like an exhibit in a courtroom — relevant, dated, and supported by a concrete fact.

> This is an original summary of public guidance. Read the canonical guide via the source link above.

## The non-negotiables

- **One page** until your career has more than 8–10 years of relevant experience. Two pages only when you have stories that won't fit, not as a default.
- **Reverse-chronological** within each section. Most relevant section first — for current students that's Education; for working professionals, Experience.
- **Consistent date formatting** throughout. Pick one (e.g. \`Sept 2023 – Present\`) and stick with it.
- **Action verb, then result, then mechanism.** Lead with a strong verb; quantify the outcome; close with the technique or tool that produced it.

## What every bullet must contain

The Harvard model treats each bullet as a tiny PAR (Problem / Action / Result):

1. **Action verb** — past tense for completed work, present tense for current.
2. **Quantified result** — number, percentage, scale, dollars, frequency.
3. **Context** — for whom, against what constraint, with what stack.

A weak line:

> Responsible for improving the deployment pipeline.

A Harvard-style rewrite:

> Cut deployment failure rate 60% by migrating CI from shell scripts to Buildkite, owning rollout for 14 services and ~120 daily deploys.

The verb is stronger (\`Cut\`), the result is quantified (\`60%\`), the context is specific (\`14 services, 120 daily deploys\`).

## What to omit

- **Pronouns.** Resume bullets are subject-elided. "I" and "we" don't appear.
- **Generic objective statements.** Replace with a one-line skills summary if you keep anything at the top.
- **References available on request.** Assumed.
- **Tools that everyone has.** "Microsoft Word", "Email". Reserve the skills section for differentiators.

## Applying this in Underleaf

- Use the **ATS Hints** tab to catch weak verbs and unquantified bullets.
- Use the **JD Match** tab to surface the company-specific keywords each bullet should land on.
- Switch templates (Jake's, Awesome-CV, RenderCV Modern) to test which density of information fits your story on a single page.
- Use **Rewrite for impact** (\`Cmd/Ctrl + Alt + R\`) on individual bullets to tighten with a strong verb.

## What to drop after revision

After one full revision pass with the AI assistant, re-read each section and ask:

- Could a reviewer skim this in 6 seconds and tell what I did?
- Does every bullet survive the "so what?" test — would removing it weaken my candidacy?

If a line doesn't earn its space, cut it.
`,
}

export default post
