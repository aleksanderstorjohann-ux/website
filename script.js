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

// ===== Golf in Copenhagen: map (Leaflet + OpenStreetMap, no API key) =====
// Builds one pin per venue card, reading its data-lat / data-lng.
(function () {
  var el = document.getElementById('cph-map');
  if (!el || typeof L === 'undefined') return;

  var map = L.map(el, { scrollWheelZoom: false }); // don't hijack page scroll
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var points = [];
  document.querySelectorAll('#golf-in-copenhagen .venue-card').forEach(function (card, index) {
    var lat = parseFloat(card.getAttribute('data-lat'));
    var lng = parseFloat(card.getAttribute('data-lng'));
    if (isNaN(lat) || isNaN(lng)) return;

    // Give the card a stable id so a pin click can scroll straight to it.
    if (!card.id) card.id = 'venue-' + index;

    var name = card.getAttribute('data-name') || '';
    var link = card.querySelector('.venue-link');
    var url = link ? link.getAttribute('href') : '';
    var html = '<strong>' + name + '</strong>';
    if (url) html += '<br><a href="' + url + '" target="_blank" rel="noopener">Website &rarr;</a>';

    var marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#1a2e4a',
      fillOpacity: 1
    }).addTo(map).bindPopup(html);

    // Clicking a pin scrolls the page down to that venue's card below the map.
    marker.on('click', function () {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    points.push([lat, lng]);
  });

  if (points.length) {
    map.fitBounds(points, { padding: [30, 30] });
  }
  // The section is off-screen at load; recalc size once so tiles render fully.
  setTimeout(function () { map.invalidateSize(); }, 300);
})();
