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
