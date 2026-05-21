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
  let curX = mouseX;
  let curY = mouseY;
  let velX = 0;
  let velY = 0;

  const SIZE = 48;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const circles = [
    { ox: 0,   oy: 0,   or: 13, x: 0,   y: 0,   r: 13, tx: 0,   ty: 0,   tr: 13, phase: 0    },
    { ox: 6,   oy: -5,  or: 10, x: 6,   y: -5,  r: 10, tx: 6,   ty: -5,  tr: 10, phase: 1.2  },
    { ox: -5,  oy: 6,   or: 9,  x: -5,  y: 6,   r: 9,  tx: -5,  ty: 6,   tr: 9,  phase: 2.4  },
    { ox: 4,   oy: 7,   or: 8,  x: 4,   y: 7,   r: 8,  tx: 4,   ty: 7,   tr: 8,  phase: 0.7  },
  ];

  let retargetTimer = 0;

  function newTarget(c) {
    c.tx = c.ox + (Math.random() - 0.5) * 10;
    c.ty = c.oy + (Math.random() - 0.5) * 10;
    c.tr = c.or + (Math.random() - 0.5) * 6;
    c.tr = Math.max(5, Math.min(16, c.tr));
  }

  circles.forEach(c => newTarget(c));

  function lerp(a, b, t) { return a + (b - a) * t; }

  function buildPath(circs) {
    const res = 72;
    const angles = Array.from({ length: res }, (_, i) => (i / res) * Math.PI * 2);
    const points = angles.map(a => {
      let px = 0, py = 0, totalW = 0;
      circs.forEach(c => {
        const dx = Math.cos(a) * c.r;
        const dy = Math.sin(a) * c.r;
        const ex = cx + c.x + dx;
        const ey = cy + c.y + dy;
        const w = c.r * c.r;
        px += ex * w;
        py += ey * w;
        totalW += w;
      });
      return [px / totalW, py / totalW];
    });

    const smooth = points.map((p, i) => {
      const prev = points[(i - 1 + res) % res];
      const next = points[(i + 1) % res];
      return [
        (prev[0] + p[0] * 2 + next[0]) / 4,
        (prev[1] + p[1] * 2 + next[1]) / 4,
      ];
    });

    return smooth.map((p, i) => {
      const next = smooth[(i + 1) % res];
      const cpx = (p[0] + next[0]) / 2;
      const cpy = (p[1] + next[1]) / 2;
      return (i === 0 ? `M${cpx.toFixed(2)},${cpy.toFixed(2)}` : '') +
        `Q${p[0].toFixed(2)},${p[1].toFixed(2)} ${cpx.toFixed(2)},${cpy.toFixed(2)}`;
    }).join(' ') + ' Z';
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.style.cssText = 'width:100%;height:100%;overflow:visible;';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', '#ffffff');
  svg.appendChild(path);
  cursor.innerHTML = '';
  cursor.appendChild(svg);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let frame = 0;
  function animate() {
    frame++;
    velX = mouseX - curX;
    velY = mouseY - curY;
    curX = lerp(curX, mouseX, 0.1);
    curY = lerp(curY, mouseY, 0.1);
    const speed = Math.sqrt(velX * velX + velY * velY);

    retargetTimer++;
    if (retargetTimer > 80) {
      retargetTimer = 0;
      circles.forEach(c => newTarget(c));
    }

    circles.forEach((c, i) => {
      const t = 0.012 + speed * 0.001;
      c.x = lerp(c.x, c.tx, t);
      c.y = lerp(c.y, c.ty, t);
      c.r = lerp(c.r, c.tr + Math.sin(frame * 0.025 + c.phase) * 2, t + 0.008);
    });

    const angle = Math.atan2(velY, velX) * (180 / Math.PI) + 90;
    const stretch = Math.min(speed * 0.03, 0.35);

    path.setAttribute('d', buildPath(circles));
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%) rotate(${angle}deg) scaleX(${1 - stretch}) scaleY(${1 + stretch})`;

    requestAnimationFrame(animate);
  }

  animate();
})();
