/* lv-menu: header burger.  Markup: [data-lv-menu-toggle] controls the element with id = its aria-controls */
LV.ready(function () {
  LV.$$('[data-lv-menu-toggle]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var set = function (open) { btn.setAttribute('aria-expanded', open); panel.hidden = !open; };
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });
});
