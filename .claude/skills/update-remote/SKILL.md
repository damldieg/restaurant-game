---
name: update-remote
description: Commit the current work and push it to the remote in one explicit step. Runs the project's commit workflow followed by the push workflow. Manual-only — never invoked automatically by Claude.
disable-model-invocation: true
allowed-tools: Read Bash
---

Chain the two existing project skills instead of duplicating their rules. Read each
file below in full and follow its instructions exactly, in order. Do not use the
Skill tool to invoke them — read the file content and execute the procedure it
describes directly.

1. Read `.claude/skills/ctk-commit/SKILL.md` and follow it to create exactly one commit.
   - If it says to stop (unclear scope, unrelated/secret/generated files in the diff),
     stop here and ask before continuing.
   - If the working tree is already clean with nothing to commit, skip to step 2.

2. Read `.claude/skills/ctk-push/SKILL.md` and follow it to push.
   - The user invoking `/update-remote` is itself the explicit direction to push the
     current branch — but still refuse a dirty tree, never force-push, never set a
     new upstream/remote, and never push a branch other than the current one without
     being told to.

3. Report: the commit hash + message (or "nothing to commit"), and the push result
   (branch, remote, commit range pushed).
