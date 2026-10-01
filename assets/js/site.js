/* Shared chrome: footer year, mobile dropdown menu. */
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  var label = toggle.querySelector('.menu-label');

  function setOpen(open, returnFocus) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    if (!open && returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () { setOpen(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false, true);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 760 && !menu.hidden) setOpen(false);
  });
})();
