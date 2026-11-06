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
    var all = leads.slice(), idx = 0, step = 2800, hero = card.closest('.lv-hero'), calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!follow) { var clone = leads[0].cloneNode(true); clone.setAttribute('aria-hidden', 'true'); list.appendChild(clone); all.push(clone); }
    else leads.forEach(function (l) { var c = l.cloneNode(true); c.setAttribute('aria-hidden', 'true'); list.appendChild(c); all.push(c); });   // list mode loops forever: a second copy of the list follows the first, and the view snaps back unseen (see snap())

    function measure() {
      if (follow) {   // list mode: the card runs from its top down to the bottom of the hero (stacked under the map on small screens, where CSS sets the height)
        if (window.innerWidth <= 1100 || !hero) { card.style.height = ''; return; }
        card.style.height = Math.max(0, hero.getBoundingClientRect().bottom - (map.getBoundingClientRect().top + card.offsetTop)) + 'px';
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
    function scrollTo(i, instant) {   // list mode: the highlight steps down the first three rows, then the list scrolls up under it so the highlight stays on row 3 (eased, 0.8s)
      if (!follow) return;
      var to = Math.max(0, all[i].offsetTop - all[2].offsetTop), from = list.scrollTop;
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
        // the highlight is on the copy of lead 3 (row 3) when idx = n + 2: that view is identical to the real list with lead 3 highlighted, so jump back to it unseen
        if (idx === n + 2) setTimeout(function () { card.classList.add('is-snap'); show(2, true); void list.offsetHeight; card.classList.remove('is-snap'); }, 950);
        return;
      }
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
