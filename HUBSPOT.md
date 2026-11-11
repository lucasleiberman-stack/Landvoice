# HubSpot handoff (read this before touching anything in `hubspot/`)

The site is being rebuilt as a HubSpot custom theme **"Landvoice - 2026 Redesign"** (account `landvoice`, id 545307) so editors can change text and images through modules. The old site stays live; new pages are drafts on the new theme until launch. Local prototype (`index.html`, `expired-listings.html`) is where we experiment; HubSpot is where it ships.

## Theme layout (repo `hubspot/theme/` = remote `Landvoice - 2026 Redesign/`)
- `Templates/base.html`: head (fonts, `2026main.css`, an inline `<style>` for the road-map corner patches), the global **header + footer (hard-coded here, not modules)**, the SVG icon sprite, `2026main.js`.
- `CSS/2026main.css`, `JS/2026main.js`: the ONE shared stylesheet/script. Images in `images/` (use `get_asset_url('/Landvoice - 2026 Redesign/images/x.png')`; absolute path, **PNG/JPG/SVG only, HubSpot rejects .webp**: convert with `sips`).
- `Modules/<Name>.module/` = `module.html`, `fields.json`, `meta.json`, optional `module.css`.

## CLI workflow (the rules that keep us from breaking things)
Run from the repo root. CLI: `~/.npm-global/bin/hs` (already authenticated; never ask for or print the key).
```
hs cms fetch "Landvoice - 2026 Redesign/CSS/2026main.css" <scratch>/r.css --overwrite   # ALWAYS fetch first
diff -q <scratch>/r.css hubspot/theme/CSS/2026main.css                                   # remote == repo copy? if not, someone edited in HubSpot: build on the REMOTE copy
hs cms upload hubspot/theme/CSS/2026main.css "Landvoice - 2026 Redesign/CSS/2026main.css"
hs cms upload "hubspot/theme/Modules/X.module" "Landvoice - 2026 Redesign/Modules/X.module"   # whole folder, or a single file
hs cms fetch ".../Modules/X.module" <scratch>/x --overwrite; cp <scratch>/x/fields.json hubspot/theme/Modules/X.module/fields.json  # HubSpot rewrites fields.json (adds ids): copy it back
```
1. **Never rebuild `2026main.css` / `2026main.js` from the sources** (`cat assets/css/...`). The local sources contain unapproved experiments and a different file order. Instead **patch the fetched remote copy**: replace the specific old block with the new one, or append the new block (this is how band-options, facts-stack, record, billing, buttons were added). Same for JS (append the new file's text).
2. **Only upload what the user approved.** Experiments stay local until they say "push to HubSpot". Currently local-only: the blue glow + whiter glass behind the hero list (`hero-leads-follow.css`), the territory-map/house-photo graphic and the Star Wars record block on `expired-listings.html` (`housemap.css`).
3. After uploading a module, fetch it back and check the new fields exist. The user must still **publish the theme and hard-refresh (Cmd+Shift+R)** in HubSpot (unpublished edits don't render).
4. Commit locally after each change (`Co-Authored-By` line as instructed). **Never `git push`** (the user pushes).

## Gotchas learned
- HubSpot concatenates `assets/css/sections/*.css` **alphabetically**, local pages link them in a different order. So a rule can win locally and lose in HubSpot. Write new overrides with **2-3 classes** (e.g. `section.lv-band.lv-pad-top-0`, `.lv-leads.lv-leads--follow`). Test by loading one concatenated file locally when unsure.
- `fields.json`: reserved field names (`label`, `name`, `body`), no `textarea`, a plain field's `"tab"` is ignored (only groups can sit in the Style tab), module labels must be unique, group repeaters use `occurrence {min,max,default}`, conditional fields use `visibility {controlling_field_path, controlling_value_regex "true", operator "EQUAL"}`. Existing page instances keep their saved values; new defaults only apply to newly added modules (tell the user to fill/adjust on the page).
- Module CSS can't use `get_asset_url`; pass an asset URL through an inline style custom property from the module HTML.
- The preview launcher (`preview_start name`) fails with "Operation not permitted"; start the dev server with Bash `python3 serve.py 8000` (run in background; it dies when the session ends). The browser pane does not tick animation frames reliably: finish animations with `document.getAnimations().forEach(a=>a.finish())`, set classes by hand, measure with `getBoundingClientRect`/`getComputedStyle`. Test at **1440px** (and 1728 / 2200 for type), then `resize_window preset:"desktop"`.
- `assets/img/` and `dist/` are read-denied; copy/convert with shell (`sips`) is fine.

## Modules (all uploaded unless noted)
**Reusable (have the style options, see below):** `split block standard` (hero split, image or "show whole image" mockup mode, heading h1/h2, corner map graphic + position, padding, corners), `Bleed Hero Split` (large image running off the right edge, default tablet screenshot), `Data Record Showcase` (rotating pills + zooming record mock), `Split Block Stats` (centred heading + paragraph, 1-4 big stats in a row; the name is a leftover, it is no longer split), `Testimonial Slider` (+ theme dark/light, headshot left/right), `Pricing Plans` (+ Monthly/Quarterly/Annually tabs), `FAQ`, `4 Item Stats`, `How It Works Steps`.
**One-offs (homepage only, no style options):** `Home Hero` (v3: zoom-out + list + glass markers), `OG HERO ANIMATION HUBSPOT` (frozen original hero, do not touch), `Homepage Stats`, `Product Showcase`, `Lead Manager Slider`, `Integrations`, `Success Stories and Proof`, `Add-ons Carousel`, `logoslider` (Brand Slider), `Site Header` (empty stub; header lives in base.html).

## Style options pattern on reusable modules
Four fields: Remove top padding, Remove bottom padding, Top corners, Bottom corners (Default / Rounded / Square). The module adds `lv-pad-top-0`, `lv-pad-bottom-0`, `lv-corner-top-round|square`, `lv-corner-bottom-round|square` to its `section.lv-band`; the rules live in `assets/css/sections/band-options.css` (already in HubSpot's CSS). `split block standard` uses its own equivalents (`lv-pg-hero--no-top` etc.). To add the options to another module: add the 4 fields (copy from a finished module's fields.json) and the class expression to the module's root `<section>`.

## Still to do in HubSpot
Header/footer as global modules (optional); product-page templates (FSBO, Pre-Foreclosure, Neighborhood Search) from `expired-listings.html`; `home.html` page template; forms + redirects before launch; real nav/social/product URLs; pricing: Essential plan exists on landvoice.com/pricing but not in the module; update saved Pro/Elite "save" text on the page ($354 / $727); testimonial photos/names; placeholders in README.
