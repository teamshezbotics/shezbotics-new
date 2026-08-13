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
function shezToast(heading, detail) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.querySelector('b').textContent = heading;
  t.querySelector('span').textContent = detail;
  t.classList.add('is-shown');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('is-shown'); }, 4500);
}

/* ===== 09 · SUBMISSIONS → GOOGLE SHEET + ALERT MAIL =====
   Primary : Apps Script web app. Writes a row to the Sheet AND emails you.
   Fallback: FormSubmit, so mail still arrives if the script is unreachable.
   Paste your deployed /exec URL into SHEZ_ENDPOINT below. */

var SHEZ_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE';
var SHEZ_FALLBACK = 'team.shezbotics@gmail.com';

function shezCollect(form) {
  var data = {};
  new FormData(form).forEach(function (value, key) {
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

function shezSend(form) {
  var data = shezCollect(form);

  // text/plain keeps this a "simple request" — no CORS preflight to Apps Script
  var toScript = fetch(SHEZ_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  }).then(function (r) {
    if (!r.ok) throw new Error('script ' + r.status);
    return r;
  });

  return toScript.catch(function () {
    return fetch('https://formsubmit.co/ajax/' + SHEZ_FALLBACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
  });
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

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      shezSend(form)
        .then(function () {
          form.reset();
          if (form.dataset.resetSteps) window.shezResetSteps && window.shezResetSteps();
          shezToast(
            form.dataset.successTitle || 'Enquiry received',
            form.dataset.successBody || 'We usually reply within one working day.'
          );
        })
        .catch(function () {
          shezToast('Could not send', 'Please WhatsApp us on +91 95457 97867 instead.');
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  });
})();

/* ===== 09b · MULTI-STEP FORM (demo.html) ===== */
(function () {
  var form = document.querySelector('[data-steps]');
  if (!form) return;

  var steps = [].slice.call(form.querySelectorAll('.step'));
  var dots = [].slice.call(document.querySelectorAll('.stepper li'));
  var nextBtn = form.querySelector('[data-next]');
  var backBtn = form.querySelector('[data-back]');
  var submitBtn = form.querySelector('button[type="submit"]');
  var count = form.querySelector('.step-count');
  var i = 0;

  function paint() {
    steps.forEach(function (s, n) { s.hidden = n !== i; });
    dots.forEach(function (d, n) {
      d.classList.toggle('is-current', n === i);
      d.classList.toggle('is-done', n < i);
    });
    backBtn.hidden = i === 0;
    nextBtn.hidden = i === steps.length - 1;
    submitBtn.hidden = i !== steps.length - 1;
    if (count) count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
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

  nextBtn.addEventListener('click', function () { if (valid()) go(i + 1); });
  backBtn.addEventListener('click', function () { go(i - 1); });

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
