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

/* lv-mega: the hover/focus mega menu is pure CSS; this adds tap-to-open on touch screens and Escape to close.
   Markup: <li data-lv-mega> <a>Products</a> <div class="lv-mega">...</div> </li> */
LV.ready(function () {
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  LV.$$('[data-lv-mega]').forEach(function (item) {
    var link = item.querySelector('a');
    if (touch) link.addEventListener('click', function (e) { if (!item.classList.contains('is-open')) { e.preventDefault(); item.classList.add('is-open'); } });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) item.classList.remove('is-open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { item.classList.remove('is-open'); if (item.contains(document.activeElement)) document.activeElement.blur(); } });
  });
});

/* lv-header: adds .is-stuck once the page has scrolled, so the bar floats (see header.css). */
LV.ready(function () {
  var header = LV.$('.lv-header');
  if (!header) return;
  var update = LV.raf(function () { header.classList.toggle('is-stuck', window.scrollY > 40); });
  window.addEventListener('scroll', update, { passive: true });
  update();
});
