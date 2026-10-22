---
description: End the session: update STATUS.md, commit, print a next-session prompt
---
Wrap up this session without pushing.

1. Run `git status --short` and `git diff --stat` to see what changed.
2. Update `STATUS.md`: move finished work into "Done recently" (keep the last ~5 items), refresh "Current focus" and "Next up", and add any new decisions or gotchas. Keep the file under 40 lines.
3. If CSS or JS source changed, run `./bundle.sh` so `dist/` is current.
4. Commit everything with a short, plain message.
5. Do NOT push. Tell the user the work is committed locally and they can push.
6. Print one line the user can paste to start the next session, e.g. `Continue with: <next task>`.
