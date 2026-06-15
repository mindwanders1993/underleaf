#!/usr/bin/env bash
# ship.sh — branch+commit+push+PR helper used by the ship worker.
# Usage: scripts/ship.sh <branch> <module-slug>
# Pre: working tree has the changes to ship, current branch is the work branch.
# Per CLAUDE.md: NEVER merges, NEVER targets main, NEVER --no-verify.

set -euo pipefail

BRANCH="${1:?branch name required}"
MODULE="${2:-work}"

if ! command -v gh >/dev/null 2>&1; then
  echo "[ship] gh CLI not installed" >&2
  exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "$BRANCH" ]]; then
  echo "[ship] expected to be on $BRANCH, currently on $current_branch" >&2
  exit 1
fi

if ! git diff --cached --quiet || ! git diff --quiet; then
  echo "[ship] staging and committing pending changes"
  git add -A
  git commit -m "chore($MODULE): agent worker auto-commit

Co-Authored-By: Underleaf Agent Fleet <noreply@underleaf.dev>"
fi

git push -u origin "$BRANCH"

# Title/body for PR — base is always dev per CLAUDE.md.
TITLE="chore($MODULE): ship $BRANCH"
BODY=$(cat <<EOF
Automated PR opened by the ship worker.

Branch: \`$BRANCH\`
Module: \`$MODULE\`

Review checklist:
- [ ] Lint + build clean
- [ ] CLAUDE.md invariants respected
- [ ] Scope is surgical (no drive-by changes)
- [ ] Tests added or updated

The ship worker NEVER merges. Merge via GitHub UI after review.
EOF
)

PR_URL=$(gh pr create --base dev --head "$BRANCH" --title "$TITLE" --body "$BODY")
echo "$PR_URL"
