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

function toggleMobileLangBtn() {
  const btn = document.getElementById('mobileLangBtn');
  const isEn = btn.textContent === 'TR';
  const lang = isEn ? 'tr' : 'en';
  btn.textContent = isEn ? 'EN' : 'TR';
  applyLang(lang);
}



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

// ── Ink Cursor ────────────────────────────────
(function() {
  const cursor = document.getElementById('ink-cursor');
  const inkPath = document.getElementById('ink-path');
  if (!cursor || !inkPath) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;
  let velX = 0;
  let velY = 0;
  let tick = 0;

  const shapes = [
    'M14 2 C14 2 24 12 24 22 C24 29 19.5 34 14 34 C8.5 34 4 29 4 22 C4 12 14 2 14 2 Z',
    'M14 2 C14 2 25 11 25 21 C25 29 20 35 14 35 C8 35 3 29 3 21 C3 11 14 2 14 2 Z',
    'M14 2 C14 2 23 13 23 23 C23 30 19 34 14 34 C9 34 5 30 5 23 C5 13 14 2 14 2 Z',
    'M14 3 C14 3 26 13 26 22 C26 30 20.5 35 14 35 C7.5 35 2 30 2 22 C2 13 14 3 14 3 Z',
    'M14 1 C14 1 24 10 24 21 C24 29 19.5 34 14 34 C8.5 34 4 29 4 21 C4 10 14 1 14 1 Z',
  ];

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    tick++;

    velX = mouseX - curX;
    velY = mouseY - curY;
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);

    const speed = Math.sqrt(velX * velX + velY * velY);
    const angle = Math.atan2(velY, velX) * (180 / Math.PI) + 90;
    const squish = Math.min(speed * 0.4, 18);

    const shapeIndex = Math.floor(tick / 8) % shapes.length;
    inkPath.setAttribute('d', shapes[shapeIndex]);

    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) rotate(${angle}deg) scaleX(${1 - squish * 0.015}) scaleY(${1 + squish * 0.025})`;

    requestAnimationFrame(animate);
  }

  animate();
})();
