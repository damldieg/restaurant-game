---
name: commit
description: Stage relevant changes, commit them using Conventional Commits, and push to the current branch's remote.
---

Review `git status` and `git diff` (staged and unstaged) before doing anything else.

Stage only files relevant to the change being committed. Never use `git add -A` or `git add .`; add files by name. Flag anything that looks like a secret or credential instead of staging it.

Write the commit message in Conventional Commits format:

```
<type>(<scope>): <short summary>

<optional body explaining why, not what>
```

- `type` is one of: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `perf`.
- `scope` is the affected area (e.g. `npc`, `grid`, `restaurant`, `skills`), omitted if the change is repo-wide.
- Summary is imperative mood, lowercase, no trailing period, under ~70 chars.
- Only add a body when the reason for the change isn't obvious from the diff.
- One commit per logical change. If the staged changes mix unrelated concerns, say so and propose splitting them instead of writing one commit that covers both.

After committing:
- If the current branch has no upstream, or pushing would overwrite remote history, stop and ask before proceeding.
- Otherwise push with a plain `git push` (or `git push -u origin <branch>` the first time). Never force-push.
- Report the commit hash, message, and push result.
