/* lv-marquee: duplicates the track's children once so the CSS loop is seamless.
   Markup: .lv-marquee > [data-lv-marquee] (the track) > items.  Speed: style="--lv-marquee-speed:40s" */
LV.ready(function () {
  LV.$$('[data-lv-marquee]').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (c) {
      var clone = c.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
    });
  });
});
