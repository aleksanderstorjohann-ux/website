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

    var marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#1a2e4a',
      fillOpacity: 1
    }).addTo(map);

    // Hover: show the venue name (and a hint that clicking jumps to its info).
    marker.bindTooltip(
      '<strong>' + name + '</strong><br><span class="venue-tooltip-hint">Click for info</span>',
      { direction: 'top', offset: [0, -10], className: 'venue-tooltip' }
    );

    // Click: scroll the page to that venue's card, centred in the screen.
    marker.on('click', function () {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    points.push([lat, lng]);
  });

  if (points.length) {
    map.fitBounds(points, { padding: [30, 30] });
  }
  // The section is off-screen at load; recalc size once so tiles render fully.
  setTimeout(function () { map.invalidateSize(); }, 300);
})();

// ===== Gallery lightbox: click a photo to view it larger, arrows to browse =====
(function () {
  var thumbs = [].slice.call(document.querySelectorAll('.gallery-thumb'));
  var lightbox = document.getElementById('lightbox');
  if (!thumbs.length || !lightbox) return;

  var img = lightbox.querySelector('.lightbox-img');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  var current = 0;

  function show(index) {
    current = (index + thumbs.length) % thumbs.length; // wrap around both ends
    var thumb = thumbs[current];
    img.src = thumb.src;
    img.alt = thumb.alt;
  }

  function open(index) {
    show(index);
    lightbox.classList.add('open');
  }

  function close() {
    lightbox.classList.remove('open');
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () { open(index); });
    // Let keyboard users (Tab + Enter/Space) open it too, not just mouse clicks.
    thumb.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(index);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });

  // Click the dark backdrop (not the image or buttons) to close.
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  // Keyboard: Escape closes, left/right arrows browse.
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Touch swipe: drag left/right on the image to browse (mobile).
  var touchStartX = null;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) show(current + 1); // swiped left -> next
      else show(current - 1);           // swiped right -> previous
    }
    touchStartX = null;
  }, { passive: true });
})();
