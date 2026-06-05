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
  '.specialty-card, .about-text, .about-visual, .process-step, .contact-info, .contact-form-wrap'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── Gallery filter ────────────────────────────
function filterGallery(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = btn || (event && event.currentTarget);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    const show = cat === 'all' || item.dataset.cat === cat;
    item.classList.toggle('hidden', !show);
  });
}

// ── Navigate to portfolio with filter ─────────
function goToPortfolio(cat) {
  window.location.href = 'portfolio.html?filter=' + cat;
}

// ── Auto-apply filter from URL param ──────────
function applyFilterFromURL() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('filter');
  if (!cat) return;
  const btn = document.querySelector(`.filter-btn[onclick*="'${cat}'"]`);
  filterGallery(cat, btn);
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

// ── Stat counter animation ───────────────────
function animateCounters() {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      const isPlus = target === 2000; // show "+" suffix for tattoos
      const duration = 1800;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        // ease-out: slow down near the end
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(eased * target);

        el.textContent = current + (isPlus && step >= steps ? '+' : '');

        if (step >= steps) {
          el.textContent = target + (isPlus ? '+' : '');
          clearInterval(timer);
        }
      }, duration / steps);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  applyFilterFromURL();
  animateCounters();
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
    curX = lerp(curX, mouseX, 0.96);
    curY = lerp(curY, mouseY, 0.96);

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

    const stretch = Math.min(speed * 0.025 * 0.25, 0.3 * 0.25);
    const angle = speed > 0.5 ? Math.atan2(smoothVelY, smoothVelX) * (180 / Math.PI) : 0;
    cursor.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%) rotate(${angle}deg) scaleX(${1 + stretch}) scaleY(${1 - stretch}) rotate(${-angle}deg)`;

    requestAnimationFrame(animate);
  }

  animate();
})();


// ── Ink Trail ─────────────────────────────────
(function() {
  let mouseX = 0, mouseY = 0;
  const trail = [];
  const MAX_POINTS = 48;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100000;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trail.push({ x: mouseX, y: mouseY, age: 0 });
    if (trail.length > MAX_POINTS) trail.shift();
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (trail.length > 2) {
      const n = trail.length;

      // Build control points for full spline
      const cps = [];
      for (let i = 0; i < n; i++) {
        const p0 = trail[Math.max(i - 1, 0)];
        const p1 = trail[i];
        const p2 = trail[Math.min(i + 1, n - 1)];
        const p3 = trail[Math.min(i + 2, n - 1)];
        cps.push({
          cp1x: p1.x + (p2.x - p0.x) / 3,
          cp1y: p1.y + (p2.y - p0.y) / 3,
          cp2x: p2.x - (p3.x - p1.x) / 3,
          cp2y: p2.y - (p3.y - p1.y) / 3,
        });
      }

      // Draw in slices from tail to head, each slice one solid color+width
      // Use small slices so the gradient appears smooth with no overlap artifacts
      const SLICES = n - 1;
      for (let i = 0; i < SLICES; i++) {
        const t0 = i / SLICES;
        const t1 = (i + 1) / SLICES;
        const tMid = (t0 + t1) / 2;
        const alpha = Math.pow(tMid, 2) * 0.5;
        const width = 0.1 + tMid * 7.9;
        const cp = cps[i];
        const p1 = trail[i];
        const p2 = trail[i + 1];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, p2.x, p2.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    }

    // Age out points — remove old ones even when mouse stops
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age++;
      if (trail[i].age > 18) trail.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
