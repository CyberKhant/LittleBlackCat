/* Little Black Cat — script.js
   El gatito se dibuja píxel a píxel en un mini-canvas (64x48) y se escala sin suavizado.
   Todas las animaciones usan el MISMO dibujo con distintos parámetros → identidad consistente. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const cv = $('stage'), ctx = cv.getContext('2d');
const spr = document.createElement('canvas'); spr.width = 64; spr.height = 48;
const g = spr.getContext('2d');
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.floor(Math.random() * a.length)];

// Paleta del gatito
const COL = { fur:'#1c1f30', fur2:'#2c3354', rim:'#5068a8', inEar:'#e87aa0', gold:'#ffc531', gold2:'#ff9a1c',
  dark:'#07070d', nose:'#ff8fb1', cheek:'#ff6f9c', whisk:'#9aa3cf', mouth:'#7479a0' };

/* ---------- Tamaño de pantalla ---------- */
let W, H, DPR, S; // S = escala de cada píxel del gato
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  S = clamp(Math.round(Math.min(W, H) / 105), 3, 7);
  cat.x = clamp(cat.x, 8 * S, W - 8 * S); cat.y = clamp(cat.y, H * .3, H * .92);
  cat.tx = cat.x; cat.ty = cat.y;
}

/* ---------- Primitivas de píxel-art ---------- */
function P(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }
function E(cx, cy, rx, ry, c) { // elipse rellena pixel a pixel
  g.fillStyle = c;
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const a = (x + .5 - cx) / rx, b = (y + .5 - cy) / ry;
      if (a * a + b * b <= 1) g.fillRect(x, y, 1, 1);
    }
}
function T(ax, ay, bx, by, cx, cy, c) { // triángulo relleno
  g.fillStyle = c;
  const x0 = Math.floor(Math.min(ax, bx, cx)), x1 = Math.ceil(Math.max(ax, bx, cx));
  const y0 = Math.floor(Math.min(ay, by, cy)), y1 = Math.ceil(Math.max(ay, by, cy));
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const l1 = ((by - cy) * (x + .5 - cx) + (cx - bx) * (y + .5 - cy)) / d;
    const l2 = ((cy - ay) * (x + .5 - cx) + (ax - cx) * (y + .5 - cy)) / d;
    if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) g.fillRect(x, y, 1, 1);
  }
}

/* ---------- Dibujo del gatito (una sola función para todas las poses) ---------- */
function drawCat(p, t) {
  g.clearRect(0, 0, 64, 48);
  const lie = p.lie;
  const bx = 30 + p.hx * .4, by = lie ? 37 : 33 + p.bob * .5;
  const brx = lie ? 16 : 13.5 + p.sq, bry = lie ? 6.5 : 10 - p.sq * .6;

  // Cola larga y expresiva (segmentos que se curvan)
  const pts = []; let tx = bx + 11, ty = lie ? 38 : 37, a = lie ? .5 : -.25 - p.up * .9;
  for (let i = 0; i < 12; i++) {
    tx += Math.cos(a) * 2; ty += Math.sin(a) * 2;
    a += lie ? .3 : -.1 + Math.sin(t * 5 - i * .5) * p.wag * .1;
    pts.push([tx, Math.min(ty, 44)]);
  }
  pts.forEach(q => E(q[0], q[1] - .6, 2.4, 2.4, COL.rim));
  pts.forEach((q, i) => E(q[0], q[1], 1.9, 1.9, COL.fur));
  pts.forEach((q, i) => { if (i % 3 === 1) P(q[0], q[1] - 1, 1, 1, COL.fur2); });

  // Cuerpo gordito
  E(bx, by, brx + 1, bry + 1, COL.rim);
  E(bx, by + 1, brx, bry, COL.fur);
  E(bx - 4, by - 3, 4, 2, COL.fur2);
  if (!lie) E(bx, by + 4, brx * .5, bry * .45, COL.fur2);

  // Patitas cortas
  if (!lie) for (let k = 0; k < 2; k++) {
    const px = bx + (k ? 6.5 : -6.5), py = 42.3 - p.lift[k];
    E(px, py - .7, 4, 3, COL.rim); E(px, py, 3.3, 2.5, COL.fur); P(px - 1, py - 1, 2, 1, COL.fur2);
    P(px - 1, py + 1, 1, 1, '#ff9fbf'); P(px + 1, py + 1, 1, 1, '#ff9fbf');
  }

  // Cabeza (un poco grande)
  const hcx = lie ? 24 + p.hx * .3 : 30 + p.hx, hcy = (lie ? 31 : 20) + p.bob;

  // Orejas triangulares
  for (const k of [-1, 1]) {
    const ay = hcy - 14 - p.earUp * 2 + p.tw * k;
    T(hcx + k * 10.5, ay - 1, hcx + k * 14.5, hcy - 3, hcx + k * 3.5, hcy - 10, COL.rim);
    T(hcx + k * 10.5, ay, hcx + k * 14, hcy - 3, hcx + k * 4, hcy - 9, COL.fur);
    T(hcx + k * 10.2, ay + 3.5, hcx + k * 12, hcy - 4.5, hcx + k * 6.8, hcy - 8, COL.inEar);
  }
  E(hcx, hcy, 15.5, 11.5, COL.rim);
  E(hcx, hcy + .8, 14.6, 10.7, COL.fur);
  E(hcx - 5, hcy - 6, 4.5, 1.6, COL.fur2); P(hcx + 4, hcy - 7, 2, 1, COL.fur2);

  // Ojos grandes dorados
  for (const k of [-1, 1]) {
    const ex = hcx + k * 6.3 + p.px * .8, ey = hcy + 1 + p.py * .5;
    if (p.eye === 'h' || p.eye === 'c') {
      if (p.eye === 'h') { P(ex - 3, ey + 1, 1, 1, COL.dark); P(ex - 2, ey, 4, 1, COL.dark); P(ex - 1, ey - 1, 2, 1, COL.dark); P(ex + 2, ey + 1, 1, 1, COL.dark); }
      else { P(ex - 3, ey, 1, 1, COL.dark); P(ex - 2, ey + 1, 4, 1, COL.dark); P(ex + 2, ey, 1, 1, COL.dark); }
    } else {
      const wide = p.eye === 'w', ry = (wide ? 5.4 : 4.3) * (1 - p.blink), rx = wide ? 4.3 : 3.6;
      if (ry < 1.2) { P(ex - 3, ey + 1, 6, 1, COL.dark); continue; }
      E(ex, ey, rx, ry, COL.gold2); E(ex, ey - .8, rx - .5, ry - .9, COL.gold);
      E(ex + p.px * .9, ey + p.py * .6, wide ? 1 : 1.3, Math.min(ry - .5, wide ? 1.6 : 3.2), COL.dark);
      P(ex - 2, ey - ry + 1.2, 2, 2, '#fff'); P(ex + 1, ey + ry - 2, 1, 1, '#fff6c8');
    }
  }
  // Nariz rosada, boquita, mejillas y bigotes
  P(hcx - 1, hcy + 5, 2, 1, COL.nose);
  if (p.mouth) E(hcx, hcy + 8, 1.6, 1.6, '#ff6f91');
  else { P(hcx, hcy + 6, 1, 1, COL.mouth); P(hcx - 2, hcy + 7, 2, 1, COL.mouth); P(hcx + 1, hcy + 7, 2, 1, COL.mouth); }
  g.globalAlpha = .8; E(hcx - 10.5, hcy + 5, 2.7, 1.7, COL.cheek); E(hcx + 10.5, hcy + 5, 2.7, 1.7, COL.cheek); g.globalAlpha = 1;
  P(hcx - 17, hcy + 4, 4, 1, COL.whisk); P(hcx - 16, hcy + 6, 3, 1, COL.whisk);
  P(hcx + 13, hcy + 4, 4, 1, COL.whisk); P(hcx + 13, hcy + 6, 3, 1, COL.whisk);
}

/* ---------- Estado del gatito ---------- */
const cat = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, z: 0, mode: 'idle', t: 0, dur: 0, face: 1,
  hx: 0, gx: 0, gy: 0, phase: 0, nb: 2, ne: 5, jh: 10, j: null, rot: 0, stepSign: 1 };
const fx = { blink: 0, close: 0, ear: 0, tail: 0 };
let started = false, following = false, now = 0, lastInput = 0, lastSay = -99, interactions = 0, lastReact = [];
let sndOn = true, look = { x: 0, y: 0 };
const WALK = () => 26 * S, RUN = () => 70 * S;

function setMode(m, dur = 1) { cat.mode = m; cat.t = 0; cat.dur = dur; cat.vx = cat.vy = 0; cat.tx = cat.x; cat.ty = cat.y; cat.rot = 0; }
function startJump(x, y, h) {
  cat.mode = 'jump'; cat.t = 0; cat.dur = .55; cat.j = { x0: cat.x, y0: cat.y, x1: x, y1: y };
  cat.jh = h; cat.vx = cat.vy = 0; if (Math.abs(x - cat.x) > 6) cat.face = Math.sign(x - cat.x);
}
function goTo(x, y) { // toque en el suelo: salto si está cerca, caminata/carrera si está lejos
  const tx = clamp(x, 8 * S, W - 8 * S), ty = clamp(y, H * .34, H * .9), d = Math.hypot(tx - cat.x, ty - cat.y);
  if (cat.mode === 'sleep') wake();
  if (d < 10 * S) return;
  if (d < 40 * S) startJump(tx, ty, 9 * S); else { cat.mode = 'idle'; cat.tx = tx; cat.ty = ty; cat.far = d; }
}
function wake() { if (cat.mode === 'sleep') { setMode('surprised', 1); say('Miau, hola otra vez :)', true); } }

/* ---------- Reacciones al tocar al gatito (variadas, sin repetir) ---------- */
const REACTS = ['blink', 'close', 'ear', 'tail', 'hop', 'happy', 'roll', 'surprised', 'pet'];
function react() {
  let r; do { r = pick(REACTS); } while (lastReact.includes(r));
  lastReact.push(r); if (lastReact.length > 3) lastReact.shift();
  if (cat.mode === 'sleep') { wake(); return; }
  if (['walk', 'run', 'idle'].includes(cat.mode)) { cat.tx = cat.x; cat.ty = cat.y; cat.vx = cat.vy = 0; }
  switch (r) {
    case 'blink': fx.blink = .25; break;
    case 'close': fx.close = 1.5; hearts(2); break;
    case 'ear': fx.ear = 1.1; break;
    case 'tail': fx.tail = 1.8; break;
    case 'hop': startJump(cat.x, cat.y, 6 * S); meow(); break;
    case 'happy': setMode('happy', 2.3); meow(); break;
    case 'roll': setMode('roll', 1.9); break;
    case 'surprised': setMode('surprised', 1.1); break;
    case 'pet': setMode('pet', 2.8); purr(2.6); say('Purrrr...'); break;
  }
  const q = Math.random();
  if (q < .12) say('Hola linda :) digo miau', true); else if (q < .4) say(pick(['Miau miau ♡', '¿Me das cariño?', '¿Me estabas buscando?']), true);
}

/* ---------- Frases y burbuja ---------- */
const bubble = $('bubble'), bubbleText = $('bubbleText');
let bubbleUntil = 0;
const PHRASES = ['Miau miau ♡', '¿Me estabas buscando?', 'Purrrr...', '¿Me das cariño?', 'Miau, hola otra vez :)', 'Hola linda :) digo miau'];
function say(txt, force) {
  if (!force && now - lastSay < 8) return;
  lastSay = now; bubbleText.textContent = txt; bubble.classList.add('show'); bubbleUntil = now + 2.8 + txt.length * .05;
  if (/miau/i.test(txt)) meow(); else if (/purr/i.test(txt)) purr(1.6);
  interactions = 0;
}

/* ---------- Sonidos (Web Audio, sin archivos; opcionales) ---------- */
let ac = null;
function audio() {
  if (!sndOn) return null;
  try { if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (A) ac = new A(); } if (ac && ac.state === 'suspended') ac.resume(); } catch (e) { return null; }
  return ac;
}
function meow() {
  const a = audio(); if (!a) return; const t = a.currentTime;
  const o = a.createOscillator(), f = a.createBiquadFilter(), v = a.createGain();
  o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 1500;
  o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(900, t + .16); o.frequency.exponentialRampToValueAtTime(560, t + .5);
  v.gain.setValueAtTime(.0001, t); v.gain.linearRampToValueAtTime(.07, t + .08); v.gain.exponentialRampToValueAtTime(.0001, t + .55);
  o.connect(f); f.connect(v); v.connect(a.destination); o.start(t); o.stop(t + .6);
}
function purr(d) {
  const a = audio(); if (!a) return; const t = a.currentTime;
  const o = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), f = a.createBiquadFilter(), v = a.createGain(), m = a.createGain();
  o.type = 'sawtooth'; o.frequency.value = 26; f.type = 'lowpass'; f.frequency.value = 220;
  l.frequency.value = 22; lg.gain.value = .05; v.gain.value = .06; l.connect(lg); lg.connect(v.gain);
  m.gain.setValueAtTime(.0001, t); m.gain.linearRampToValueAtTime(1, t + .25); m.gain.linearRampToValueAtTime(.0001, t + d);
  o.connect(f); f.connect(v); v.connect(m); m.connect(a.destination); o.start(t); l.start(t); o.stop(t + d + .1); l.stop(t + d + .1);
}
function step() {
  const a = audio(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), v = a.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(70, t + .05);
  v.gain.setValueAtTime(.04, t); v.gain.exponentialRampToValueAtTime(.0001, t + .06);
  o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + .07);
}

/* ---------- Ambiente: estrellas, luciérnagas, corazones, Z ---------- */
const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * .85, r: Math.random() < .2 ? 2 : 1, ph: rnd(0, 6.3), sp: rnd(.8, 2.4) }));
const flies = Array.from({ length: 12 }, () => ({ x: Math.random(), y: rnd(.2, .95), vx: rnd(-.01, .01), vy: rnd(-.01, -.002), ph: rnd(0, 6.3) }));
const parts = []; // corazones y letras Z
const HEART = ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000'];
function hearts(n) { for (let i = 0; i < n; i++) parts.push({ k: 'h', x: cat.x + rnd(-8, 8) * S, y: cat.y - cat.z - rnd(28, 38) * S, vy: -rnd(25, 45), vx: rnd(-12, 12), life: 1.6 }); }

/* ---------- Actualización ---------- */
function update(dt) {
  const c = cat;
  for (const k in fx) if (fx[k] > 0) fx[k] -= dt;
  if ((c.nb -= dt) <= 0) { fx.blink = .14; c.nb = Math.random() < .2 ? .3 : rnd(2, 5.5); }
  if ((c.ne -= dt) <= 0) { fx.ear = .8; c.ne = rnd(4, 10); }
  if (started && c.mode === 'idle' && Math.random() < dt * .08) fx.tail = 1.5;

  // Mirada: hacia el dedo/ratón o hacia el destino
  const lx = (following || now - lastInput < 4) ? look.x : c.tx, ly = (following || now - lastInput < 4) ? look.y : c.ty - 20 * S;
  const dxl = lx - c.x, dyl = ly - (c.y - 22 * S);
  c.hx = lerp(c.hx, clamp(dxl / (10 * S), -2.5, 2.5), Math.min(1, dt * 8));
  c.gx = lerp(c.gx, clamp(dxl / (30 * S), -1.2, 1.2), Math.min(1, dt * 8));
  c.gy = lerp(c.gy, clamp(dyl / (30 * S), -1, 1), Math.min(1, dt * 8));

  const m = c.mode; c.z = 0;
  if (m === 'jump') {
    c.t += dt; const u = Math.min(1, c.t / c.dur), e = u * u * (3 - 2 * u);
    c.x = lerp(c.j.x0, c.j.x1, e); c.y = lerp(c.j.y0, c.j.y1, e); c.z = Math.sin(Math.PI * u) * c.jh;
    if (u >= 1) { c.tx = c.x; c.ty = c.y; c.mode = 'idle'; step(); }
  } else if (['happy', 'pet', 'roll', 'surprised'].includes(m)) {
    c.t += dt;
    if (m === 'surprised') c.z = Math.max(0, Math.sin(c.t * 14)) * 4 * S * Math.max(0, 1 - c.t * 1.6);
    if (m === 'happy') c.z = Math.abs(Math.sin(c.t * 9)) * 2 * S;
    if (m === 'roll') c.rot = c.t / c.dur * Math.PI * 4;
    if ((m === 'happy' || m === 'pet') && Math.random() < dt * 3) hearts(1);
    if (c.t >= c.dur) { c.mode = 'idle'; c.rot = 0; if (m === 'happy') lastInput = now; }
  } else if (m === 'sleep') {
    if (Math.random() < dt * .9) parts.push({ k: 'z', x: c.x + 8 * S, y: c.y - 22 * S, vy: -14, vx: 10, life: 2.4 });
  } else { // idle / walk / run → desplazamiento suave hacia el destino
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    const arrive = following ? 10 * S : 3 * S;
    let want = 0;
    if (d > arrive) want = (d > 90 * S ? RUN() : WALK()) * clamp(d / (18 * S), .4, 1);
    const ux = d ? dx / d : 0, uy = d ? dy / d : 0, k = Math.min(1, dt * 7);
    c.vx = lerp(c.vx, ux * want, k); c.vy = lerp(c.vy, uy * want, k);
    c.x += c.vx * dt; c.y += c.vy * dt;
    const sp = Math.hypot(c.vx, c.vy);
    if (Math.abs(dx) > 6 * S * .3 && sp > 8) c.face = Math.sign(dx) || c.face;
    c.mode = sp > RUN() * .6 ? 'run' : sp > 10 ? 'walk' : 'idle';
    if (sp > 10) {
      c.phase += dt * (c.mode === 'run' ? 16 : 10);
      const s = Math.sign(Math.sin(c.phase)); if (s !== c.stepSign) { c.stepSign = s; step(); }
    }
    // Comportamientos espontáneos
    const idleT = now - lastInput;
    if (started && c.mode === 'idle' && !following) {
      if (idleT > 9 && now - lastSay > 12) say(pick(PHRASES.slice(0, 4)), true);
      if (idleT > 24) { setMode('sleep', 1e9); say('Tengo sueño zzz', true); }
      if (interactions >= 14) say(pick(PHRASES), true);
    }
  }
  // Partículas
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.life <= 0) parts.splice(i, 1); }
  if (bubble.classList.contains('show') && now > bubbleUntil) bubble.classList.remove('show');
}

/* ---------- Pose según estado ---------- */
function pose() {
  const c = cat, t = now, m = c.mode;
  const p = { hx: c.hx, px: c.gx, py: c.gy, bob: 0, lie: false, eye: 'o', blink: fx.blink > 0 ? 1 : 0, earUp: 0,
    tw: fx.ear > 0 ? Math.sin(fx.ear * 45) * 1.3 : 0, lift: [0, 0], up: fx.tail > 0 ? .95 : .1, wag: fx.tail > 0 ? 3 : 1.2, sq: 0, mouth: false };
  if (fx.close > 0) p.eye = 'h';
  if (m === 'idle') { p.bob = Math.sin(t * 2.2) * .6; p.sq = Math.sin(t * 2.2) * .3; }
  else if (m === 'walk' || m === 'run') {
    const s = Math.sin(c.phase), r = m === 'run';
    p.bob = -Math.abs(s) * (r ? 2.2 : 1.4); p.lift = [Math.max(0, s) * (r ? 3.5 : 2.5), Math.max(0, -s) * (r ? 3.5 : 2.5)];
    p.wag = r ? 2.5 : 1.8; p.up = r ? .55 : .25; p.sq = Math.sin(c.phase * 2) * .3; if (r) p.mouth = true;
  } else if (m === 'jump') {
    const u = c.t / c.dur; p.sq = u < .12 ? 1.6 : u > .9 ? 1.3 : -1.1; p.bob = u < .12 ? 1.5 : 0; p.mouth = u > .12 && u < .9; p.eye = 'w'; p.up = .6; p.lift = [1.5, 1.5];
  } else if (m === 'happy') { p.eye = 'h'; p.up = .9; p.wag = 3.5; p.mouth = true; p.hx = Math.sin(t * 8) * 1.5; }
  else if (m === 'pet') { p.eye = Math.sin(t * 3) > .3 ? 'c' : 'h'; p.hx = Math.sin(t * 5) * 2; p.wag = 2; p.up = .5; p.bob = 1; p.sq = .6; }
  else if (m === 'surprised') { p.eye = 'w'; p.earUp = 1; p.mouth = true; p.sq = -.6; p.up = .9; p.wag = 0; p.blink = 0; }
  else if (m === 'sleep') { p.lie = true; p.eye = 'c'; p.bob = Math.sin(t * 1.4) * .7; p.hx = -2; p.px = 0; p.py = 0; }
  else if (m === 'roll') { p.lie = true; p.eye = 'h'; p.wag = 3; p.hx = 0; }
  if (p.eye !== 'o' && p.eye !== 'w') p.blink = 0;
  return p;
}

/* ---------- Dibujo en pantalla ---------- */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  // Estrellas con parpadeo suave
  ctx.fillStyle = '#dfe8ff';
  for (const s of stars) { ctx.globalAlpha = .3 + .7 * (.5 + .5 * Math.sin(now * s.sp + s.ph)); ctx.fillRect(Math.round(s.x * W), Math.round(s.y * H), s.r, s.r); }
  // Luciérnagas / partículas luminosas
  for (const f of flies) {
    f.x += f.vx * .016 + Math.sin(now * .7 + f.ph) * .0003; f.y += f.vy * .016; if (f.y < .1) { f.y = 1; f.x = Math.random(); }
    ctx.globalAlpha = .25 + .45 * Math.abs(Math.sin(now * 1.2 + f.ph)); ctx.fillStyle = '#ffe9a0'; ctx.fillRect(Math.round(f.x * W), Math.round(f.y * H), 3, 3);
  }
  ctx.globalAlpha = 1;
  const c = cat, h = c.z;
  // Luz suave y sombra bajo el gato
  const gl = ctx.createRadialGradient(c.x, c.y - 10 * S, 0, c.x, c.y - 10 * S, 34 * S);
  gl.addColorStop(0, 'rgba(120,150,255,.13)'); gl.addColorStop(1, 'rgba(120,150,255,0)');
  ctx.fillStyle = gl; ctx.fillRect(c.x - 36 * S, c.y - 46 * S, 72 * S, 72 * S);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 1, 13 * S * (1 - h / (40 * S)), 2.6 * S, 0, 0, 6.3); ctx.fill();
  // Gatito
  const p = pose(); drawCat(p, now);
  const lean = clamp(c.vx / (RUN() * 6), -.12, .12) + (c.mode === 'pet' ? Math.sin(now * 5) * .05 : 0);
  ctx.save(); ctx.translate(c.x, c.y - h - 18 * S); ctx.rotate(lean + c.rot); ctx.scale(c.face, 1);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(spr, -30 * S, -26 * S, 64 * S, 48 * S); ctx.restore();
  // Corazones y Z
  for (const q of parts) {
    ctx.globalAlpha = clamp(q.life, 0, 1);
    if (q.k === 'h') { const u = Math.max(2, S * .7); ctx.fillStyle = '#ff6f9c'; HEART.forEach((row, ry) => [...row].forEach((v, rx) => { if (v === '1') ctx.fillRect(Math.round(q.x + rx * u), Math.round(q.y + ry * u), u, u); })); }
    else { ctx.fillStyle = '#bcd0ff'; ctx.font = `bold ${Math.round(4 * S + (2.4 - q.life) * 5)}px monospace`; ctx.fillText('Z', q.x, q.y); }
  }
  ctx.globalAlpha = 1;
  // Burbuja sobre la cabeza
  const bxp = clamp(c.x, 120, Math.max(120, W - 120)), byp = Math.max(70, c.y - h - 44 * S + 4 * S);
  bubble.style.transform = `translate(${bxp}px,${byp}px) translate(-50%,-100%)`;
}

/* ---------- Entrada: Pointer Events (táctil + ratón) ---------- */
function hitCat(x, y) { return Math.hypot(x - cat.x, y - (cat.y - cat.z - 22 * S)) < 18 * S; }
let downPos = null, dragging = false, downOnCat = false;
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); if (!started) return;
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  downPos = { x: e.clientX, y: e.clientY }; dragging = false; look = { x: e.clientX, y: e.clientY };
  lastInput = now; interactions++;
  downOnCat = hitCat(e.clientX, e.clientY);
  if (downOnCat) react(); else { if (cat.mode === 'sleep') wake(); else goTo(e.clientX, e.clientY); }
});
cv.addEventListener('pointermove', e => {
  look = { x: e.clientX, y: e.clientY }; if (!started) return;
  if (!downPos) { lastInput = Math.max(lastInput, now - 3.5); return; } // ratón sin pulsar: solo mira
  if (!dragging && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 10) dragging = true;
  if (dragging && !downOnCat || (dragging && downOnCat && !['pet', 'happy', 'roll', 'surprised'].includes(cat.mode))) {
    following = true; lastInput = now;
    if (cat.mode === 'sleep') wake();
    if (cat.mode === 'idle' || cat.mode === 'walk' || cat.mode === 'run') { cat.tx = clamp(e.clientX, 8 * S, W - 8 * S); cat.ty = clamp(e.clientY, H * .34, H * .9); }
  }
});
const endPtr = () => { downPos = null; following = false; dragging = false; };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
['touchmove', 'gesturestart', 'contextmenu'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));

/* ---------- Botones ---------- */
function reset() {
  cat.x = cat.tx = W / 2; cat.y = cat.ty = H * .62; cat.face = 1; setMode('idle'); parts.length = 0; lastInput = now; lastReact = [];
  bubble.classList.remove('show'); setTimeout(() => say('Hola linda :) digo miau', true), 500);
}
$('startBtn').addEventListener('click', () => {
  started = true; lastInput = now; audio();
  $('intro').classList.add('hide'); $('ctrls').classList.add('on');
  cat.tx = W / 2; cat.ty = H * .62; setTimeout(() => startJump(W / 2, H * .62, 8 * S), 250);
  setTimeout(() => say('Hola linda :) digo miau', true), 900);
});
$('soundBtn').addEventListener('click', e => { sndOn = !sndOn; e.currentTarget.textContent = sndOn ? '🔊' : '🔇'; if (sndOn) { audio(); meow(); } });
$('petBtn').addEventListener('click', () => { if (cat.mode === 'sleep') wake(); lastInput = now; interactions++; setMode('pet', 3); purr(2.8); say('Purrrr...', true); });
$('resetBtn').addEventListener('click', reset);

/* ---------- Bucle principal ---------- */
window.addEventListener('resize', resize);
resize(); cat.x = cat.tx = W / 2; cat.y = cat.ty = H * .52; look = { x: W / 2, y: H / 2 };
let last = performance.now();
function loop(ts) { const dt = Math.min(.05, (ts - last) / 1000); last = ts; now += dt; update(dt); render(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
})();
