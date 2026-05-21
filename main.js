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

  const S = 48;
  const HALF = S / 2;
  const THRESHOLD = 1.0;
  const GRID = 3;

  // 4 metaballs — each has position, radius, all slowly drifting
  const balls = [
    { x: 0,    y: -4,   r: 13, px: 0,    py: -4,   pr: 13, tx: 0,    ty: -4,   tr: 13,  phase: 0    },
    { x: 6,    y: 4,    r: 10, px: 6,    py: 4,    pr: 10, tx: 6,    ty: 4,    tr: 10,  phase: 1.6  },
    { x: -7,   y: 5,    r: 9,  px: -7,   py: 5,    pr: 9,  tx: -7,   ty: 5,    tr: 9,   phase: 3.1  },
    { x: 3,    y: -8,   r: 7,  px: 3,    py: -8,   pr: 7,  tx: 3,    ty: -8,   tr: 7,   phase: 4.7  },
  ];

  let retarget = 0;

  function newTargets() {
    balls.forEach(b => {
      b.tx = (Math.random() - 0.5) * 14;
      b.ty = (Math.random() - 0.5) * 14;
      b.tr = 6 + Math.random() * 9;
    });
  }
  newTargets();

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Marching squares — sample metaball field on a grid, extract contour
  function field(px, py) {
    let v = 0;
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const dx = px - (HALF + b.x);
      const dy = py - (HALF + b.y);
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.01) return 999;
      v += (b.r * b.r) / d2;
    }
    return v;
  }

  // March along the iso-contour
  function march() {
    const pts = [];
    const cols = Math.ceil(S / GRID) + 1;
    const rows = Math.ceil(S / GRID) + 1;
    const cells = [];

    for (let j = 0; j <= rows; j++) {
      cells[j] = [];
      for (let i = 0; i <= cols; i++) {
        cells[j][i] = field(i * GRID, j * GRID);
      }
    }

    const edgePts = [];

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x0 = i * GRID, x1 = (i + 1) * GRID;
        const y0 = j * GRID, y1 = (j + 1) * GRID;
        const f00 = cells[j][i], f10 = cells[j][i+1];
        const f01 = cells[j+1][i], f11 = cells[j+1][i+1];

        const interp = (a, b, va, vb) => {
          if (Math.abs(vb - va) < 0.001) return (a + b) / 2;
          return a + (THRESHOLD - va) / (vb - va) * (b - a);
        };

        const idx =
          (f00 >= THRESHOLD ? 1 : 0) |
          (f10 >= THRESHOLD ? 2 : 0) |
          (f11 >= THRESHOLD ? 4 : 0) |
          (f01 >= THRESHOLD ? 8 : 0);

        const top    = [interp(x0, x1, f00, f10), y0];
        const right  = [x1, interp(y0, y1, f10, f11)];
        const bottom = [interp(x0, x1, f01, f11), y1];
        const left   = [x0, interp(y0, y1, f00, f01)];

        const segs = {
          1: [[left, top]], 2: [[top, right]], 3: [[left, right]],
          4: [[right, bottom]], 5: [[left, top], [right, bottom]],
          6: [[top, bottom]], 7: [[left, bottom]], 8: [[bottom, left]],
          9: [[bottom, top]], 10: [[top, left], [bottom, right]],
          11: [[bottom, right]], 12: [[right, left]], 13: [[right, top]],
          14: [[left, top]], 15: []
        };

        if (idx > 0 && idx < 15 && segs[idx]) {
          segs[idx].forEach(([a, b]) => edgePts.push([a, b]));
        }
      }
    }

    if (edgePts.length === 0) return '';

    // Chain edge segments into a polygon
    const ordered = [edgePts[0][0], edgePts[0][1]];
    const used = new Array(edgePts.length).fill(false);
    used[0] = true;

    for (let iter = 0; iter < edgePts.length; iter++) {
      const last = ordered[ordered.length - 1];
      let found = false;
      for (let k = 0; k < edgePts.length; k++) {
        if (used[k]) continue;
        const [a, b] = edgePts[k];
        const da = Math.hypot(a[0] - last[0], a[1] - last[1]);
        const db = Math.hypot(b[0] - last[0], b[1] - last[1]);
        if (da < GRID * 1.5) { ordered.push(b); used[k] = true; found = true; break; }
        if (db < GRID * 1.5) { ordered.push(a); used[k] = true; found = true; break; }
      }
      if (!found) break;
    }

    if (ordered.length < 4) return '';

    // Smooth the polygon with catmull-rom-like beziers
    const n = ordered.length;
    let d = `M${ordered[0][0].toFixed(1)},${ordered[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = ordered[(i - 1 + n) % n];
      const p1 = ordered[i];
      const p2 = ordered[(i + 1) % n];
      const p3 = ordered[(i + 2) % n];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + ' Z';
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.style.cssText = 'width:100%;height:100%;overflow:visible;';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', '#ffffff');
  svg.appendChild(path);
  cursor.innerHTML = '';
  cursor.appendChild(svg);

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function animate() {
    frame++;
    velX = mouseX - curX;
    velY = mouseY - curY;
    curX = lerp(curX, mouseX, 0.1);
    curY = lerp(curY, mouseY, 0.1);
    const speed = Math.sqrt(velX * velX + velY * velY);

    retarget++;
    if (retarget > 100) { retarget = 0; newTargets(); }

    const t = 0.008 + speed * 0.0008;
    balls.forEach((b, i) => {
      b.x = lerp(b.x, b.tx + Math.sin(frame * 0.018 + b.phase) * 2.5, t);
      b.y = lerp(b.y, b.ty + Math.cos(frame * 0.022 + b.phase) * 2.5, t);
      b.r = lerp(b.r, b.tr + Math.sin(frame * 0.03 + b.phase * 1.3) * 1.5, t + 0.005);
    });

    const d = march();
    if (d) path.setAttribute('d', d);

    const angle = speed > 0.5 ? Math.atan2(velY, velX) * (180 / Math.PI) + 90 : 0;
    const stretch = Math.min(speed * 0.025, 0.3);
    cursor.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%) rotate(${angle}deg) scaleX(${1 - stretch}) scaleY(${1 + stretch})`;

    requestAnimationFrame(animate);
  }

  animate();
})();
