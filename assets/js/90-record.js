/* lv-record: rotates the "What Landvoice Expired Data Includes" pills; the active pill turns solid blue and the record mock zooms in on the matching piece.
   Markup: [data-lv-rec] (the frame) > [data-lv-rec-stage] (the record, em-sized) + [data-lv-rec-spot] (the spotlight ring); targets are [data-lv-rec-target="x"] inside the stage's first row;
   pills are [data-lv-rec-pill="x"] (click one to jump to it). Starts when the frame scrolls into view; pauses off-screen / in a hidden tab. */
LV.ready(function () {
  LV.$$('[data-lv-rec]').forEach(function (frame) {
    var stage = LV.$('[data-lv-rec-stage]', frame), spot = LV.$('[data-lv-rec-spot]', frame);
    var section = frame.closest('section'), pills = LV.$$('[data-lv-rec-pill]', section || document);
    if (!stage || !spot || !pills.length) return;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches, idx = -1, timer = 0, step = 3300;

    function geo(el) {   // position + size of an element relative to the stage, in the stage's own (untransformed) layout pixels
      var x = 0, y = 0, n = el;
      while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    }
    function show(i) {
      idx = i;
      var key = pills[i].getAttribute('data-lv-rec-pill'), target = LV.$('[data-lv-rec-target="' + key + '"]', stage);
      pills.forEach(function (p, j) { p.classList.toggle('is-active', j === i); });
      if (!target) return;
      var g = geo(target), pad = 10, vw = frame.clientWidth, vh = frame.clientHeight, L = stage.offsetLeft, T = stage.offsetTop;   // L/T = where the stage sits in the frame
      var z = Math.max(1, Math.min(vw * .72 / (g.w + 2 * pad), vh * .62 / (g.h + 2 * pad), 3.4));
      var cx = g.x + g.w / 2, cy = g.y + g.h / 2;
      stage.style.setProperty('--z', z);
      stage.style.transform = 'translate(' + (vw / 2 - L - z * cx) + 'px,' + (vh / 2 - T - z * cy) + 'px) scale(' + z + ')';
      spot.style.left = (g.x - pad) + 'px'; spot.style.top = (g.y - pad) + 'px'; spot.style.width = (g.w + 2 * pad) + 'px'; spot.style.height = (g.h + 2 * pad) + 'px';   // the spotlight is inside the stage, so it rides the camera
    }
        function next() { if (document.hidden) return; show((idx + 1) % pills.length); }
    function start() { if (timer) return; frame.classList.add('is-live'); show(0); timer = setInterval(next, step); }
    function stop() { clearInterval(timer); timer = 0; }

    pills.forEach(function (p, i) { p.addEventListener('click', function () { frame.classList.add('is-live'); show(i); if (timer) { stop(); timer = setInterval(next, step); } }); });
    window.addEventListener('resize', LV.raf(function () { if (idx >= 0) show(idx); }));
    if (calm || !('IntersectionObserver' in window)) { frame.classList.add('is-live'); show(0); return; }
    new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: .45 }).observe(frame);
  });
});
