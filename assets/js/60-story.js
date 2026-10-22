/* lv-story: "scroll story". The section sticks to the viewport; the right-hand track scrolls while the left stays put.
   Markup: [data-lv-story data-lv-story-speed="1.1"]  >  [data-lv-story-sticky]  >  [data-lv-story-window]  >  [data-lv-story-track]  (optional [data-lv-story-num] marks the last item's big number to line up with the h2)
   Optional: data-lv-story-until=".selector" names the element that follows (default: next sibling); data-lv-story-gap="0.45" keeps that share of the empty space under the last item.
   Below 900px the effect is switched off and the content flows normally. */
LV.ready(function () {
  LV.$$('[data-lv-story]').forEach(function (root) {
    var sticky = LV.$('[data-lv-story-sticky]', root), win = LV.$('[data-lv-story-window]', root), track = LV.$('[data-lv-story-track]', root);
    var speed = parseFloat(root.getAttribute('data-lv-story-speed')) || 1.1, distance = 0, enabled = false;
    if (!sticky || !win || !track) return;
    var ctx = document.createElement('canvas').getContext('2d');
    // px from an element's top edge down to the top of its capital letters
    var capTop = function (el) {
      var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      ctx.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
      var m = ctx.measureText('H'), lh = parseFloat(cs.lineHeight) || fs * 1.2;
      var content = (m.fontBoundingBoxAscent || fs * .9) + (m.fontBoundingBoxDescent || fs * .25);
      return (lh - content) / 2 + (m.fontBoundingBoxAscent || fs * .9) - m.actualBoundingBoxAscent;
    };
    var measure = function () {
      enabled = window.innerWidth > 900 && !LV.reduceMotion;
      if (!enabled) { root.style.height = ''; root.style.marginBottom = ''; track.style.transform = ''; return; }
      track.style.transform = 'none';
      // scroll until the last stat's big number sits level with the headline (cap-height to cap-height)
      var last = track.lastElementChild, pad = parseFloat(getComputedStyle(track).paddingTop) || 0;
      var num = LV.$('[data-lv-story-num]', last) || last, head = LV.$('h2', sticky);
      var lastTop = num.getBoundingClientRect().top - track.getBoundingClientRect().top;
      var shift = head ? capTop(num) - capTop(head) : 0;   // extra gap above the digits' tops vs the headline's tops
      distance = Math.max(0, lastTop - pad + shift);
      root.style.height = (sticky.offsetHeight + distance * speed) + 'px';
      // the empty stretch left under the last stat: pull the next block up so only `data-lv-story-gap` (default 45%) of it remains
      root.style.marginBottom = '0px';
      var sel = root.getAttribute('data-lv-story-until'), next = (sel && document.querySelector(sel)) || root.nextElementSibling;
      if (next) {
        // positions relative to the pinned stage, so the maths doesn't depend on the current scroll position
        var st = sticky.getBoundingClientRect(), rb = root.getBoundingClientRect();
        var lastBottomAtEnd = rb.bottom - st.height + (last.getBoundingClientRect().bottom - st.top) - distance;
        var gap = next.getBoundingClientRect().top - lastBottomAtEnd;
        var keep = parseFloat(root.getAttribute('data-lv-story-gap'));
        if (!(keep >= 0)) keep = 0.45;
        if (gap > 0) root.style.marginBottom = (-gap * (1 - keep)).toFixed(0) + 'px';
      }
      update();
    };
    var update = function () {
      if (!enabled) return;
      var scrollable = root.offsetHeight - sticky.offsetHeight;
      var pinTop = parseFloat(getComputedStyle(sticky).top) || 0;   // the stage pins this far below the viewport top
      var p = LV.clamp((pinTop - root.getBoundingClientRect().top) / scrollable, 0, 1);
      track.style.transform = 'translate3d(0,' + (-p * distance).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', LV.raf(update), { passive: true });
    window.addEventListener('resize', LV.raf(measure));
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
  });
});
