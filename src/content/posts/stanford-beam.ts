import type { BlogPost } from '../types'

const post: BlogPost = {
  id: 'stanford-beam',
  title: 'Translating academic experience: Stanford BEAM',
  summary:
    'How Stanford BEAM frames the resume for students and early-career candidates moving from coursework into industry — and how to apply it inside Underleaf.',
  tags: ['guide', 'early-career', 'stanford'],
  source: {
    label: 'Stanford BEAM (Career Education)',
    url: 'https://beam.stanford.edu/students/career-resources/resume-cover-letter',
  },
  updatedAt: '2026-06-16',
  body: `# Translating academic experience: Stanford BEAM

Stanford BEAM emphasizes **translation**: turning research, coursework, and student-org work into language a hiring manager already understands. Most early-career candidates undersell this work because they describe what they *did* in academic vocabulary instead of what they *produced* in industry vocabulary.

> This is an original summary of public guidance. Read the canonical guide via the source link above.

## The translation pattern

Pick the strongest bullet from a coursework project. Run it through this pattern:

- **Problem stated as a constraint** — what was the brief? What was off-limits?
- **Approach in plain language** — strip the academic jargon; use the words a senior engineer would use in a Slack message.
- **Outcome with proof** — even synthetic outcomes count if you can show evidence (a passing rubric, a public demo, a paper grade if relevant).
- **Skills surfaced naturally** — names of languages, libraries, statistical methods, hardware should appear inside the sentence, not pinned to a separate list.

A pre-translation bullet:

> CS 229 final project on convolutional neural networks for image classification.

A translation:

> Built a CNN-based image classifier for plant disease detection (PyTorch, 12k images), reaching 91% F1 across 38 classes — graded top 5% of CS 229 cohort.

## What BEAM prioritizes for early-career resumes

1. **A short Skills section** above the fold — language list (TypeScript, Go, Python), then methods (statistics, signal processing), then tools (Postgres, Docker). Saves the reader from inferring.
2. **Project narratives** that explicitly say "built", "deployed", "shipped", "published" — verbs from the industry vocabulary.
3. **Numbers that translate well**: dataset size, user reach, performance gain, test coverage, model accuracy, runtime change.
4. **Collaboration framing**: when the work was a group project, lead with the part *you* owned. The bullet should still read as a personal accomplishment, not a team summary.

## A common mistake

Listing coursework in a "Relevant Coursework" subsection without translation. BEAM's framing: if a class taught you a skill that matters, that skill belongs in a project bullet under Experience or Projects, not as a course name.

## Applying this in Underleaf

- In structured mode, use **\`projects\`** entries for substantive coursework / hackathon / open-source work. Treat each like a mini-job.
- The **Skills section** in the renderer surfaces the technologies — name them precisely (\`React 19\`, \`Pandas 2.x\`) when version matters; otherwise stick to canonical names.
- Use **JD Match** to surface specific terms the company expects — these are often the words BEAM is asking you to translate into.
- After each Apply, run **ATS Hints** again; the heuristic catches bullets that drift back into academic vocabulary.

## When you're not sure if a bullet matters

Three quick tests adapted from BEAM-style review:

- Could you defend this bullet in 60 seconds in an interview?
- Does it map cleanly to at least one bullet point in the JD?
- Does it survive the substitution of any classmate's name — i.e. is the achievement still uniquely yours?

If all three answers are yes, keep it. If two or three are no, replace it.
`,
}

export default post
