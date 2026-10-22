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
/* lv-marquee: duplicates the track's children once so the CSS loop is seamless.
   Markup: .lv-marquee > [data-lv-marquee] (the track) > items.  Speed: style="--lv-marquee-speed:40s" */
LV.ready(function () {
  LV.$$('[data-lv-marquee]').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (c) {
      var clone = c.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
    });
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
