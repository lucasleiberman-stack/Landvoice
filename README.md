# Landvoice homepage: prototype

Plain HTML, CSS and JS with no build tools. Open `index.html` through any local server (`python3 -m http.server`), or just double-click it.
Everything is written so it can be lifted into WordPress as theme template parts.

## Folder layout
```
prototype/
  index.html                  the page; each section is wrapped in a comment naming its WP template part
  bundle.sh                   joins the files into dist/lv.css and dist/lv.js for production
  assets/
    css/
      00-tokens.css           ALL colours, fonts, sizes, spacing: change a value here, it changes everywhere
      01-base.css             reset, typography classes (.lv-h1/.lv-h2/.lv-h3/.lv-lede/.lv-eyebrow), helpers
      02-layout.css           container, light/dark "bands", section spacing, the tilted grid, scroll reveal
      03-components.css       buttons, tags, placeholder boxes, carousel, feature card, tablet frame
      sections/*.css          one file per section (header, hero, trust, who, showcase, services, ...)
    js/                       small modules, numbered in load order (00-core.js first)
    img/                      hero map, logo mark, dotted US/Canada map, grid patterns
```

## Rules the code follows
- **Every class starts with `lv-`** so nothing collides with WordPress, the theme or plugins.
- **BEM-style names:** `lv-block`, `lv-block__element`, `lv-block--modifier` (e.g. `lv-btn__label`, `lv-btn--dark`).
- **No hard-coded colours or sizes in section files** if a token exists; reach for `var(--lv-...)`.
- **Light vs dark** is a single class on the band (`lv-band--light` / `lv-band--dark`). Inside a band, text and line colours come from `--lv-fg`, `--lv-fg-muted`, `--lv-hairline`, so components work on either.
- **JS is opt-in through `data-lv-*` attributes.** No IDs or classes are used as JS hooks, so restyling can't break behaviour.
- Respects `prefers-reduced-motion`. Pages work without JS (content stays visible).

## JavaScript hooks
| Attribute | What it does | File |
|---|---|---|
| `data-lv-reveal` | fade-up when scrolled into view (`style="--lv-delay:.2s"` to stagger) | 20-reveal.js |
| `data-lv-story` + `-sticky` / `-window` / `-track` | the "Who we are" scroll story: block sticks, right column scrolls (`data-lv-story-speed` = scroll length) | 60-story.js |
| `data-lv-road` + `data-lv-road-row` | services road fills as you scroll and switches each row on | 70-road.js |
| `data-lv-carousel` + `-track` / `-prev` / `-next` | scroll-snap carousel with arrow buttons (lead manager, add-ons, success stories) | 40-carousel.js |
| `data-lv-slider` + `data-lv-slide` / `data-lv-dot` | one-at-a-time testimonial slider (`data-lv-interval` ms) | 50-slider.js |
| `data-lv-marquee` | duplicates logos so the CSS loop is seamless | 30-marquee.js |
| `data-lv-menu-toggle` | header menu button | 10-menu.js |
| `data-lv-video="URL"` | swaps the placeholder for an iframe when played (empty = does nothing yet) | 80-media.js |

## Moving into WordPress
1. Run `./bundle.sh`. Copy `dist/lv.css`, `dist/lv.js` and the `assets/img/` folder into your theme (keep `dist/` next to `assets/`, because the bundled CSS points to `../assets/img/`).
2. Enqueue them, and the three Google fonts, in `functions.php`:
   ```php
   add_action('wp_enqueue_scripts', function () {
     $u = get_template_directory_uri();
     wp_enqueue_style('lv-fonts', 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500;600&display=swap', [], null);
     wp_enqueue_style('lv', "$u/dist/lv.css", ['lv-fonts'], '1.0');
     wp_enqueue_script('lv', "$u/dist/lv.js", [], '1.0', true);
   });
   ```
3. Split `index.html` at the `<!-- ===== ... (WP: template-parts/xyz.php) ===== -->` comments into template parts. The icon sprite near the top of `<body>` goes in `header.php`.
4. Keep the `no-js` class on `<html>` (the core script removes it).
5. Replace text stand-ins with real content: ACF fields or blocks map naturally onto the repeated pieces (service items, feature cards, plans, logo tiles).

## Building hero blocks (home, product pages, any new page)
Every hero's text uses the same stack so type size, line height and spacing never drift between pages:
```html
<div class="lv-herocopy">                     <!-- shared wrapper: max width + spacing, defined once in 03-components.css -->
  <p class="lv-eyebrow">Eyebrow text</p>
  <h1 class="lv-h1">Headline</h1>              <!-- --lv-fs-h1, line-height 1.05 -->
  <p class="lv-lede">Supporting paragraph</p>  <!-- --lv-fs-lede, line-height 1.65 (can be an h3 if the copy calls for one: keep the lv-lede class) -->
  <div class="lv-actions"> ...buttons... </div>
</div>
```
- Never add hero-specific font sizes or margins in a page's CSS; change `.lv-herocopy` (or the `--lv-fs-h1` / `--lv-fs-lede` tokens) so every hero changes together.
- Hero bands: use `lv-band lv-band--light lv-band--flat-top` + the page's hero class for layout (see `.lv-hero` in `sections/hero.css` and `.lv-pg-hero` in `sections/product.css`).
- Reveal animation: `data-lv-reveal` on each element, with `style="--lv-delay:.08s"`, `.16s`, `.24s` for the stagger.

## Building other pages from this one
Reuse the same pieces: `lv-band` (light/dark), `lv-section`, `lv-container`, the type classes, `lv-btn`, `lv-fcard`, `lv-carousel`, `lv-plan`, `lv-tag`, `lv-eyebrow`. A new page is mostly a new order of existing sections plus (at most) one new section CSS file.

## Placeholders still to fill (all outlined in dashed orange or marked `lv-ph`)
- Real logos: trust strip, CRM tiles (12), coach logos, AI icons are simple stand-ins.
- Screenshots / graphics: tablet video poster, lead manager cards (4), "how it works" images (3), add-on images (4), video posters (3), Sheri Jackson headshot.
- Copy: "[X]+ agents" / "[X] housing cycles" (two places), Lead Manager cards 3 and 4, Build Your Own "Add on" list, testimonials 2 and 3 names, video URLs (`data-lv-video`).

## Copy notes: please confirm
- Eyebrow "SERVING LISTINGS AGENTS" corrected to "listing agents"; "Pre-forclosure" and "Pre-Forclosure" corrected to "Pre-foreclosure"; "Its a no-brainer" to "It's".
- The success-stories eyebrow in the design says **ADD-ONS** (looks like a leftover); the prototype uses "Testimonials".
- The second button in "Setup takes minutes" says "Get Started" twice in the design; the prototype uses "Live Demo" for the second.
- Duplicated text kept as designed but flagged with `TODO copy` comments: Neighborhood Search (copies Expired), Lead Manager card 2 (copies card 1), the CRM section text repeats its own intro.
- Footer legal text and phone links come from the text you pasted earlier. Phone links inherit the surrounding colour (`.lv-footer__legal a[href^="tel"]`).
- Not in the design, so not built: FAQ, billing toggle on pricing.
