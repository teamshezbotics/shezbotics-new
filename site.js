/* ==========================================================================
   SHEZBOTICS · site.js  (every page, loaded as a module after script.js)
   01 smooth scroll · 02 bar ink by chapter · 03 entrances · 04 rolling figures
   05 course tally · 06 sideways journey · 07 kit stage · 08 the 3D robot
   09 the demo pass. Each part does nothing on a page without its elements.
   script.js still runs the menu, modal, enrol links, forms, toast and gallery.
   ========================================================================== */

const html = document.documentElement;
const mq = (q) => window.matchMedia(q);
const reduced = mq('(prefers-reduced-motion: reduce)').matches;
const finePointer = mq('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* shared state the robot reads */
const state = { kitP: 0, kitLive: false, part: -1 };

/* ===== 01 · SMOOTH SCROLL (wheel only; touch and reduced motion keep native) ===== */
let lenis = null;
if (window.Lenis && !reduced && finePointer) {
  lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -64 } });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  html.classList.add('is-smooth');
}

/* ===== 02 · BAR INK BY CHAPTER ===== */
(() => {
  const bar = document.querySelector('[data-bar]');
  if (!bar) return;
  const toned = [...document.querySelectorAll('main [data-tone], footer[data-tone]')];
  let queued = false;
  const paint = () => {
    queued = false;
    const y = 40;
    for (const el of toned) {
      const r = el.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        const tone = el.dataset.tone;
        if (bar.dataset.tone !== tone) bar.dataset.tone = tone;
        break;
      }
    }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', paint);
  paint();

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
    if (lenis) open ? lenis.stop() : lenis.start();
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
    '.contact-title, .row, .contact-copy, #contactForm',
    '.footer-cols > *, .footer-last',
    '.facts-row li',
    '.book-head > *, .pass, .book-form',
    '.next h2, .poster-list li',
    '.meet-pics, .meet-copy > *',
    '.faq h2, .faq-item',
    '.sub-head > *, .mosaic > *, .format, .formats-note',
    '.report-copy > *, .card-slip',
    '.proposal-copy > *, .proposal-form',
    '.toolkit-note, .duo, .stage-photo',
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
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } };
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
    if (lenis) lenis.scrollTo(contact, { offset: -64 });
    else contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
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
  let queued = false;
  const place = () => {
    queued = false;
    panels.forEach((p, i) => {
      const next = panels[i + 1];
      const top = next ? next.getBoundingClientRect().top : Infinity;
      p.querySelectorAll('.panel-row').forEach((el) => {
        // gone by the moment the next panel's edge reaches the bottom of this row
        const o = clamp((top - el.getBoundingClientRect().bottom) / (innerHeight * 0.2));
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.02 ? 'hidden' : '';
      });
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

  const phone = mq('(max-width: 767px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  scene.add(new THREE.HemisphereLight(0xeaf6fb, 0x0d2238, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-4, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x5fffd7, 1.4); rim.position.set(5, 3, -5); scene.add(rim);

  /* ---------- materials ---------- */
  const M = {
    acrylic: new THREE.MeshPhysicalMaterial({ color: 0x07090c, roughness: 0.55, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.18 }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xffc400, roughness: 0.45 }),
    tyre: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x00878f, roughness: 0.5, metalness: 0.1 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x1f5fbf, roughness: 0.45, metalness: 0.1 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.5 }),
    black: new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.55 }),
    chip: new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.35, metalness: 0.2 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xcfd5dc, roughness: 0.28, metalness: 0.95 }),
    mesh: new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.95, metalness: 0.3 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.9 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.6 }),
    servo: new THREE.MeshPhysicalMaterial({ color: 0x2b6fd6, roughness: 0.35, transmission: 0, clearcoat: 0.6 }),
    cell: new THREE.MeshStandardMaterial({ color: 0x2f80ed, roughness: 0.35, metalness: 0.3 }),
  };
  const led = (on) => new THREE.MeshStandardMaterial({ color: 0x0a3d33, emissive: 0x5fffd7, emissiveIntensity: on ? 2.2 : 0, roughness: 0.3 });

  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m;
  };
  const box = (w, h, d, mat, x, y, z, parent, r = 0) =>
    mesh(r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const cyl = (rt, rb, h, mat, x, y, z, parent, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, parent);

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

  // chassis plate + caster
  const chassis = part('chassis', [0, -0.35, 0]);
  box(1.72, 0.06, 2.3, M.acrylic, 0, 0.66, 0, chassis, 0.03);
  [[-0.7, 0.95], [0.7, 0.95], [-0.7, -1.0], [0.7, -1.0]].forEach(([x, z]) => cyl(0.03, 0.03, 0.02, M.silver, x, 0.7, z, chassis, 12));
  const caster = part('caster', [0, -0.7, 0.3]);
  cyl(0.06, 0.06, 0.28, M.silver, 0, 0.5, 0.86, caster, 16);
  mesh(new THREE.SphereGeometry(0.12, 24, 16), M.silver, 0, 0.12 + 0.12, 0.86, caster);

  // motors and wheels, one set per side
  const motorL = part('motorL', [-0.75, -0.2, 0]);
  const motorR = part('motorR', [0.75, -0.2, 0]);
  const wheels = [];
  [[motorL, -1], [motorR, 1]].forEach(([g, s]) => {
    box(0.6, 0.24, 0.34, M.yellow, s * 0.52, 0.44, -0.32, g, 0.04);
    cyl(0.11, 0.11, 0.3, M.silver, s * 0.08, 0.44, -0.32, g).rotation.z = Math.PI / 2;
    cyl(0.025, 0.025, 0.2, M.white, s * 0.88, 0.44, -0.32, g, 12).rotation.z = Math.PI / 2;
    const w = new THREE.Group(); w.position.set(s * 1.02, 0.44, -0.32); g.add(w);
    const tyre = mesh(new THREE.TorusGeometry(0.34, 0.1, 18, 40), M.tyre, 0, 0, 0, w); tyre.rotation.y = Math.PI / 2;
    const rimDisc = cyl(0.3, 0.3, 0.16, M.yellow, 0, 0, 0, w, 32); rimDisc.rotation.z = Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      const sp = box(0.06, 0.5, 0.04, M.yellow, s * 0.09, 0, 0, w);
      sp.rotation.x = (i / 5) * Math.PI;
    }
    cyl(0.07, 0.07, 0.2, M.white, 0, 0, 0, w, 16).rotation.z = Math.PI / 2;
    wheels.push(w);
  });

  // motor driver board with heatsink (the "motors" chapter)
  const driver = part('driver', [0, 0.85, -0.25]);
  box(0.46, 0.03, 0.46, M.red, 0, 0.72, -0.3, driver);
  const sink = new THREE.Group(); sink.position.set(0, 0.8, -0.32); driver.add(sink);
  for (let i = 0; i < 7; i++) box(0.024, 0.16, 0.26, M.black, -0.15 + i * 0.05, 0.04, 0, sink);
  box(0.36, 0.04, 0.28, M.black, 0, -0.03, 0, sink);
  [[-0.17, 0.12], [-0.06, 0.12], [0.06, 0.12], [0.17, 0.12]].forEach(([x, z]) => box(0.08, 0.08, 0.08, M.blue, x, 0.775, -0.3 + z, driver));

  // battery holder with two cells
  const battery = part('battery', [0, 0.95, -0.7]);
  box(0.84, 0.16, 0.44, M.black, 0, 0.77, -0.86, battery, 0.03);
  [-0.1, 0.1].forEach((z) => {
    cyl(0.09, 0.09, 0.66, M.cell, 0, 0.88, -0.86 + z, battery).rotation.z = Math.PI / 2;
    cyl(0.05, 0.05, 0.02, M.silver, 0.34, 0.88, -0.86 + z, battery, 16).rotation.z = Math.PI / 2;
  });
  box(0.06, 0.08, 0.08, M.red, -0.46, 0.76, -0.7, battery);

  // Arduino Uno on brass standoffs, with five seat lights
  const board = part('board', [0, 1.25, 0.15]);
  const pcbY = 0.84;
  box(0.7, 0.035, 0.54, M.teal, 0, pcbY, 0.3, board);
  [[-0.31, 0.07], [0.31, 0.07], [-0.31, 0.53], [0.31, 0.53]].forEach(([x, z]) => cyl(0.02, 0.02, 0.14, M.brass, x, pcbY - 0.09, z, board, 10));
  box(0.36, 0.05, 0.1, M.chip, 0.06, pcbY + 0.04, 0.36, board);
  box(0.16, 0.12, 0.2, M.silver, -0.28, pcbY + 0.08, 0.12, board);
  box(0.12, 0.11, 0.16, M.black, -0.3, pcbY + 0.07, 0.44, board);
  box(0.5, 0.07, 0.04, M.black, 0.06, pcbY + 0.05, 0.06, board);
  box(0.42, 0.07, 0.04, M.black, 0.1, pcbY + 0.05, 0.55, board);
  box(0.06, 0.04, 0.06, M.silver, 0.25, pcbY + 0.035, 0.2, board);
  const leds = [];
  for (let i = 0; i < 5; i++) {
    const l = mesh(new THREE.BoxGeometry(0.035, 0.03, 0.025), led(true), -0.1 + i * 0.05, pcbY + 0.03, 0.2, board);
    leds.push(l);
  }

  // servo (the neck) and the ultrasonic sensor (the eyes), facing +z
  const servo = part('servo', [0, 0.55, 0.85]);
  box(0.23, 0.22, 0.13, M.servo, 0, 0.8, 0.98, servo, 0.015);
  box(0.33, 0.02, 0.13, M.servo, 0, 0.86, 0.98, servo);
  cyl(0.035, 0.035, 0.05, M.white, 0.05, 0.935, 0.98, servo, 16);

  const head = part('sensor', [0, 1.1, 1.05]);
  const neck = new THREE.Group(); neck.position.set(0.05, 0.97, 0.98); head.add(neck);
  box(0.22, 0.02, 0.06, M.white, 0, 0, 0, neck);
  box(0.05, 0.3, 0.04, M.black, 0, 0.15, 0, neck);
  const eyes = new THREE.Group(); eyes.position.set(0, 0.42, 0.02); eyes.scale.setScalar(1.45); neck.add(eyes);
  box(0.46, 0.21, 0.018, M.blue, 0, 0, 0, eyes);
  const pupils = [];
  [-0.13, 0.13].forEach((x) => {
    const t = cyl(0.083, 0.083, 0.13, M.silver, x, 0, 0.07, eyes, 40); t.rotation.x = Math.PI / 2;
    const face = cyl(0.07, 0.07, 0.01, M.mesh, x, 0, 0.137, eyes, 40); face.rotation.x = Math.PI / 2;
    pupils.push(face);
  });
  box(0.08, 0.035, 0.03, M.silver, 0, 0.065, 0.02, eyes);
  for (let i = 0; i < 4; i++) box(0.012, 0.06, 0.012, M.silver, -0.045 + i * 0.03, -0.13, 0, eyes);

  // wires (they belong to the assembled robot and fade as it comes apart)
  const wireMats = [0xd7263d, 0x111111, 0xffc400, 0x2bb673, 0x2f80ed, 0xff7a00, 0xf2f2f2].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, transparent: true, opacity: 1 }));
  const wires = new THREE.Group(); body.add(wires);
  const wire = (pts, mi) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 40, 0.014, 6, false), wireMats[mi], 0, 0, 0, wires);
  };
  wire([[0.02, 0.9, 0.55], [0.0, 1.02, 0.72], [-0.02, 1.0, 0.92], [-0.08, 1.1, 0.98]], 2);
  wire([[0.06, 0.9, 0.55], [0.06, 1.05, 0.75], [0.04, 1.06, 0.95], [-0.04, 1.12, 0.99]], 3);
  wire([[0.1, 0.9, 0.56], [0.14, 1.0, 0.78], [0.1, 0.98, 0.95], [0.02, 1.12, 0.99]], 4);
  wire([[0.14, 0.9, 0.56], [0.2, 0.98, 0.8], [0.14, 0.9, 0.98], [0.1, 0.85, 0.98]], 5);
  wire([[0.2, 0.9, 0.06], [0.24, 1.0, -0.06], [0.18, 0.86, -0.16], [0.12, 0.79, -0.2]], 0);
  wire([[0.26, 0.9, 0.06], [0.32, 0.98, -0.05], [0.24, 0.85, -0.2], [0.17, 0.79, -0.2]], 1);
  wire([[-0.1, 0.9, 0.06], [-0.2, 1.02, -0.1], [-0.32, 0.92, -0.5], [-0.46, 0.8, -0.7]], 0);
  wire([[-0.05, 0.9, 0.06], [-0.12, 0.98, -0.12], [-0.22, 0.9, -0.55], [-0.4, 0.84, -0.86]], 1);
  wire([[-0.18, 0.79, -0.3], [-0.45, 0.82, -0.36], [-0.62, 0.6, -0.34], [-0.5, 0.5, -0.32]], 0);
  wire([[0.18, 0.79, -0.3], [0.45, 0.82, -0.36], [0.62, 0.6, -0.34], [0.5, 0.5, -0.32]], 1);

  // the ground blob under the wheels (drawn, not a shadow map) taste-skill-ignore
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(4,11,20,0.55)'); g.addColorStop(1, 'rgba(4,11,20,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = mesh(new THREE.PlaneGeometry(3.4, 3.0), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), 0, 0.005, -0.05, body); // taste-skill-ignore: drawn ground blob
  shadow.rotation.x = -Math.PI / 2; // taste-skill-ignore: drawn ground blob

  // centre the model on its footprint: x/z centre, y = 0 at the ground
  body.children.forEach((c) => { if (c !== shadow) c.position.z += 0.0; }); // taste-skill-ignore: drawn ground blob
  Object.values(parts).forEach((p) => { p.home = p.g.position.clone(); });

  /* ---------- placement on the page ---------- */
  let W = innerWidth, H = innerHeight;
  const resize = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    canvas.style.height = H + 'px';
  };
  resize();
  addEventListener('resize', resize);
  const worldPerPx = () => (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / H;

  // where the robot stands inside a spot: x centre, ground at fy of its height; width it should fill
  const anchor = (el, fy, fill) => {
    const r = el.getBoundingClientRect();
    const k = worldPerPx();
    return {
      x: (r.left + r.width / 2 - W / 2) * k,
      y: -(r.top + r.height * fy - H / 2) * k,
      s: (r.width * fill * k) / 2.6,
      visible: r.bottom > -H * 0.5 && r.top < H * 1.5,
    };
  };

  /* ---------- input ---------- */
  const pointer = { x: 0, y: 0, moved: -10 };
  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / W) * 2 - 1;
    pointer.y = -(e.clientY / H) * 2 + 1;
    pointer.moved = performance.now() / 1000;
  }, { passive: true });

  const ray = new THREE.Raycaster();
  let happy = -10;
  addEventListener('pointerdown', (e) => {
    const v = new THREE.Vector2((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
    ray.setFromCamera(v, camera);
    if (ray.intersectObject(body, true).some((h) => h.object !== shadow)) happy = performance.now() / 1000; // taste-skill-ignore: drawn ground blob
  });

  /* ---------- the loop ---------- */
  let frozen = false;
  let last = performance.now() / 1000, spin = 0, yaw = -0.35, tilt = 0.12, headYaw = 0, headPitch = 0, travelPrev = 0, explodeNow = 0;
  const tmp = new THREE.Vector3();
  const lerp = THREE.MathUtils.lerp;

  function frame() {
    requestAnimationFrame(frame);
    if (frozen) return;
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, t - last); last = t;

    const heroR = hero.getBoundingClientRect();
    const kitR = kit ? kit.getBoundingClientRect() : { top: Infinity, bottom: -Infinity };
    const onScreen = heroR.bottom > 0 || (kitR.top < H && kitR.bottom > 0);
    canvas.style.visibility = onScreen ? 'visible' : 'hidden';
    // the layer covers only the hero and the kit stage, never the sections after them
    const lo = Math.min(H, Math.max(heroR.bottom, kitR.bottom));
    canvas.style.clipPath = `inset(0 0 ${Math.max(0, H - lo).toFixed(0)}px 0)`;
    if (!onScreen) return;

    // travel from the hero spot to the kit spot as the kit section comes up
    const travel = kit ? smooth(0, 1, 1 - kitR.top / H) : 0;
    const a = anchor(spotHero, 0.94, 0.92);
    const b = kit ? anchor(spotKit, state.kitLive ? 0.74 : 0.8, phone ? 0.86 : 0.8) : a;
    robotRoot.position.set(lerp(a.x, b.x, travel), lerp(a.y, b.y, travel), 0);

    // explode with the kit stage
    const p = state.kitLive ? state.kitP : 0.5;
    const explode = travel < 0.999 ? 0 : (state.kitLive ? smooth(0.06, 0.2, p) * (1 - smooth(0.84, 0.97, p)) : 0.85);
    explodeNow = lerp(explodeNow, explode, reduced ? 1 : Math.min(1, dt * 8));
    const s = lerp(a.s, b.s, travel) / (1 + explodeNow * 0.3);
    robotRoot.scale.setScalar(s);

    // body pose: facing the headline in the hero, turning slowly through the kit stage
    const now = t;
    const idle = now - pointer.moved > 2.5 || !finePointer;
    const relX = clamp(pointer.x - (robotRoot.position.x / (W * worldPerPx() / 2)), -1.5, 1.5);
    const heroYaw = -0.38 + (idle ? 0 : relX * 0.22);
    const kitYaw = state.kitLive ? 0.65 - p * Math.PI * 2 : 0.5;   // one full turn, ending where it began
    const yawT = lerp(heroYaw, kitYaw, travel);
    const tiltT = lerp(0.12, phone ? 0.42 : 0.38, travel);
    const k = reduced ? 1 : Math.min(1, dt * 6);
    yaw = lerp(yaw, yawT, k); tilt = lerp(tilt, tiltT, k);
    body.rotation.set(tilt, yaw, 0);

    // the hop when tapped, and the wheels turning while it travels
    const h = now - happy;
    const hop = h < 1.4 && !reduced ? Math.abs(Math.sin(h * Math.PI * 2.2)) * 0.18 * (1 - h / 1.4) : 0;
    body.position.y = hop + (reduced ? 0 : Math.sin(now * 2.2) * 0.008);
    spin += (travel - travelPrev) * 28 + (h < 1.4 ? dt * 14 : 0);
    travelPrev = travel;
    wheels.forEach((w, i) => { w.rotation.x = spin * (i ? 1 : 1); });

    // the head (servo + sensor): follows the pointer, scans when idle
    let hy, hp;
    if (travel < 0.5) {
      if (idle) { hy = reduced ? 0.3 : Math.sin(now * 0.9) * 0.85; hp = 0; }
      else { hy = clamp(relX * 1.1 + 0.5, -1.2, 1.2); hp = clamp(-pointer.y * 0.3, -0.25, 0.3); }
    } else { hy = 0; hp = 0; }
    headYaw = lerp(headYaw, hy, Math.min(1, dt * 7)); headPitch = lerp(headPitch, hp, Math.min(1, dt * 7));
    neck.rotation.y = headYaw; eyes.rotation.x = headPitch;

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
    shadow.material.opacity = clamp(1 - explodeNow * 1.4); // taste-skill-ignore: drawn ground blob

    // five seat lights fill one by one, then hold, then empty
    const cyc = reduced ? 5 : (now * 1.4) % 8;
    leds.forEach((l, i) => {
      const on = h < 1.4 ? (Math.floor(now * 12) + i) % 2 === 0 : cyc > i + 0.5;
      l.material.emissiveIntensity = on ? 2.4 : 0.05;
    });

    renderer.render(scene, camera);
  }

  html.classList.add('has-3d');
  requestAnimationFrame(frame);

  // still frames for the no-WebGL fallback images (used once by the build, harmless otherwise)
  window.__shezStill = (mode) => {
    frozen = true;
    const size = [900, 700];
    renderer.setPixelRatio(1); renderer.setSize(size[0], size[1], false);
    camera.aspect = size[0] / size[1]; camera.updateProjectionMatrix();
    robotRoot.position.set(0, mode === 'parts' ? -2.0 : -2.55, 0); robotRoot.scale.setScalar(mode === 'parts' ? 1.5 : 2.2);
    body.rotation.set(mode === 'parts' ? 0.38 : 0.2, mode === 'parts' ? 0.5 : -0.5, 0);
    const e = mode === 'parts' ? 1 : 0;
    Object.values(parts).forEach((pt) => pt.g.position.copy(pt.home).addScaledVector(pt.out, e));
    wires.visible = !e; shadow.visible = !e; // taste-skill-ignore: drawn ground blob
    renderer.render(scene, camera);
    return canvas.toDataURL('image/png');
  };
}

robot().catch((err) => { console.warn('3D robot unavailable:', err); html.classList.remove('has-3d'); });

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
    if (lenis) lenis.scrollTo(target, { offset: -64 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    const first = target.querySelector('input:not([type=hidden]):not(.hp)');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 800);
  }));
})();

/* ===== 11 · TEAM TASKS: the chat window shows the kind of task each team brings ===== */
(() => {
  const root = document.querySelector('[data-chat]');
  if (!root) return;
  const tasks = {
    ops: { ask: "Here are this week's 38 customer emails. Group them by problem, count each group, and draft one reply per group in our tone.",
      rows: [['Late delivery', 14], ['Billing questions', 11], ['Login trouble', 8], ['Feature requests', 5]],
      end: 'Four draft replies follow, one per group, ready to edit.' },
    hr: { ask: "Here's our job description for a sales executive and 12 CVs. Shortlist the closest matches, say why in one line each, and suggest three interview questions per person.",
      rows: [['Shortlisted', 5], ['Worth a call first', 4], ['Not a match', 3]],
      end: 'Fifteen interview questions follow, three for each shortlisted candidate.' },
    fin: { ask: "Here are last month's 64 vendor invoices as a spreadsheet. Flag possible duplicates, anything over budget, and anything missing a GST number.",
      rows: [['Possible duplicates', 3], ['Over budget', 6], ['Missing GST number', 2], ['Clean', 53]],
      end: 'The eleven flagged invoices follow, each with its reason.' },
  };
  const tabs = [...root.querySelectorAll('[data-team]')];
  const ask = root.querySelector('[data-chat-ask]');
  const reply = root.querySelector('[data-chat-reply]');
  const ai = root.querySelector('.msg-ai');
  const show = (key) => {
    const t = tasks[key];
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.team === key)));
    ask.textContent = t.ask;
    reply.innerHTML = '<ul class="chat-list">' + t.rows.map(([k, v], i) => `<li style="--k:${i}"><span>${k}</span><span>${v}</span></li>`).join('') +
      `</ul><p style="--k:${t.rows.length}">${t.end}</p>`;
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
