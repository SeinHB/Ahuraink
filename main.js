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
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;
  let velX = 0, velY = 0;
  let frame = 0;

  const S = 96; // viewBox size — larger internally so blur has room
  const H = S / 2;

  // Corner base positions within the 96x96 viewBox
  // Center + 4 corners spread around it
  const BASE = [
    { bx: 0,   by: 0   }, // center — fixed
    { bx: -18, by: -18 }, // top left
    { bx:  18, by: -18 }, // top right
    { bx: -18, by:  18 }, // bottom left
    { bx:  18, by:  18 }, // bottom right
  ];

  const balls = BASE.map((b, i) => ({
    x: b.bx, y: b.by,
    r: 14,
    tx: b.bx, ty: b.by, tr: 14,
    fixed: i === 0,
    phase: i * 1.3,
  }));

  let retarget = 0;

  function newTargets() {
    balls.forEach((b, i) => {
      if (b.fixed) return;
      b.tx = BASE[i].bx + (Math.random() - 0.5) * 16;
      b.ty = BASE[i].by + (Math.random() - 0.5) * 16;
      b.tr = 14 + Math.random() * 22; // r 14 to 36 = diameter 28 to 72... clamp to our range
      b.tr = Math.min(b.tr, 30);
    });
  }
  newTargets();

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Build SVG with goo filter for welding
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.style.cssText = 'width:100%;height:100%;overflow:visible;';

  // Goo filter: blur → color matrix threshold → dilate to smooth edges
  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'goo');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');

  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', '5');
  blur.setAttribute('result', 'blur');

  const matrix = document.createElementNS(ns, 'feColorMatrix');
  matrix.setAttribute('in', 'blur');
  matrix.setAttribute('type', 'matrix');
  // threshold: keeps only areas where alpha is high — creates sharp merged edges
  matrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9');
  matrix.setAttribute('result', 'goo');

  filter.appendChild(blur);
  filter.appendChild(matrix);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // Group with goo filter applied
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('filter', 'url(#goo)');

  const circles = balls.map(() => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('fill', '#ffffff');
    g.appendChild(c);
    return c;
  });

  svg.appendChild(g);
  cursor.innerHTML = '';
  cursor.appendChild(svg);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    frame++;

    velX = mouseX - curX;
    velY = mouseY - curY;
    curX = lerp(curX, mouseX, 0.1);
    curY = lerp(curY, mouseY, 0.1);
    const speed = Math.sqrt(velX * velX + velY * velY);

    retarget++;
    if (retarget > 90) { retarget = 0; newTargets(); }

    const t = 0.008 + speed * 0.001;

    balls.forEach((b, i) => {
      if (!b.fixed) {
        b.x = lerp(b.x, b.tx + Math.sin(frame * 0.018 + b.phase) * 3, t);
        b.y = lerp(b.y, b.ty + Math.cos(frame * 0.022 + b.phase) * 3, t);
        b.r = lerp(b.r, b.tr + Math.sin(frame * 0.028 + b.phase * 1.3) * 2, t + 0.005);
      }
      circles[i].setAttribute('cx', (H + b.x).toFixed(2));
      circles[i].setAttribute('cy', (H + b.y).toFixed(2));
      circles[i].setAttribute('r', Math.max(2, b.r).toFixed(2));
    });

    const angle = speed > 0.5 ? Math.atan2(velY, velX) * (180 / Math.PI) + 90 : 0;
    const stretch = Math.min(speed * 0.025, 0.3);
    cursor.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%) rotate(${angle}deg) scaleX(${1 - stretch}) scaleY(${1 + stretch})`;

    requestAnimationFrame(animate);
  }

  animate();
})();
