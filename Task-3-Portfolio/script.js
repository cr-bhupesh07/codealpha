'use strict';

/* =========================================================
   Personal Portfolio - Bhupesh Kumar
   Features: mobile menu, active nav link, scroll reveal,
   header shadow, back-to-top, toast messages, resume check.
   ========================================================= */

(function () {
  /* ---------- Elements ---------- */
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');
  const backToTop = document.getElementById('back-to-top');
  const toast = document.getElementById('toast');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     Toast message (small popup at the bottom)
     ========================================================= */
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4200);
  }

  /* =========================================================
     Mobile navigation
     ========================================================= */
  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }

  navToggle.addEventListener('click', function () {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setMenu(!isOpen);
  });

  // Close the menu after choosing a link
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenu(false);
    });
  });

  // Close with Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Close when clicking outside the header
  document.addEventListener('click', function (event) {
    if (navMenu.classList.contains('open') && !header.contains(event.target)) {
      setMenu(false);
    }
  });

  // Reset the menu when the window becomes wide
  window.matchMedia('(min-width: 861px)').addEventListener('change', function (event) {
    if (event.matches) {
      setMenu(false);
    }
  });

  /* =========================================================
     Header style + back-to-top button on scroll
     ========================================================= */
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 10);
    backToTop.classList.toggle('visible', scrollY > 600);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* =========================================================
     Highlight the nav link of the section on screen
     ========================================================= */
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach(function (link) {
          const isActive = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* =========================================================
     Scroll reveal animation
     ========================================================= */

  // Give children of grids a small staggered delay
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    Array.from(parent.children).forEach(function (child, index) {
      child.style.setProperty('--delay', index * 90 + 'ms');
    });
  });

  const revealItems = document.querySelectorAll('.reveal');

  // After the animation ends, remove the helper classes so hover effects stay fast
  function finishReveal(element) {
    setTimeout(function () {
      element.classList.remove('reveal', 'is-visible');
    }, 1400);
  }

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
          finishReveal(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    // No animation support: just show everything
    revealItems.forEach(function (item) {
      item.classList.remove('reveal');
    });
  }

  /* =========================================================
     Project card glow that follows the mouse
     ========================================================= */
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', event.clientX - rect.left + 'px');
      card.style.setProperty('--my', event.clientY - rect.top + 'px');
    });
  });

  /* =========================================================
     Placeholder project links
     ========================================================= */
  document.querySelectorAll('.link-placeholder').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      showToast('This is a placeholder link. Replace it with your real URL in index.html.');
    });
  });

  /* =========================================================
     Resume download
     - If you open the file directly (file://), the browser
       handles the download itself.
     - On Live Server or a website, we first check that
       resume.pdf exists and show a friendly message if not.
     ========================================================= */
  document.querySelectorAll('.js-resume').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (window.location.protocol === 'file:') {
        return;
      }

      event.preventDefault();

      fetch(link.getAttribute('href'), { method: 'HEAD', cache: 'no-store' })
        .then(function (response) {
          if (!response.ok && response.status !== 405) {
            throw new Error('Resume not found');
          }
          const temp = document.createElement('a');
          temp.href = link.href;
          temp.download = link.getAttribute('download') || 'resume.pdf';
          document.body.appendChild(temp);
          temp.click();
          temp.remove();
        })
        .catch(function () {
          showToast('Resume file not found. Add resume.pdf to the Task-3-Portfolio folder.');
        });
    });
  });

  /* =========================================================
     Footer year
     ========================================================= */
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();