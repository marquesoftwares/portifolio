(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      const srLabel = menuButton.querySelector('.sr-only');
      if (srLabel) {
        srLabel.textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
      }
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        const srLabel = menuButton.querySelector('.sr-only');
        if (srLabel) {
          srLabel.textContent = 'Abrir menu';
        }
      });
    });
  }

  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.project-card');
  const filterStatus = document.getElementById('filter-status');

  if (filters.length && cards.length) {
    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
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

        if (filterStatus) {
          filterStatus.textContent = `${visibleCards} ${visibleCards === 1 ? 'projeto encontrado' : 'projetos encontrados'} em ${selected}.`;
        }
      });
    });
  }

  document.querySelectorAll('.project-visual img').forEach((image) => {
    image.addEventListener(
      'error',
      () => {
        const visualWrap = image.closest('.project-visual');
        if (visualWrap) {
          visualWrap.classList.add('screenshot-fallback');
        }
      },
      { once: true }
    );
  });

  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              currentObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealItems.forEach((item) => observer.observe(item));
    }
  }

  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let animationId = null;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const waves = [
      { amplitude: 40, wavelength: 0.0024, speed: 0.012, phase: 0.0, yOffsetRatio: 0.22, color: 'rgba(255, 98, 76, 0.14)', width: 1.2 },
      { amplitude: 52, wavelength: 0.0018, speed: 0.008, phase: 1.8, yOffsetRatio: 0.26, color: 'rgba(255, 130, 105, 0.10)', width: 1.0 },
      { amplitude: 32, wavelength: 0.0030, speed: 0.015, phase: 3.5, yOffsetRatio: 0.24, color: 'rgba(255, 98, 76, 0.07)', width: 0.9 },
      { amplitude: 62, wavelength: 0.0014, speed: 0.006, phase: 5.1, yOffsetRatio: 0.29, color: 'rgba(245, 241, 233, 0.04)', width: 0.8 },
      { amplitude: 46, wavelength: 0.0021, speed: 0.011, phase: 0.7, yOffsetRatio: 0.34, color: 'rgba(255, 98, 76, 0.16)', width: 1.3 },
      { amplitude: 60, wavelength: 0.0016, speed: 0.007, phase: 2.6, yOffsetRatio: 0.38, color: 'rgba(255, 110, 85, 0.12)', width: 1.1 },
      { amplitude: 36, wavelength: 0.0028, speed: 0.014, phase: 4.4, yOffsetRatio: 0.36, color: 'rgba(255, 98, 76, 0.08)', width: 1.0 },
      { amplitude: 70, wavelength: 0.0012, speed: 0.005, phase: 1.5, yOffsetRatio: 0.42, color: 'rgba(245, 241, 233, 0.05)', width: 0.8 },
      { amplitude: 44, wavelength: 0.0020, speed: 0.010, phase: 3.2, yOffsetRatio: 0.48, color: 'rgba(255, 98, 76, 0.13)', width: 1.1 },
      { amplitude: 56, wavelength: 0.0017, speed: 0.007, phase: 0.9, yOffsetRatio: 0.52, color: 'rgba(255, 140, 115, 0.09)', width: 1.0 },
      { amplitude: 38, wavelength: 0.0026, speed: 0.014, phase: 5.4, yOffsetRatio: 0.46, color: 'rgba(255, 98, 76, 0.06)', width: 0.8 },
      { amplitude: 66, wavelength: 0.0013, speed: 0.005, phase: 2.1, yOffsetRatio: 0.56, color: 'rgba(245, 241, 233, 0.04)', width: 0.8 }
    ];

    const getY = (wave, x) => {
      const baseY = height * wave.yOffsetRatio;
      const angle = x * wave.wavelength + time * wave.speed + wave.phase;
      const harmonic = Math.sin(angle * 0.5) * 14;
      return baseY + Math.sin(angle) * wave.amplitude + harmonic;
    };

    const beams = [];
    const beamCount = 8;

    const resetBeam = (b, isInitial = false) => {
      b.waveIndex = Math.floor(Math.random() * waves.length);
      b.speed = 6.5 + Math.random() * 8.5;
      b.length = 260 + Math.random() * 240;
      b.x = isInitial ? Math.random() * (width || 1200) : -b.length - Math.random() * 350;
      b.width = 2.2 + Math.random() * 1.4;
      b.isLaserWhite = Math.random() < 0.4;
    };

    for (let i = 0; i < beamCount; i++) {
      const b = {};
      resetBeam(b, true);
      beams.push(b);
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      const waveCount = waves.length;
      for (let w = 0; w < waveCount; w++) {
        const wave = waves[w];
        ctx.beginPath();
        const step = width < 700 ? 8 : 5;

        for (let x = 0; x <= width; x += step) {
          const y = getY(wave, x);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.width;
        ctx.stroke();
      }

      ctx.save();
      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];
        b.x += b.speed;

        if (b.x - b.length > width) {
          resetBeam(b);
          continue;
        }

        const wave = waves[b.waveIndex];
        const halfLen = b.length / 2;
        const startX = Math.max(0, b.x - halfLen);
        const endX = Math.min(width, b.x + halfLen);

        if (endX <= startX) continue;

        const startY = getY(wave, startX);
        const endY = getY(wave, endX);

        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        if (b.isLaserWhite) {
          grad.addColorStop(0, 'rgba(255, 98, 76, 0)');
          grad.addColorStop(0.35, 'rgba(255, 120, 100, 0.4)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.65, 'rgba(255, 120, 100, 0.4)');
          grad.addColorStop(1, 'rgba(255, 98, 76, 0)');
        } else {
          grad.addColorStop(0, 'rgba(255, 98, 76, 0)');
          grad.addColorStop(0.35, 'rgba(255, 98, 76, 0.5)');
          grad.addColorStop(0.5, 'rgba(255, 175, 150, 0.9)');
          grad.addColorStop(0.65, 'rgba(255, 98, 76, 0.5)');
          grad.addColorStop(1, 'rgba(255, 98, 76, 0)');
        }

        ctx.beginPath();
        const step = 6;
        for (let px = startX; px <= endX; px += step) {
          const py = getY(wave, px);
          if (px === startX) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        const lastY = getY(wave, endX);
        ctx.lineTo(endX, lastY);

        ctx.strokeStyle = grad;
        ctx.lineWidth = b.width;
        ctx.shadowColor = '#ff624c';
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
      ctx.restore();

      if (!prefersReduced) {
        animationId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationId) cancelAnimationFrame(animationId);
      } else if (!prefersReduced) {
        animationId = requestAnimationFrame(draw);
      }
    });

    resize();
    draw();
  }
})();
