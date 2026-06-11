/* ==========================================================================
   NovaTech Gadgets — main.js
   Single shared JavaScript file for all five pages.
   Each init function is guarded by a DOM existence check so it only runs
   on the page that contains the relevant elements.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. NAVBAR — active link, hamburger toggle, outside-click close
   -------------------------------------------------------------------------- */

// --- Refreshes the page ---
const logo = document.getElementById("logo");
if (logo) {
  logo.addEventListener("click", function(e){
    e.preventDefault();
    location.reload();
  });
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  // --- Active link detection ---
  const currentPath = window.location.pathname;
  const links = navbar.querySelectorAll('.nav-links a');

  links.forEach(function (link) {
    const href = link.getAttribute('href');
    // Match on the filename portion of the path
    if (
      currentPath.endsWith(href) ||
      // Handle root → index.html
      (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))
    ) {
      link.classList.add('active');
    }
  });

  if (!hamburger || !navLinks) return;

  // --- Hamburger toggle ---
  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('nav-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // --- Close menu when a nav link is clicked ---
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // --- Outside-click close ---
  document.addEventListener('click', function (event) {
    if (!navbar.contains(event.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------------------------
   2. BACK-TO-TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY >= 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   3. SCROLL ANIMATIONS — IntersectionObserver with staggered delay
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatables = document.querySelectorAll('[data-animate]');
  if (!animatables.length) return;

  // Add .animate-hidden to all animatable elements initially
  animatables.forEach(function (el) {
    el.classList.add('animate-hidden');
  });

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    animatables.forEach(function (el) {
      el.classList.remove('animate-hidden');
      el.classList.add('animate-visible');
    });
    return;
  }

  // IntersectionObserver unavailability fallback
  if (!('IntersectionObserver' in window)) {
    animatables.forEach(function (el) {
      el.classList.remove('animate-hidden');
      el.classList.add('animate-visible');
    });
    return;
  }

  // Apply staggered transition-delay for sibling groups (same parent)
  // Group elements by their parent node
  var parentMap = new Map();
  animatables.forEach(function (el) {
    var parent = el.parentNode;
    if (!parentMap.has(parent)) {
      parentMap.set(parent, []);
    }
    parentMap.get(parent).push(el);
  });

  parentMap.forEach(function (siblings) {
    siblings.forEach(function (el, index) {
      el.style.transitionDelay = (index * 100) + 'ms';
    });
  });

  // Create observer
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('animate-hidden');
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatables.forEach(function (el) {
    observer.observe(el);
  });
}

/* --------------------------------------------------------------------------
   4. PRODUCT FILTER — show/hide cards by category
   -------------------------------------------------------------------------- */
function initProductFilter() {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;

  var filterButtons = document.querySelectorAll('.filter-btn');
  var cards = grid.querySelectorAll('.product-card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active button
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      // Show / hide cards
      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. FAQ PAGE
   -------------------------------------------------------------------------- */
function initAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // close all
      items.forEach(i => {
        i.classList.remove("active");
        const a = i.querySelector(".faq-answer");
        if (a) a.style.maxHeight = null;
      });

      // open clicked if closed
      if (!isOpen) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. CONTACT FORM — validation and success message
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');

  if (!form || !successBox) return;

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');
  const consent = document.getElementById('consent');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    clearErrors();
    let valid = true;

    if (!name.value.trim()) {
      showError(name, 'Enter full name');
      valid = false;
    }

    if (!email.value.trim()) {
      showError(email, 'Enter email');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Invalid email');
      valid = false;
    }

    if (!subject.value.trim()) {
      showError(subject, 'Enter subject');
      valid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'Minimum 10 characters');
      valid = false;
    }

    if (!consent.checked) {
      alert('Accept privacy policy');
      valid = false;
    }

    if (valid) {
      form.style.display = 'none';
      successBox.style.display = 'block';
      form.reset();
    }
  });

  function showError(input, msg) {
    const group = input.closest('.form-group');
    group.classList.add('error');
    group.querySelector('.error-msg').textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.form-group').forEach(g => {
      g.classList.remove('error');
      const msg = g.querySelector('.error-msg');
      if (msg) msg.textContent = '';
    });
  }
}

/* --------------------------------------------------------------------------
   7. FOOTER YEAR
   -------------------------------------------------------------------------- */
function initFooterYear() {
  var yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* --------------------------------------------------------------------------
   8. ENTRY POINT — DOMContentLoaded
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initBackToTop();
  initScrollAnimations();
  initProductFilter();
  initAccordion();
  initContactForm();
  initFooterYear();
});
