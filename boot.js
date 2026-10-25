/* ==========================================================================
   SHEZBOTICS — boot.js
   The boot screen: a 1602 character LCD that powers on, initialises and says
   hello while the page loads. Shown on the first visit in a session and on a
   reload (the inline script in <head> decides), never between pages.
   ========================================================================== */
(function () {
  var html = document.documentElement;
  var boot = document.querySelector('[data-boot]');
  if (!boot) return;
  if (!html.classList.contains('booting')) { boot.remove(); return; }
  try { sessionStorage.setItem('shez-boot', '1'); } catch (e) {}
  clearTimeout(window.__bootFs);            // the page's own safety net; this script keeps its own below

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the page's own brand (the ShezBotics companies set data-brand on <html>), and its greeting
  var BRAND = (html.dataset.brand || 'ShezBotics').toUpperCase(), HELLO = html.dataset.hello || 'HELLO, MAKER!';
  var hint = boot.querySelector('[data-boot-skip]');
  if (hint && window.matchMedia('(hover: hover)').matches) hint.textContent = 'Click or press any key to skip';
  var cv = boot.querySelector('canvas');
  var logo = boot.querySelector('.boot-logo');   // the SB mark, lit with the backlight
  var W = 800, H = 360, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  var x = cv.getContext('2d');
  x.scale(dpr, dpr);

  /* ---------- the module: green board, pin pads, black frame ---------- */
  var NAVY = '#071423', GOLD = '#d9a521', SILK = '#eef6ee';
  var base = document.createElement('canvas');
  base.width = W * dpr; base.height = H * dpr;
  var b = base.getContext('2d');
  b.scale(dpr, dpr);
  var rr = function (c, px, py, w, h, r) {
    c.beginPath(); c.moveTo(px + r, py); c.arcTo(px + w, py, px + w, py + h, r); c.arcTo(px + w, py + h, px, py + h, r);
    c.arcTo(px, py + h, px, py, r); c.arcTo(px, py, px + w, py, r); c.closePath();
  };
  b.fillStyle = '#1f9a3b'; rr(b, 0, 0, W, H, 8); b.fill();
  // copper under the mask
  b.strokeStyle = '#1a8833'; b.lineWidth = 3; b.lineCap = 'round';
  for (var i = 0; i < 16; i++) {
    var tx = 166 + i * 30;
    b.beginPath(); b.moveTo(tx, 50); b.lineTo(tx, 76); b.lineTo(tx + (i < 8 ? -18 : 18), 88); b.stroke();
  }
  [[24, 120, 24, 250], [776, 120, 776, 250], [120, 318, 300, 318], [500, 318, 680, 318]].forEach(function (l) {
    b.beginPath(); b.moveTo(l[0], l[1]); b.lineTo(l[2], l[3]); b.stroke();
  });
  // mounting holes
  [[28, 28], [772, 28], [28, 332], [772, 332]].forEach(function (h) {
    b.fillStyle = GOLD; b.beginPath(); b.arc(h[0], h[1], 17, 0, Math.PI * 2); b.fill();
    b.fillStyle = NAVY; b.beginPath(); b.arc(h[0], h[1], 9, 0, Math.PI * 2); b.fill();
  });
  // sixteen pads and their names
  var names = ['GND', 'VCC', 'V0', 'RS', 'RW', 'E', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'BLA', 'BLK'];
  b.font = '700 9.5px Arial, Helvetica, sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
  names.forEach(function (n, i) {
    var px = 166 + i * 30;
    b.fillStyle = GOLD; rr(b, px - 10, 22, 20, 28, 5); b.fill();
    b.fillStyle = NAVY; b.beginPath(); b.arc(px, 36, 4.5, 0, Math.PI * 2); b.fill();
    b.fillStyle = SILK; b.fillText(n, px, 64);
  });
  // the frame, the backlight connector, the part number
  b.fillStyle = '#101214'; rr(b, 48, 88, 704, 204, 10); b.fill();
  b.strokeStyle = '#2a2e33'; b.lineWidth = 2; rr(b, 49, 89, 702, 202, 10); b.stroke();
  b.fillStyle = '#c9cdd2'; b.fillRect(752, 164, 16, 52);
  b.fillStyle = '#9aa0a6'; b.fillRect(756, 172, 8, 36);
  b.strokeStyle = GOLD; b.lineWidth = 2; b.strokeRect(352, 305, 96, 26);
  b.font = '800 15px Arial, Helvetica, sans-serif'; b.fillStyle = GOLD; b.fillText('1602A', 400, 319);

  /* ---------- the screen: 16 × 2 cells of 5 × 8 dots ---------- */
  var SX = 78, SY = 110, SW = 644, SH = 162;
  var P = 6.45, DOT = 5.5, GAP = 5.2, ROWGAP = 8;
  var GX = SX + (SW - (80 * P + 15 * GAP)) / 2, GY = SY + (SH - (16 * P + ROWGAP)) / 2;
  var GLYPHS = {
    ' ': '00000000000000', '0': '0e11131519110e', '1': '040c040404040e', '2': '0e11010204081f', '3': '1f02040201110e',
    '4': '02060a121f0202', '5': '1f101e0101110e', '6': '0608101e11110e', '7': '1f010204080808', '8': '0e11110e11110e',
    '9': '0e11110f01020c', 'A': '0e1111111f1111', 'B': '1e11111e11111e', 'C': '0e11101010110e', 'E': '1f10101e10101f',
    'G': '0e11101711110f', 'H': '1111111f111111', 'I': '0e04040404040e', 'K': '11121418141211', 'L': '1010101010101f',
    'M': '111b1515111111', 'N': '11111915131111', 'O': '0e11111111110e', 'R': '1e11111e141211', 'S': '0f10100e01011e',
    'T': '1f040404040404', 'Z': '1f01020408101f', '%': '18190204081303', '!': '04040404040004', ',': '000000000c0408',
    '>': '08040201020408', '.': '00000000000c0c',
  };
  var dots = new Uint8Array(80 * 16);
  var clear = function () { dots.fill(0); };
  var cell = function (row, col, ch) {
    if (col < 0 || col > 15) return;
    var g = GLYPHS[ch] || GLYPHS[' '];
    for (var y = 0; y < 8; y++) {
      var bits = ch === '#' ? 31 : y < 7 ? parseInt(g.substr(y * 2, 2), 16) : 0;
      for (var dx = 0; dx < 5; dx++) dots[(row * 8 + y) * 80 + col * 5 + dx] = (bits & (16 >> dx)) ? 1 : 0;
    }
  };
  var write = function (row, col, s) { for (var i = 0; i < s.length; i++) cell(row, col + i, s.charAt(i)); };
  var centred = function (s) { return Math.floor((16 - s.length) / 2); };
  // a progress bar that fills column by column, the way LCD bars are drawn with custom characters
  var bar = function (row, cells, p) {
    var lit = Math.round(p * cells * 5);
    for (var c = 0; c < cells; c++) for (var y = 0; y < 8; y++) for (var dx = 0; dx < 5; dx++) {
      dots[(row * 8 + y) * 80 + c * 5 + dx] = (y > 0 && y < 7 && c * 5 + dx < lit) ? 1 : 0;
    }
  };
  var cursor = null;          // [row, col] of the blinking block, or null
  var light = 0;              // backlight, 0 off → 1 on
  var lit = function (v) { light = v; if (logo) logo.style.opacity = v; };

  var mix = function (a, c, t) {
    var pa = parseInt(a.slice(1), 16), pc = parseInt(c.slice(1), 16);
    var r = Math.round(((pa >> 16) & 255) + ((((pc >> 16) & 255) - ((pa >> 16) & 255)) * t));
    var g = Math.round(((pa >> 8) & 255) + ((((pc >> 8) & 255) - ((pa >> 8) & 255)) * t));
    var bl = Math.round((pa & 255) + (((pc & 255) - (pa & 255)) * t));
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  };
  var draw = function (now) {
    x.clearRect(0, 0, W, H);
    x.drawImage(base, 0, 0, W, H);
    x.fillStyle = mix('#141a36', '#3048d8', light); x.fillRect(SX, SY, SW, SH);
    var off = mix('#18203f', '#3d57e8', light), on = mix('#4a5684', '#eef3ff', light);
    var blink = cursor && Math.floor(now / 260) % 2 === 0;
    for (var r = 0; r < 2; r++) for (var c = 0; c < 16; c++) {
      var isCur = blink && cursor[0] === r && cursor[1] === c;
      for (var y = 0; y < 8; y++) for (var dx = 0; dx < 5; dx++) {
        x.fillStyle = (isCur || dots[(r * 8 + y) * 80 + c * 5 + dx]) ? on : off;
        x.fillRect(GX + c * (5 * P + GAP) + dx * P, GY + r * (8 * P + ROWGAP) + y * P, DOT, DOT);
      }
    }
  };
  var running = true;
  var loop = function (now) { if (!running) return; draw(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  /* ---------- the sequence ---------- */
  var skipped = false, finished = false;
  var wait = function (ms) {
    return new Promise(function (res) {
      if (skipped) return res();
      var t = setTimeout(res, ms);
      waiters.push(function () { clearTimeout(t); res(); });
    });
  };
  var waiters = [];
  var type = function (row, col, s, ms) {
    var i = 0;
    var step = function () {
      if (skipped || i >= s.length) { cursor = null; return Promise.resolve(); }
      cell(row, col + i, s.charAt(i)); i++; cursor = [row, col + i];
      return wait(ms).then(step);
    };
    return step();
  };
  var loaded = document.readyState === 'complete';
  window.addEventListener('load', function () { loaded = true; });
  // the page's heavy start (the 3D robot) begins when the bar holds, and says when it is done
  var held = false;
  var hold = function () {
    if (held) return;
    held = true; window.__shezBootHold = true;
    document.dispatchEvent(new Event('shez:boot-hold'));
  };
  var progress = function () {
    var t0 = performance.now(), p = 0;
    return new Promise(function (res) {
      var tick = function () {
        if (skipped) return res();
        var t = performance.now() - t0;
        // creeps to 90% on its own; the last tenth waits for the page and the robot (at most five seconds)
        var target = (loaded && window.__shez3d) || t > 5000 ? 1 : Math.min(0.9, t / 950);
        p += (target - p) * 0.12; if (target === 1 && p > 0.995) p = 1;
        if (p > 0.85) hold();
        bar(1, 11, p);
        write(1, 12, ('   ' + Math.round(p * 100)).slice(-3) + '%');
        if (p >= 1) return res();
        setTimeout(tick, 30);
      };
      tick();
    });
  };
  var finish = function () {
    if (finished) return;
    finished = true; skipped = true; hold();
    waiters.forEach(function (f) { f(); });
    boot.classList.add('is-leaving');
    html.classList.remove('booting');
    setTimeout(function () { running = false; boot.remove(); }, reduced ? 200 : 600);
  };
  var skip = function () { if (!finished) { skipped = true; waiters.forEach(function (f) { f(); }); finish(); } };
  setTimeout(function () { finish(); }, 12000);   // never longer than this, whatever happens
  ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(function (ev) { window.addEventListener(ev, skip, { once: true, passive: true }); });

  var hello = function () {
    clear(); cursor = null;
    write(0, centred(BRAND), BRAND); write(1, centred(HELLO), HELLO);
  };

  if (reduced) {
    lit(1); hello();
    wait(900).then(finish);
    return;
  }

  // power on: the backlight flickers up and an uninitialised LCD shows a row of blocks
  var flicker = [[0.55, 60], [0.1, 70], [0.85, 60], [0.35, 50], [1, 0]];
  var power = flicker.reduce(function (pr, f) { return pr.then(function () { lit(f[0]); return wait(f[1]); }); }, Promise.resolve());
  power
    .then(function () { write(0, 0, '################'); return wait(320); })
    .then(function () { clear(); return wait(120); })
    .then(function () { return Promise.all([type(0, 0, '> INITIALISING', 42), progress()]); })
    .then(function () { return wait(260); })
    .then(function () { clear(); return type(0, centred(BRAND), BRAND, 46); })
    .then(function () { return type(1, centred(HELLO), HELLO, 36); })
    .then(function () { cursor = [1, Math.min(15, centred(HELLO) + HELLO.length)]; return wait(600); })
    .then(finish);
})();
