/* ===========================
   AHURA INK STUDIO — JS
=========================== */

// ── Language ──────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-en]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });

  document.documentElement.lang = lang === 'tr' ? 'tr' : 'en';

  // sync all toggle checkboxes
  const isTr = lang === 'tr';
  document.querySelectorAll('#langToggle, #langToggleMobile').forEach(t => {
    t.checked = isTr;
  });
}

function toggleLang(checkbox) {
  const lang = checkbox.checked ? 'tr' : 'en';
  // Sync mobile toggle
  const mob = document.getElementById('langToggleMobile');
  if (mob && mob !== checkbox) mob.checked = checkbox.checked;
  applyLang(lang);
}

function toggleLangMobile(checkbox) {
  const lang = checkbox.checked ? 'tr' : 'en';
  // Sync desktop toggle
  const desk = document.getElementById('langToggle');
  if (desk && desk !== checkbox) desk.checked = checkbox.checked;
  applyLang(lang);
}

// Legacy support for old setLang calls in portfolio page
function setLang(lang) { applyLang(lang); }

// ── Nav scroll ────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Mobile menu ───────────────────────────────
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}

// ── Scroll reveal ─────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.style-card, .about-text, .about-visual, .process-step, .contact-info, .contact-form-wrap'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── Gallery filter ────────────────────────────
function filterGallery(cat) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    const show = cat === 'all' || item.dataset.cat === cat;
    item.classList.toggle('hidden', !show);
  });
}

// ── Lightbox ──────────────────────────────────
function openLightbox(el) {
  const lb = document.getElementById('lightbox');
  const catEl    = el.querySelector('.gallery-cat');
  const titleEl  = el.querySelector('.gallery-title');
  const thumbEl  = el.querySelector('.thumb-placeholder');

  document.getElementById('lightboxCat').textContent   = catEl   ? catEl.textContent   : '';
  document.getElementById('lightboxTitle').textContent = titleEl ? titleEl.textContent : '';

  const img = document.getElementById('lightboxImage');
  img.innerHTML = thumbEl ? thumbEl.innerHTML : '';

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Contact form ──────────────────────────────
function submitForm(e) {
  e.preventDefault();
  const msg = document.getElementById('formSuccess');
  msg.classList.add('visible');
  e.target.reset();
  setTimeout(() => msg.classList.remove('visible'), 4000);
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
});
