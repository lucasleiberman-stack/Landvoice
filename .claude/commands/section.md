---
description: Load only one homepage section (HTML, CSS, JS) to keep context small
argument-hint: <section name, e.g. hero, services, pricing>
---
Work on the "$ARGUMENTS" section only.

1. Grep `index.html` for the `<!-- ===== ` comment that names this section and read only that block (use offset/limit; never read the whole file).
2. Read `assets/css/sections/$ARGUMENTS.css` if it exists.
3. Grep the block for `data-lv-*` attributes and read only the matching `assets/js/` module(s).
4. Do not read `dist/` or `assets/img/`.
5. Reply with one or two lines on what the section contains, then wait for instructions.
