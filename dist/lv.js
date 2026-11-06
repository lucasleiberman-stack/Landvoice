/* lv-core: tiny helpers shared by the other modules. Load this first.
   Everything is opt-in through data attributes; nothing runs unless the markup asks for it. */
window.LV = (function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ready = function (fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); };
  var raf = function (fn) { var p = false; return function () { if (p) return; p = true; requestAnimationFrame(function () { p = false; fn(); }); }; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.remove('no-js');
  return { $: $, $$: $$, ready: ready, raf: raf, clamp: clamp, reduceMotion: reduceMotion };
})();
/* lv-menu: header burger.  Markup: [data-lv-menu-toggle] controls the element with id = its aria-controls */
LV.ready(function () {
  LV.$$('[data-lv-menu-toggle]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var set = function (open) { btn.setAttribute('aria-expanded', open); panel.hidden = !open; };
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });
});

/* lv-mega: the hover/focus mega menu is pure CSS; this adds tap-to-open on touch screens and Escape to close.
   Markup: <li data-lv-mega> <a>Products</a> <div class="lv-mega">...</div> </li> */
LV.ready(function () {
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  LV.$$('[data-lv-mega]').forEach(function (item) {
    var link = item.querySelector('a');
    if (touch) link.addEventListener('click', function (e) { if (!item.classList.contains('is-open')) { e.preventDefault(); item.classList.add('is-open'); } });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) item.classList.remove('is-open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { item.classList.remove('is-open'); if (item.contains(document.activeElement)) document.activeElement.blur(); } });
  });
});

/* lv-header: adds .is-stuck once the page has scrolled, so the bar floats (see header.css). */
LV.ready(function () {
  var header = LV.$('.lv-header');
  if (!header) return;
  var update = LV.raf(function () { header.classList.toggle('is-stuck', window.scrollY > 40); });
  window.addEventListener('scroll', update, { passive: true });
  update();
});
/* lv-reveal: fades elements up when they scroll into view.
   Markup: data-lv-reveal  (optional style="--lv-delay:.2s")
   Uses IntersectionObserver, plus a scroll-position fallback so content can never stay hidden. */
LV.ready(function () {
  var pending = LV.$$('[data-lv-reveal]');
  var show = function (el) {
    el.classList.add('is-in');
    pending = pending.filter(function (e) { return e !== el; });
  };
  if (LV.reduceMotion) { pending.slice().forEach(show); return; }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    pending.forEach(function (e) { io.observe(e); });
  }

  var sweep = function () {
    var limit = window.innerHeight * 0.88;
    pending.slice().forEach(function (el) { if (el.getBoundingClientRect().top < limit) show(el); });
  };
  window.addEventListener('scroll', LV.raf(sweep), { passive: true });
  window.addEventListener('resize', LV.raf(sweep));
  setTimeout(sweep, 400);
});
/* lv-draw: plays a one-time "draw" animation the first time an element scrolls into view.
   Markup: data-lv-draw  (the element gets .is-drawn once, and never loses it, so scrolling back up does not replay it).
   Used by .lv-timeline (the line draws down while each numbered circle pops in). Falls back to the finished state with no JS / reduced motion. */
LV.ready(function () {
  var els = LV.$$('[data-lv-draw]');
  if (!els.length) return;
  var done = function (el) { el.classList.add('is-drawn'); };
  if (LV.reduceMotion || !('IntersectionObserver' in window)) { els.forEach(done); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { done(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
});
/* lv-marquee: repeats the track's items until one half is wider than the strip, then doubles it, so the CSS loop (translateX -50%) is seamless on any screen width.
   Markup: .lv-marquee > [data-lv-marquee] (the track) > items.  Speed: style="--lv-marquee-speed:40s" */
LV.ready(function () {
  LV.$$('[data-lv-marquee]').forEach(function (track) {
    var originals = Array.prototype.slice.call(track.children);
    var strip = track.parentNode, built = 0;
    function copy(node) { var c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }
    function build() {
      var width = strip.clientWidth;
      if (!width || width === built) return;
      built = width;
      while (track.children.length > originals.length) track.removeChild(track.lastChild);   // reset to the originals
      var setWidth = track.scrollWidth || 1, copies = Math.max(1, Math.ceil(width / setWidth));
      for (var i = 1; i < copies; i++) originals.forEach(function (n) { track.appendChild(copy(n)); });
      Array.prototype.slice.call(track.children).forEach(function (n) { track.appendChild(copy(n)); });   // second half for the loop
    }
    build();
    window.addEventListener('load', function () { built = 0; build(); });
    window.addEventListener('resize', LV.raf(build));
  });
});
/* lv-carousel: scroll-snap carousel with optional prev/next buttons.
   Optional: data-lv-carousel-start="center" opens on the middle slide, centered.
   Markup: [data-lv-carousel] contains [data-lv-carousel-track] and (optional) [data-lv-carousel-prev] / [data-lv-carousel-next] */
LV.ready(function () {
  LV.$$('[data-lv-carousel]').forEach(function (root) {
    var track = LV.$('[data-lv-carousel-track]', root);
    var prev = LV.$('[data-lv-carousel-prev]', root), next = LV.$('[data-lv-carousel-next]', root);
    if (!track) return;
    var step = function () {
      var s = track.children[0]; if (!s) return track.clientWidth;
      return s.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    };
    var update = function () {
      if (prev) prev.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', LV.raf(update), { passive: true });
    var center = function () {
      var mid = track.children[Math.floor((track.children.length - 1) / 2)]; if (!mid) return;
      var t = track.getBoundingClientRect(), m = mid.getBoundingClientRect();
      track.scrollLeft += (m.left + m.width / 2) - (t.left + t.width / 2);
    };
    if (root.getAttribute('data-lv-carousel-start') === 'center') {
      var prevSnap = track.style.scrollSnapType; track.style.scrollSnapType = 'none';
      center(); track.style.scrollSnapType = prevSnap;
    }
    window.addEventListener('resize', update); update();
  });
});
/* lv-slider: one-at-a-time slider with progress dots (testimonials).
   Markup: [data-lv-slider data-lv-interval="7000"] > [data-lv-slide] (hidden attr on inactive) + [data-lv-dot] buttons */
LV.ready(function () {
  LV.$$('[data-lv-slider]').forEach(function (root) {
    var slides = LV.$$('[data-lv-slide]', root), dots = LV.$$('[data-lv-dot]', root);
    var interval = parseInt(root.getAttribute('data-lv-interval'), 10) || 0, i = 0, timer;
    if (slides.length < 2) return;
    var show = function (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== i; });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); d.setAttribute('aria-current', k === i); });
    };
    var start = function () { if (interval && !LV.reduceMotion) { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, interval); } };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); start(); }); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', start);
    show(0); start();
  });
});
/* lv-story: "scroll story". The section sticks to the viewport; the right-hand track scrolls while the left stays put.
   Markup: [data-lv-story data-lv-story-speed="1.1"]  >  [data-lv-story-sticky]  >  [data-lv-story-window]  >  [data-lv-story-track]  (optional [data-lv-story-num] marks the last item's big number to line up with the h2)
   Optional: data-lv-story-until=".selector" names the element that follows (default: next sibling); data-lv-story-gap="0.45" keeps that share of the empty space under the last item.
   Below 900px the effect is switched off and the content flows normally. */
LV.ready(function () {
  LV.$$('[data-lv-story]').forEach(function (root) {
    var sticky = LV.$('[data-lv-story-sticky]', root), win = LV.$('[data-lv-story-window]', root), track = LV.$('[data-lv-story-track]', root);
    var speed = parseFloat(root.getAttribute('data-lv-story-speed')) || 1.1, distance = 0, enabled = false;
    if (!sticky || !win || !track) return;
    var ctx = document.createElement('canvas').getContext('2d');
    // px from an element's top edge down to the top of its capital letters
    var capTop = function (el) {
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      ctx.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var m = ctx.measureText('H'), lh = parseFloat(cs.lineHeight) || fs * 1.2;
      var content = (m.fontBoundingBoxAscent || fs * .9) + (m.fontBoundingBoxDescent || fs * .25);
      return (lh - content) / 2 + (m.fontBoundingBoxAscent || fs * .9) - m.actualBoundingBoxAscent;
    };
    var measure = function () {
      enabled = window.innerWidth > 900 && !LV.reduceMotion;
      if (!enabled) { root.style.height = ''; root.style.marginBottom = ''; track.style.transform = ''; return; }
      track.style.transform = 'none';
      // scroll until the last stat's big number sits level with the headline (cap-height to cap-height)
      var last = track.lastElementChild, pad = parseFloat(getComputedStyle(track).paddingTop) || 0;
      var num = LV.$('[data-lv-story-num]', last) || last, head = LV.$('h2', sticky);
      var lastTop = num.getBoundingClientRect().top - track.getBoundingClientRect().top;
      var shift = head ? capTop(num) - capTop(head) : 0;   // extra gap above the digits' tops vs the headline's tops
      distance = Math.max(0, lastTop - pad + shift);
      root.style.height = (sticky.offsetHeight + distance * speed) + 'px';
      // the empty stretch left under the last stat: pull the next block up so only `data-lv-story-gap` (default 45%) of it remains
      root.style.marginBottom = '0px';
      var sel = root.getAttribute('data-lv-story-until'), next = (sel && document.querySelector(sel)) || root.nextElementSibling;
      if (next) {
        // positions relative to the pinned stage, so the maths doesn't depend on the current scroll position
        var st = sticky.getBoundingClientRect(), rb = root.getBoundingClientRect();
        var lastBottomAtEnd = rb.bottom - st.height + (last.getBoundingClientRect().bottom - st.top) - distance;
        var gap = next.getBoundingClientRect().top - lastBottomAtEnd;
        var keep = parseFloat(root.getAttribute('data-lv-story-gap'));
        if (!(keep >= 0)) keep = 0.45;
        if (gap > 0) root.style.marginBottom = (-gap * (1 - keep)).toFixed(0) + 'px';
      }
      update();
    };
    var update = function () {
      if (!enabled) return;
      var scrollable = root.offsetHeight - sticky.offsetHeight;
      var pinTop = parseFloat(getComputedStyle(sticky).top) || 0;   // the stage pins this far below the viewport top
      var p = LV.clamp((pinTop - root.getBoundingClientRect().top) / scrollable, 0, 1);
      track.style.transform = 'translate3d(0,' + (-p * distance).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', LV.raf(update), { passive: true });
    window.addEventListener('resize', LV.raf(measure));
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
  });
});
/* lv-road: fills the vertical road as you scroll and switches each row on when the road reaches it.
   It only plays forward: once drawn it stays drawn, so scrolling back up never rewinds it.
   Markup: [data-lv-road] > .lv-road__rows > [data-lv-road-row] (first/second item + .lv-road__mid), and .lv-road__fill inside .lv-road__line
   Tweak: data-lv-road-trigger="0.62" is how far down the screen (0-1) the road tip sits. */
LV.ready(function () {
  LV.$$('[data-lv-road]').forEach(function (road) {
    var rows = LV.$$('[data-lv-road-row]', road), rowsBox = LV.$('.lv-road__rows', road);
    var trigger = parseFloat(road.getAttribute('data-lv-road-trigger')) || 0.62, drawn = 0;
    if (!rowsBox) return;
    var update = function () {
      var top = rowsBox.getBoundingClientRect().top, height = rowsBox.offsetHeight;
      var tip = LV.reduceMotion ? height : LV.clamp(window.innerHeight * trigger - top, 0, height + 90);
      drawn = Math.max(drawn, tip); tip = drawn;   /* first pass only: never retract */
      road.style.setProperty('--lv-road-progress', (tip + 90) + 'px');            /* line starts 90px above the first row */
      rows.forEach(function (row) {
        var node = LV.$('.lv-road__node', row);
        var y = row.offsetTop + (node ? node.offsetTop : 0);
        if (tip >= y - 6 && top + y < window.innerHeight * 0.92) row.classList.add('is-active');
      });
    };
    window.addEventListener('scroll', LV.raf(update), { passive: true });
    window.addEventListener('resize', LV.raf(update)); update();
  });
});
/* lv-leads: stretches the hero leads card from its top down to the bottom edge of the hero, so the list runs off the bottom of the hero block, and sets --lv-fade-from so that only the last bubble (the one meeting the edge) fades out.
   Markup: [data-lv-leads] inside .lv-hero__map inside .lv-hero. Below 1100px the card sits under the map, so the height is left to CSS. */
LV.ready(function () {
  LV.$$('[data-lv-leads]').forEach(function (card) {
    var hero = card.closest('.lv-hero'), map = card.offsetParent;
    if (!hero || !map) return;
    function fit() {
      if (window.innerWidth <= 1100) { card.style.height = ''; return; }
      var top = map.getBoundingClientRect().top + card.offsetTop;   // offsetTop ignores the entrance animation's transform
      card.style.height = Math.max(0, hero.getBoundingClientRect().bottom - top) + 'px';
      // only the bubble that meets the bottom edge fades out: start the mask where that bubble begins
      var h = card.clientHeight, fadeFrom = h;
      LV.$$('.lv-lead', card).forEach(function (li) { if (li.offsetTop < h) fadeFrom = li.offsetTop; });
      card.style.setProperty('--lv-fade-from', fadeFrom + 'px');
    }
    fit();
    window.addEventListener('load', fit);
    window.addEventListener('resize', LV.raf(fit));
  });
});
/* lv-leads slider: rotates the highlighted pin (+ its pill) and slides the matching lead into view, one at a time, 1.5 cards visible.
   Markup: [data-lv-leads-slider] (inside .lv-hero__map) > .lv-leads__list > li.lv-lead (one per pin, same order as .lv-pin / .lv-prop-card).
   A clone of the first lead is appended so the loop wraps seamlessly. Starts when the CSS --lv-leads-start (+.4s) has passed. No JS = first card only, no highlight.
   MODE 2, [data-lv-leads-follow] (the "list" version): ALL leads are listed (card runs from the top of the map to the hero's bottom edge, last one fading out); the first is highlighted
   (brighter, the rest dimmed) and its marker + address appear on the map; then the highlight steps down the list one lead at a time (the list scrolls to keep it in view), only ever
   showing the marker of the highlighted lead. Needs hero-leads-follow.css. */
LV.ready(function () {
  LV.$$('[data-lv-leads-slider], [data-lv-leads-follow]').forEach(function (card) {
    var follow = card.hasAttribute('data-lv-leads-follow');
    var map = card.closest('.lv-hero__map'), list = LV.$('.lv-leads__list', card);
    var leads = LV.$$('.lv-lead', list), n = leads.length;
    if (!map || !n) return;
    var pins = LV.$$('.lv-pin', map), pills = LV.$$('.lv-prop-card', map);
    var all = leads.slice(), idx = 0, step = 2800, calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!follow) { var clone = leads[0].cloneNode(true); clone.setAttribute('aria-hidden', 'true'); list.appendChild(clone); all.push(clone); }
    else {   // list mode loops forever in both directions: a copy of the list before and after the real one, the highlight starts on the first real lead (index n), and the view snaps back unseen (see next())
      var before = [], after = [];
      leads.forEach(function (l) { var c = l.cloneNode(true); c.setAttribute('aria-hidden', 'true'); before.push(c); list.insertBefore(c, leads[0]); });
      leads.forEach(function (l) { var c = l.cloneNode(true); c.setAttribute('aria-hidden', 'true'); after.push(c); list.appendChild(c); });
      all = before.concat(leads, after); idx = n;
    }

    function measure() {
      if (follow) {   // list mode: the card shows 3.5 leads (the highlighted one in the middle, a full lead above and below it, slivers fading out at the top and bottom edges)
        var h0 = leads[0].offsetHeight, g0 = leads[1].offsetTop - leads[0].offsetTop - h0;
        card.style.height = Math.round(3.5 * h0 + 3 * g0) + 'px';
        card.style.setProperty('--lv-fade-len', Math.round(h0 * .62) + 'px');
        return;
      }
      // slider mode: card height = padding + current card + gap + half of the next one; the list is moved so the current card sits at the top
      var h = all[0].offsetHeight, pad = all[0].offsetTop, gap = all[1].offsetTop - all[0].offsetTop - h;
      card.style.height = Math.round(pad + h + gap + h / 2) + 'px';
      list.style.transform = 'translateY(' + -(all[idx].offsetTop - pad) + 'px)';
    }
    // glass markers (HTML, drawn at each SVG pin's spot): a round glass badge with a coloured dot; the highlighted one slides its address out of itself like a small card.
    // The SVG pins stay in the markup as the no-JS fallback and as the source of each spot + kind.
    var props = LV.$('.lv-props', map), mks = [];
    pins.forEach(function (p, k) {
      var g = LV.$('g[transform]', p), m = g && /translate\(([\d.]+)[ ,]+([\d.]+)\)/.exec(g.getAttribute('transform')), kind = /lv-pin--(\w+)/.exec(p.getAttribute('class'));
      if (!props || !m || !kind || !leads[k]) return;
      var a = LV.$('.lv-lead__addr', leads[k]), street = a && a.firstChild ? a.firstChild.textContent : '';
      var el = document.createElement('div'), body = document.createElement('span'), dot = document.createElement('span'), addr = document.createElement('span'), txt = document.createElement('span'), pulse = document.createElement('span'), kindEl = document.createElement('span'), tag = LV.$('.lv-lead__tag', leads[k]);
      el.className = 'lv-mk lv-mk--' + kind[1] + (p.getAttribute('data-side') === 'left' ? ' is-left' : '');   // data-side on each SVG pin says which way its card opens (hand-set so neighbouring markers never overlap and none runs under the list card)
      el.style.setProperty('--tx', m[1]); el.style.setProperty('--ty', m[2]); el.setAttribute('aria-hidden', 'true');
      body.className = 'lv-mk__body'; dot.className = 'lv-mk__dot'; kindEl.className = 'lv-mk__kind'; kindEl.textContent = tag ? tag.textContent : ''; addr.className = 'lv-mk__addr'; pulse.className = 'lv-mk__pulse'; txt.textContent = street;
      addr.appendChild(txt); body.appendChild(dot); body.appendChild(kindEl); body.appendChild(addr); el.appendChild(body); el.appendChild(pulse); props.appendChild(el); mks[k] = el;
    });
    if (mks.length) { props.classList.add('has-mk'); if (follow) props.classList.add('is-list-mode'); }
    var scrollRaf = 0;
    function scrollTo(i, instant) {   // list mode: scroll (eased, 0.8s) so the highlighted lead is vertically centred in the card
      if (!follow) return;
      var to = all[i].offsetTop + all[i].offsetHeight / 2 - list.clientHeight / 2, from = list.scrollTop;
      cancelAnimationFrame(scrollRaf);
      if (instant || calm || Math.abs(to - from) < 1) { list.scrollTop = to; return; }
      var t0 = 0;
      scrollRaf = requestAnimationFrame(function step(t) {
        t0 = t0 || t; var p = Math.min(1, (t - t0) / 800), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        list.scrollTop = from + (to - from) * e;
        if (p < 1) scrollRaf = requestAnimationFrame(step);
      });
    }
    function show(i, instant) {
      idx = i; measure(); scrollTo(i, instant);
      var k = i % n;
      all.forEach(function (li, j) { li.classList.toggle('is-active', j === i); });
      pins.forEach(function (p, j) { p.classList.toggle('is-active', j === k); });
      pills.forEach(function (p, j) { p.classList.toggle('is-active', j === k); });
      mks.forEach(function (m, j) { if (m) m.classList.toggle('is-active', j === k); });
    }
    function next() {
      if (document.hidden) return;
      if (follow) {
        show(idx + 1);
        // on the first lead of the second copy (index 2n) the view is identical to the real list with the first lead highlighted (index n): jump back to it unseen
        if (idx === 2 * n) setTimeout(function () { card.classList.add('is-snap'); show(n, true); void list.offsetHeight; card.classList.remove('is-snap'); }, 950);
        return;
      }
      show(idx + 1);
      if (idx === n) setTimeout(function () {   // landed on the clone: jump back to the real first card, unseen
        card.classList.add('is-snap'); show(0); void list.offsetHeight; card.classList.remove('is-snap');
      }, 900);
    }
    function place() { measure(); scrollTo(idx, true); }   // (re)size, and for list mode put the highlighted lead in the middle without animating
    place();
    window.addEventListener('load', place);
    window.addEventListener('resize', LV.raf(place));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    all[idx].classList.add('is-active');   // resting look from the start; the entrance animation fades the cards in to it
    if (calm) { show(idx, true); return; }
    // start in step with the CSS entrance (not a separate timer, which could drift from it): the first card's entrance animation begins when the card appears
    var started = false;
    function go() { if (started) return; started = true; show(idx); setInterval(next, step); }
    all[idx].addEventListener('animationstart', go);
    var start = (parseFloat(getComputedStyle(map).getPropertyValue('--lv-leads-start')) || 3.2) * 1000 + 1500;
    setTimeout(function () { if (!all[idx].getAnimations().length) go(); }, start);   // safety net only if there is no entrance animation at all (e.g. animations disabled)
  });
});
/* lv-media: swaps a placeholder for a real video when a play button is clicked.
   Markup: <button data-lv-video="https://player.vimeo.com/video/XXXX">  inside a [data-lv-video-frame] element.
   No data-lv-video value = the button does nothing yet (prototype). */
LV.ready(function () {
  LV.$$('[data-lv-video]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-lv-video'), frame = btn.closest('[data-lv-video-frame]');
      if (!src || !frame) return;
      var f = document.createElement('iframe');
      f.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1'; f.allow = 'autoplay; fullscreen'; f.title = btn.getAttribute('aria-label') || 'Video';
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      frame.innerHTML = ''; frame.appendChild(f);
    });
  });
});
