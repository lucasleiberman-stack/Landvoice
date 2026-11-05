/* lv-leads: (1) stretches the hero leads card from its top down to the bottom edge of the hero, so the list runs off the bottom and the CSS fade takes over there;
   (2) keeps the list alive: every 1.5s the next lead from the looping data set opens up at the top and pushes the others down one place.
   Markup: [data-lv-leads] inside .lv-hero__map inside .lv-hero (the leads in its <ul> are the data set that loops). Below 1100px the card sits under the map and stays still. */
LV.ready(function () {
  LV.$$('[data-lv-leads]').forEach(function (card) {
    var hero = card.closest('.lv-hero'), map = card.offsetParent;
    if (!hero || !map) return;
    function fit() {
      if (window.innerWidth <= 1100) { card.style.height = ''; return; }
      var top = map.getBoundingClientRect().top + card.offsetTop;   // offsetTop ignores the entrance animation's transform
      card.style.height = Math.max(0, hero.getBoundingClientRect().bottom - top) + 'px';
    }
    fit();
    window.addEventListener('load', fit);
    window.addEventListener('resize', LV.raf(fit));

    var list = LV.$('.lv-leads__list', card);
    if (!list || LV.reduceMotion) return;
    var pool = LV.$$('.lv-lead', list).map(function (li) { return li.cloneNode(true); });
    var next = pool.length - 1, EVERY = 1500, START = 8400;   // START = ms after page load: the first rows have all landed by then
    function tick() {
      var r = hero.getBoundingClientRect();
      if (document.hidden || window.innerWidth <= 1100 || r.bottom < 0 || r.top > window.innerHeight) return;
      var li = pool[next].cloneNode(true);
      next = (next + pool.length - 1) % pool.length;   // walk the data set backwards so the list reads as one endless loop
      li.style.animation = 'none';
      li.style.visibility = 'hidden';
      list.insertBefore(li, list.firstChild);
      var h = li.getBoundingClientRect().height, pad = getComputedStyle(li);
      var pt = pad.paddingTop, pb = pad.paddingBottom;
      li.classList.add('is-entering');
      li.style.height = '0px'; li.style.paddingTop = '0px'; li.style.paddingBottom = '0px'; li.style.opacity = '0'; li.style.visibility = '';
      li.getBoundingClientRect();   // force a reflow so the transition starts from the closed state
      li.style.height = h + 'px'; li.style.paddingTop = pt; li.style.paddingBottom = pb; li.style.opacity = '1';
      setTimeout(function () { li.classList.remove('is-entering'); li.style.height = li.style.paddingTop = li.style.paddingBottom = li.style.opacity = ''; }, 700);
      // drop the lead that fell off the bottom, but only once the rest still fill the card
      var last = list.lastElementChild, prev = last && last.previousElementSibling;
      if (prev && prev.getBoundingClientRect().bottom - list.getBoundingClientRect().top > card.clientHeight + 40) list.removeChild(last);
    }
    setTimeout(function () { setInterval(tick, EVERY); }, Math.max(0, START - (window.performance ? performance.now() : 0)));
  });
});
