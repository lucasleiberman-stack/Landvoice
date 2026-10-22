/* lv-core: tiny helpers shared by the other modules. Load this first.
   Everything is opt-in through data attributes; nothing runs unless the markup asks for it. */
window.LV = (function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ready = function (fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); };
  var raf = function (fn) { var p = false; return function () { if (p) return; p = true; requestAnimationFrame(function () { p = false; fn(); }); }; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.remove('no-js');
  return { $: $, $$: $$, ready: ready, raf: raf, clamp: clamp, reduceMotion: reduceMotion };
})();
