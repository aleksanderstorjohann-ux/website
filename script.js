// Toggle the mobile navigation menu open/closed when the hamburger is tapped.
document.querySelectorAll('.nav-toggle').forEach(function (button) {
  button.addEventListener('click', function () {
    var nav = button.parentElement.querySelector('.site-nav');
    var isOpen = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
  });
});

// Make the hero arrow smooth-scroll to the next section when clicked.
// (A plain #anchor won't work here because the page scrolls inside <main class="snap">,
//  not the whole window — so we scroll that section into view ourselves.)
document.querySelectorAll('.scroll-cue').forEach(function (cue) {
  cue.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(cue.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
