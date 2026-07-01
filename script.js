// ===== Mobile menu toggle =====
document.querySelectorAll('.nav-toggle').forEach(function (button) {
  button.addEventListener('click', function () {
    var nav = button.parentElement.querySelector('.site-nav');
    var isOpen = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
  });
});

// ===== Smooth scroll for every in-page anchor link =====
// The page scrolls inside <main class="snap">, not the window, so a plain
// #anchor won't move it. We scroll the target section into view ourselves.
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var href = link.getAttribute('href');
    if (href.length < 2) return; // ignore a bare "#"
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Close the mobile menu after choosing a destination.
    var openNav = document.querySelector('.site-nav.open');
    if (openNav) {
      openNav.classList.remove('open');
      var toggle = document.querySelector('.nav-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// ===== Scrollspy: highlight the menu item for the section in view =====
// We check which section sits under the middle of the screen as you scroll.
(function () {
  var container = document.querySelector('.snap');
  var navLinks = document.querySelectorAll('.site-nav a');
  if (!container || !navLinks.length) return;

  var linkFor = {};
  navLinks.forEach(function (link) { linkFor[link.getAttribute('href')] = link; });

  var sections = [].slice.call(document.querySelectorAll('.snap-section'))
    .filter(function (s) { return s.id; });

  var ticking = false;
  function updateActive() {
    ticking = false;
    var mid = container.getBoundingClientRect().top + container.clientHeight / 2;
    var current = null;
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) current = s;
    });
    if (!current) return;
    var link = linkFor['#' + current.id];
    if (!link) return; // sections without a menu item keep the previous highlight
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    link.classList.add('active');
  }

  container.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  }, { passive: true });

  updateActive(); // set the initial highlight on load
})();
