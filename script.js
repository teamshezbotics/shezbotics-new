/* ==========================================================================
   SHEZBOTICS — script.js
   Shared by index · demo · schools · corporate · privacy
   Everything guards for missing elements so one file serves every page.
   ========================================================================== */

/* ===== 01 · LOADER HANDOFF ===== */
(function () {
  var pre = document.getElementById('preloader');
  if (!pre) { document.body.classList.add('is-ready'); return; }

  var MIN = 1500, t0 = Date.now(), done = false;

  function release() {
    if (done) return;
    done = true;
    pre.classList.add('is-done');
    document.body.classList.add('is-ready');
    setTimeout(function () { pre.remove(); }, 600);
  }

  window.addEventListener('load', function () {
    setTimeout(release, Math.max(0, MIN - (Date.now() - t0)));
  });
  setTimeout(release, 3000);          // ceiling on a slow connection
})();

/* ===== 02 · HEADER STATE + SCROLL PROGRESS ===== */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
  document.body.prepend(probe);
  new IntersectionObserver(function (e) {
    header.classList.toggle('is-stuck', !e[0].isIntersecting);
  }).observe(probe);

  var bar = header.querySelector('.progress');
  if (!bar) return;
  var ticking = false;

  function draw() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(draw); }
  }, { passive: true });
})();

/* ===== 03 · MOBILE NAV ===== */
(function () {
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (!burger || !links) return;

  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    document.body.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && links.classList.contains('is-open')) burger.click();
  });
})();

/* ===== 04 · SCROLL REVEALS (observer, not a scroll listener) ===== */
(function () {
  var items = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);       // reveal once, then stop watching
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

  items.forEach(function (el) { io.observe(el); });
})();

/* ===== 05 · COUNTERS ===== */
(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(el) {
    var target = +el.dataset.count;
    var suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }

    var start = performance.now(), dur = 1400;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { io.observe(el); });
})();

/* ===== 06 · PROJECT MODAL ===== */
(function () {
  var modal = document.getElementById('projectModal');
  if (!modal) return;

  var img = document.getElementById('pmImage');
  var title = document.getElementById('pmTitle');
  var desc = document.getElementById('pmDesc');
  var list = document.getElementById('pmList');
  var closeBtn = modal.querySelector('.modal-close');
  var lastFocus = null;

  var projects = {
    aiProject: {
      image: 'assets/project1.png', title: 'AI Robot',
      desc: 'Build a robot that senses its surroundings and reacts — the project most students start with.',
      learn: ['Arduino programming', 'Ultrasonic sensors', 'Servo motors', 'Obstacle avoidance', 'Serial debugging']
    },
    homeProject: {
      image: 'assets/project2.png', title: 'Smart Home',
      desc: 'Wire up lights and appliances you can switch from a phone, using ESP32 over your home WiFi.',
      learn: ['Relay modules', 'ESP32 setup', 'WiFi control', 'Mobile app control', 'Safe low-voltage wiring']
    },
    droneProject: {
      image: 'assets/project3.png', title: 'Drone Technology',
      desc: 'Understand what makes a drone fly, then assemble and tune one from parts.',
      learn: ['Frame and motors', 'Flight controller', 'ESCs', 'Battery and power budget', 'Assembly and balance']
    },
    iotProject: {
      image: 'assets/project4.png', title: 'IoT Systems',
      desc: 'Put a sensor on the internet and read it from anywhere — the foundation of every connected product.',
      learn: ['ESP32', 'WiFi and MQTT', 'Cloud dashboards', 'Sensor calibration', 'Real-time control']
    }
  };

  function open(key) {
    var d = projects[key];
    if (!d) return;
    lastFocus = document.activeElement;
    img.src = d.image;
    img.alt = d.title;
    title.textContent = d.title;
    desc.textContent = d.desc;
    list.innerHTML = d.learn.map(function (i) { return '<li>' + i + '</li>'; }).join('');
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-project]').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.dataset.project); });
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  var enrol = document.getElementById('pmEnrol');
  if (enrol) {
    enrol.addEventListener('click', function (e) {
      e.preventDefault();
      close();
      var sel = document.getElementById('selectedCourse');
      if (sel) sel.value = title.textContent;
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();

/* ===== 07 · ENROL BUTTONS → CONTACT FORM ===== */
(function () {
  var sel = document.getElementById('selectedCourse');
  var contact = document.getElementById('contact');
  if (!sel || !contact) return;

  document.querySelectorAll('[data-enrol]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      sel.value = btn.dataset.enrol;
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { sel.focus({ preventScroll: true }); }, 600);
    });
  });
})();

/* ===== 08 · TOAST ===== */
function shezToast(heading, detail, action) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.querySelector('b').textContent = heading;
  t.querySelector('span').textContent = detail;
  var box = t.querySelector('b').parentNode;
  var link = t.querySelector('.toast-act');
  if (action) {
    if (!link) {
      link = document.createElement('a');
      link.className = 'toast-act';
      link.target = '_blank';
      link.rel = 'noopener';
      box.appendChild(link);
    }
    link.href = action.href;
    link.textContent = action.label;
    link.hidden = false;
  } else if (link) {
    link.hidden = true;
  }
  t.classList.add('is-shown');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('is-shown'); }, action ? 15000 : 4500);
}

/* ===== 09 · SUBMISSIONS → GOOGLE SHEET + ALERT MAIL =====
   Primary : Apps Script web app. Writes a row to the Sheet AND emails you.
   Fallback: FormSubmit, so mail still arrives if the script is unreachable.
             FormSubmit delivers nothing until its one-time "Activate Form" email,
             sent to SHEZ_FALLBACK on the first submission, has been clicked.
   Last resort: the visitor is offered WhatsApp with their details filled in,
             so an enquiry is never silently lost.
   Paste your deployed /exec URL into SHEZ_ENDPOINT below (see SETUP.md). */

var SHEZ_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE';
var SHEZ_FALLBACK = 'team.shezbotics@gmail.com';
var SHEZ_WHATSAPP = '919545797867';

function shezCollect(form) {
  var data = {};
  new FormData(form).forEach(function (value, key) {
    if (key === '_honey') return;
    if (key in data) {                          // checkbox groups
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });
  Object.keys(data).forEach(function (k) {
    if (Array.isArray(data[k])) data[k] = data[k].join(', ');
  });
  data._form = form.dataset.sheet || 'Other';
  data._page = location.pathname.split('/').pop() || 'index.html';
  data._submitted = new Date().toISOString();
  return data;
}

function shezHasScript() {
  return /^https:\/\/script\.google(usercontent)?\.com\//.test(SHEZ_ENDPOINT);
}

function shezSend(data) {
  // text/plain keeps this a "simple request" — no CORS preflight to Apps Script
  var toScript = shezHasScript()
    ? fetch(SHEZ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('script ' + r.status);
        return r.json();
      }).then(function (res) {
        if (!res || res.ok !== true) throw new Error('script said ' + JSON.stringify(res));
        return res;
      })
    : Promise.reject(new Error('SHEZ_ENDPOINT not set'));

  return toScript.catch(function (err) {
    if (window.console) console.warn('Sheet route failed, trying email:', err.message);
    var mail = {};
    Object.keys(data).forEach(function (k) { if (k.charAt(0) !== '_') mail[k] = data[k]; });
    mail._subject = data._subject || ('ShezBotics website: ' + data._form);
    mail._template = 'table';
    mail.form = data._form;
    mail.page = data._page;
    return fetch('https://formsubmit.co/ajax/' + SHEZ_FALLBACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(mail)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (res) {
        // FormSubmit answers 200 even when it did not deliver (e.g. not yet activated)
        if (!r.ok || String(res.success) !== 'true') throw new Error('formsubmit: ' + (res.message || r.status));
        return res;
      });
    });
  });
}

function shezWhatsAppText(data) {
  var lines = ['Hi ShezBotics, I tried to send this from your website (' + data._form + ' form):'];
  Object.keys(data).forEach(function (k) {
    if (k.charAt(0) === '_' || !String(data[k]).trim()) return;
    lines.push(k.replace(/_/g, ' ') + ': ' + data[k]);
  });
  return 'https://wa.me/' + SHEZ_WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
}

(function () {
  var forms = document.querySelectorAll('form[data-sheet]');
  if (!forms.length) return;

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var hp = form.querySelector('.hp');
      if (hp && hp.value) return;                       // bot
      if (!form.reportValidity()) return;

      // the button actually pressed (multi-step forms carry one per step)
      var btn = e.submitter || [].slice.call(form.querySelectorAll('button[type="submit"]')).filter(function (b) {
        return b.offsetParent !== null;
      })[0];
      if (btn && btn.disabled) return;
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      var data = shezCollect(form);
      shezSend(data)
        .then(function () {
          form.reset();
          if (form.hasAttribute('data-reset-steps') && window.shezResetSteps) window.shezResetSteps();
          shezToast(
            form.dataset.successTitle || 'Enquiry received',
            form.dataset.successBody || 'We usually reply within one working day.'
          );
        })
        .catch(function (err) {
          if (window.console) console.error('Enquiry not delivered:', err.message);
          shezToast('Could not send that',
            'Nothing was lost. Send the same details to us on WhatsApp, or call +91 95457 97867.',
            { href: shezWhatsAppText(data), label: 'Send on WhatsApp' });
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  });
})();

/* ===== 09b · MULTI-STEP FORM (demo.html) =====
   Every step carries its own Back / Continue / submit row, so each button is wired. */
(function () {
  var form = document.querySelector('[data-steps]');
  if (!form) return;

  var steps = [].slice.call(form.querySelectorAll('.step'));
  var dots = [].slice.call(document.querySelectorAll('.stepper li'));
  var i = 0;

  function paint() {
    steps.forEach(function (s, n) {
      s.hidden = n !== i;
      var back = s.querySelector('[data-back]');
      var next = s.querySelector('[data-next]');
      var submit = s.querySelector('button[type="submit"]');
      var count = s.querySelector('.step-count');
      if (back) back.hidden = n === 0;
      if (next) next.hidden = n === steps.length - 1;
      if (submit) submit.hidden = n !== steps.length - 1;
      if (count) count.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
    });
    dots.forEach(function (d, n) {
      d.classList.toggle('is-current', n === i);
      d.classList.toggle('is-done', n < i);
    });
  }

  function valid() {
    var fields = steps[i].querySelectorAll('input,select,textarea');
    for (var n = 0; n < fields.length; n++) {
      if (!fields[n].checkValidity()) { fields[n].reportValidity(); return false; }
    }
    return true;
  }

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    paint();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var first = steps[i].querySelector('input:not([type=hidden]),select,textarea');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
  }

  form.querySelectorAll('[data-next]').forEach(function (b) {
    b.addEventListener('click', function () { if (valid()) go(i + 1); });
  });
  form.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { go(i - 1); });
  });

  // Enter advances instead of submitting early
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && i < steps.length - 1) {
      e.preventDefault();
      if (valid()) go(i + 1);
    }
  });

  window.shezResetSteps = function () { go(0); };
  paint();
})();

/* ===== 10 · LOGO FALLBACK ===== */
document.querySelectorAll('[data-mark] img').forEach(function (img) {
  img.addEventListener('error', function () {
    img.closest('[data-mark]').classList.add('no-img');
  });
  if (img.complete && img.naturalWidth === 0) img.closest('[data-mark]').classList.add('no-img');
});

/* ===== 11 · CYLINDER GALLERY ===== */
(function () {
  var root = document.querySelector('[data-cylinder]');
  if (!root) return;
  var ring = root.querySelector('.cyl-ring');
  var originals = Array.prototype.slice.call(ring.children);
  if (!originals.length) return;

  // Fill the ring to at least 12 cards so the cylinder reads as continuous.
  while (ring.children.length < 12) {
    originals.forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      ring.appendChild(copy);
    });
  }
  var cards = Array.prototype.slice.call(ring.children);
  var n = cards.length, step = 360 / n, GAP = 14, R = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO = reduce ? 0 : 7;                       // degrees per second

  root.classList.add('is-3d');

  function layout() {
    var w = root.clientWidth;
    var cw = Math.round(Math.max(140, Math.min(230, w * 0.2)));
    var ch = Math.round(cw * 1.36);
    R = n * (cw + GAP) / (2 * Math.PI);
    root.style.setProperty('--cw', cw + 'px');
    root.style.setProperty('--ch', ch + 'px');
    root.style.setProperty('--persp', Math.round(R * 2.3) + 'px');   // camera must sit past the near wall (2R)
    cards.forEach(function (card, i) {
      card.style.transform = 'rotateY(' + (-i * step) + 'deg) translateZ(' + (-R) + 'px)';
    });
  }

  var angle = 0, vel = AUTO, target = null;
  var dragging = false, hovering = false, visible = true, running = false;
  var lastFront = -1;
  var startX = 0, startAngle = 0, lastX = 0, lastT = 0, last = 0;

  function frame(t) {
    var dt = Math.min((t - (last || t)) / 1000, 0.1);
    last = t;
    if (!dragging) {
      if (target !== null) {
        angle += (target - angle) * Math.min(1, reduce ? 1 : dt * 7);
        if (Math.abs(target - angle) < 0.05) { angle = target; target = null; vel = 0; }
      } else {
        var goal = hovering ? 0 : AUTO;
        vel += (goal - vel) * Math.min(1, dt * 2.5);  // inertia eases back to cruise speed
        angle += vel * dt;
      }
    }
    ring.style.transform = 'translateZ(' + R + 'px) rotateY(' + angle + 'deg)';
    var front = ((Math.round(angle / step) % n) + n) % n;   // the card facing the viewer shows its caption
    if (front !== lastFront) {
      if (cards[lastFront]) cards[lastFront].classList.remove('is-front');
      cards[front].classList.add('is-front');
      lastFront = front;
    }
    if (visible) requestAnimationFrame(frame); else { running = false; last = 0; }
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function degPerPx() { return 180 / (Math.PI * R); }

  root.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.cyl-btn')) return;
    dragging = true; target = null;
    startX = lastX = e.clientX; startAngle = angle; lastT = performance.now();
    root.classList.add('is-dragging');
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var now = performance.now();
    angle = startAngle - (e.clientX - startX) * degPerPx();
    if (now > lastT) vel = -(e.clientX - lastX) * degPerPx() / ((now - lastT) / 1000);
    lastX = e.clientX; lastT = now;
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    if (performance.now() - lastT > 80) vel = 0;   // released after holding still
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', function () { hovering = false; });

  function go(dir) { target = Math.round((target !== null ? target : angle) / step) * step + dir * step; }
  root.querySelector('[data-cyl-prev]').addEventListener('click', function () { go(-1); });
  root.querySelector('[data-cyl-next]').addEventListener('click', function () { go(1); });

  layout();
  window.addEventListener('resize', layout);

  // Only animate while the gallery is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(root);
  }
  start();
})();
