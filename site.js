/* ==========================================================================
   SHEZBOTICS · site.js  (every page, loaded as a module after script.js)
   01 scrolling · 02 bar ink by chapter · 03 entrances · 04 rolling figures
   05 course tally · 06 sideways journey · 07 kit stage · 08 the 3D robot
   09 the demo pass. Each part does nothing on a page without its elements.
   script.js still runs the menu, modal, enrol links, forms, toast and gallery.
   ========================================================================== */

const html = document.documentElement;
const mq = (q) => window.matchMedia(q);
const reduced = mq('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* shared state the robot reads */
const state = { kitP: 0, kitLive: false, part: -1 };

/* ===== 01 · SCROLLING is the browser's own: it runs off the main thread, so it stays smooth whatever
   else the page is doing. Anchor links glide (scroll-behavior) and clear the bar (scroll-padding-top). ===== */

/* ===== 02 · BAR INK BY CHAPTER ===== */
(() => {
  const bar = document.querySelector('[data-bar]');
  if (!bar) return;
  const toned = [...document.querySelectorAll('main [data-tone], footer[data-tone]')];
  // the chapter under the bar, from an observer on a 1px band at y = 40 (nothing is measured on scroll)
  let band = null, bandH = 0;
  const watch = () => {
    if (band && bandH === innerHeight) return;
    if (band) band.disconnect();
    bandH = innerHeight;
    band = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting && bar.dataset.tone !== e.target.dataset.tone) bar.dataset.tone = e.target.dataset.tone;
    }, { rootMargin: `-40px 0px ${41 - bandH}px 0px` });
    toned.forEach((el) => band.observe(el));
  };
  addEventListener('resize', watch);
  watch();

  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((e) => document.body.classList.toggle('in-hero', e[0].intersectionRatio > 0.35), { threshold: [0, 0.35, 1] }).observe(hero);
    // the floating WhatsApp button steps aside wherever it would sit on a primary action
    const actions = [...document.querySelectorAll('.tally, .ticket-stub, #contactForm, #demoForm, .proposal-form, .footer-last')];
    const near = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? near.add(e.target) : near.delete(e.target);
      document.body.classList.toggle('near-action', near.size > 0);
    }, { rootMargin: '0px 0px -0px 0px', threshold: 0 });
    actions.forEach((el) => io.observe(el));
  }

  const burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.textContent = open ? 'Close' : 'Menu';
  });
})();

/* ===== 03 · ENTRANCES (once, per part of each section) ===== */
(() => {
  const groups = [
    '.record-title, .tile',
    '.weekend-copy > *, .slip',
    '.courses-head > *, .level, .tally, .track-note',
    '.founder-title, .founder-text > *, .founder-hex',
    '.journey-title, .stop',
    '.voices h2, .voice',
    '.work-intro > *',
    '.gallery-head > *',
    '.beyond-title, .beyond-link',
    '.contact-title, .row, .contact-copy',
    '.footer-cols > *, .footer-last',
    '.facts-row li',
    '.book-head > *, .pass',
    '.next h2, .poster-list li',
    '.meet-pics, .meet-copy > *',
    '.faq h2, .faq-item',
    '.sub-head > *, .mosaic > *, .format, .formats-note',
    '.report-copy > *, .card-slip',
    '.proposal-copy > *',
    '.toolkit-note, .duo',
    '.skill-note, .limits-copy > *, .limits-lists > *, .stays-out h2, .stays-list li, .stays-note',
    '.legal > *',
  ];
  const items = [];
  for (const sel of groups) {
    let i = 0, lastParent = null;
    document.querySelectorAll(sel).forEach((el) => {
      if (el.parentElement !== lastParent && !el.matches('.level, .row, .stop, .voice, .tile')) i = Math.min(i, 2);
      lastParent = el.parentElement;
      el.setAttribute('data-rise', '');
      el.style.setProperty('--i', Math.min(i++, 5));
      items.push(el);
    });
  }
  const reveal = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    reveal.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
  items.forEach((el) => io.observe(el));
  // a clipped element never reports as visible, so watch its parent for it
  const io2 = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.querySelectorAll(':scope > [data-reveal]').forEach((el) => el.classList.add('is-in')); io2.unobserve(e.target); }
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0.01 });
  reveal.forEach((el) => io2.observe(el.parentElement));
  addEventListener('beforeprint', () => items.forEach((el) => el.classList.add('is-in')));

  // A jump (an anchor link, the End key) can carry an element from below the screen to above it
  // between two frames; the observer sees no crossing then, so anything already passed is shown too.
  let left = items.slice(), queued = false;
  const sweep = () => {
    queued = false;
    const edge = innerHeight * 0.9;
    left = left.filter((el) => {
      if (el.classList.contains('is-in')) return false;
      if (el.getBoundingClientRect().top < edge) { el.classList.add('is-in'); io.unobserve(el); return false; }
      return true;
    });
    reveal.forEach((el) => { if (!el.classList.contains('is-in') && el.parentElement.getBoundingClientRect().top < edge) el.classList.add('is-in'); });
    if (!left.length) removeEventListener('scroll', onScroll);
  };
  let lastY = scrollY;
  const onScroll = () => {
    const jump = Math.abs(scrollY - lastY) > innerHeight * 0.75; lastY = scrollY;
    if (jump && !queued) { queued = true; requestAnimationFrame(sweep); }
  };
  addEventListener('scroll', onScroll, { passive: true });
})();

/* ===== 04 · ROLLING FIGURES ===== */
(() => {
  const els = [...document.querySelectorAll('[data-roll]')];
  if (!els.length) return;
  els.forEach((el) => {
    const value = el.textContent.trim();
    const said = Object.assign(document.createElement('span'), { className: 'sr-only', textContent: value });
    const shown = Object.assign(document.createElement('span'), { className: 'roll__digits' });
    shown.setAttribute('aria-hidden', 'true');
    let i = 0;
    for (const ch of value) {
      if (!/\d/.test(ch)) { shown.append(ch); continue; }
      const col = Object.assign(document.createElement('span'), { className: 'roll__col' });
      const strip = Object.assign(document.createElement('span'), { className: 'roll__strip' });
      strip.style.setProperty('--d', ch);
      strip.style.setProperty('--i', i++);
      col.append(strip);
      shown.append(col);
    }
    el.classList.add('roll');
    el.replaceChildren(said, shown);
  });
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -15% 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ===== 05 · COURSE TALLY (the live thing) ===== */
(() => {
  const root = document.querySelector('[data-picker]');
  const tally = document.querySelector('[data-tally]');
  if (!root || !tally) return;
  const buttons = [...root.querySelectorAll('[data-level]')];
  const kits = tally.querySelector('[data-tally-kits]');
  const pick = tally.querySelector('[data-tally-pick]');
  const total = tally.querySelector('[data-tally-total]');
  const note = tally.querySelector('[data-tally-note]');
  const enrol = tally.querySelector('[data-tally-enrol]');
  const rs = (n) => '₹' + n.toLocaleString('en-IN');
  const FULL = 15999;

  function paint() {
    const on = buttons.filter((b) => b.getAttribute('aria-pressed') === 'true');
    const sum = (k) => on.reduce((s, b) => s + +b.dataset[k], 0);
    const fees = sum('fee'), kit = sum('kit'), sessions = sum('sessions'), weeks = sum('weeks');
    const withKits = kits.checked;
    const names = on.map((b) => b.dataset.level);

    if (!on.length) {
      pick.textContent = 'Nothing picked yet.';
      total.textContent = 'Tap a level above to see the total.';
      note.textContent = 'Fees are per student. Kits are optional and passed on at cost.';
      enrol.textContent = 'Enrol';
      return;
    }
    pick.textContent = names.join(' + ') + ` · ${sessions} sessions over ${weeks} weeks`;
    total.textContent = withKits
      ? `${rs(fees)} in fees + ${rs(kit)} in kits = ${rs(fees + kit)}`
      : `${rs(fees)} in fees, using your own components`;

    if (on.length === 3) {
      const sep = withKits ? fees + kit : fees;
      note.textContent = `The full track below covers all three in 26 sessions over 13 weeks for ${rs(FULL)}, kits included. That is ${rs(sep - FULL)} less.`;
      enrol.textContent = 'Enrol in the full track';
    } else if (on.length === 2) {
      note.textContent = `Add the third level and the full track does all three for ${rs(FULL)}, kits included.`;
      enrol.textContent = 'Enrol in these two';
    } else {
      note.textContent = 'Every level is live online, Saturday and Sunday, five students per batch.';
      enrol.textContent = `Enrol in ${names[0]}`;
    }
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    paint();
  }));
  kits.addEventListener('change', paint);

  enrol.addEventListener('click', (e) => {
    const on = buttons.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.level);
    const sel = document.getElementById('selectedCourse');
    const msg = document.getElementById('cMsg');
    const contact = document.getElementById('contact');
    if (!sel || !contact) return;
    e.preventDefault();
    if (on.length === 3) sel.value = 'All three (full track)';
    else if (on.length === 1) sel.value = on[0];
    else {
      sel.value = on.length ? 'Not sure yet' : '';
      if (on.length && msg && !msg.value) msg.value = `Interested in ${on.join(' + ')}${kits.checked ? ', with kits' : ', without kits'}.`;
    }
    contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => sel.focus({ preventScroll: true }), 700);
  });
  paint();
})();

/* ===== 06 · SIDEWAYS JOURNEY (pinned on wide screens, native row elsewhere) ===== */
(() => {
  const root = document.querySelector('.journey');
  if (!root) return;
  const track = root.querySelector('.journey-track');
  const wide = mq('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  let dx = 0, queued = false;
  const place = () => {
    queued = false;
    if (!root.classList.contains('is-pinned')) return;
    const p = clamp(-root.getBoundingClientRect().top / dx);
    track.style.transform = `translate3d(${(-p * dx).toFixed(1)}px,0,0)`;
  };
  const measure = () => {
    root.classList.add('is-pinned');
    track.style.transform = '';
    dx = track.scrollWidth - track.clientWidth;
    const pin = wide.matches && dx > 0 && dx < innerHeight * 3;
    root.classList.toggle('is-pinned', pin);
    root.style.height = pin ? `${innerHeight + dx}px` : '';
    place();
  };
  track.addEventListener('focusin', (e) => {
    if (!root.classList.contains('is-pinned')) return;
    const item = e.target.closest('.stop');
    if (!item) return;
    const x = clamp(item.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), 0, dx);
    scrollTo({ top: root.getBoundingClientRect().top + scrollY + x, behavior: 'instant' });
  });
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  wide.addEventListener('change', measure);
  measure();
})();

/* ===== 07 · KIT STAGE (held for four screens, one part per beat) ===== */
(() => {
  const root = document.querySelector('[data-kit]');
  if (!root) return;
  const parts = [...root.querySelectorAll('[data-part]')];
  state.kitLive = !reduced;
  root.classList.toggle('is-live', state.kitLive);
  let queued = false;
  const place = () => {
    queued = false;
    const r = root.getBoundingClientRect();
    const span = r.height - innerHeight;
    state.kitP = span > 0 ? clamp(-r.top / span) : 0.6;
    if (!state.kitLive) return;
    const p = state.kitP;
    let part = -1;
    if (p >= 0.1 && p < 0.9) part = Math.min(parts.length - 1, Math.floor((p - 0.1) / (0.8 / parts.length)));
    const beat = p >= 0.9 ? 'all' : String(part);
    if (part !== state.part || root.dataset.beat !== beat) {
      state.part = part;
      root.dataset.beat = beat;
      parts.forEach((li, i) => li.classList.toggle('is-on', i === part));
    }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener('resize', place);
  place();
})();

/* ===== 07a · PROJECT PANELS: the covered panel's words step aside as the next one slides over ===== */
(() => {
  const panels = [...document.querySelectorAll('.panel')];
  if (panels.length < 2) return;
  const rows = panels.map((p) => [...p.querySelectorAll('.panel-row')]);
  let queued = false;
  const place = () => {
    queued = false;
    // all the reading first, then all the writing, so the page is laid out once
    const out = [];
    panels.forEach((p, i) => {
      const next = panels[i + 1];
      const top = next ? next.getBoundingClientRect().top : Infinity;
      // gone by the moment the next panel's edge reaches the bottom of this row
      rows[i].forEach((el) => out.push([el, clamp((top - el.getBoundingClientRect().bottom) / (innerHeight * 0.2))]));
    });
    out.forEach(([el, o]) => {
      const v = o.toFixed(2);
      if (el.style.opacity === v) return;
      el.style.opacity = v;
      el.style.visibility = o < 0.02 ? 'hidden' : '';
    });
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener('resize', place);
  place();
})();

/* ===== 07b · ONE WORD FILLS THE BAND ===== */
(() => {
  const word = document.querySelector('[data-fit]');
  if (!word) return;
  const box = word.parentElement;
  const fit = () => {
    box.style.fontSize = '';
    const max = parseFloat(getComputedStyle(box).fontSize);
    const room = box.clientWidth;
    const w = word.getBoundingClientRect().width;
    if (w > 0) box.style.fontSize = Math.min(max * 1.6, max * room / w, innerHeight * 0.46) + 'px';
  };
  addEventListener('resize', fit);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
  fit();
})();

/* ===== 08 · THE ROBOT (three.js) ===== */
async function robot() {
  const canvas = document.querySelector('.robot-canvas');
  const spotHero = document.querySelector('[data-spot="hero"]');
  const spotKit = document.querySelector('[data-spot="kit"]');
  const hero = spotHero && spotHero.closest('section');
  const kit = document.querySelector('[data-kit]');
  if (!canvas || !spotHero) return;   // pages without a kit stage keep the robot in their hero

  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

  const THREE = await import('three');
  const { RoomEnvironment } = await import('./vendor/three/addons/RoomEnvironment.js');
  const { RoundedBoxGeometry } = await import('./vendor/three/addons/RoundedBoxGeometry.js');
  const { mergeGeometries } = await import('./vendor/three/addons/BufferGeometryUtils.js');
  // with the boot screen up, build only once its bar is holding, so its typing never stutters
  if (html.classList.contains('booting')) await new Promise((res) => {
    if (window.__shezBootHold) return res();
    document.addEventListener('shez:boot-hold', res, { once: true });
    setTimeout(res, 3000);
  });

  const phone = mq('(max-width: 767px)').matches;
  // 1.5x is sharp on any screen; a device that can't keep up steps down from there (see frame)
  let pr = Math.min(devicePixelRatio || 1, 1.5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(pr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  scene.add(new THREE.HemisphereLight(0xeaf6fb, 0x0d2238, 0.45));
  // the key light throws soft shadows onto the deck and onto the floor under the wheels
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(phone ? 512 : 1024, phone ? 512 : 1024);
  key.shadow.radius = 3; key.shadow.bias = -0.0004;
  const keyDir = new THREE.Vector3(-3, 7.5, 5).normalize();
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x5fffd7, 1.3); rim.position.set(5, 3, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdff6ff, 0.6); fill.position.set(7, 1.5, 7); scene.add(fill);
  // the light and the box it casts from travel and scale with the robot
  const aimKey = (s) => {
    key.target.position.copy(robotRoot.position);
    key.position.copy(robotRoot.position).addScaledVector(keyDir, 10 * s);
    const c = key.shadow.camera, e = 2.4 * s;
    c.left = -e; c.right = e; c.top = e; c.bottom = -e; c.near = 2 * s; c.far = 18 * s;
    c.updateProjectionMatrix();
    key.shadow.normalBias = 0.012 * s;
  };

  /* ---------- printed surfaces: boards, labels, the etched deck ---------- */
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const paint = (w, h, draw, color = true) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  };
  const SANS = 'Arial, Helvetica, sans-serif';
  const say = (x, text, px, py, size, o = {}) => {
    x.save(); x.translate(px, py); if (o.rot) x.rotate(o.rot);
    x.font = `${o.weight || 700} ${size}px ${SANS}`; x.fillStyle = o.color || '#f3f6f7';
    x.textAlign = o.align || 'center'; x.textBaseline = 'middle';
    if (o.spacing) x.letterSpacing = o.spacing + 'px';
    x.fillText(text, 0, 0); x.restore();
  };
  // copper under the solder mask: routed traces with 45° bends, ending in vias
  const traces = (x, w, h, n, color) => {
    x.strokeStyle = color; x.fillStyle = color; x.lineCap = 'round'; x.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      let px = rnd() * w, py = rnd() * h;
      x.lineWidth = w * (0.003 + rnd() * 0.004);
      x.beginPath(); x.moveTo(px, py);
      for (let k = 0; k < 3; k++) {
        const d = w * (0.03 + rnd() * 0.16), s = rnd() > 0.5 ? 1 : -1;
        if (k === 0) px += s * d; else if (k === 1) { px += s * d * 0.4; py += d * 0.4; } else py += s * d;
        x.lineTo(px, py);
      }
      x.stroke();
      x.beginPath(); x.arc(px, py, w * 0.007, 0, Math.PI * 2); x.fill();
    }
  };
  const frame2d = (x, px, py, w, h, lw) => { x.strokeStyle = '#f3f6f7'; x.lineWidth = lw; x.strokeRect(px, py, w, h); };
  const pad = (x, px, py, r) => {
    x.fillStyle = '#d9dee3'; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#0b0d10'; x.beginPath(); x.arc(px, py, r * 0.45, 0, Math.PI * 2); x.fill();
  };

  // Arduino Uno, top side. Canvas top = the back edge (−z), canvas left = −x
  const BW = 0.69, BD = 0.53;
  const unoTex = paint(1024, 786, (x, w, h) => {
    const u = (bx) => (bx / BW + 0.5) * w, v = (bz) => (bz / BD + 0.5) * h, k = w / BW;
    x.fillStyle = '#00838b'; x.fillRect(0, 0, w, h);
    traces(x, w, h, 70, '#0a96a0');
    x.strokeStyle = '#006a71'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
    // header footprints, pads under every pin
    for (let i = 0; i < 10; i++) pad(x, u(-0.117 + i * 0.0254), v(-0.235), 7);
    for (let i = 0; i < 8; i++) pad(x, u(0.152 + i * 0.0254), v(-0.235), 7);
    for (let i = 0; i < 8; i++) pad(x, u(-0.07 + i * 0.0254), v(0.235), 7);
    for (let i = 0; i < 6; i++) pad(x, u(0.152 + i * 0.0254), v(0.235), 7);
    [[-0.31, -0.23], [0.31, -0.23], [-0.31, 0.23], [0.31, 0.23]].forEach(([a, b]) => {
      x.fillStyle = '#d9dee3'; x.beginPath(); x.arc(u(a), v(b), 26, 0, Math.PI * 2); x.fill();
    });
    // silkscreen
    say(x, 'DIGITAL (PWM~)', u(0.1), v(-0.19), 20);
    ['13', '12', '~11', '~10', '~9', '8'].forEach((t, i) => say(x, t, u(0.152 + i * 0.0254), v(-0.205), 13, { rot: -Math.PI / 2 }));
    say(x, 'POWER', u(0.02), v(0.2), 20); say(x, 'ANALOG IN', u(0.216), v(0.2), 20);
    frame2d(x, u(-0.13), v(0.215), 0.47 * k, 0.04 * k, 3);
    say(x, 'UNO', u(0.3), v(0.02), 64, { rot: -Math.PI / 2, weight: 800, spacing: 4 });
    say(x, 'ARDUINO', u(0.08), v(-0.155), 26, { weight: 800, spacing: 3 });
    // the infinity mark
    x.strokeStyle = '#f3f6f7'; x.lineWidth = 6;
    [-1, 1].forEach((s) => { x.beginPath(); x.arc(u(0.235) + s * 17, v(-0.12), 16, 0, Math.PI * 2); x.stroke(); });
    say(x, 'ON', u(-0.13), v(-0.075), 16); say(x, 'L', u(-0.13), v(-0.11), 16);
    say(x, 'TX', u(-0.2), v(-0.11), 14); say(x, 'RX', u(-0.2), v(-0.075), 14);
    say(x, 'RESET', u(-0.29), v(-0.19), 14);
    frame2d(x, u(-0.11), v(0.045), 0.38 * k, 0.09 * k, 3);
    say(x, 'MADE FOR SHEZBOTICS', u(0.08), v(0.15), 15, { spacing: 2 });
  });
  const unoTop = new THREE.MeshStandardMaterial({ map: unoTex, roughness: 0.42, metalness: 0.05 });
  const unoEdge = new THREE.MeshStandardMaterial({ color: 0x006b72, roughness: 0.6 });

  // HC-SR04, front side. Canvas top = top
  const sonarTex = paint(920, 420, (x, w, h) => {
    x.fillStyle = '#1d4fb0'; x.fillRect(0, 0, w, h);
    traces(x, w, h, 26, '#2a5fc4');
    say(x, 'HC-SR04', w / 2, h * 0.56, 21, { weight: 800 });
    say(x, 'T', w * 0.07, h * 0.86, 34); say(x, 'R', w * 0.93, h * 0.86, 34);
    ['Vcc', 'Trig', 'Echo', 'Gnd'].forEach((t, i) => say(x, t, w * (0.42 + i * 0.053), h * 0.86, 15, { rot: -Math.PI / 2 }));
    [[0.04, 0.1], [0.96, 0.1], [0.04, 0.9], [0.96, 0.9]].forEach(([a, b]) => pad(x, w * a, h * b, 14));
  });
  const sonarFront = new THREE.MeshStandardMaterial({ map: sonarTex, roughness: 0.4 });
  const sonarEdge = new THREE.MeshStandardMaterial({ color: 0x173f8f, roughness: 0.55 });

  // L298N motor driver, top side
  const driverTex = paint(768, 768, (x, w, h) => {
    x.fillStyle = '#b3141c'; x.fillRect(0, 0, w, h);
    traces(x, w, h, 50, '#c6262e');
    say(x, 'L298N', w * 0.5, h * 0.9, 44, { weight: 800, spacing: 3 });
    say(x, 'OUT1  OUT2', w * 0.13, h * 0.5, 20, { rot: -Math.PI / 2 });
    say(x, 'OUT3  OUT4', w * 0.87, h * 0.5, 20, { rot: Math.PI / 2 });
    say(x, '12V   GND   5V', w * 0.32, h * 0.97, 18);
    say(x, 'ENA IN1 IN2 IN3 IN4 ENB', w * 0.72, h * 0.97, 15);
    [[0.06, 0.06], [0.94, 0.06], [0.06, 0.94], [0.94, 0.94]].forEach(([a, b]) => pad(x, w * a, h * b, 22));
  });
  const driverTop = new THREE.MeshStandardMaterial({ map: driverTex, roughness: 0.42 });
  const driverEdge = new THREE.MeshStandardMaterial({ color: 0x8f0f16, roughness: 0.55 });

  // the deck: glossy black acrylic, laser-etched (matte) where the words are
  const PW = 0.78, PL = 1.12;
  const deckArt = (x, w, h, ink) => {
    const u = (dx) => (dx / (2 * PW) + 0.5) * w, v = (dz) => (dz / (2 * PL) + 0.5) * h;
    say(x, 'SHEZBOTICS', u(-0.66), v(-0.1), 46, { rot: -Math.PI / 2, weight: 800, spacing: 14, color: ink });
    say(x, 'BASIC  ·  OBSTACLE AVOIDER  ·  01', u(0.66), v(-0.1), 24, { rot: Math.PI / 2, weight: 700, spacing: 6, color: ink });
  };
  const deckMap = paint(1024, 1470, (x, w, h) => { x.fillStyle = '#0b0d10'; x.fillRect(0, 0, w, h); deckArt(x, w, h, '#5d6873'); });
  const deckRough = paint(1024, 1470, (x, w, h) => { x.fillStyle = 'rgb(40,40,40)'; x.fillRect(0, 0, w, h); deckArt(x, w, h, 'rgb(225,225,225)'); }, false);
  [deckMap, deckRough].forEach((t) => { t.repeat.set(1 / (2 * PW), 1 / (2 * PL)); t.offset.set(0.5, 0.5); });

  // labels and small prints
  const servoTex = paint(512, 490, (x, w, h) => {
    x.fillStyle = '#2a6be0'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e9eef5'; x.fillRect(w * 0.1, h * 0.24, w * 0.8, h * 0.5);
    say(x, 'SG90', w / 2, h * 0.42, 92, { weight: 800, color: '#163a7a', spacing: 4 });
    say(x, 'MICRO SERVO  9g', w / 2, h * 0.62, 30, { color: '#163a7a', spacing: 2 });
  });
  const chipTex = paint(512, 108, (x, w, h) => {
    x.fillStyle = '#1a1c20'; x.fillRect(0, 0, w, h);
    say(x, 'ATMEGA328P', w * 0.54, h * 0.5, 40, { weight: 700, color: '#8c939c', spacing: 3 });
    x.fillStyle = '#0d0e10'; x.beginPath(); x.arc(0, h / 2, h * 0.16, -Math.PI / 2, Math.PI / 2); x.fill();
    x.beginPath(); x.arc(w * 0.06, h * 0.75, 6, 0, Math.PI * 2); x.fill();
  });
  const holeTex = paint(64, 64, (x, w) => {
    x.fillStyle = '#15171a'; x.fillRect(0, 0, w, w);
    x.fillStyle = '#2a2d31'; x.fillRect(17, 17, 30, 30);
    x.fillStyle = '#030304'; x.fillRect(21, 21, 22, 22);
  });
  holeTex.wrapS = THREE.RepeatWrapping;
  const cellTex = paint(256, 512, (x, w, h) => {
    x.fillStyle = '#16a6c2'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0d1b2a'; x.fillRect(0, h * 0.04, w, h * 0.05);
    say(x, '18650  ·  3.7V  ·  2600mAh', w / 2, h / 2, 30, { rot: -Math.PI / 2, weight: 800, color: '#0d1b2a', spacing: 2 });
  });
  // the transducers' woven mesh, and the light that shows through it
  const weave = (x, w, line, gap) => {
    x.fillStyle = gap; x.fillRect(0, 0, w, w);
    x.strokeStyle = line; x.lineWidth = 2.2;
    for (let i = 0; i <= w; i += 7) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, w); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
  };
  const meshTex = paint(256, 256, (x, w) => weave(x, w, '#a7afb8', '#15181c'));
  const meshGlow = paint(256, 256, (x, w) => weave(x, w, '#000000', '#ffffff'));

  /* ---------- materials ---------- */
  const M = {
    yellow: new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.4 }),
    tyre: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.84 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xf1f3f5, roughness: 0.34 }),
    rimInner: new THREE.MeshStandardMaterial({ color: 0x8d969f, roughness: 0.6 }),
    black: new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.5 }),
    sink: new THREE.MeshStandardMaterial({ color: 0x1b1e22, roughness: 0.4, metalness: 0.7 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.35, metalness: 0.2 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.2, metalness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xaab2bb, roughness: 0.34, metalness: 1 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd8aa3c, roughness: 0.28, metalness: 1 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xcf8a4a, roughness: 0.3, metalness: 1 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.5 }),
    nylon: new THREE.MeshStandardMaterial({ color: 0xeee8d8, roughness: 0.62 }),
    terminal: new THREE.MeshStandardMaterial({ color: 0x1f64d8, roughness: 0.42 }),
    servo: new THREE.MeshStandardMaterial({ color: 0x2a6be0, roughness: 0.24 }),
    servoLabel: new THREE.MeshStandardMaterial({ map: servoTex, roughness: 0.4 }),
    chipTop: new THREE.MeshStandardMaterial({ map: chipTex, roughness: 0.4, metalness: 0.15 }),
    header: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.55 }),
    cell: new THREE.MeshStandardMaterial({ map: cellTex, roughness: 0.28 }),
    deck: new THREE.MeshStandardMaterial({ map: deckMap, roughnessMap: deckRough, roughness: 1, metalness: 0, envMapIntensity: 0.7 }),
    deckEdge: new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.12 }),
    bracket: new THREE.MeshStandardMaterial({ color: 0x0d0f12, roughness: 0.18 }),
  };
  const led = (on) => new THREE.MeshStandardMaterial({ color: 0x0a3d33, emissive: 0x5fffd7, emissiveIntensity: on ? 2.2 : 0, roughness: 0.3 });
  // a box with its own material on one face: 0 +x, 1 −x, 2 top, 3 bottom, 4 front, 5 back
  const faces = (side, face, at) => Array.from({ length: 6 }, (_, i) => (i === at ? face : side));
  const headerTop = (pins) => { const t = holeTex.clone(); t.repeat.set(pins, 1); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55 }); };

  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m;
  };
  const box = (w, h, d, mat, x, y, z, parent, r = 0) =>
    mesh(r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const cyl = (rt, rb, h, mat, x, y, z, parent, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, parent);
  const dummy = new THREE.Object3D();
  const many = (geo, mat, list, parent) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, y, z, rx = 0, ry = 0, rz = 0], i) => {
      dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, rz); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
    });
    parent.add(im); return im;
  };
  // a hex screw head, axis along y
  const screwGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.014, 6);
  const screws = (list, parent, mat = M.steel) => many(screwGeo, mat, list, parent);

  /* ---------- the robot: an obstacle-avoiding car, 1 unit ≈ 10 cm ---------- */
  const robotRoot = new THREE.Group();      // placed on the page spots
  const body = new THREE.Group();           // yaw, tilt, hop
  robotRoot.add(body);
  scene.add(robotRoot);

  const parts = {};                          // each part: { g, home: Vector3, out: Vector3 }
  const part = (name, out) => {
    const g = new THREE.Group(); body.add(g);
    parts[name] = { g, out: new THREE.Vector3(...out), spin: new THREE.Vector3(0, 0, 0) };
    return g;
  };

  // deck: one laser-cut plate with a rounded nose, wiring slots and mounting holes
  const chassis = part('chassis', [0, -0.35, 0]);
  const deck = new THREE.Shape();             // drawn in (x, −z)
  const rr = 0.16, rf = 0.46;
  deck.moveTo(-PW, -PL + rf);
  deck.lineTo(-PW, PL - rr); deck.absarc(-PW + rr, PL - rr, rr, Math.PI, Math.PI / 2, true);
  deck.lineTo(PW - rr, PL); deck.absarc(PW - rr, PL - rr, rr, Math.PI / 2, 0, true);
  deck.lineTo(PW, -PL + rf); deck.absarc(PW - rf, -PL + rf, rf, 0, -Math.PI / 2, true);
  deck.lineTo(-PW + rf, -PL); deck.absarc(-PW + rf, -PL + rf, rf, -Math.PI / 2, -Math.PI, true);
  const hole = (x, z, r) => { const p = new THREE.Path(); p.absarc(x, -z, r, 0, Math.PI * 2, false); deck.holes.push(p); };
  const slot = (x, z, len, r) => {
    const p = new THREE.Path();
    p.absarc(x - len / 2, -z, r, Math.PI / 2, Math.PI * 1.5, false);
    p.absarc(x + len / 2, -z, r, -Math.PI / 2, Math.PI / 2, false);
    deck.holes.push(p);
  };
  [-1, 1].forEach((s) => {
    slot(s * 0.5, 0.66, 0.2, 0.035); slot(s * 0.52, -0.02, 0.14, 0.03);
    [-0.98, -0.62, 0.3].forEach((z) => hole(s * 0.52, z, 0.024));
  });
  hole(0, -0.96, 0.05);
  const deckGeo = new THREE.ExtrudeGeometry(deck, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 18 });
  deckGeo.rotateX(-Math.PI / 2); deckGeo.translate(0, 0.632, 0);
  mesh(deckGeo, [M.deck, M.deckEdge], 0, 0, 0, chassis);
  screws([[-0.52, 0.687, -0.42], [0.52, 0.687, -0.42], [-0.52, 0.687, -0.2], [0.52, 0.687, -0.2], [-0.09, 0.687, 0.84], [0.09, 0.687, 0.84]], chassis);

  // ball caster on two brass standoffs, under the nose
  const caster = part('caster', [0, -0.7, 0.3]);
  [-0.09, 0.09].forEach((x) => cyl(0.022, 0.022, 0.21, M.brass, x, 0.525, 0.84, caster, 6));
  box(0.28, 0.03, 0.12, M.black, 0, 0.405, 0.84, caster, 0.012);
  cyl(0.085, 0.105, 0.23, M.black, 0, 0.28, 0.84, caster, 32);
  cyl(0.108, 0.108, 0.02, M.steel, 0, 0.17, 0.84, caster, 32);
  mesh(new THREE.SphereGeometry(0.088, 32, 20), M.silver, 0, 0.088, 0.84, caster);

  // TT gear motors under the deck, treaded wheels outside them
  const motorL = part('motorL', [-0.75, -0.2, 0]);
  const motorR = part('motorR', [0.75, -0.2, 0]);
  const wheels = [];
  const WR = 0.395, AXLE_Z = -0.32;
  const tyreGeo = new THREE.LatheGeometry([
    [0.268, -0.1], [0.3, -0.104], [0.345, -0.1], [0.364, -0.082], [0.37, -0.05], [0.372, 0], [0.37, 0.05], [0.364, 0.082], [0.345, 0.1], [0.3, 0.104], [0.268, 0.1],
  ].map(([r, y]) => new THREE.Vector2(r, y)), 72);
  tyreGeo.rotateZ(Math.PI / 2);
  const treadGeo = new RoundedBoxGeometry(0.085, 0.034, 0.048, 1, 0.01);
  const treadList = [];
  for (let i = 0; i < 30; i++) [-1, 1].forEach((row) => {
    const a = (i + (row > 0 ? 0.5 : 0)) / 30 * Math.PI * 2;
    treadList.push([row * 0.048, Math.cos(a) * 0.379, Math.sin(a) * 0.379, a]);
  });
  // rim face: a disc with six windows between the spokes
  const rimShape = new THREE.Shape(); rimShape.absarc(0, 0, 0.272, 0, Math.PI * 2, false);
  for (let k = 0; k < 6; k++) {
    const a0 = (k / 6) * Math.PI * 2 + 0.2, a1 = a0 + Math.PI / 3 - 0.4;
    const p = new THREE.Path(); p.absarc(0, 0, 0.228, a0, a1, false); p.absarc(0, 0, 0.1, a1, a0, true); rimShape.holes.push(p);
  }
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 40 });
  rimGeo.rotateY(Math.PI / 2);
  [[motorL, -1], [motorR, 1]].forEach(([g, s]) => {
    box(0.22, 0.34, 0.5, M.yellow, s * 0.6, 0.45, -0.2, g, 0.035);                 // gearbox
    box(0.03, 0.3, 0.34, M.bracket, s * 0.475, 0.475, -0.22, g, 0.008);             // mount bracket
    screws([[s * 0.714, 0.37, -0.06, 0, 0, Math.PI / 2], [s * 0.714, 0.54, -0.06, 0, 0, Math.PI / 2]], g);
    cyl(0.055, 0.055, 0.03, M.yellow, s * 0.725, WR, AXLE_Z, g, 24).rotation.z = Math.PI / 2;
    cyl(0.022, 0.022, 0.12, M.white, s * 0.76, WR, AXLE_Z, g, 12).rotation.z = Math.PI / 2;
    const can = cyl(0.095, 0.095, 0.24, M.silver, s * 0.6, 0.47, 0.17, g, 32); can.rotation.x = Math.PI / 2;
    const cap = cyl(0.08, 0.08, 0.025, M.black, s * 0.6, 0.47, 0.3, g, 32); cap.rotation.x = Math.PI / 2;
    [-0.04, 0.04].forEach((dx) => box(0.018, 0.04, 0.012, M.copper, s * 0.6 + dx, 0.47, 0.318, g));
    const w = new THREE.Group(); w.position.set(s * 0.89, WR, AXLE_Z); w.scale.x = s; g.add(w);   // +x is outward
    mesh(tyreGeo, M.tyre, 0, 0, 0, w);
    many(treadGeo, M.tyre, treadList, w);
    const web = cyl(0.27, 0.27, 0.02, M.rimInner, -0.05, 0, 0, w, 48); web.rotation.z = Math.PI / 2;
    const band = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.17, 48, 1, true), M.rim, 0, 0, 0, w); band.rotation.z = Math.PI / 2;
    mesh(rimGeo, M.rim, 0.045, 0, 0, w);
    const hub = cyl(0.07, 0.075, 0.12, M.rim, 0.03, 0, 0, w, 32); hub.rotation.z = Math.PI / 2;
    const bolt = cyl(0.026, 0.026, 0.014, M.steel, 0.095, 0, 0, w, 6); bolt.rotation.z = Math.PI / 2;
    wheels.push(w);
  });

  // L298N motor driver: red board, finned heatsink, blue screw terminals
  const driver = part('driver', [0, 0.85, -0.25]);
  box(0.43, 0.026, 0.43, faces(driverEdge, driverTop, 2), 0, 0.72, -0.3, driver);
  [[-0.19, -0.49], [0.19, -0.49], [-0.19, -0.11], [0.19, -0.11]].forEach(([x, z]) => cyl(0.018, 0.018, 0.04, M.nylon, x, 0.7, z, driver, 12));
  const sink = new THREE.Group(); sink.position.set(0, 0.8, -0.32); driver.add(sink);
  box(0.26, 0.03, 0.24, M.sink, 0, -0.05, 0, sink, 0.006);
  for (let i = 0; i < 8; i++) box(0.016, 0.15, 0.24, M.sink, -0.119 + i * 0.034, 0.03, 0, sink, 0.005);
  const terminal = (n, x, z, ry) => {
    const t = new THREE.Group(); t.position.set(x, 0.775, z); t.rotation.y = ry; driver.add(t);
    box(0.075 * n, 0.08, 0.075, M.terminal, 0, 0, 0, t, 0.008);
    for (let i = 0; i < n; i++) {
      const sx = (i - (n - 1) / 2) * 0.075;
      cyl(0.024, 0.024, 0.01, M.steel, sx, 0.041, 0.0, t, 20);
      box(0.034, 0.006, 0.007, M.black, sx, 0.047, 0, t);
    }
  };
  terminal(3, -0.1, -0.13, 0); terminal(2, -0.18, -0.36, Math.PI / 2); terminal(2, 0.18, -0.36, -Math.PI / 2);
  many(new THREE.BoxGeometry(0.008, 0.07, 0.008), M.brass, Array.from({ length: 6 }, (_, i) => [0.06 + i * 0.025, 0.765, -0.12]), driver);
  [0, 2, 4].forEach((i) => box(0.045, 0.05, 0.022, M.black, 0.072 + i * 0.025, 0.79, -0.12, driver, 0.004));
  cyl(0.035, 0.035, 0.09, M.chip, 0.08, 0.778, -0.475, driver, 24);
  cyl(0.035, 0.035, 0.005, M.steel, 0.08, 0.825, -0.475, driver, 24);

  // battery tray with two 18650 cells and a power switch
  const battery = part('battery', [0, 0.95, -0.7]);
  const tray = (w, h, d, x, y, z) => box(w, h, d, M.black, x, y, z, battery, 0.008);
  tray(0.84, 0.03, 0.44, 0, 0.695, -0.86);
  tray(0.84, 0.11, 0.025, 0, 0.75, -1.07); tray(0.84, 0.11, 0.025, 0, 0.75, -0.65);
  tray(0.025, 0.13, 0.44, -0.41, 0.76, -0.86); tray(0.025, 0.13, 0.44, 0.41, 0.76, -0.86);
  [-0.1, 0.1].forEach((z) => {
    const c = cyl(0.09, 0.09, 0.66, M.cell, -0.01, 0.8, -0.86 + z, battery, 40); c.rotation.z = Math.PI / 2;
    cyl(0.06, 0.06, 0.012, M.silver, 0.325, 0.8, -0.86 + z, battery, 24).rotation.z = Math.PI / 2;
    cyl(0.03, 0.03, 0.02, M.silver, 0.335, 0.8, -0.86 + z, battery, 16).rotation.z = Math.PI / 2;
    cyl(0.05, 0.05, 0.035, M.steel, -0.375, 0.8, -0.86 + z, battery, 8).rotation.z = Math.PI / 2;
  });
  box(0.03, 0.06, 0.1, M.black, 0.435, 0.76, -0.78, battery, 0.006);
  box(0.02, 0.045, 0.06, new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.45 }), 0.455, 0.765, -0.78, battery, 0.006);

  // Arduino Uno on brass standoffs, with five seat lights
  const board = part('board', [0, 1.25, 0.15]);
  const pcbY = 0.84, BZ = 0.3;
  box(BW, 0.032, BD, faces(unoEdge, unoTop, 2), 0, pcbY, BZ, board);
  [[-0.31, -0.23], [0.31, -0.23], [-0.31, 0.23], [0.31, 0.23]].forEach(([x, z]) => {
    cyl(0.02, 0.02, 0.14, M.brass, x, pcbY - 0.088, BZ + z, board, 6);
    cyl(0.022, 0.022, 0.01, M.steel, x, pcbY + 0.021, BZ + z, board, 16);
  });
  // ATmega328P with its 28 legs
  box(0.36, 0.04, 0.075, faces(M.chip, M.chipTop, 2), 0.07, pcbY + 0.04, BZ + 0.09, board);
  const legs = [];
  for (let i = 0; i < 14; i++) [-1, 1].forEach((s) => legs.push([0.07 - 0.165 + i * 0.0254, pcbY + 0.03, BZ + 0.09 + s * 0.044]));
  many(new THREE.BoxGeometry(0.012, 0.03, 0.014), M.steel, legs, board);
  // headers: female, with their holes
  const header = (pins, x, z) => box(pins * 0.0254, 0.07, 0.026, faces(M.header, headerTop(pins), 2), x, pcbY + 0.05, BZ + z, board);
  header(10, -0.003, -0.235); header(8, 0.241, -0.235); header(8, 0.019, 0.235); header(6, 0.216, 0.235);
  // USB-B, barrel jack, regulator, crystal, capacitors, reset
  box(0.16, 0.11, 0.12, faces(M.silver, M.black, 1), -0.29, pcbY + 0.07, BZ - 0.13, board);
  box(0.14, 0.11, 0.09, M.black, -0.3, pcbY + 0.07, BZ + 0.15, board, 0.01);
  cyl(0.028, 0.028, 0.004, M.black, -0.371, pcbY + 0.07, BZ + 0.15, board, 20).rotation.z = Math.PI / 2;
  box(0.06, 0.035, 0.05, M.chip, -0.19, pcbY + 0.034, BZ + 0.03, board);
  box(0.06, 0.012, 0.03, M.steel, -0.19, pcbY + 0.022, BZ - 0.005, board);
  box(0.07, 0.035, 0.026, M.silver, -0.08, pcbY + 0.034, BZ - 0.06, board, 0.012);
  [[-0.17, 0.12], [-0.17, 0.2]].forEach(([x, z]) => {
    cyl(0.022, 0.022, 0.05, M.chip, x, pcbY + 0.041, BZ + z, board, 20);
    cyl(0.022, 0.022, 0.003, M.steel, x, pcbY + 0.068, BZ + z, board, 20);
  });
  box(0.05, 0.025, 0.05, M.steel, -0.29, pcbY + 0.028, BZ - 0.24, board);
  cyl(0.013, 0.013, 0.02, new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.4 }), -0.29, pcbY + 0.045, BZ - 0.24, board, 16);
  box(0.05, 0.01, 0.05, M.chip, -0.13, pcbY + 0.021, BZ - 0.15, board);
  const leds = [];
  for (let i = 0; i < 5; i++) {
    const l = mesh(new THREE.BoxGeometry(0.035, 0.03, 0.025), led(true), -0.1 + i * 0.05, pcbY + 0.03, 0.2, board);
    leds.push(l);
  }

  // servo (the neck) and the ultrasonic sensor (the eyes), facing +z
  const servo = part('servo', [0, 0.55, 0.85]);
  box(0.23, 0.22, 0.12, M.servo, 0, 0.8, 0.98, servo, 0.012);
  box(0.2, 0.15, 0.004, M.servoLabel, -0.005, 0.79, 1.041, servo);
  box(0.33, 0.018, 0.12, M.servo, 0, 0.865, 0.98, servo, 0.006);
  screws([[-0.145, 0.88, 0.98], [0.145, 0.88, 0.98]], servo);
  cyl(0.055, 0.055, 0.04, M.servo, 0.05, 0.93, 0.98, servo, 24);
  cyl(0.02, 0.02, 0.03, M.white, 0.05, 0.955, 0.98, servo, 12);

  const head = part('sensor', [0, 1.1, 1.05]);
  const neck = new THREE.Group(); neck.position.set(0.05, 0.97, 0.98); head.add(neck);
  // the horn, and the acrylic bracket that carries the sensor
  const horn = new THREE.Shape();
  horn.absarc(-0.09, 0, 0.022, Math.PI / 2, Math.PI * 1.5, false); horn.absarc(0.09, 0, 0.022, -Math.PI / 2, Math.PI / 2, false);
  const hornGeo = new THREE.ExtrudeGeometry(horn, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 12 });
  hornGeo.rotateX(-Math.PI / 2);
  mesh(hornGeo, M.white, 0, -0.008, 0, neck);
  box(0.15, 0.44, 0.02, M.bracket, 0, 0.22, -0.035, neck, 0.008);
  screws([[0, 0.02, 0, 0, 0, 0]], neck);
  const eyes = new THREE.Group(); eyes.position.set(0, 0.42, 0.02); eyes.scale.setScalar(1.38); neck.add(eyes);
  box(0.46, 0.21, 0.016, faces(sonarEdge, sonarFront, 4), 0, 0, 0, eyes);
  const pupilMat = new THREE.MeshStandardMaterial({ map: meshTex, roughness: 0.5, metalness: 0.6, emissive: 0x5fffd7, emissiveMap: meshGlow, emissiveIntensity: 0 });
  [-0.13, 0.13].forEach((x) => {
    const t = cyl(0.083, 0.083, 0.12, M.silver, x, 0, 0.068, eyes, 48); t.rotation.x = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.078, 0.007, 10, 48), M.silver, x, 0, 0.128, eyes);
    cyl(0.074, 0.074, 0.006, pupilMat, x, 0, 0.124, eyes, 48).rotation.x = Math.PI / 2;
  });
  box(0.085, 0.034, 0.03, M.silver, 0, 0.066, 0.02, eyes, 0.012);
  box(0.06, 0.06, 0.008, M.chip, -0.05, 0, -0.012, eyes); box(0.05, 0.05, 0.008, M.chip, 0.06, 0, -0.012, eyes);
  const pings = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.062, 0.078, 48),
      new THREE.MeshBasicMaterial({ color: 0x071423, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    m.visible = false; eyes.add(m); pings.push({ m, t: -1, x: 0 });
  }
  many(new THREE.BoxGeometry(0.01, 0.06, 0.01), M.brass, [0, 1, 2, 3].map((i) => [-0.038 + i * 0.0254, -0.13, 0]), eyes);

  // a 16×2 character LCD on an acrylic stand at the back: it shows what the sensor measures
  const GLYPHS = {
    ' ': '00000000000000', '0': '0e11131519110e', '1': '040c040404040e', '2': '0e11010204081f',
    '3': '1f02040201110e', '4': '02060a121f0202', '5': '1f101e0101110e', '6': '0608101e11110e',
    '7': '1f010204080808', '8': '0e11110e11110e', '9': '0e11110f01020c', 'A': '0e1111111f1111',
    'B': '1e11111e11111e', 'C': '0e11101010110e', 'D': '1c12111111121c', 'E': '1f10101e10101f',
    'G': '0e11101711110f', 'H': '1111111f111111', 'I': '0e04040404040e', 'K': '11121418141211',
    'L': '1010101010101f', 'M': '111b1515111111', 'N': '11111915131111', 'O': '0e11111111110e',
    'R': '1e11111e141211', 'S': '0f10100e01011e', 'T': '1f040404040404', 'Z': '1f01020408101f',
    'c': '00000e1010110e', 'm': '00001a15151111', ',': '000000000c0408', '.': '00000000000c0c', '-': '0000001f000000',
  };
  const DOT = 5, PITCH = 6, CELL_W = 5 * PITCH + 3, CELL_H = 8 * PITCH + 4, PADX = 15, PADY = 12;   // about as many pixels as it ever shows
  const LW = PADX * 2 + 16 * CELL_W - 6, LH = PADY * 2 + 2 * CELL_H - 8;
  const lcdCanvas = document.createElement('canvas'); lcdCanvas.width = LW; lcdCanvas.height = LH;
  const lcdCtx = lcdCanvas.getContext('2d');
  const lcdTex = new THREE.CanvasTexture(lcdCanvas); lcdTex.colorSpace = THREE.SRGBColorSpace; lcdTex.anisotropy = maxAniso;
  const LCD_BLUE = ['#1f4fd8', '#2b5de8', '#eef6ff'], LCD_RED = ['#d1382b', '#df4a3c', '#fff3ec'];
  const lcdDots = new Uint8Array(80 * 16);          // 16 cells × 5 dots across, 2 rows × 8 dots down
  const rows = (ch) => { const g = GLYPHS[ch] || GLYPHS[' ']; return Array.from({ length: 7 }, (_, y) => parseInt(g.substr(y * 2, 2), 16)); };
  const putText = (row, col, str) => [...str].forEach((ch, i) => {
    const c = col + i; if (c < 0 || c > 15) return;
    rows(ch).forEach((bits, y) => { for (let x = 0; x < 5; x++) if (bits & (16 >> x)) lcdDots[(row * 8 + y) * 80 + c * 5 + x] = 1; });
  });
  // big digits, three cells wide and both rows tall, the way LCD clocks draw them
  const putBig = (col, ch) => rows(ch).forEach((bits, y) => {
    for (let x = 0; x < 5; x++) if (bits & (16 >> x)) for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 3; sx++) {
      const Y = y * 2 + sy; lcdDots[(Y < 7 ? Y : Y + 1) * 80 + col * 5 + x * 3 + sx] = 1;
    }
  });
  const centred = (t) => ' '.repeat(Math.max(0, Math.floor((16 - t.length) / 2))) + t;
  let lcdKey = '';
  const lcdShow = (mode, n, now) => {
    const dots = '.'.repeat(Math.floor(now * 2.5) % 4);
    const key = mode === 'scan' ? mode + dots : mode + n;
    if (key === lcdKey) return;
    lcdKey = key; lcdDots.fill(0);
    if (mode === 'dist' || mode === 'near') {
      const t = String(Math.min(n, 999)), c0 = 11 - (t.length * 4 - 1);
      [...t].forEach((ch, i) => putBig(c0 + i * 4, ch));
      putText(0, 12, mode === 'near' ? 'TOO ' : 'DIST'); putText(1, 12, mode === 'near' ? 'NEAR' : ' cm ');
    } else if (mode === 'far') { putText(0, 0, centred('NO OBSTACLE')); putText(1, 0, centred('IN RANGE')); }
    else if (mode === 'kit') { putText(0, 0, centred('HELLO, MAKER')); putText(1, 0, centred('SHEZBOTICS')); }
    else { putText(0, 0, centred('SHEZBOTICS')); putText(1, 3, 'SCANNING' + dots); }
    const [bg, off, on] = mode === 'near' ? LCD_RED : LCD_BLUE;
    lcdCtx.fillStyle = bg; lcdCtx.fillRect(0, 0, LW, LH);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 16; c++) for (let dy = 0; dy < 8; dy++) for (let dx = 0; dx < 5; dx++) {
      lcdCtx.fillStyle = lcdDots[(r * 8 + dy) * 80 + c * 5 + dx] ? on : off;
      lcdCtx.fillRect(PADX + c * CELL_W + dx * PITCH, PADY + r * CELL_H + dy * PITCH, DOT, DOT);
    }
    lcdTex.needsUpdate = true;
    canvas.dataset.lcd = mode === 'dist' || mode === 'near' ? `${mode} ${n}` : mode;
  };
  lcdShow('scan', 0, 0);

  const lcd = part('lcd', [0.35, 0.95, -0.45]);
  const screenBox = new THREE.Group(); screenBox.position.set(0.36, 1.15, -0.8); screenBox.rotation.set(-0.14, 0.32, 0); lcd.add(screenBox);
  box(0.8, 0.36, 0.016, new THREE.MeshStandardMaterial({ color: 0x1d7a3e, roughness: 0.45 }), 0, 0, -0.03, screenBox);
  box(0.71, 0.25, 0.032, M.sink, 0, -0.005, -0.006, screenBox, 0.006);
  mesh(new THREE.PlaneGeometry(0.62, 0.62 * LH / LW), new THREE.MeshBasicMaterial({ map: lcdTex, toneMapped: false }), 0, -0.005, 0.0105, screenBox);
  mesh(new THREE.PlaneGeometry(0.64, 0.17), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.06, metalness: 1, transparent: true, opacity: 0.1, depthWrite: false }), 0, -0.005, 0.012, screenBox);
  [[-0.37, 0.155], [0.37, 0.155], [-0.37, -0.155], [0.37, -0.155]].forEach(([x, y]) => cyl(0.018, 0.018, 0.006, M.silver, x, y, -0.02, screenBox, 16).rotation.x = Math.PI / 2);
  many(new THREE.CylinderGeometry(0.009, 0.009, 0.005, 10), M.brass, Array.from({ length: 16 }, (_, i) => [-0.29 + i * 0.0254, 0.158, -0.02, Math.PI / 2]), screenBox);
  box(0.42, 0.2, 0.012, M.chip, 0.05, 0, -0.046, screenBox);
  // the stand: one black acrylic upright, screwed to the deck
  box(0.13, 0.43, 0.025, M.bracket, 0.57, 0.895, -0.93, lcd, 0.008).rotation.y = 0.32;
  box(0.18, 0.025, 0.12, M.bracket, 0.57, 0.692, -0.93, lcd, 0.008).rotation.y = 0.32;
  screws([[0.53, 0.708, -0.91], [0.62, 0.708, -0.95]], lcd);

  // wires with their plugs (they belong to the assembled robot and fade as it comes apart)
  const wireMats = [0xd7263d, 0x16181b, 0xffc400, 0x2bb673, 0x2f80ed, 0xff7a00, 0xf2f2f2, 0x0e0f11].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, transparent: true, opacity: 1 }));
  const wires = new THREE.Group(); body.add(wires);
  const plugGeo = new RoundedBoxGeometry(0.03, 0.03, 0.075, 1, 0.006);
  const AXIS_Z = new THREE.Vector3(0, 0, 1);
  const wire = (pts, mi, plugs = true) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 48, 0.0125, 8, false), wireMats[mi], 0, 0, 0, wires);
    if (!plugs) return;
    [0, 1].forEach((t) => {
      const tan = curve.getTangentAt(t);
      const pl = mesh(plugGeo, wireMats[7], 0, 0, 0, wires);
      pl.position.copy(curve.getPointAt(t)).addScaledVector(tan, t ? -0.03 : 0.03);
      pl.quaternion.setFromUnitVectors(AXIS_Z, tan);
    });
  };
  wire([[0.02, 0.9, 0.55], [0.0, 1.02, 0.72], [-0.02, 1.0, 0.92], [-0.08, 1.1, 0.98]], 2);
  wire([[0.06, 0.9, 0.55], [0.06, 1.05, 0.75], [0.04, 1.06, 0.95], [-0.04, 1.12, 0.99]], 3);
  wire([[0.1, 0.9, 0.56], [0.14, 1.0, 0.78], [0.1, 0.98, 0.95], [0.02, 1.12, 0.99]], 4);
  wire([[0.14, 0.9, 0.56], [0.2, 0.98, 0.8], [0.14, 0.9, 0.98], [0.1, 0.85, 0.98]], 5);
  wire([[0.2, 0.9, 0.06], [0.24, 1.0, -0.06], [0.18, 0.86, -0.16], [0.12, 0.79, -0.2]], 0);
  wire([[0.26, 0.9, 0.06], [0.32, 0.98, -0.05], [0.24, 0.85, -0.2], [0.17, 0.79, -0.2]], 1);
  wire([[-0.1, 0.9, 0.06], [-0.2, 1.02, -0.1], [-0.32, 0.92, -0.5], [-0.46, 0.8, -0.7]], 0, false);
  wire([[-0.05, 0.9, 0.06], [-0.12, 0.98, -0.12], [-0.22, 0.9, -0.55], [-0.4, 0.84, -0.86]], 1, false);
  wire([[-0.18, 0.79, -0.36], [-0.45, 0.82, -0.36], [-0.6, 0.7, 0.1], [-0.6, 0.5, 0.31]], 0, false);
  wire([[0.18, 0.79, -0.36], [0.45, 0.82, -0.36], [0.6, 0.7, 0.1], [0.6, 0.5, 0.31]], 1, false);
  // the screen's two I2C leads run under it to the backpack on its back
  wire([[0.3, 0.9, 0.07], [0.42, 0.95, -0.35], [0.5, 0.94, -0.84], [0.45, 1.08, -0.9]], 4);
  wire([[0.33, 0.9, 0.07], [0.45, 0.95, -0.35], [0.53, 0.94, -0.85], [0.48, 1.08, -0.91]], 3);

  // every solid part casts and catches the key light's shadows
  // one draw per material for everything that moves together: hundreds of small parts become a few dozen meshes
  const moving = new Set([...wheels, neck, eyes]);
  const flatten = (m, toRoot) => {
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    Object.keys(g.attributes).forEach((k) => { if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k); });
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.clearGroups();
    return g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, m.matrixWorld));
  };
  const mergeInto = (root) => {
    root.updateMatrixWorld(true);
    const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map();
    const walk = (o) => o.children.slice().forEach((c) => {
      if (moving.has(c)) mergeInto(c);
      else if (c.isMesh && !c.isInstancedMesh && !Array.isArray(c.material) && !c.children.length) {
        const list = buckets.get(c.material) || []; list.push(c); buckets.set(c.material, list);
      } else if (!c.isMesh) walk(c);
    });
    walk(root);
    buckets.forEach((list, mat) => {
      if (list.length < 2) return;
      const geo = mergeGeometries(list.map((m) => flatten(m, toRoot)), false);
      if (!geo) return;
      list.forEach((m) => m.parent.remove(m));
      root.add(new THREE.Mesh(geo, mat));
    });
  };
  Object.values(parts).forEach((pt) => mergeInto(pt.g));
  mergeInto(wires);
  // everything catches the key light's shadows; only the parts big enough to matter cast them
  body.traverse((o) => {
    if (!o.isMesh) return;
    o.receiveShadow = true;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    o.castShadow = !o.isInstancedMesh && o.geometry.boundingSphere.radius > 0.09;
  });
  pings.forEach((pg) => { pg.m.castShadow = false; });

  // the floor: a soft drawn blob for contact, plus a catcher for the real shadows
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(4,11,20,0.42)'); g.addColorStop(1, 'rgba(4,11,20,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const floorBlob = mesh(new THREE.PlaneGeometry(2.9, 2.7), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }), 0, 0.004, -0.05, body);
  floorBlob.rotation.x = -Math.PI / 2;
  // only as big as the shadow ever reaches (the light is front-left, so it falls back and right)
  const floor = mesh(new THREE.PlaneGeometry(3.6, 4.0), new THREE.ShadowMaterial({ color: 0x03101c, opacity: 0.3, depthWrite: false }), 0.3, 0.002, -0.5, body);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;

  Object.values(parts).forEach((p) => { p.home = p.g.position.clone(); });

  /* ---------- placement: the canvas lives in the page (the hero, then the kit stage), so it scrolls with it ---------- */
  const field = spotHero.parentElement;                         // the hero's picture area
  const kitStage = spotKit ? spotKit.closest('.kit-stage') : null;
  let W = 1, H = 1, mode = '', A = { x: 0, y: 0, s: 1 };
  const worldPerPx = () => (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / H;
  // size the drawing to its box, and find where the robot stands in it: x centre, ground at fy of the spot, width it fills
  const layout = () => {
    const box = canvas.parentElement;
    const w = Math.max(1, box.clientWidth), h = Math.max(1, box.clientHeight);
    if (w !== W || h !== H) {
      W = w; H = h;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    const inKit = mode === 'kit';
    const spot = inKit ? spotKit : spotHero;
    const b = box.getBoundingClientRect(), r = spot.getBoundingClientRect(), k = worldPerPx();
    const fy = inKit ? (state.kitLive ? 0.74 : 0.8) : 0.83, fill = inKit ? (phone ? 0.86 : 0.8) : 0.9;
    A = { x: (r.left - b.left + r.width / 2 - W / 2) * k, y: -(r.top - b.top + r.height * fy - H / 2) * k, s: (r.width * fill * k) / 2.6 };
    renderer.shadowMap.needsUpdate = true;
  };
  let pose = 0, poseFrom = 0, poseAt = -10, posePrev = 0;      // 0 the hero's pose, 1 the kit stage's
  const place = (m) => {
    if (m === mode || (m === 'kit' && !kitStage)) return;
    mode = m;
    (m === 'kit' ? kitStage : field).appendChild(canvas);
    layout();
    poseFrom = pose; poseAt = performance.now() / 1000;
  };
  place('hero');
  pose = 0;
  const sizes = new ResizeObserver(() => layout());
  [field, spotHero, kitStage, spotKit].forEach((el) => { if (el) sizes.observe(el); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(layout);
  // nothing is drawn while the box it sits in is off screen
  const seen = { hero: true, kit: false };
  new IntersectionObserver((es) => { seen.hero = es[es.length - 1].isIntersecting; }).observe(field);
  if (kit && kitStage) {
    new IntersectionObserver((es) => { seen.kit = es[es.length - 1].isIntersecting; }).observe(kit);
    // it moves to the kit stage once the hero has scrolled away (the kit section's top passes 15% from the top)
    new IntersectionObserver((es) => { place(es[es.length - 1].isIntersecting ? 'kit' : 'hero'); }, { rootMargin: '-15% 0px -84% 0px' }).observe(kit);
  }

  /* ---------- input ---------- */
  const pointer = { cx: 0, cy: 0, px: 0, py: 0, x: 0, y: 0, moved: -10 };   // client px, canvas px, -1..1
  const aimAt = (e) => { pointer.cx = e.clientX; pointer.cy = e.clientY; pointer.moved = performance.now() / 1000; };
  addEventListener('pointermove', aimAt, { passive: true });

  const ray = new THREE.Raycaster();
  let happy = -10;
  addEventListener('pointerdown', (e) => {
    aimAt(e);
    const c = canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - c.left) / W) * 2 - 1, -((e.clientY - c.top) / H) * 2 + 1);
    ray.setFromCamera(v, camera);
    if (ray.intersectObject(body, true).some((h) => h.object !== floorBlob && h.object !== floor)) happy = performance.now() / 1000;
  });

  // phones: tilt it and a ball rolls across the hero; the sensor tracks the ball, a tap drops it there
  const hint = field.querySelector('.hero-hint');
  const hintLead = hint ? hint.textContent.split('. ')[0] + '. ' : '';
  const ball = { on: false, x: 0, y: 0, vx: 0, vy: 0, gx: 0, gy: 0, g0: null, b0: null, el: null };
  const touch = mq('(hover: none) and (pointer: coarse)').matches && !reduced && 'DeviceOrientationEvent' in window;
  const canAsk = touch && typeof DeviceOrientationEvent.requestPermission === 'function';
  const tell = (t) => { if (hint) hint.textContent = hintLead + t; };
  const startBall = () => {
    if (ball.on) return;
    ball.on = true;
    ball.el = document.createElement('i'); ball.el.className = 'tilt-ball'; ball.el.setAttribute('aria-hidden', 'true');
    field.appendChild(ball.el);
    ball.x = field.clientWidth * 0.5; ball.y = field.clientHeight * 0.42;
    requestAnimationFrame(() => ball.el.classList.add('is-on'));
    tell('Tilt your phone to roll the ball: its sensor follows it. Roll it close and it backs off.');
  };
  const onTilt = (e) => {
    if (e.beta == null || e.gamma == null) return;
    ball.live = true;
    const ang = (screen.orientation && screen.orientation.angle) || 0;
    let lr = e.gamma, fb = e.beta;                       // in the screen's own axes, landscape too
    if (ang === 90) { lr = e.beta; fb = -e.gamma; } else if (ang === 270 || ang === -90) { lr = -e.beta; fb = e.gamma; }
    if (ball.g0 === null) { ball.g0 = lr; ball.b0 = fb; }
    // however the phone is held becomes level again over a few seconds
    ball.g0 += (lr - ball.g0) * 0.008; ball.b0 += (fb - ball.b0) * 0.008;
    ball.gx = clamp((lr - ball.g0) / 22, -1, 1); ball.gy = clamp((fb - ball.b0) / 22, -1, 1);
    if (!ball.on && Math.hypot(lr - ball.g0, fb - ball.b0) > 3) startBall();
  };
  if (touch) {
    tell('Tap anywhere and its sensor looks there.');
    addEventListener('deviceorientation', onTilt);
    // some phones (iPhones) send no tilt until the visitor allows it, which needs a tap
    if (canAsk) setTimeout(() => { if (!ball.live) tell('Tap, then tilt your phone: its sensor follows the ball.'); }, 1200);
    field.addEventListener('pointerdown', (e) => {
      if (ball.on) {
        const r = field.getBoundingClientRect();
        ball.x = e.clientX - r.left; ball.y = e.clientY - r.top; ball.vx = ball.vy = 0;
      } else if (canAsk && !ball.live && !ball.asked) {
        ball.asked = true;
        DeviceOrientationEvent.requestPermission().then((r) => { if (r === 'granted') startBall(); }).catch(() => {});
      }
    });
  }
  // one step of rolling, in the hero's own pixels (the canvas fills it): tilt pushes, friction slows, walls and robot bounce
  const sensPx = { x: -1e4, y: -1e4, ppu: 1 };
  const BALL_R = 11;
  const roll = (dt) => {
    ball.vx = clamp((ball.vx + ball.gx * 2400 * dt) * Math.pow(0.4, dt), -1400, 1400);
    ball.vy = clamp((ball.vy + ball.gy * 2400 * dt) * Math.pow(0.4, dt), -1400, 1400);
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    const L = 12 + BALL_R, R = W - 12 - BALL_R, T = 76 + BALL_R, B = H - 12 - BALL_R;
    if (ball.x < L) { ball.x = L; ball.vx = Math.abs(ball.vx) * 0.55; }
    if (ball.x > R) { ball.x = R; ball.vx = -Math.abs(ball.vx) * 0.55; }
    if (ball.y < T) { ball.y = T; ball.vy = Math.abs(ball.vy) * 0.55; }
    if (ball.y > B) { ball.y = B; ball.vy = -Math.abs(ball.vy) * 0.55; }
    // the car: a box around its deck and wheels
    const u = sensPx.ppu;
    v3.copy(robotRoot.position).project(camera);
    const gx = (v3.x + 1) / 2 * W, gy = (1 - v3.y) / 2 * H;
    const cl = gx - 1.2 * u - BALL_R, cr = gx + 1.2 * u + BALL_R, ct = gy - 0.95 * u - BALL_R, cb = gy + 0.15 * u + BALL_R;
    if (ball.x > cl && ball.x < cr && ball.y > ct && ball.y < cb) {
      const m = Math.min(ball.x - cl, cr - ball.x, ball.y - ct, cb - ball.y);
      if (m === ball.y - ct) { ball.y = ct; ball.vy = -Math.abs(ball.vy) * 0.5; }
      else if (m === ball.x - cl) { ball.x = cl; ball.vx = -Math.abs(ball.vx) * 0.5; }
      else if (m === cr - ball.x) { ball.x = cr; ball.vx = Math.abs(ball.vx) * 0.5; }
      else { ball.y = cb; ball.vy = Math.abs(ball.vy) * 0.5; }
    }
    // the sensor head: a circle that knocks the ball away
    const dx = ball.x - sensPx.x, dy = ball.y - sensPx.y, d = Math.hypot(dx, dy) || 1;
    const reach = 0.6 * u + BALL_R;          // touching it reads under TOO_CLOSE, so it backs off
    if (d < reach) {
      const nx = dx / d, ny = dy / d, vn = ball.vx * nx + ball.vy * ny;
      ball.x = sensPx.x + nx * reach; ball.y = sensPx.y + ny * reach;
      if (vn < 0) { ball.vx -= 1.7 * vn * nx; ball.vy -= 1.7 * vn * ny; }
      ball.vx += nx * 160; ball.vy += ny * 160;
    }
  };

  /* ---------- the loop ---------- */
  let frozen = false;
  let last = performance.now() / 1000, spin = 0, yaw = -0.35, tilt = 0.12, headYaw = 0, headPitch = 0, explodeNow = 0;
  const tmp = new THREE.Vector3();
  const lerp = THREE.MathUtils.lerp;

  // the sensor: finds the cursor, pings it, measures it, and backs off when it gets too close
  const aimRay = new THREE.Raycaster();
  const aimPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const aimHit = new THREE.Vector3(), neckW = new THREE.Vector3(), v3 = new THREE.Vector3(), ndc = new THREE.Vector2();
  const TOO_CLOSE = 9;                     // cm, at the robot's own scale (1 unit = 10 cm)
  let lastPing = 0, avoidAt = -10, hudAt = 0, glow = 0, avoiding = false, retreat = 0, retreatPrev = 0;

  // shadows are redrawn every other frame (every third on phones): soft shadows look the same, at a fraction of the cost
  renderer.shadowMap.autoUpdate = false;
  let slow = 1 / 60, samples = 0, frameNo = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (frozen) return;
    const t = performance.now() / 1000;
    if (t - last < 1 / 75) return;             // about 60 frames a second at most, even on 120 Hz screens
    const raw = t - last;
    const dt = Math.min(0.05, raw); last = t;
    if (!seen[mode]) { ball.t = t; return; }   // off screen: nothing to draw

    // a device that can't hold about 40 frames a second renders fewer pixels, then drops the shadows
    if (raw < 0.25) { samples++; slow += (raw - slow) * 0.05; }
    if (samples > 120 && slow > 1 / 38) {
      samples = 0; slow = 1 / 60;
      if (pr > 0.75) { pr = Math.max(0.75, pr - 0.25); renderer.setPixelRatio(pr); renderer.setSize(W, H, false); }
      else key.castShadow = false;
    }

    // the pose eases between the hero's and the kit stage's after each move; in the kit it rises into place
    const inKit = mode === 'kit';
    const pe = clamp((t - poseAt) / (inKit ? 0.9 : 0.4));
    pose = lerp(poseFrom, inKit ? 1 : 0, 1 - Math.pow(1 - pe, 3));
    const rise = inKit ? (1 - pose) * 0.9 : 0;

    // explode with the kit stage
    const p = state.kitLive ? state.kitP : 0.5;
    const explode = !inKit ? 0 : (state.kitLive ? smooth(0.06, 0.2, p) * (1 - smooth(0.84, 0.97, p)) : 0.85);
    explodeNow = lerp(explodeNow, explode, reduced ? 1 : Math.min(1, dt * 8));
    const s = A.s / (1 + explodeNow * 0.3);
    robotRoot.position.set(A.x, A.y - rise * A.s, 0);
    robotRoot.scale.setScalar(s);
    aimKey(s);

    // where the target is, in the canvas's pixels: the ball on phones, otherwise the cursor (read once a frame)
    const now = t;
    if (ball.on && !inKit) {
      let left = Math.min(0.25, t - (ball.t || t)); while (left > 1e-4) { const st = Math.min(1 / 60, left); roll(st); left -= st; }
      ball.el.style.transform = `translate(${ball.x.toFixed(1)}px, ${ball.y.toFixed(1)}px)`;
      pointer.px = ball.x; pointer.py = ball.y; pointer.moved = now;
    } else if (!inKit && now - pointer.moved < 2.5) {
      const c = canvas.getBoundingClientRect();
      pointer.px = pointer.cx - c.left; pointer.py = pointer.cy - c.top;
    }
    ball.t = t;
    pointer.x = (pointer.px / W) * 2 - 1; pointer.y = -(pointer.py / H) * 2 + 1;
    const tracking = !inKit && now - pointer.moved < 2.5;
    let az = 0, cm = Infinity;
    if (tracking) {
      // where the target sits in space, on a plane a little in front of the sensor
      neck.getWorldPosition(neckW);
      aimPlane.constant = -(neckW.z + 2.5 * s);
      aimRay.setFromCamera(ndc.set(pointer.x, pointer.y), camera);
      aimRay.ray.intersectPlane(aimPlane, aimHit);
      v3.copy(aimHit); robotRoot.worldToLocal(v3);
      const nl = robotRoot.worldToLocal(neckW.clone());
      az = Math.atan2(v3.x - nl.x, v3.z - nl.z);
      // the reading: distance on screen from the sensor to the target, in the robot's centimetres
      v3.copy(neckW).project(camera);
      const sx = (v3.x + 1) / 2 * W, sy = (1 - v3.y) / 2 * H;
      sensPx.x = sx; sensPx.y = sy; sensPx.ppu = s / worldPerPx();
      cm = Math.hypot(pointer.px - sx, pointer.py - sy) / (s / worldPerPx()) * 10;
    }
    // too close: back off and stay back while the target stays near (a little slack so it doesn't flicker)
    const near = tracking && cm < (avoiding ? TOO_CLOSE + 5 : TOO_CLOSE);
    if (near && !avoiding) avoidAt = now;
    avoiding = !inKit && (near || now - avoidAt < 1.1);
    retreat = lerp(retreat, avoiding && !reduced ? 1 : 0, Math.min(1, dt * (avoiding ? 5 : 2.2)));
    const back = retreat;
    const heroYaw = (tracking ? clamp(-0.38 + az * 0.3, -1.1, 0.7) : -0.38) - back * 0.45 * Math.sign(az || 1);
    const kitYaw = state.kitLive ? 0.65 - p * Math.PI * 2 : 0.5;   // one full turn, ending where it began
    const yawT = lerp(heroYaw, kitYaw, pose);
    const tiltT = lerp(0.2, phone ? 0.42 : 0.38, pose);
    const k = reduced ? 1 : Math.min(1, dt * 6);
    yaw = lerp(yaw, yawT, k); tilt = lerp(tilt, tiltT, k);
    body.rotation.set(tilt, yaw, 0);

    // the hop when tapped, and the wheels turning while it rises in or backs off
    const h = now - happy;
    const hop = h < 1.4 && !reduced ? Math.abs(Math.sin(h * Math.PI * 2.2)) * 0.18 * (1 - h / 1.4) : 0;
    body.position.y = hop + (reduced ? 0 : Math.sin(now * 2.2) * 0.008);
    floor.position.y = floorBlob.position.y = 0.003 - body.position.y;   // the floor stays put when it hops
    body.position.x = -Math.sin(yaw) * back * 0.6;
    body.position.z = -Math.cos(yaw) * back * 0.6;
    spin += (pose - posePrev) * 28 + (h < 1.4 ? dt * 14 : 0) - (retreat - retreatPrev) * 30;
    posePrev = pose; retreatPrev = retreat;
    wheels.forEach((w) => { w.rotation.x = spin; });

    robotRoot.updateMatrixWorld(true);
    // the head (servo + sensor): aims straight at the target, scans when there is none
    let hy = 0, hp = 0;
    if (!inKit) {
      if (tracking) {
        v3.copy(aimHit); neck.parent.worldToLocal(v3); v3.sub(neck.position);
        hy = clamp(Math.atan2(v3.x, v3.z), -1.45, 1.45);
        hp = clamp(-Math.atan2(v3.y - eyes.position.y, Math.hypot(v3.x, v3.z)), -0.6, 0.6);
      } else { hy = reduced ? 0.3 : Math.sin(now * 0.9) * 0.85; }
    }
    const kh = Math.min(1, dt * (tracking ? 12 : 4));
    headYaw = lerp(headYaw, hy, kh); headPitch = lerp(headPitch, hp, kh);
    neck.rotation.y = headYaw; eyes.rotation.x = headPitch;

    // pings leave both transducers while it has a target; the faces glow when it is locked on
    if (tracking && !reduced && now - lastPing > 0.34) {
      lastPing = now;
      [-0.13, 0.13].forEach((x) => { const pg = pings.find((q) => q.t < 0); if (pg) { pg.t = now; pg.x = x; } });
    }
    pings.forEach((pg) => {
      if (pg.t < 0) return;
      const life = (now - pg.t) / 0.9;
      if (life >= 1 || inKit) { pg.t = -1; pg.m.visible = false; return; }
      pg.m.visible = true;
      pg.m.position.set(pg.x, 0, 0.14 + life * 1.9);
      pg.m.scale.setScalar(1 + life * 4.5);
      pg.m.material.opacity = (1 - life) * 0.65;
      pg.m.material.color.setHex(avoiding ? 0xe0453a : 0x071423);
    });
    glow = lerp(glow, tracking ? (avoiding ? 2.4 : 1.1) : 0.12, Math.min(1, dt * 6));
    pupilMat.emissiveIntensity = glow;
    pupilMat.emissive.setHex(avoiding ? 0xff6a5a : 0x5fffd7);

    // the robot's own screen, ten times a second
    if (now - hudAt > 0.1) {
      hudAt = now;
      lcdShow(inKit ? 'kit' : !tracking ? 'scan' : cm > 400 ? 'far' : avoiding ? 'near' : 'dist', Math.round(cm), now);
    }

    // parts move out along their own directions; the active chapter lifts a little more
    const active = state.part;
    const order = ['board', 'sensor', 'servo', 'motors', 'power'];
    Object.entries(parts).forEach(([name, pt]) => {
      const chapter = name === 'driver' || name === 'motorL' || name === 'motorR' ? 'motors'
        : name === 'battery' || name === 'chassis' || name === 'caster' ? 'power' : name;
      const lift = active >= 0 && order[active] === chapter ? 0.22 : 0;
      tmp.copy(pt.out).multiplyScalar(explodeNow * (1 + lift));
      pt.g.position.copy(pt.home).add(tmp);
    });
    const wo = clamp(1 - explodeNow * 3);
    wireMats.forEach((m) => { m.opacity = wo; });
    wires.visible = wo > 0.01;
    floorBlob.material.opacity = clamp(1 - explodeNow * 1.4);
    floor.material.opacity = 0.3 * clamp(1 - explodeNow * 1.4);

    // five seat lights fill one by one, then hold, then empty
    const cyc = reduced ? 5 : (now * 1.4) % 8;
    leds.forEach((l, i) => {
      const on = h < 1.4 || avoiding ? (Math.floor(now * 12) + i) % 2 === 0 : cyc > i + 0.5;
      l.material.emissiveIntensity = on ? 2.4 : 0.05;
    });

    if (++frameNo % (phone ? 3 : 2) === 0) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  }

  html.classList.add('has-3d');
  renderer.shadowMap.needsUpdate = true;
  frame();                                   // the first frame now, shaders and all, while the boot screen is still up

  // still frames for the no-WebGL fallback images (used once by the build, harmless otherwise)
  window.__shezStill = (mode) => {
    frozen = true;
    const size = [900, 700];
    renderer.setPixelRatio(1); renderer.setSize(size[0], size[1], false);
    camera.aspect = size[0] / size[1]; camera.updateProjectionMatrix();
    robotRoot.position.set(0, mode === 'parts' ? -2.0 : -2.35, 0); robotRoot.scale.setScalar(mode === 'parts' ? 1.5 : 2.2);
    body.rotation.set(mode === 'parts' ? 0.38 : 0.2, mode === 'parts' ? 0.5 : -0.5, 0);
    const e = mode === 'parts' ? 1 : 0;
    Object.values(parts).forEach((pt) => pt.g.position.copy(pt.home).addScaledVector(pt.out, e));
    wires.visible = !e; floorBlob.visible = floor.visible = !e;
    lcdShow('kit', 0, 0);
    robotRoot.updateMatrixWorld(true); aimKey(robotRoot.scale.x);
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    return canvas.toDataURL('image/png');
  };
}

robot().catch((err) => { console.warn('3D robot unavailable:', err); html.classList.remove('has-3d'); })
  .finally(() => { window.__shez3d = true; document.dispatchEvent(new Event('shez:3d')); });   // the boot screen waits for this

/* ===== 09 · THE DEMO PASS: the ticket beside the booking form prints itself as it is filled ===== */
(() => {
  const pass = document.querySelector('[data-pass]');
  const form = document.getElementById('demoForm');
  if (!pass || !form) return;
  const slots = [...pass.querySelectorAll('[data-fill]')];
  const valueOf = (name) => {
    const els = [...form.elements].filter((el) => el.name === name);
    if (!els.length) return '';
    if (els[0].type === 'radio') { const on = els.find((el) => el.checked); return on ? on.value : ''; }
    return els[0].value.trim();
  };
  const paint = () => slots.forEach((dd) => {
    const v = valueOf(dd.dataset.fill);
    dd.textContent = v || dd.dataset.empty;
    dd.classList.toggle('is-empty', !v);
  });
  form.addEventListener('input', paint);
  form.addEventListener('change', paint);
  form.addEventListener('reset', () => setTimeout(paint, 0));
  paint();
})();

/* ===== 10 · FORMAT BUTTONS: choosing a format fills it in on the proposal form ===== */
(() => {
  const buttons = document.querySelectorAll('[data-format]');
  if (!buttons.length) return;
  buttons.forEach((b) => b.addEventListener('click', () => {
    const radio = document.querySelector(`input[name="format"][value="${b.dataset.format}"]`);
    const target = document.getElementById('proposal');
    if (radio) radio.checked = true;
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    const first = target.querySelector('input:not([type=hidden]):not(.hp)');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 800);
  }));
})();

/* ===== 11 · SAME TOOL, DIFFERENT INSTRUCTION: the chat window switches between the two ===== */
(() => {
  const root = document.querySelector('[data-chat]');
  if (!root) return;
  const take = {
    built: { ask: 'You are a sales coordinator at an industrial supplier. Our shipment to a regular customer is delayed by four days due to a transport issue. Draft a short, formal email that apologises, gives the revised date, and offers to call. Under 120 words.',
      reply: "Dear Mr Rao, your shipment is delayed by four days because of a transport issue on our side, and I'm sorry for the trouble. The revised delivery date is Thursday. I'm happy to call at a time that suits you.",
      verdict: 'Usable on the first attempt.', bad: false },
    vague: { ask: 'Write an email to the customer about the delay.',
      reply: 'Dear Customer, we regret to inform you that there has been a delay. We apologise for any inconvenience caused and appreciate your patience and understanding in this matter.',
      verdict: 'Generic. Wrong tone. You rewrite most of it.', bad: true },
  };
  const tabs = [...root.querySelectorAll('[data-team]')];
  const ask = root.querySelector('[data-chat-ask]');
  const reply = root.querySelector('[data-chat-reply]');
  const ai = root.querySelector('.msg-ai');
  const show = (key) => {
    const t = take[key];
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.team === key)));
    ask.textContent = t.ask;
    reply.innerHTML = `<p style="--k:0"></p><p class="chat-verdict${t.bad ? ' is-bad' : ''}" style="--k:1"></p>`;
    reply.children[0].textContent = t.reply;
    reply.children[1].textContent = t.verdict;
    ai.classList.add('is-typing');
    requestAnimationFrame(() => requestAnimationFrame(() => ai.classList.remove('is-typing')));
  };
  tabs.forEach((b) => b.addEventListener('click', () => show(b.dataset.team)));
  root.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); show(n.dataset.team);
  });
})();

/* ===== 12 · CLASS CLIPS: they play only while on screen, and stay still for reduced motion ===== */
(() => {
  const clips = document.querySelectorAll('video[data-loop]');
  if (!clips.length || reduced) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: 0.25 });
  clips.forEach((v) => io.observe(v));
})();

/* ===== 13 · THE REEL: zoom through the headline into the footage; scroll fast and it fast-forwards ===== */
(() => {
  const reel = document.querySelector('[data-reel]');
  if (!reel) return;
  const clips = [...reel.querySelectorAll('.reel-clip')];
  const mask = reel.querySelector('.reel-mask'), title = reel.querySelector('.reel-title'), stem = reel.querySelector('[data-zoom]');
  const hud = reel.querySelector('.reel-hud'), time = reel.querySelector('[data-reel-time]'), cap = reel.querySelector('[data-reel-cap]');
  const count = reel.querySelector('[data-reel-count]'), ff = reel.querySelector('[data-reel-ff]');
  if (reduced) {
    reel.classList.add('is-still');
    clips.forEach((v, i) => { v.controls = true; v.preload = i ? 'none' : 'metadata'; });   // only the first one shows
    return;
  }
  const two = (n) => String(n).padStart(2, '0');
  // zoom about the middle of the I, so its stroke becomes the whole screen
  const aim = () => {
    title.style.transform = 'none';
    const t = title.getBoundingClientRect(), z = stem.getBoundingClientRect();
    title.style.setProperty('--ox', `${(z.left + z.width / 2 - t.left).toFixed(1)}px`);
    title.style.setProperty('--oy', `${(z.top + z.height / 2 - t.top).toFixed(1)}px`);
  };
  aim();
  addEventListener('resize', aim);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(aim);

  let active = 0, lastY = scrollY, rate = 1, seen = false;
  const show = (i) => {
    if (i === active) return;
    clips[active].pause(); clips[active].classList.remove('is-on');
    active = i;
    const v = clips[i]; v.classList.add('is-on'); v.play().catch(() => {});
    reel.classList.remove('is-cut'); void reel.offsetWidth; reel.classList.add('is-cut');
    cap.textContent = v.dataset.caption || '';
    count.textContent = `${two(i + 1)} / ${two(clips.length)}`;
  };
  count.textContent = `01 / ${two(clips.length)}`;
  // the loop only runs while the section is on screen (an observer starts and stops it)
  let running = false, ffShown = '', timeShown = '';
  const tick = () => {
    if (!running) return;
    requestAnimationFrame(tick);
    const r = reel.getBoundingClientRect();
    if (!seen) { seen = true; clips[active].play().catch(() => {}); }
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const z = smooth(0.02, 0.42, p);
    title.style.transform = `scale(${(1 + 34 * z * z * z).toFixed(3)})`;
    mask.style.opacity = (1 - smooth(0.3, 0.44, p)).toFixed(3);
    mask.style.visibility = p > 0.45 ? 'hidden' : '';
    hud.style.opacity = smooth(0.4, 0.5, p).toFixed(3);
    // after the reveal, the rest of the section is shared between the clips
    show(Math.min(clips.length - 1, Math.floor(clamp((p - 0.45) / 0.55) * clips.length)));
    // scrolling fast plays it faster, up to three and a half times
    const speed = Math.abs(scrollY - lastY); lastY = scrollY;
    const want = p > 0.42 ? 1 + Math.min(2.5, speed / 22) : 1;
    rate += (want - rate) * (want > rate ? 0.25 : 0.06);
    const v = clips[active];
    if (Math.abs(v.playbackRate - rate) > 0.05) v.playbackRate = rate;
    const f = rate > 1.2 ? `>> ${rate.toFixed(1)}x` : '';
    if (f !== ffShown) { ff.textContent = f; ffShown = f; }
    const s = v.currentTime || 0;
    const tc = `${two(Math.floor(s / 60))}:${two(Math.floor(s) % 60)}:${two(Math.floor((s % 1) * 30))}`;
    if (tc !== timeShown) { time.textContent = tc; timeShown = tc; }
  };
  new IntersectionObserver((es) => {
    const on = es[es.length - 1].isIntersecting;
    if (on && !running) { running = true; lastY = scrollY; requestAnimationFrame(tick); }
    else if (!on && running) { running = false; seen = false; clips[active].pause(); }
  }).observe(reel);
})();
