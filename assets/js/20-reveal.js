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
