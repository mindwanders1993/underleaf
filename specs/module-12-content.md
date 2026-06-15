# module-12-content — In-app Learn (blog) with resume-fine-tuning + AI prompt cookbook

## Goal

Ship the content layer the user flagged as load-bearing for product differentiation: an in-app **Learn** drawer with curated posts on resume writing (Harvard CES summary, Stanford BEAM summary) and an AI prompt cookbook for Underleaf's rewrite features. Content is treated as a feature, not as marketing — accessible from the FileTree footer like the AI Assist / Backup drawers.

No external router. Lazy-loaded so the blog code stays out of the main bundle.

## Acceptance criteria

- [ ] `src/content/types.ts` exports `BlogPost` (`id`, `title`, `tags`, `source`, `updatedAt`, `summary`, `body` markdown string).
- [ ] `src/content/posts/*.ts` — three posts:
  - `harvard-ces.ts` — original summary of Harvard FAS Career Services resume guidance (NOT a copy of the original).
  - `stanford-beam.ts` — original summary of Stanford BEAM resume guidance.
  - `ai-prompt-cookbook.ts` — copy-paste prompts users can drop into the JD Match / Settings UI.
- [ ] `src/content/registry.ts` — `listPosts()` (sorted by `updatedAt` desc) + `getPost(id)`.
- [ ] `src/components/learn/LearnDrawer.tsx` — right-side drawer (~720px wide). Left rail shows post list with tags; right pane shows selected post markdown rendered by `react-markdown`. Esc closes; focus restoration to trigger.
- [ ] LearnDrawer + react-markdown are **lazy-loaded** via `React.lazy` inside FileTree's mount point so the main bundle doesn't grow.
- [ ] Every post body is rendered as markdown; external links open in a new tab with `rel="noopener noreferrer"`.
- [ ] `FileTree` footer adds a "Learn" button with `BookOpen` icon.
- [ ] `npm run lint`, `npm run build` clean. Main bundle growth ≤ 3 KB. Lazy chunk for the drawer is bounded but acceptable (react-markdown + remark are ~70 KB).
- [ ] Vitest covers: registry sort + lookup; LearnDrawer renders list, switches to detail, Esc closes; FileTree Learn button toggles the drawer.

## Files to touch

- `package.json` — add `react-markdown`.
- `src/content/types.ts` — new.
- `src/content/posts/harvard-ces.ts` — new.
- `src/content/posts/stanford-beam.ts` — new.
- `src/content/posts/ai-prompt-cookbook.ts` — new.
- `src/content/registry.ts` — new.
- `src/content/registry.test.ts` — new.
- `src/components/learn/LearnDrawer.tsx` — new.
- `src/components/learn/LearnDrawer.css` — new.
- `src/components/learn/LearnDrawer.test.tsx` — new.
- `src/components/sidebar/FileTree.tsx` — Learn button + lazy mount.
- `docs/LLD.md` — new §2.21 Content layer.

## Reuse first

- `src/components/ai/AssistantDrawer.css` is the visual reference for the drawer pattern; replicate the same anchor + tabs aesthetic where useful, but keep `LearnDrawer.css` separate.
- Existing key-handler pattern (`useEffect` for `Escape`, focus restoration via parent's trigger ref).
- Lucide icons: `BookOpen` (button), `ArrowLeft` (back-to-list), `ExternalLink` (source link), `X` (close).

## Content / attribution

- Posts contain **original prose summaries** of public best-practice guidance attributed to Harvard CES and Stanford BEAM. Each post links to the canonical source for the user to verify and read in full.
- AI prompt cookbook is original content — copy-paste recipes tuned for our LLM rewrite paths.

## Risks / open questions

- **react-markdown bundle hit**: ~70 KB minified+gzipped for react-markdown + remark. Lazy split keeps it out of the main bundle; only loaded when the user first opens Learn.
- **Image / table support**: react-markdown default plugins handle headings, lists, code, bold/italic, links. No images or tables in v1 posts; if needed, add `remark-gfm` later.
- **Routing**: no router added. Future deep-linkability to a specific post (e.g. `?post=harvard-ces`) is a small follow-up.
- **Content rot**: when the source guides change, our summaries should be updated. Each post has `updatedAt` to track this.
