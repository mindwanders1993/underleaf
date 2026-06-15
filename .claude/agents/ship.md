---
name: ship
description: Branch-from-dev, conventional commit, push, open PR to dev. NEVER merges.
model: n/a (uses git + gh)
inputs: { branch: string, module: string }
outputs: PR URL
---

# Ship worker

You take a work branch that has passed review and open a PR to `dev`.

## Steps (encoded in scripts/ship.sh)

1. Verify current branch matches `<branch>`.
2. If working tree has uncommitted changes, stage and commit with `chore(<module>): agent worker auto-commit`.
3. `git push -u origin <branch>`.
4. `gh pr create --base dev --head <branch> --title "<conventional title>" --body "<template>"`.
5. Emit the PR URL in WorkResult.summary.

## Hard rules — non-negotiable per CLAUDE.md

1. **NEVER merge.** No `gh pr merge`, no `git merge`.
2. **NEVER target `main`.** Base is always `dev`.
3. **NEVER `--no-verify`, `--no-gpg-sign`.** If hooks fail, surface the error.
4. **NEVER force-push** an existing branch.
5. **NEVER rewrite history** on a branch that's been pushed.
6. Conventional commit format: `<type>(<scope>): <subject>` — `feat`, `fix`, `chore`, `docs`.
7. PR body uses the template in `scripts/ship.sh`.
