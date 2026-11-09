/* lv-billing: Monthly / Quarterly / Annually tabs for the pricing plans.
   Markup: [data-lv-billing] (role=tablist) holds buttons [data-lv-period="monthly|quarterly|annual"]; the plans element [data-lv-plans] in the same section gets data-period
   set to the chosen tab, and the CSS shows the matching price. Works without JS too (the HTML already carries data-period); arrow keys move between tabs. */
LV.ready(function () {
  LV.$$('[data-lv-billing]').forEach(function (bar) {
    var section = bar.closest('section'), plans = section && LV.$('[data-lv-plans]', section), tabs = LV.$$('[data-lv-period]', bar);
    if (!plans || !tabs.length) return;
    function set(period) {
      plans.setAttribute('data-period', period);
      tabs.forEach(function (t) { var on = t.getAttribute('data-lv-period') === period; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { set(t.getAttribute('data-lv-period')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus(); set(next.getAttribute('data-lv-period')); e.preventDefault();
      });
    });
  });
});
