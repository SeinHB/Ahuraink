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
// data-cat supports multiple space-separated slugs, e.g. data-cat="realistic blackgray"
function filterGallery(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = btn || (event && event.currentTarget);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    const cats = (item.dataset.cat || '').split(' ');
    const show = cat === 'all' || cats.includes(cat);
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

// ── Current design (shared between lightbox & booking form) ──
let currentDesign = { id: '', cats: '' };

// ── Lightbox ──────────────────────────────────
function openLightbox(el) {
  const lb = document.getElementById('lightbox');
  const catsEl = el.querySelector('.gallery-cats');
  const idEl   = el.querySelector('.gallery-id');
  const srcImg = el.querySelector('img');

  const catText = catsEl ? catsEl.textContent : '';
  const idText  = idEl   ? idEl.textContent   : '';

  document.getElementById('lightboxCat').textContent   = catText;
  document.getElementById('lightboxTitle').textContent = idText;

  // store for booking form
  currentDesign.id   = idText;
  currentDesign.cats = catText;

  // show actual photo
  const imgEl = document.getElementById('lightboxImage');
  imgEl.innerHTML = srcImg
    ? `<img src="${srcImg.src}" alt="${idText}">`
    : '';

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── Booking form — open / close ───────────────
function openBookingForm() {
  closeLightbox();
  const badge = document.getElementById('bookingDesignBadge');
  if (badge) {
    badge.innerHTML =
      `<span class="badge-id">${currentDesign.id}</span>` +
      `<span class="badge-cats">${currentDesign.cats}</span>`;
  }
  const overlay = document.getElementById('bookingOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingForm() {
  const overlay = document.getElementById('bookingOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeBookingFormOutside(e) {
  if (e.target === document.getElementById('bookingOverlay')) closeBookingForm();
}

// ── Booking phone/email toggle ────────────────
function bookSwitchContact(mode) {
  const emailField = document.getElementById('bookFieldEmail');
  const phoneWrap  = document.getElementById('bookPhoneWrap');
  const btnEmail   = document.getElementById('bookBtnEmail');
  const btnPhone   = document.getElementById('bookBtnPhone');
  if (!emailField) return;
  if (mode === 'email') {
    emailField.style.display = '';
    phoneWrap.style.display  = 'none';
    btnEmail.classList.add('active');
    btnPhone.classList.remove('active');
  } else {
    emailField.style.display = 'none';
    phoneWrap.style.display  = 'flex';
    btnPhone.classList.add('active');
    btnEmail.classList.remove('active');
  }
}

// ── Booking country dropdown ──────────────────
let bookSelectedDial = '+90';
let bookSelectedCountryCode = 'TR';

function bookToggleCountryDropdown() {
  const dd = document.getElementById('bookCountryDropdown');
  if (!dd) return;
  const open = dd.style.display === 'none' || !dd.style.display;
  dd.style.display = open ? 'flex' : 'none';
  if (open) { bookRenderCountryList(); document.getElementById('bookCountrySearch').focus(); }
}

function bookRenderCountryList(filter = '') {
  const list = document.getElementById('bookCountryList');
  if (!list) return;
  const filtered = filter
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.dial.includes(filter))
    : COUNTRIES;
  list.innerHTML = filtered.map(c => `
    <div class="country-option" onclick="bookSelectCountry('${c.code}','${c.dial}')">
      <img class="flag-img" src="https://flagcdn.com/w40/${c.code.toLowerCase()}.png" alt="${c.code}">
      <span>${c.name}</span>
      <span style="margin-left:auto;color:var(--muted)">${c.dial}</span>
    </div>`).join('');
}

function bookFilterCountries(val) { bookRenderCountryList(val); }

function bookSelectCountry(code, dial) {
  bookSelectedDial = dial; bookSelectedCountryCode = code;
  document.getElementById('bookSelectedFlag').src = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  document.getElementById('bookSelectedFlag').alt = code;
  document.getElementById('bookSelectedCode').textContent = dial;
  document.getElementById('bookCountryDropdown').style.display = 'none';
}

document.addEventListener('click', e => {
  const dd  = document.getElementById('bookCountryDropdown');
  const btn = document.getElementById('bookCountryBtn');
  if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
    dd.style.display = 'none';
  }
});

// ── Booking file attachment ───────────────────
let bookAttachedFiles = [];

function bookHandleFiles(input) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  for (const f of Array.from(input.files)) {
    if (bookAttachedFiles.length >= 3) break;
    if (!allowed.includes(f.type)) continue;
    bookAttachedFiles.push(f);
  }
  input.value = '';
  bookRenderFileList();
  const btn = document.querySelector('label[for="bookFileInput"]');
  if (btn) {
    btn.style.opacity       = bookAttachedFiles.length >= 3 ? '0.4' : '';
    btn.style.pointerEvents = bookAttachedFiles.length >= 3 ? 'none' : '';
  }
}

function bookRemoveFile(i) {
  bookAttachedFiles.splice(i, 1);
  bookRenderFileList();
  const btn = document.querySelector('label[for="bookFileInput"]');
  if (btn) { btn.style.opacity = ''; btn.style.pointerEvents = ''; }
}

function bookRenderFileList() {
  const list = document.getElementById('bookFileList');
  if (!list) return;
  list.innerHTML = bookAttachedFiles.map((f, i) => `
    <div class="file-item">
      <span>${f.name}</span>
      <button type="button" class="file-remove" onclick="bookRemoveFile(${i})">✕</button>
    </div>`).join('');
}

// ── Booking form submit ───────────────────────
async function submitBookingForm(e) {
  e.preventDefault();
  let valid = true;

  const nameField = document.getElementById('bookFieldName');
  const errName   = document.getElementById('bookErrorName');
  if (!nameField.value.trim()) {
    nameField.classList.add('error'); errName.classList.add('visible'); valid = false;
  } else {
    nameField.classList.remove('error'); errName.classList.remove('visible');
  }

  const phoneWrap = document.getElementById('bookPhoneWrap');
  const isPhone   = phoneWrap && phoneWrap.style.display !== 'none';
  let emailVal = '', phoneVal = '';

  if (isPhone) {
    const phoneField = document.getElementById('bookFieldPhone');
    const errPhone   = document.getElementById('bookErrorPhone');
    const digits = phoneField.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      phoneField.classList.add('error'); errPhone.classList.add('visible'); valid = false;
    } else {
      phoneField.classList.remove('error'); errPhone.classList.remove('visible');
      phoneVal = '00' + bookSelectedDial.replace('+', '') + digits;
    }
  } else {
    const emailField = document.getElementById('bookFieldEmail');
    const errEmail   = document.getElementById('bookErrorEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      emailField.classList.add('error'); errEmail.classList.add('visible'); valid = false;
    } else {
      emailField.classList.remove('error'); errEmail.classList.remove('visible');
      emailVal = emailField.value.trim();
    }
  }

  if (!valid) return;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const origText  = submitBtn.textContent;
  submitBtn.textContent = currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...';
  submitBtn.disabled = true;

  try {
    const filesData = await Promise.all(bookAttachedFiles.map(file => new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res({ name: file.name, type: file.type, data: reader.result.split(',')[1] });
      reader.onerror = rej;
      reader.readAsDataURL(file);
    })));

    // prepend design reference to message so it always appears in the sheet
    const designRef = `[Design #${currentDesign.id} — ${currentDesign.cats}]`;
    const userMsg   = document.getElementById('bookFieldMessage').value.trim();
    const fullMsg   = userMsg ? `${designRef}\n\n${userMsg}` : designRef;

    await fetch(SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        name:    nameField.value.trim(),
        email:   emailVal,
        phone:   phoneVal,
        message: fullMsg,
        files:   filesData
      })
    });

    const senderName = nameField.value.trim();
    bookAttachedFiles = [];
    bookRenderFileList();
    e.target.reset();
    bookSwitchContact('phone');
    closeBookingForm();
    showFormPopup('success', senderName);

  } catch (err) {
    showFormPopup('error');
    console.error(err);
  } finally {
    submitBtn.textContent = origText;
    submitBtn.disabled = false;
  }
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeBookingForm();
    closeFormPopup();
  }
});

// ── Contact form — email/phone toggle ────────
function switchContact(mode) {
  const emailField = document.getElementById('fieldEmail');
  const phoneWrap  = document.getElementById('phoneWrap');
  const btnEmail   = document.getElementById('btnEmail');
  const btnPhone   = document.getElementById('btnPhone');
  const errEmail   = document.getElementById('errorEmail');
  const errPhone   = document.getElementById('errorPhone');
  if (!emailField) return;
  // clear errors on switch
  [emailField, document.getElementById('fieldPhone')].forEach(f => f && f.classList.remove('error'));
  [errEmail, errPhone].forEach(e => e && e.classList.remove('visible'));

  if (mode === 'email') {
    emailField.style.display = '';
    phoneWrap.style.display  = 'none';
    btnEmail.classList.add('active');
    btnPhone.classList.remove('active');
    emailField.required = true;
    document.getElementById('fieldPhone').required = false;
  } else {
    emailField.style.display = 'none';
    phoneWrap.style.display  = 'flex';
    btnPhone.classList.add('active');
    btnEmail.classList.remove('active');
    emailField.required = false;
    document.getElementById('fieldPhone').required = true;
  }
}

// ── Phone formatter & validator ───────────────
function formatPhone(input) {
  // strip all non-digits
  let digits = input.value.replace(/\D/g, '').slice(0, 10);
  // format as "000 000 00 00"
  let formatted = '';
  if (digits.length > 0) formatted = digits.slice(0, 3);
  if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
  if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
  if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
  input.value = formatted;
}

// ── Country dropdown ──────────────────────────
const COUNTRIES = [
  { code: 'TR', dial: '+90',  name: 'Turkey' },
  { code: 'US', dial: '+1',   name: 'United States' },
  { code: 'GB', dial: '+44',  name: 'United Kingdom' },
  { code: 'DE', dial: '+49',  name: 'Germany' },
  { code: 'FR', dial: '+33',  name: 'France' },
  { code: 'IT', dial: '+39',  name: 'Italy' },
  { code: 'ES', dial: '+34',  name: 'Spain' },
  { code: 'NL', dial: '+31',  name: 'Netherlands' },
  { code: 'RU', dial: '+7',   name: 'Russia' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'AE', dial: '+971', name: 'UAE' },
  { code: 'IR', dial: '+98',  name: 'Iran' },
  { code: 'GR', dial: '+30',  name: 'Greece' },
  { code: 'AU', dial: '+61',  name: 'Australia' },
  { code: 'CA', dial: '+1',   name: 'Canada' },
  { code: 'JP', dial: '+81',  name: 'Japan' },
  { code: 'KR', dial: '+82',  name: 'South Korea' },
  { code: 'CN', dial: '+86',  name: 'China' },
  { code: 'IN', dial: '+91',  name: 'India' },
  { code: 'BR', dial: '+55',  name: 'Brazil' },
  { code: 'MX', dial: '+52',  name: 'Mexico' },
  { code: 'ZA', dial: '+27',  name: 'South Africa' },
  { code: 'NG', dial: '+234', name: 'Nigeria' },
  { code: 'EG', dial: '+20',  name: 'Egypt' },
  { code: 'PL', dial: '+48',  name: 'Poland' },
  { code: 'SE', dial: '+46',  name: 'Sweden' },
  { code: 'NO', dial: '+47',  name: 'Norway' },
  { code: 'CH', dial: '+41',  name: 'Switzerland' },
  { code: 'AT', dial: '+43',  name: 'Austria' },
  { code: 'BE', dial: '+32',  name: 'Belgium' },
  { code: 'PT', dial: '+351', name: 'Portugal' },
  { code: 'UA', dial: '+380', name: 'Ukraine' },
  { code: 'RO', dial: '+40',  name: 'Romania' },
  { code: 'BG', dial: '+359', name: 'Bulgaria' },
  { code: 'HU', dial: '+36',  name: 'Hungary' },
  { code: 'CZ', dial: '+420', name: 'Czech Republic' },
  { code: 'SK', dial: '+421', name: 'Slovakia' },
  { code: 'HR', dial: '+385', name: 'Croatia' },
  { code: 'RS', dial: '+381', name: 'Serbia' },
  { code: 'GE', dial: '+995', name: 'Georgia' },
  { code: 'AZ', dial: '+994', name: 'Azerbaijan' },
  { code: 'AM', dial: '+374', name: 'Armenia' },
  { code: 'IQ', dial: '+964', name: 'Iraq' },
  { code: 'SY', dial: '+963', name: 'Syria' },
  { code: 'LB', dial: '+961', name: 'Lebanon' },
  { code: 'JO', dial: '+962', name: 'Jordan' },
  { code: 'KW', dial: '+965', name: 'Kuwait' },
  { code: 'QA', dial: '+974', name: 'Qatar' },
  { code: 'BH', dial: '+973', name: 'Bahrain' },
  { code: 'OM', dial: '+968', name: 'Oman' },
];

let selectedDial = '+90';
let selectedCountryCode = 'TR';

function renderCountryList(filter = '') {
  const list = document.getElementById('countryList');
  if (!list) return;
  const filtered = filter
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.dial.includes(filter))
    : COUNTRIES;
  list.innerHTML = filtered.map(c => `
    <div class="country-option" onclick="selectCountry('${c.code}','${c.dial}','${c.name}')">
      <img class="flag-img" src="https://flagcdn.com/w40/${c.code.toLowerCase()}.png" alt="${c.code}" />
      <span>${c.name}</span>
      <span style="margin-left:auto;color:var(--muted)">${c.dial}</span>
    </div>`).join('');
}

function toggleCountryDropdown() {
  const dd = document.getElementById('countryDropdown');
  if (!dd) return;
  const open = dd.style.display === 'none' || !dd.style.display;
  dd.style.display = open ? 'flex' : 'none';
  dd.style.flexDirection = 'column';
  if (open) { renderCountryList(); document.getElementById('countrySearch').focus(); }
}

function filterCountries(val) { renderCountryList(val); }

function selectCountry(code, dial, name) {
  selectedDial = dial; selectedCountryCode = code;
  document.getElementById('selectedFlag').src = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  document.getElementById('selectedFlag').alt = code;
  document.getElementById('selectedCode').textContent = dial;
  document.getElementById('countryDropdown').style.display = 'none';
}

document.addEventListener('click', e => {
  const dd = document.getElementById('countryDropdown');
  const btn = document.getElementById('countryBtn');
  if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
    dd.style.display = 'none';
  }
});

// ── File attachment ────────────────────────────
let attachedFiles = [];

function handleFiles(input) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  const newFiles = Array.from(input.files);
  const remaining = 3 - attachedFiles.length;
  let added = 0;

  for (const f of newFiles) {
    if (attachedFiles.length >= 3) break;
    if (!allowed.includes(f.type)) continue;
    attachedFiles.push(f);
    added++;
  }

  input.value = '';
  renderFileList();

  if (attachedFiles.length >= 3) {
    document.querySelector('.attach-btn').style.opacity = '0.4';
    document.querySelector('.attach-btn').style.pointerEvents = 'none';
  }
}

function removeFile(i) {
  attachedFiles.splice(i, 1);
  renderFileList();
  document.querySelector('.attach-btn').style.opacity = '';
  document.querySelector('.attach-btn').style.pointerEvents = '';
}

function renderFileList() {
  const list = document.getElementById('fileList');
  if (!list) return;
  list.innerHTML = attachedFiles.map((f, i) => `
    <div class="file-item">
      <span>${f.name}</span>
      <button type="button" class="file-remove" onclick="removeFile(${i})">✕</button>
    </div>`).join('');
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeMKkmsikCHGijnPsPwErZfcbrBhUGemu511AkwYgIbN8NjQe6gPf0v4plZK1lATHU/exec';

// ── Form popup ────────────────────────────────
function showFormPopup(type, name) {
  const overlay = document.getElementById('formPopupOverlay');
  const icon    = document.getElementById('formPopupIcon');
  const title   = document.getElementById('formPopupTitle');
  const desc    = document.getElementById('formPopupDesc');
  const isTr    = currentLang === 'tr';

  if (type === 'success') {
    icon.textContent  = '✦';
    title.textContent = isTr ? 'Mesaj Alındı' : 'Message Received';
    title.className   = 'form-popup-title success';
    const nameSpan    = `<span class="popup-name">${name}</span>`;
    desc.innerHTML    = isTr
      ? `${nameSpan}, bize ulaştığın için teşekkürler. En kısa sürede seninle iletişime geçeceğiz.`
      : `Thanks for reaching us, ${nameSpan}. We will contact you soon.`;
  } else {
    icon.textContent  = '✕';
    title.textContent = isTr ? 'Gönderilemedi' : 'Failed to Send';
    title.className   = 'form-popup-title error';
    desc.textContent  = isTr
      ? 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.'
      : 'Something went wrong. Please try again.';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFormPopup() {
  const overlay = document.getElementById('formPopupOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}


async function submitForm(e) {
  e.preventDefault();
  let valid = true;

  // ── Validate name ──
  const nameField = document.getElementById('fieldName');
  const errName   = document.getElementById('errorName');
  if (!nameField.value.trim()) {
    nameField.classList.add('error');
    errName.classList.add('visible');
    valid = false;
  } else {
    nameField.classList.remove('error');
    errName.classList.remove('visible');
  }

  // ── Validate email or phone ──
  const phoneWrap = document.getElementById('phoneWrap');
  const isPhone   = phoneWrap && phoneWrap.style.display !== 'none';
  let emailVal = '', phoneVal = '';

  if (isPhone) {
    const phoneField = document.getElementById('fieldPhone');
    const errPhone   = document.getElementById('errorPhone');
    const digits     = phoneField.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      phoneField.classList.add('error');
      errPhone.classList.add('visible');
      valid = false;
    } else {
      phoneField.classList.remove('error');
      errPhone.classList.remove('visible');
      // Format: 00 + country code (no +) + local number digits
      const dialDigits = selectedDial.replace('+', '');
      const localDigits = phoneField.value.replace(/\D/g, '');
      phoneVal = '00' + dialDigits + localDigits;
    }
  } else {
    const emailField = document.getElementById('fieldEmail');
    const errEmail   = document.getElementById('errorEmail');
    const emailRe    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailField.value.trim())) {
      emailField.classList.add('error');
      errEmail.classList.add('visible');
      valid = false;
    } else {
      emailField.classList.remove('error');
      errEmail.classList.remove('visible');
      emailVal = emailField.value.trim();
    }
  }

  if (!valid) return;

  // ── Show loading state ──
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...';
  submitBtn.disabled = true;

  try {
    // ── Convert files to base64 ──
    const filesData = await Promise.all(attachedFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve({
          name: file.name,
          type: file.type,
          data: reader.result.split(',')[1]
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }));

    // ── Send to Apps Script ──
    const payload = {
      name:    nameField.value.trim(),
      email:   emailVal,
      phone:   phoneVal,
      message: document.getElementById('fieldMessage').value.trim(),
      files:   filesData
    };

    // Google Apps Script requires no-cors — we send and assume success
    // if the network call doesn't throw
    await fetch(SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify(payload)
    });

    // If fetch didn't throw, treat as success
    const senderName = nameField.value.trim();
    attachedFiles = [];
    renderFileList();
    e.target.reset();
    switchContact('phone');
    showFormPopup('success', senderName);

  } catch (err) {
    showFormPopup('error');
    console.error('Fetch error:', err);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Live validation — clear error as user types
document.addEventListener('DOMContentLoaded', () => {
  const liveValidate = (fieldId, errorId, testFn) => {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errorId);
    if (!f || !e) return;
    f.addEventListener('input', () => {
      if (testFn(f.value)) {
        f.classList.remove('error'); e.classList.remove('visible');
      }
    });
    f.addEventListener('blur', () => {
      if (!testFn(f.value)) {
        f.classList.add('error'); e.classList.add('visible');
      }
    });
  };
  liveValidate('fieldName',  'errorName',  v => v.trim().length > 0);
  liveValidate('fieldPhone', 'errorPhone', v => v.replace(/\D/g,'').length === 10);
  liveValidate('fieldEmail', 'errorEmail', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()));
});

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
