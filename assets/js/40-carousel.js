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
