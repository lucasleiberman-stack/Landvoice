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
    // address blurb next to the highlighted marker: one floating label inside .lv-props, moved + re-filled for each pin
    var props = LV.$('.lv-props', map), tip = null, tipTimer = 0, spots = pins.map(function (p) {
      var g = LV.$('g[transform]', p), m = g && /translate\(([\d.]+)[ ,]+([\d.]+)\)/.exec(g.getAttribute('transform'));
      return m ? { x: +m[1], y: +m[2] } : null;
    });
    if (props) { tip = document.createElement('div'); tip.className = 'lv-pin-tip'; tip.setAttribute('aria-hidden', 'true'); props.appendChild(tip); }
    function showTip(k) {
      if (!tip || !spots[k]) return;
      clearTimeout(tipTimer); tip.classList.remove('is-on');
      tipTimer = setTimeout(function () {   // fade the old one out, then move + refill + fade in
        var a = LV.$('.lv-lead__addr', leads[k]), street = a && a.firstChild ? a.firstChild.textContent : '';
        tip.textContent = street;
        tip.style.setProperty('--tx', spots[k].x); tip.style.setProperty('--ty', spots[k].y);
        tip.style.setProperty('--c', getComputedStyle(pins[k]).getPropertyValue('--c'));
        tip.classList.toggle('is-left', spots[k].x > 330);   // markers on the right put the blurb on their left, away from the list card
        tip.classList.add('is-on');
      }, 220);
    }
    function show(i) {
      idx = i; measure();
      var k = i % n;
      showTip(k);
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

    all[0].classList.add('is-active');   // resting look from the start; the entrance animation fades the cards in to it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { show(0); return; }
    // start in step with the CSS entrance (not a separate timer, which could drift from it): the first card's entrance animation begins when the card appears
    var started = false;
    function go() { if (started) return; started = true; show(0); setInterval(next, step); }
    all[0].addEventListener('animationstart', go);
    var start = (parseFloat(getComputedStyle(map).getPropertyValue('--lv-leads-start')) || 3.2) * 1000 + 1500;
    setTimeout(function () { if (!all[0].getAnimations().length) go(); }, start);   // safety net only if there is no entrance animation at all (e.g. animations disabled)
  });
});
