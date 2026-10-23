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
