(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.querySelector('.sr-only').textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Abrir menu';
  }));

  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.project-card');
  const filterStatus = document.getElementById('filter-status');
  filters.forEach((filter) => filter.addEventListener('click', () => {
    const selected = filter.dataset.filter;
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visibleCards = 0;
    cards.forEach((card) => {
      const isHidden = selected !== 'Todos' && card.dataset.category !== selected;
      card.classList.toggle('is-hidden', isHidden);
      card.setAttribute('aria-hidden', String(isHidden));
      if (!isHidden) visibleCards += 1;
    });
    filterStatus.textContent = `${visibleCards} ${visibleCards === 1 ? 'projeto encontrado' : 'projetos encontrados'} em ${selected}.`;
  }));

  document.querySelectorAll('.project-visual img').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.project-visual').classList.add('screenshot-fallback');
    }, { once: true });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
  const revealItems = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); currentObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }
})();
