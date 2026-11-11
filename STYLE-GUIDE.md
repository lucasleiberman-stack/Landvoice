# Landvoice style guide (read before building any new block or page)

All values live in `assets/css/00-tokens.css`. Change a token, never hard-code a value in a section file. Every class starts with `lv-` (BEM: `lv-block__element--modifier`).

## Fonts
- **Display** (headings, buttons, stats): Schibsted Grotesk. `--lv-font-display`
- **Body** (paragraphs, pills): DM Sans. `--lv-font-body`
- **Mono** (eyebrows only): Spline Sans Mono. `--lv-font-mono`

## Type scale (global classes in `01-base.css`)
| Class | Size token | Weight | Letter spacing | Line height |
|---|---|---|---|---|
| `lv-h1` | `--lv-fs-h1`: 54px at 1728px, easing back to 60px at 2200px+ (4.6vw below ~1174px; min 2.4rem) | 600 | -.04em | 1.05 |
| `lv-h2` | `--lv-fs-h2`: 47px at 1728px, easing back to 52px at 2200px+ (3.9vw below ~1205px; min 2rem), every h2 | 600 | -.035em | 1.05 |
| `lv-h3` | `--lv-fs-h3` clamp(1.35rem, 2vw, 1.9rem) | 600 | -.025em | 1.15 |
| `lv-lede` (sub paragraph) | `--lv-fs-lede` clamp(1.05rem, 1.3vw, 1.2rem) | 400 | **`--lv-ls-sub` = -0.3px** | 1.65, muted colour |
| `lv-eyebrow` | `--lv-fs-eyebrow` .8rem, mono, uppercase | 400 | .08em | |
- Sub paragraphs (`lv-lede`, `lv-pg__sub`, `lv-pg__body`) and pills (`lv-tag`, `lv-pill`) all use `letter-spacing: var(--lv-ls-sub)`. Change the token, never type -0.3px in a rule.
- Headings use `text-wrap: balance`. A heading's tag and look are independent: keep the right tag (one `h1` per page, sections `h2`, hero sub-paragraph may be an `h3` carrying `lv-lede`) and put the look on the class.
- Copy is sentence case. If supplied copy has random Capital Words, normalise and flag it; fix obvious typos.

## Bands (full-width blocks) and padding
- `lv-band lv-band--light` (paper `#F1F0ED`, rounded corners) / `lv-band lv-band--dark` (ink `#0D1117`, flat). Text colours come from `--lv-fg`, `--lv-fg-muted`, `--lv-hairline`, `--lv-link`, so components work on either.
- **Alternate light and dark down the page.** Two light bands touching leave dark notches at the rounded corners (bad); two dark bands touching merge seamlessly (OK, used on purpose).
- **Standard block padding = `lv-section`** (top + bottom = `--lv-section-y` clamp(96px, 13vw, 200px)). `lv-section--tight` = `--lv-section-y-tight`. Put it on every new band. Never hard-code section padding.
- Several content blocks can share one band: wrap the 2nd+ blocks in `<div class="lv-pg-block">` (adds even spacing, `clamp(72px, 9vw, 140px)`). `lv-section--joined` (padding-top 0) sits a band directly under another dark band with its own padding (e.g. under the testimonial).
- Containers: `lv-container` (1240px), `lv-container lv-container--wide` (1600px). Page gutter `--lv-gutter`.

## Hero blocks
```html
<section class="lv-band lv-band--light lv-band--flat-top lv-pg-hero">   <!-- .lv-hero on the homepage -->
  <div class="lv-pg-hero__stage">                                        <!-- 2 columns: text left, media right -->
    <div class="lv-herocopy">                                            <!-- shared type + spacing, defined once in 03-components.css -->
      <p class="lv-eyebrow" data-lv-reveal>Eyebrow</p>
      <h1 class="lv-h1" data-lv-reveal style="--lv-delay:.08s">Headline</h1>
      <p class="lv-lede" data-lv-reveal style="--lv-delay:.16s">Supporting paragraph</p>
      <div class="lv-actions">buttons</div>                              <!-- optional -->
    </div>
    <div class="lv-pg-hero__media">image or <div class="lv-ph" data-label="Image: ..."></div></div>
  </div>
</section>
```
- `.lv-herocopy`: max-width 46rem; eyebrow margin-bottom 1.6rem; h1 margin-bottom 1.6rem; lede margin-bottom 2.4rem, max-width 44rem. Never set hero font sizes or margins per page.
- Optional second small block under the lede: `<div class="lv-herocopy__more"><h3 class="lv-h3">..</h3><p class="lv-lede">..</p></div>`.

## Pills, tags, buttons
- `lv-tag` (in `<ul class="lv-tags">`): pale-blue fill `rgba(106,163,255,.1)`, 1px blue outline, blue text, DM Sans, `--lv-ls-sub`. Product pages enlarge them (`.lv-pg__stack .lv-tag`, 1.5px border, clamp(.88rem, 1.52vw, 1.36rem), weight 500).
- `lv-pill`: the same look, inline inside a paragraph (e.g. the three highlighted reasons in "Why listings expire"). On dark bands it switches to `--lv-blue-on-dark`.
- Orange "coming soon" pill: `.lv-services__soon` (DM Sans, lowercase, 600, `--lv-orange` fill).
- Buttons: `lv-btn` has **no arrow** (the `.lv-btn__icon` span is still in the markup but hidden) and is 19px (20px at 1798px+), ~53px tall, Schibsted Grotesk 500, blue (`lv-btn--dark` black) with a darker wipe across the whole button on hover. **Exception: the header "Buy Now"** (`.lv-header .lv-btn`, `lv-btn--sm`) keeps its arrow and 15px size. Rule lives in `03-components.css` ("NO ARROWS + LARGER TEXT").

## Header / nav / footer
- Header is a sticky bar. After ~40px of scroll JS adds `.is-stuck`: it floats 10px from the top, inset from the sides (`clamp(10px, 2.2vw, 36px)`), 12px radius, light shadow, eased over .5s. `--lv-header-h` (79px) is what sticky stages pin under.
- Products item opens a hover/focus **mega menu** (`data-lv-mega`): Lead data (Expired Listings -> `expired-listings.html`, FSBO, Pre-Foreclosure & Distressed, Neighborhood Search, FRBO "coming soon") + Add-ons (Inked Cards, Call Capture, Data Genie). Mobile burger menu has the same product links nested.
- Footer: brand/contact column (address, phones, Terms | Privacy, six social icons, copyright) + two link columns, faint logo rings behind. Social + Blog/Help/CCPA/Terms/Privacy links are `#` placeholders. The header and footer markup is **duplicated** in `index.html` and `expired-listings.html`: change both.

## Homepage specifics
- **Hero map (v3, see HUBSPOT.md for versions)**: `hero-map-clean.png` + live SVG circle. Timeline: ring draws (0.2-1.3s) -> the whole map layers (image, circle, markers) scale to 76% toward the map's RIGHT edge (1.45s, 1s long) -> at 2.65s the lead list appears on the LEFT of the circle (`hero-leads-follow.css`, `76-leads-slider.js` mode `data-lv-leads-follow`): 3.5 leads visible, highlighted lead centred, top/bottom fade out, endless loop (copies before/after, snap back unseen) -> every 2.8s the highlight steps on and ONE glass way-point marker (list tag colours, address slides out) pops onto the map. Marker positions are SVG `.lv-pin` groups in the markup (kept as no-JS fallback; JS draws the HTML markers). Reduced motion = static.
- **Logo slider** (`data-lv-marquee`): 14 white logos in `assets/img/brokerages/`, each with its own height class `.lv-logo-img--name` in `sections/trust.css`; ERA and Realty ONE Group are greyscale via CSS filter. The marquee JS repeats items until half the track is wider than the strip, so it loops seamlessly on any width.
- **Services road**: wide container, `--lv-arm` clamp(200px, 20vw, 300px), so all four blurbs wrap to the same number of lines on desktop.
- AI icons row, integrations image (`integrations-cluster-v2.webp`), Lead Manager card images (`lm-filters-v2.png`, `lm-dnc-v2.png`), add-on images, FAQ (22 answers) are all in `index.html`.

## Product page template (`expired-listings.html`, CSS in `sections/product.css`)
Order used: hero (light) -> what-are (dark, h2 left + paragraph right via `lv-split`) -> data fields + phone numbers (light; `lv-pg__stack` + `lv-mock`, centred `lv-pg__center` block with `lv-mock--sm`) -> old expireds facts (dark, `lv-facts`) -> why + steps (light; `lv-pill` paragraph, `lv-steps__list--text`) -> testimonial + still-works + price (dark, joined) -> comparison + FAQ + CTA (light) -> footer.
Reusable pieces: `lv-split` (2 columns), `lv-pg__center` (centred stack), `lv-pg__stack`, `lv-pg__sub`/`lv-pg__body` (sub paragraphs), `lv-mock` / `lv-mock--sm` (screenshot frames; swap the `.lv-ph` placeholder for an `<img>`), `lv-facts`/`lv-fact`, `lv-price`, `lv-cta`, `lv-faq` (native `<details>`, no JS), `lv-steps` (shared with the homepage). To make another product page: copy the file, swap copy and images, keep the band alternation.

## Scroll-draw animation (`data-lv-draw`) and the vertical timeline
- `assets/js/25-draw.js`: any element with `data-lv-draw` gets `.is-drawn` the first time it scrolls into view and keeps it (plays once; no replay on scroll back up). No JS or reduced motion = finished state.
- `lv-timeline` (in `product.css`): vertical numbered steps, 66px circles + body text, max-width 46rem. On first scroll the line draws down and each circle pops in as the line reaches it (`--lv-tl-step` 1.15s per step; per-item delay from `style="--i:N"`). Markup: `<ol class="lv-timeline" data-lv-draw><li class="lv-timeline__item" style="--i:0"><span class="lv-timeline__num">01</span><div class="lv-timeline__body"><h3 class="lv-h3 lv-timeline__title">..</h3><p class="lv-lede">..</p></div></li>...</ol>`. Works on dark bands too.
- Keep section headlines short (e.g. "Turn Expired Data Into Signed Listings").
- A row of `lv-pill`s inside a sub paragraph goes in `<span class="lv-pills">` (adds the gap under the pills).

## Placeholders and copy flags
- `lv-ph` = grey striped image placeholder. `lv-todo` = orange dashed outline marking copy that still needs to be supplied (`TODO copy: ...`). Orange-dashed bracketed text like `[X]%` in FAQ answers = unconfirmed values.

## Working conventions
- Dev server: `python3 serve.py` (no-cache). Stale look = hard refresh (Cmd+Shift+R). After CSS/JS edits run `./bundle.sh` and commit `dist/`.
- Commit after each change; **the user pushes** (never push).
- Images: give replaced images a new filename (`name-v2.png`) so browsers don't serve the old one, then `git rm` the old file. `assets/img/` is read-denied in `.claude/settings.json` (copy/edit by shell is fine). Logos on dark bands must be white on transparent: `python3 -I tools/whiten.py in.png out.png` (SVGs used as-is); `sips` (built into macOS) crops/converts.
- Check changes in the preview by measuring computed styles (`getComputedStyle`) and screenshots; for reveal-on-scroll items add class `is-in`; pause hero animations with `document.getAnimations()` and set `currentTime`.
- Ask before downloading anything; logos/trademarks come from the user or official brand pages.

## Additions in the HubSpot phase (keep consistent)
- **Band style options** (reusable modules only): `lv-pad-top-0`, `lv-pad-bottom-0`, `lv-corner-top|bottom-round|square` on `section.lv-band` (`band-options.css`). Default corners: light bands rounded (`--lv-radius-band`), dark bands square.
- **Stats** (`facts-stack.css`): open style, no cards: big number in `--lv-fg`, label under it, 1px `--lv-hairline` divider. `lv-facts--row` = centred row (labels one line, 3 columns, 1 on phones) under a centred `lv-pg__center lv-pg__center--mid` heading + paragraph (two lines). `lv-facts--stack` = single column.
- **Steps (how it works)**: `.lv-step__text` max-width `min(38rem, 85%)` of its column.
- **Product hero blocks**: `lv-pg-hero` (padding 64-140px) split; `Bleed Hero Split` image runs off the right edge (52vw, right-aligned); "mockup" images use the show-whole-image mode (object-fit contain, no frame). Heading tag option h1/h2: the class follows the tag (`lv-h1` / `lv-h2`), never use h1 more than once a page.
- **Corner map graphic**: `.lv-gridplane` + one `.lv-gridplane__patch--tl|tr|bl|br` as the band's first child (road-patch-v4.svg from base.html, `mix-blend-mode: darken` on light; faint light version on dark); mirrors: tr none, tl scaleY(-1), bl scale(-1,-1), br scaleX(-1).
- **Record mock** (`record.css`): em-sized look-alike of the app's expired-lead row with Star Wars dummy data; JS rotates pills, zooms the stage with a transform, a spotlight ring (thickness 1.25px on screen via `--z`) marks the target; pill order = Name, Phone numbers, Email, Social media links, Current status, Price, Days on market.
- **Social icons** (LinkedIn, Facebook, Instagram, YouTube): the user's SVG paths, one colour (`currentColor`), dark ink (`--lv-ink`) on light UI, white on dark.
- **Testimonial**: theme dark/light; headshot left/right (mirror: text box hugs the photo with the same gap, quote mark mirrored and moved).
- **Pricing**: billing tabs `data-lv-billing` / `data-period` on `.lv-plans` (JS `85-billing.js`); plans carry `lv-plan__amt--monthly|quarterly|annual` spans; the "save" line shows on the annual tab only.
- **Placeholder data**: Star Wars (Leia Organa, Mos Eisley TA 9900x, (415) 555-01xx). Never real people or numbers.

