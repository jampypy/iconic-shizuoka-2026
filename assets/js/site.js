/* Iconic Shizuoka 2026 — site.js */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');

  /* header shadow on scroll */
  var header = d.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  var btn = d.querySelector('.menu-btn'), nav = d.getElementById('mobile-nav');
  function closeNav() {
    if (!nav) return;
    nav.hidden = true; root.classList.remove('nav-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.hidden;
      nav.hidden = !open; root.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (e) { if (e.matches) closeNav(); });
  }

  /* settle-in reveal: elements are visible at rest and ease into place */
  var els = Array.prototype.slice.call(d.querySelectorAll('[data-reveal]'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el, i) {
      var delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.transitionDelay = delay + 'ms';
      io.observe(el);
    });
  }
})();
