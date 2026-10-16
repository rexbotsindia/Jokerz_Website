// Jokerz demo interactions: sticky header state, mobile nav, menu filter, scroll reveals, demo form.
(function () {
  document.documentElement.classList.add('js');

  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile navigation
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // Menu filter
  const chips = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-menu] [data-cat]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => {
      const on = c === chip;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', String(on));
    });
    items.forEach((item) => {
      item.hidden = f !== 'all' && item.dataset.cat !== f;
      if (!item.hidden) item.classList.add('is-in');
    });
  }));

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Demo enquiry form: validates locally, sends nothing.
  const form = document.querySelector('[data-order-form]');
  const status = document.querySelector('[data-form-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = form.elements.name.value.trim().split(' ')[0];
    status.textContent = `Thanks, ${name}! In the live site this would reach the Jokerz cake team. (Demo — nothing was sent.)`;
    status.classList.add('is-ok');
    form.reset();
  });
})();
