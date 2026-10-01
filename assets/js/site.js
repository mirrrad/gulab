/* Shared page behaviour: nav, mobile menu, footer year, in-page smooth scroll. */
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Navbar background on scroll
  var nav = document.getElementById('nav');
  var ticking = false;
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();

  // Mobile menu
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMobile');
  var menuLinks = Array.prototype.slice.call(menu.querySelectorAll('a'));
  var logo = nav.querySelector('.nav-logo');

  function isOpen() { return menu.classList.contains('open'); }

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    menuLinks[0].focus();
  }

  function closeMenu(returnFocus) {
    if (!isOpen()) return;
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    isOpen() ? closeMenu(true) : openMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    var focusables = [logo, toggle].concat(menuLinks);
    var i = focusables.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
    else if (!e.shiftKey && i === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeMenu(false);
  });

  // Links that navigate away (e.g. index.html#about from a category page) also close the menu
  menuLinks.forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });

  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      var target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu(false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
    });
  });
})();
