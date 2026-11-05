/* lv-leads slider: rotates the highlighted pin (+ its pill) and slides the matching lead into view, one at a time, 1.5 cards visible.
   Markup: [data-lv-leads-slider] (inside .lv-hero__map) > .lv-leads__list > li.lv-lead (one per pin, same order as .lv-pin / .lv-prop-card).
   A clone of the first lead is appended so the loop wraps seamlessly. Starts when the CSS --lv-leads-start (+.4s) has passed. No JS = first card only, no highlight. */
LV.ready(function () {
  LV.$$('[data-lv-leads-slider]').forEach(function (card) {
    var map = card.closest('.lv-hero__map'), list = LV.$('.lv-leads__list', card);
    var leads = LV.$$('.lv-lead', list), n = leads.length;
    if (!map || !n) return;
    var pins = LV.$$('.lv-pin', map), pills = LV.$$('.lv-prop-card', map);
    var clone = leads[0].cloneNode(true); clone.setAttribute('aria-hidden', 'true'); list.appendChild(clone);
    var all = leads.concat([clone]), idx = 0, step = 2800;

    function measure() {   // card height = padding + current card + gap + half of the next one; the list is moved so the current card sits at the top
      var h = all[0].offsetHeight, pad = all[0].offsetTop, gap = all[1].offsetTop - all[0].offsetTop - h;
      card.style.height = Math.round(pad + h + gap + h / 2) + 'px';
      list.style.transform = 'translateY(' + -(all[idx].offsetTop - pad) + 'px)';
    }
    function show(i) {
      idx = i; measure();
      var k = i % n;
      all.forEach(function (li, j) { li.classList.toggle('is-active', j === i); });
      pins.forEach(function (p, j) { p.classList.toggle('is-active', j === k); });
      pills.forEach(function (p, j) { p.classList.toggle('is-active', j === k); });
    }
    function next() {
      if (document.hidden) return;
      show(idx + 1);
      if (idx === n) setTimeout(function () {   // landed on the clone: jump back to the real first card, unseen
        card.classList.add('is-snap'); show(0); void list.offsetHeight; card.classList.remove('is-snap');
      }, 900);
    }
    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', LV.raf(measure));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { card.classList.add('is-running'); show(0); return; }
    var start = (parseFloat(getComputedStyle(map).getPropertyValue('--lv-leads-start')) || 3.7) * 1000 + 400;
    setTimeout(function () { card.classList.add('is-running'); show(0); setInterval(next, step); }, start);
  });
});
