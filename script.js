// Toggle the mobile navigation menu open/closed when the hamburger is tapped.
document.querySelectorAll('.nav-toggle').forEach(function (button) {
  button.addEventListener('click', function () {
    var nav = button.parentElement.querySelector('.site-nav');
    var isOpen = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
  });
});
