/* lv-marquee: repeats the track's items until one half is wider than the strip, then doubles it, so the CSS loop (translateX -50%) is seamless on any screen width.
   Markup: .lv-marquee > [data-lv-marquee] (the track) > items.  Speed: style="--lv-marquee-speed:40s" */
LV.ready(function () {
  LV.$$('[data-lv-marquee]').forEach(function (track) {
    var originals = Array.prototype.slice.call(track.children);
    var strip = track.parentNode, built = 0;
    function copy(node) { var c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }
    function build() {
      var width = strip.clientWidth;
      if (!width || width === built) return;
      built = width;
      while (track.children.length > originals.length) track.removeChild(track.lastChild);   // reset to the originals
      var setWidth = track.scrollWidth || 1, copies = Math.max(1, Math.ceil(width / setWidth));
      for (var i = 1; i < copies; i++) originals.forEach(function (n) { track.appendChild(copy(n)); });
      Array.prototype.slice.call(track.children).forEach(function (n) { track.appendChild(copy(n)); });   // second half for the loop
    }
    build();
    window.addEventListener('load', function () { built = 0; build(); });
    window.addEventListener('resize', LV.raf(build));
  });
});
