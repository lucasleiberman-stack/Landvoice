/* lv-leads: stretches the hero leads card from its top down to the bottom edge of the hero, so the list runs off the bottom of the hero block.
   Markup: [data-lv-leads] inside .lv-hero__map inside .lv-hero. Below 1100px the card sits under the map, so the height is left to CSS. */
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
  });
});
