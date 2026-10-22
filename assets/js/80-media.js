/* lv-media: swaps a placeholder for a real video when a play button is clicked.
   Markup: <button data-lv-video="https://player.vimeo.com/video/XXXX">  inside a [data-lv-video-frame] element.
   No data-lv-video value = the button does nothing yet (prototype). */
LV.ready(function () {
  LV.$$('[data-lv-video]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-lv-video'), frame = btn.closest('[data-lv-video-frame]');
      if (!src || !frame) return;
      var f = document.createElement('iframe');
      f.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1'; f.allow = 'autoplay; fullscreen'; f.title = btn.getAttribute('aria-label') || 'Video';
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      frame.innerHTML = ''; frame.appendChild(f);
    });
  });
});
