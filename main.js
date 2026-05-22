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
  let smoothVelX = 0, smoothVelY = 0;
  let frame = 0;

  const S = 112;
  const H = S / 2;

  const BASE = [
    { bx: 0,   by: 0   },
    { bx: -20, by: -20 },
    { bx:  20, by: -20 },
    { bx: -20, by:  20 },
    { bx:  20, by:  20 },
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
      b.tr = 14 + Math.random() * 16;
      b.tr = Math.min(b.tr, 28);
    });
  }
  newTargets();

  function lerp(a, b, t) { return a + (b - a) * t; }

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.style.cssText = 'width:100%;height:100%;overflow:visible;';

  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'goo');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');

  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', '8');
  blur.setAttribute('result', 'blur');

  const matrix = document.createElementNS(ns, 'feColorMatrix');
  matrix.setAttribute('in', 'blur');
  matrix.setAttribute('type', 'matrix');
  matrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -11');
  matrix.setAttribute('result', 'goo');

  filter.appendChild(blur);
  filter.appendChild(matrix);
  defs.appendChild(filter);
  svg.appendChild(defs);

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

    // Smooth velocity for pull effect
    smoothVelX = lerp(smoothVelX, velX, 0.15);
    smoothVelY = lerp(smoothVelY, velY, 0.15);

    const speed = Math.sqrt(smoothVelX * smoothVelX + smoothVelY * smoothVelY);
    const pullStrength = Math.min(speed * 0.6, 14);
    const pullX = speed > 0.1 ? (smoothVelX / speed) * pullStrength : 0;
    const pullY = speed > 0.1 ? (smoothVelY / speed) * pullStrength : 0;

    retarget++;
    if (retarget > 90) { retarget = 0; newTargets(); }

    const t = 0.008;

    balls.forEach((b, i) => {
      if (!b.fixed) {
        const idleX = b.tx + Math.sin(frame * 0.018 + b.phase) * 3;
        const idleY = b.ty + Math.cos(frame * 0.022 + b.phase) * 3;
        b.x = lerp(b.x, idleX + pullX, t + 0.04);
        b.y = lerp(b.y, idleY + pullY, t + 0.04);
        b.r = lerp(b.r, b.tr + Math.sin(frame * 0.028 + b.phase * 1.3) * 2, t + 0.005);
      }
      circles[i].setAttribute('cx', (H + b.x).toFixed(2));
      circles[i].setAttribute('cy', (H + b.y).toFixed(2));
      circles[i].setAttribute('r', Math.max(2, b.r).toFixed(2));
    });

    const stretch = Math.min(speed * 0.025, 0.3);
    cursor.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%) scaleX(${1 - stretch}) scaleY(${1 + stretch})`;

    requestAnimationFrame(animate);
  }

  animate();
})();

// ── Ink Particles ─────────────────────────────
(function() {
  let mouseX = 0, mouseY = 0;
  let lastX = 0, lastY = 0;
  const particles = [];
  const MAX = 18;
  const LIFE = 60; // frames ~1s at 60fps

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99998;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function spawn() {
    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 2) return;

    // Spawn 1-2 particles per move
    const count = speed > 8 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 14; // outside the 56px frame
      const r = Math.random() > 0.5 ? 2 : 1.5;
      particles.push({
        x: mouseX + Math.cos(angle) * dist,
        y: mouseY + Math.sin(angle) * dist,
        r,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        life: LIFE,
        maxLife: LIFE,
      });
    }

    if (particles.length > MAX) particles.splice(0, particles.length - MAX);
    lastX = mouseX;
    lastY = mouseY;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawn();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const progress = p.life / p.maxLife;
      // Fade in quickly, fade out slowly
      const alpha = progress < 0.8
        ? progress / 0.8
        : 1 - ((1 - progress) / 0.2) * 0;
      const opacity = progress > 0.85 ? 1 : progress / 0.85;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
