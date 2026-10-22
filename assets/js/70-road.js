/* lv-road: fills the vertical road as you scroll and switches each row on when the road reaches it.
   It only plays forward: once drawn it stays drawn, so scrolling back up never rewinds it.
   Markup: [data-lv-road] > .lv-road__rows > [data-lv-road-row] (first/second item + .lv-road__mid), and .lv-road__fill inside .lv-road__line
   Tweak: data-lv-road-trigger="0.62" is how far down the screen (0-1) the road tip sits. */
LV.ready(function () {
  LV.$$('[data-lv-road]').forEach(function (road) {
    var rows = LV.$$('[data-lv-road-row]', road), rowsBox = LV.$('.lv-road__rows', road);
    var trigger = parseFloat(road.getAttribute('data-lv-road-trigger')) || 0.62, drawn = 0;
    if (!rowsBox) return;
    var update = function () {
      var top = rowsBox.getBoundingClientRect().top, height = rowsBox.offsetHeight;
      var tip = LV.reduceMotion ? height : LV.clamp(window.innerHeight * trigger - top, 0, height + 90);
      drawn = Math.max(drawn, tip); tip = drawn;   /* first pass only: never retract */
      road.style.setProperty('--lv-road-progress', (tip + 90) + 'px');            /* line starts 90px above the first row */
      rows.forEach(function (row) {
        var node = LV.$('.lv-road__node', row);
        var y = row.offsetTop + (node ? node.offsetTop : 0);
        if (tip >= y - 6 && top + y < window.innerHeight * 0.92) row.classList.add('is-active');
      });
    };
    window.addEventListener('scroll', LV.raf(update), { passive: true });
    window.addEventListener('resize', LV.raf(update)); update();
  });
});
