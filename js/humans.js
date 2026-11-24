// Personnages articulés et animés, en costumes d'époque (kimono, hakama, armure, jūnihitoe…)
import * as THREE from 'three';

// ───────── Tissus à motifs japonais (dessinés sur canevas)
const fabricCache = new Map();
const hex = c => '#' + new THREE.Color(c).getHexString();
function shade(c, k) { const col = new THREE.Color(c); col.offsetHSL(0, 0, k); return '#' + col.getHexString(); }
function fabricTexture(color, pattern) {
  const key = color + pattern; if (fabricCache.has(key)) return fabricCache.get(key);
  const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
  x.fillStyle = hex(color); x.fillRect(0, 0, S, S);
  // trame du tissu
  for (let i = 0; i < 1400; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; x.fillRect(Math.random() * S, Math.random() * S, 2, 1); }
  const light = shade(color, 0.16), dark = shade(color, -0.14);
  x.strokeStyle = light; x.fillStyle = light; x.lineWidth = 2.5;
  if (pattern === 'seigaiha') { for (let row = -1; row < 9; row++) for (let col = -1; col < 9; col++) { const cx = col * 32 + (row % 2) * 16, cy = row * 16; for (let r = 16; r > 2; r -= 5) { x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.stroke(); } } }
  if (pattern === 'asanoha') { x.lineWidth = 1.6; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) { const cx = i * 32 + (j % 2) * 16, cy = j * 28; for (let a = 0; a < 6; a++) { x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a * Math.PI / 3) * 18, cy + Math.sin(a * Math.PI / 3) * 18); x.stroke(); } } }
  if (pattern === 'sakura') { for (let i = 0; i < 26; i++) { const cx = Math.random() * S, cy = Math.random() * S, r = 7 + Math.random() * 6; x.fillStyle = i % 3 ? '#ffd6e0' : '#ffffff'; for (let a = 0; a < 5; a++) { x.beginPath(); x.ellipse(cx + Math.cos(a * 1.2566) * r * 0.6, cy + Math.sin(a * 1.2566) * r * 0.6, r * 0.55, r * 0.35, a * 1.2566, 0, 7); x.fill(); } x.fillStyle = '#ffd166'; x.beginPath(); x.arc(cx, cy, 2, 0, 7); x.fill(); } }
  if (pattern === 'kikko') { x.lineWidth = 2; for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) { const cx = i * 30 + (j % 2) * 15, cy = j * 26; x.beginPath(); for (let a = 0; a < 6; a++) x.lineTo(cx + Math.cos(a * Math.PI / 3 + Math.PI / 6) * 15, cy + Math.sin(a * Math.PI / 3 + Math.PI / 6) * 15); x.closePath(); x.stroke(); } }
  if (pattern === 'shima') { x.fillStyle = dark; for (let i = 0; i < S; i += 16) x.fillRect(i, 0, 6, S); }
  if (pattern === 'ichimatsu') { x.fillStyle = dark; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * 32, j * 32, 32, 32); }
  if (pattern === 'yagasuri') { x.fillStyle = dark; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const cx = i * 32, cy = j * 32 + (i % 2) * 16; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + 16, cy + 8); x.lineTo(cx + 32, cy); x.lineTo(cx + 32, cy + 16); x.lineTo(cx + 16, cy + 24); x.lineTo(cx, cy + 16); x.fill(); } }
  if (pattern === 'woven') { x.strokeStyle = dark; x.lineWidth = 3; for (let i = 0; i < S; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); } x.strokeStyle = light; for (let j = 0; j < S; j += 10) { x.beginPath(); x.moveTo(0, j); x.lineTo(S, j); x.stroke(); } }
  if (pattern === 'lacing') { const cols = ['#d62828', '#f8f9fa', '#1d3557', '#ffb703']; for (let j = 0; j < S; j += 16) { x.fillStyle = dark; x.fillRect(0, j, S, 3); for (let i = 0; i < S; i += 12) { x.fillStyle = cols[(j / 16) % 4 | 0]; x.fillRect(i + 3, j + 5, 5, 9); } } }
  if (pattern === 'pleats') { x.fillStyle = dark; for (let i = 0; i < S; i += 22) x.fillRect(i, 0, 3, S); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  fabricCache.set(key, t); return t;
}
const matCache = new Map();
function cloth(color, pattern = 'plain', rough = 0.9) {
  const key = color + '|' + pattern + rough; if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: fabricTexture(color, pattern), roughness: rough });
  matCache.set(key, m); return m;
}
function solid(color, o = {}) { const key = 's' + color + JSON.stringify(o); if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...o })); return matCache.get(key); }

// Visage dessiné (texture de la tête)
const faceCache = new Map();
function faceMat(skin, fem, age) {
  const key = skin + '|' + fem + '|' + age; if (faceCache.has(key)) return faceCache.get(key);
  const W = 256, Hh = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const x = cv.getContext('2d');
  x.fillStyle = hex(skin); x.fillRect(0, 0, W, Hh);
  const cx = W * 0.25, ey = Hh * 0.5;
  x.fillStyle = 'rgba(255,120,120,.18)'; x.beginPath(); x.ellipse(cx - 17, ey + 14, 8, 5, 0, 0, 7); x.ellipse(cx + 17, ey + 14, 8, 5, 0, 0, 7); x.fill();
  for (const s of [-1, 1]) {
    x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx + s * 12, ey, 6.5, 3.6, s * -0.12, 0, 7); x.fill();
    x.fillStyle = '#2b1b12'; x.beginPath(); x.arc(cx + s * 12, ey + 0.4, 3.1, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + s * 12 + 1, ey - 0.8, 0.9, 0, 7); x.fill();
    x.strokeStyle = '#1b120c'; x.lineWidth = fem ? 1.8 : 1.4; x.beginPath(); x.ellipse(cx + s * 12, ey, 7, 4, s * -0.12, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    x.strokeStyle = age > 1 ? '#bdbdbd' : '#2b1b12'; x.lineWidth = fem ? 1.6 : 2.6; x.beginPath(); x.moveTo(cx + s * 5, ey - 8); x.quadraticCurveTo(cx + s * 12, ey - 11, cx + s * 19, ey - 8); x.stroke();
  }
  x.strokeStyle = 'rgba(120,70,50,.45)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, ey + 3); x.lineTo(cx - 2, ey + 12); x.lineTo(cx + 2, ey + 13); x.stroke();
  x.strokeStyle = fem ? '#c9184a' : '#8d4b3a'; x.lineWidth = fem ? 2.6 : 2; x.beginPath(); x.moveTo(cx - 6, ey + 21); x.quadraticCurveTo(cx, ey + 24, cx + 6, ey + 21); x.stroke();
  if (age > 1) { x.strokeStyle = 'rgba(90,60,40,.35)'; x.lineWidth = 1; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx + s * 18, ey + 6); x.lineTo(cx + s * 22, ey + 4); x.stroke(); } x.beginPath(); x.moveTo(cx - 10, ey - 14); x.lineTo(cx + 10, ey - 14); x.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }); faceCache.set(key, m); return m;
}

// ───────── Formes
function mesh(geo, mat, cast = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; }
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const cylG = (rt, rb, h, s = 12) => { const g = new THREE.CylinderGeometry(rt, rb, h, s); return g; };
function limb(rt, rb, len, mat, s = 10) { const g = cylG(rt, rb, len, s); g.translate(0, -len / 2, 0); return mesh(g, mat); }

const SKINS = [0xf1c9a5, 0xe8b98f, 0xdba67c, 0xf5d5b8, 0xc98e66];
const HAIR = 0x1c140f;

// Choix du costume selon la coiffure / le rôle et l'époque
function outfitFor(look, era) {
  if (look.outfit) return look.outfit;
  switch (look.hat) {
    case 'kabuto': return 'armor';
    case 'eboshi': return 'noble';
    case 'longhair': return 'heian';
    case 'bald': return 'monk';
    case 'crown': return 'queen';
    case 'band': return era <= 1 ? 'jomon' : 'short';
    case 'straw': return 'short';
    case 'topknot': return 'hakama';
    case 'bun': return 'kimono';
    case 'cap': return era >= 7 ? 'worker' : 'western';
    case 'ribbon': return 'student';
    case 'ponytail': return 'sailor';
    case 'hair': return era >= 8 ? 'suit' : 'western';
    case 'robot': return 'robot';
    default: return 'kimono';
  }
}
const FEM = new Set(['heian', 'queen', 'kimono', 'student', 'sailor']);

// ───────── Construction d'un personnage
export function person(look = {}, era = 3, seed = 1) {
  const robe = look.robe ?? 0x457b9d, accent = look.accent ?? 0xffd166;
  const kind = outfitFor(look, era);
  const fem = FEM.has(kind) || look.fem;
  const skin = look.skin ?? SKINS[Math.abs(seed) % SKINS.length];
  const age = look.age ?? 0;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const pat = look.pattern || (kind === 'kimono' ? ['sakura', 'asanoha', 'seigaiha', 'kikko'][seed % 4] : kind === 'heian' ? 'kikko' : kind === 'student' ? 'yagasuri' : kind === 'jomon' ? 'woven' : kind === 'short' ? (seed % 2 ? 'shima' : 'ichimatsu') : 'plain');
  const robeM = cloth(robe, pat), accM = cloth(accent, 'plain'), skinM = solid(skin, { roughness: 0.6 }), hairM = solid(HAIR, { roughness: 0.45 });
  const darkM = solid(0x1b1b1b), whiteM = cloth(0xf8f9fa, 'plain'), sandalM = solid(0xc9a66b);
  const R = { body };

  // Bassin / torse / tête
  const hipY = 0.98;
  const hips = at(new THREE.Group(), 0, hipY, 0); body.add(hips); R.hips = hips;
  const torso = at(new THREE.Group(), 0, 0, 0); hips.add(torso); R.torso = torso;
  const modern = ['western', 'suit', 'sailor', 'worker'].includes(kind);
  const topM = kind === 'suit' ? cloth(robe, 'plain', 0.6) : kind === 'sailor' ? whiteM : kind === 'jomon' ? robeM : kind === 'monk' ? cloth(0x2b2d42, 'plain') : robeM;
  const chest = mesh(cylG(0.2, 0.16, 0.58, 14), topM); chest.scale.set(1.15, 1, 0.75); at(chest, 0, 0.29, 0); torso.add(chest); R.chest = chest;
  if (!modern && kind !== 'jomon' && kind !== 'robot') {
    // col croisé (gauche sur droite) et obi
    const col1 = mesh(new THREE.BoxGeometry(0.05, 0.42, 0.02), whiteM); col1.rotation.z = 0.5; at(col1, 0.03, 0.4, 0.155); torso.add(col1);
    const col2 = mesh(new THREE.BoxGeometry(0.05, 0.42, 0.02), cloth(robe, 'plain')); col2.rotation.z = -0.5; at(col2, -0.02, 0.4, 0.165); torso.add(col2);
    const obi = mesh(cylG(0.2, 0.2, 0.16, 16), accM); obi.scale.set(1.15, 1, 0.78); at(obi, 0, 0.1, 0); torso.add(obi);
    if (fem) { const bow = mesh(new THREE.BoxGeometry(0.34, 0.2, 0.12), accM); at(bow, 0, 0.14, -0.2); torso.add(bow); }
  }
  if (kind === 'suit') { const sh = mesh(new THREE.BoxGeometry(0.12, 0.3, 0.02), whiteM); at(sh, 0, 0.42, 0.16); torso.add(sh); const tie = mesh(new THREE.BoxGeometry(0.04, 0.26, 0.02), cloth(accent)); at(tie, 0, 0.4, 0.172); torso.add(tie); }
  if (kind === 'sailor') { const col = mesh(new THREE.BoxGeometry(0.42, 0.04, 0.28), cloth(0x1d3557)); at(col, 0, 0.56, -0.08); torso.add(col); const sc = mesh(new THREE.BoxGeometry(0.08, 0.14, 0.03), cloth(accent)); at(sc, 0, 0.42, 0.17); torso.add(sc); }
  if (kind === 'worker') { const bib = mesh(new THREE.BoxGeometry(0.26, 0.3, 0.02), cloth(0x1d4ed8)); at(bib, 0, 0.3, 0.155); torso.add(bib); }
  if (kind === 'armor') {
    const dou = mesh(cylG(0.23, 0.2, 0.46, 14), cloth(0x2b2b2b, 'lacing', 0.5)); dou.scale.set(1.15, 1, 0.82); at(dou, 0, 0.32, 0); torso.add(dou);
    const kus = mesh(cylG(0.24, 0.32, 0.3, 14, 1), cloth(robe === 0x1d3557 ? 0x2b2b2b : robe, 'lacing', 0.5)); kus.scale.set(1.1, 1, 0.85); at(kus, 0, -0.12, 0); hips.add(kus);
  }
  if (kind === 'monk') { const kesa = mesh(new THREE.BoxGeometry(0.1, 0.62, 0.36), cloth(0xd4a373, 'plain')); kesa.rotation.z = 0.55; at(kesa, 0.02, 0.32, 0); kesa.scale.set(1, 1, 1.05); torso.add(kesa); }
  if (kind === 'queen') { for (let i = 0; i < 7; i++) { const b = mesh(new THREE.SphereGeometry(0.03, 8, 6), solid(i % 2 ? 0x2ec4b6 : 0xffd166, { metalness: 0.4 })); const a = -0.9 + i * 0.3; at(b, Math.sin(a) * 0.17, 0.52 - Math.cos(a) * 0.08, 0.12 + Math.cos(a) * 0.03); torso.add(b); } }

  const neck = mesh(cylG(0.055, 0.065, 0.12, 8), skinM); at(neck, 0, 0.62, 0); torso.add(neck);
  const head = at(new THREE.Group(), 0, 0.76, 0); torso.add(head); R.head = head;
  const skull = mesh(new THREE.SphereGeometry(0.118, 20, 14), faceMat(skin, fem, age)); skull.scale.set(0.92, 1.06, 0.98); skull.rotation.y = 0; head.add(skull);
  for (const s of [-1, 1]) { const ear = mesh(new THREE.SphereGeometry(0.025, 6, 6), skinM); ear.scale.set(0.5, 1, 0.8); at(ear, s * 0.108, 0, 0); head.add(ear); }
  addHair(head, look.hat, hairM, accM, kind, age, root);

  // Bras
  const sleeveWide = ['kimono', 'heian', 'noble', 'queen', 'monk', 'hakama', 'student', 'short', 'armor'].includes(kind);
  const armTop = kind === 'jomon' ? skinM : modern ? (kind === 'sailor' ? whiteM : topM) : robeM;
  for (const s of [-1, 1]) {
    const sh = at(new THREE.Group(), s * 0.24, 0.52, 0); torso.add(sh);
    sh.add(limb(0.055, 0.05, 0.29, armTop));
    if (sleeveWide && kind !== 'armor') { const sl = mesh(new THREE.BoxGeometry(0.1, kind === 'heian' || kind === 'queen' ? 0.5 : 0.36, 0.26), kind === 'monk' ? cloth(0x2b2d42) : robeM); at(sl, s * 0.02, kind === 'heian' ? -0.3 : -0.22, 0); sh.add(sl); }
    if (kind === 'armor') { const sode = mesh(new THREE.BoxGeometry(0.05, 0.26, 0.2), cloth(0x2b2b2b, 'lacing', 0.5)); at(sode, s * 0.06, -0.12, 0); sh.add(sode); }
    const el = at(new THREE.Group(), 0, -0.29, 0); sh.add(el);
    el.add(limb(0.048, 0.04, 0.26, kind === 'jomon' || kind === 'short' ? skinM : armTop));
    const hand = mesh(new THREE.SphereGeometry(0.045, 10, 8), skinM); hand.scale.set(0.85, 1.2, 0.6); at(hand, 0, -0.3, 0); el.add(hand);
    R[s < 0 ? 'armR' : 'armL'] = sh; R[s < 0 ? 'foreR' : 'foreL'] = el;
  }

  // Jambes et bas du vêtement
  const longRobe = ['kimono', 'heian', 'queen', 'monk', 'noble'].includes(kind);
  const legM = kind === 'jomon' || kind === 'sailor' || kind === 'short' ? skinM : ['hakama', 'armor', 'student'].includes(kind) ? cloth(kind === 'student' ? 0x7b2cbf : kind === 'armor' ? 0x3d2b1f : accent === 0xffd166 ? 0x2b2d42 : accent, 'pleats') : kind === 'suit' ? topM : kind === 'worker' ? cloth(0x1d4ed8) : modern ? cloth(0x343a40) : robeM;
  const wideLeg = ['hakama', 'armor', 'student'].includes(kind);
  for (const s of [-1, 1]) {
    const hip = at(new THREE.Group(), s * 0.095, 0, 0); hips.add(hip);
    hip.add(limb(wideLeg ? 0.12 : 0.075, wideLeg ? 0.14 : 0.062, 0.46, legM));
    const knee = at(new THREE.Group(), 0, -0.46, 0); hip.add(knee);
    const shinM = kind === 'short' ? cloth(0xe9ecef, 'shima') : kind === 'sailor' ? cloth(0x1d3557) : legM;
    knee.add(limb(wideLeg ? 0.14 : 0.06, wideLeg ? 0.17 : 0.048, 0.44, shinM));
    const footM = modern || kind === 'student' ? darkM : kind === 'jomon' ? skinM : sandalM;
    const foot = mesh(new THREE.BoxGeometry(0.09, 0.05, 0.22), footM); at(foot, 0, -0.47, 0.05); knee.add(foot);
    if (!modern && kind !== 'jomon' && kind !== 'student') { const tabi = mesh(new THREE.BoxGeometry(0.075, 0.06, 0.18), whiteM); at(tabi, 0, -0.42, 0.04); knee.add(tabi); }
    R[s < 0 ? 'legR' : 'legL'] = hip; R[s < 0 ? 'kneeR' : 'kneeL'] = knee;
  }
  if (longRobe) {
    const wide = kind === 'heian' || kind === 'queen' ? 0.46 : 0.27;
    const skirt = mesh(cylG(0.21, wide, 0.92, 18), robeM); skirt.scale.set(1.05, 1, 0.85); at(skirt, 0, -0.44, 0); hips.add(skirt); R.skirt = skirt;
    if (kind === 'heian') { [0xffafcc, 0x9d4edd, 0xfcbf49].forEach((c, i) => { const l = mesh(cylG(wide + 0.01 * (i + 1), wide + 0.03 * (i + 1), 0.06, 18), cloth(c)); l.scale.set(1.05, 1, 0.85); at(l, 0, -0.88 + i * 0.05, 0); hips.add(l); }); }
  }
  if (kind === 'short' || kind === 'jomon') { const sk = mesh(cylG(0.2, 0.26, 0.42, 16), robeM); sk.scale.set(1.08, 1, 0.82); at(sk, 0, -0.18, 0); hips.add(sk); R.skirt = sk; }
  if (kind === 'sailor') { const sk = mesh(cylG(0.19, 0.29, 0.36, 16), cloth(0x1d3557, 'pleats')); sk.scale.set(1.05, 1, 0.85); at(sk, 0, -0.16, 0); hips.add(sk); R.skirt = sk; }

  if (kind === 'robot') { body.clear(); robot(body, robe, accent); }

  // Animation
  let phase = seed * 1.7;
  root.userData.anim = (t, speed = 0, talk = false, dt = 0.016) => {
    if (kind === 'robot') { body.rotation.y = Math.sin(t * 1.5) * 0.15; body.position.y = Math.sin(t * 3) * 0.03; return; }
    const amt = Math.min(1, speed / 6); phase += dt * (3 + speed * 0.9);
    const sw = Math.sin(phase) * amt;
    R.legL.rotation.x = sw * 0.62; R.legR.rotation.x = -sw * 0.62;
    R.kneeL.rotation.x = Math.max(0, -Math.sin(phase)) * 0.9 * amt; R.kneeR.rotation.x = Math.max(0, Math.sin(phase)) * 0.9 * amt;
    R.armL.rotation.x = -sw * 0.5; R.armR.rotation.x = sw * 0.5;
    R.foreL.rotation.x = -0.25 - amt * 0.3; R.foreR.rotation.x = -0.25 - amt * 0.3;
    R.armL.rotation.z = 0.08; R.armR.rotation.z = -0.08;
    body.position.y = Math.abs(Math.cos(phase)) * 0.045 * amt;
    R.torso.rotation.y = sw * 0.12; R.torso.rotation.x = amt * 0.06;
    if (R.skirt) R.skirt.rotation.x = Math.sin(phase * 2) * 0.03 * amt;
    const breath = Math.sin(t * 1.8 + seed) * 0.012 * (1 - amt);
    R.chest.scale.y = 1 + breath; R.head.rotation.y = (1 - amt) * Math.sin(t * 0.4 + seed) * 0.25;
    if (talk) { R.armR.rotation.x = -0.9 + Math.sin(t * 4) * 0.15; R.foreR.rotation.x = -0.7; R.armR.rotation.z = -0.25; R.head.rotation.x = Math.sin(t * 5) * 0.05; } else R.head.rotation.x = 0;
  };
  root.userData.height = 1.95; root.userData.torso = torso;
  return root;
}

function addHair(head, hat, hairM, accM, kind, age, root) {
  const gray = age > 1 ? solid(0xcfcfcf, { roughness: 0.5 }) : hairM;
  const cap = (sx = 1, sy = 0.9, sz = 1, y = 0.03, z = -0.012) => { const h = mesh(new THREE.SphereGeometry(0.125, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), gray); h.scale.set(sx, sy, sz); at(h, 0, y, z); head.add(h); return h; };
  switch (hat) {
    case 'straw': { cap(); const kasa = mesh(new THREE.ConeGeometry(0.42, 0.2, 24, 1, true), solid(0xd9a95b, { side: THREE.DoubleSide, roughness: 0.95 })); at(kasa, 0, 0.17, 0); head.add(kasa); const k2 = mesh(new THREE.ConeGeometry(0.42, 0.2, 24), solid(0xc9963f)); k2.scale.set(0.98, 0.95, 0.98); at(k2, 0, 0.165, 0); head.add(k2); break; }
    case 'band': { cap(1, 0.95); const knot = mesh(new THREE.SphereGeometry(0.06, 10, 8), gray); at(knot, 0, 0.1, -0.08); head.add(knot); const band = mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 20), accM); band.rotation.x = Math.PI / 2; at(band, 0, 0.05, 0); head.add(band); break; }
    case 'crown': { cap(); const long = mesh(new THREE.BoxGeometry(0.22, 0.7, 0.05), hairM); at(long, 0, -0.32, -0.1); head.add(long); const cr = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.07, 14, 1, true), solid(0xffc93c, { metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide })); at(cr, 0, 0.1, 0); head.add(cr); break; }
    case 'eboshi': { cap(1, 0.8); const e = mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.3, 12), solid(0x111111, { roughness: 0.3 })); e.rotation.x = -0.25; at(e, 0, 0.2, -0.03); head.add(e); break; }
    case 'kabuto': { const k = mesh(new THREE.SphereGeometry(0.15, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), solid(0x222222, { metalness: 0.5, roughness: 0.35 })); at(k, 0, 0.02, 0); head.add(k); const sh = mesh(new THREE.ConeGeometry(0.26, 0.14, 18, 1, true), solid(0x2b2b2b, { side: THREE.DoubleSide, metalness: 0.4 })); at(sh, 0, -0.02, -0.02); head.add(sh); for (const s of [-1, 1]) { const kw = mesh(new THREE.BoxGeometry(0.02, 0.22, 0.01), solid(0xffc93c, { metalness: 0.9, roughness: 0.25 })); kw.rotation.z = s * -0.4; at(kw, s * 0.05, 0.2, 0.11); head.add(kw); } break; }
    case 'longhair': { cap(1.03, 0.95); const back = mesh(new THREE.BoxGeometry(0.24, 1.55, 0.06), hairM); at(back, 0, -0.72, -0.11); head.add(back); for (const s of [-1, 1]) { const side = mesh(new THREE.BoxGeometry(0.04, 0.3, 0.1), hairM); at(side, s * 0.11, -0.08, 0.02); head.add(side); } break; }
    case 'bald': break;
    case 'topknot': { const h = cap(1, 0.6, 1, 0.0, -0.03); h.scale.set(1, 0.55, 1); const mage = mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.13, 6), hairM); mage.rotation.x = Math.PI / 2; at(mage, 0, 0.12, 0.0); head.add(mage); for (const s of [-1, 1]) { const side = mesh(new THREE.SphereGeometry(0.07, 8, 6), hairM); at(side, s * 0.09, 0.0, -0.04); head.add(side); } break; }
    case 'bun': { cap(1.05, 0.95); const b = mesh(new THREE.SphereGeometry(0.09, 12, 10), gray); b.scale.set(1.3, 0.8, 0.9); at(b, 0, 0.13, -0.07); head.add(b); const k = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 5), accM); k.rotation.z = Math.PI / 2; at(k, 0, 0.15, -0.06); head.add(k); const fl = mesh(new THREE.SphereGeometry(0.025, 8, 6), accM); at(fl, 0.1, 0.16, -0.05); head.add(fl); break; }
    case 'cap': { cap(); const c = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16), solid(0x343a40)); at(c, 0, 0.1, 0); head.add(c); const v = mesh(new THREE.BoxGeometry(0.16, 0.012, 0.1), solid(0x212529)); at(v, 0, 0.08, 0.13); head.add(v); break; }
    case 'ponytail': { cap(1.03, 0.95); const p = mesh(new THREE.ConeGeometry(0.05, 0.32, 8), hairM); p.rotation.x = 2.8; at(p, 0, -0.08, -0.15); head.add(p); const bangs = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.03), hairM); at(bangs, 0, 0.07, 0.1); head.add(bangs); break; }
    case 'ribbon': { cap(1.04, 0.95); const back = mesh(new THREE.BoxGeometry(0.22, 0.35, 0.05), hairM); at(back, 0, -0.15, -0.1); head.add(back); for (const s of [-1, 1]) { const r = mesh(new THREE.SphereGeometry(0.06, 8, 6), accM); r.scale.set(1.4, 0.8, 0.4); at(r, s * 0.06, 0.1, -0.12); head.add(r); } break; }
    case 'robot': break;
    default: { cap(1.02, 0.85); const bangs = mesh(new THREE.BoxGeometry(0.2, 0.04, 0.03), gray); at(bangs, 0, 0.075, 0.1); head.add(bangs); }
  }
}
function robot(body, c, accent) {
  const m = solid(c, { metalness: 0.3, roughness: 0.35 }), a = solid(accent, { emissive: accent, emissiveIntensity: 0.9 });
  const b = mesh(cylG(0.22, 0.3, 0.7, 20), m); at(b, 0, 0.45, 0); body.add(b);
  const h = mesh(new THREE.SphereGeometry(0.24, 20, 14), m); at(h, 0, 1.0, 0); body.add(h);
  const v = mesh(new THREE.SphereGeometry(0.16, 16, 10), solid(0x111111, { roughness: 0.1 })); v.scale.set(1.2, 0.7, 0.5); at(v, 0, 1.0, 0.16); body.add(v);
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.035, 8, 6), a); at(e, s * 0.07, 1.02, 0.23); body.add(e); const arm = mesh(cylG(0.04, 0.05, 0.4, 8), m); arm.rotation.z = s * 0.3; at(arm, s * 0.3, 0.55, 0); body.add(arm); }
  const tab = mesh(new THREE.BoxGeometry(0.24, 0.16, 0.02), a); at(tab, 0, 0.55, 0.27); body.add(tab);
}

// Tenues des passants selon l'époque
export const CROWD = [
  [{ hat: 'band', robe: 0x8d6e63, accent: 0xd4a373 }, { hat: 'band', robe: 0x6d8b74, accent: 0xe9c46a }, { hat: 'band', robe: 0xa47148, accent: 0x2a9d8f }],
  [{ hat: 'band', robe: 0xe9c46a, accent: 0x6a4c2a }, { hat: 'straw', robe: 0xd4a373, accent: 0x3a5a40 }, { hat: 'band', robe: 0xf1faee, accent: 0xd62828 }],
  [{ hat: 'eboshi', robe: 0x2a9d8f, accent: 0xffd166 }, { hat: 'bun', robe: 0xe5989b, accent: 0x6a4c93 }, { hat: 'bald', robe: 0x8d6e63, accent: 0xffd166 }, { hat: 'straw', robe: 0xa3b18a, accent: 0x5e3b2a }],
  [{ hat: 'longhair', robe: 0xff8fab, accent: 0x6a4c93 }, { hat: 'eboshi', robe: 0x1d3557, accent: 0xffd166 }, { hat: 'longhair', robe: 0x9d4edd, accent: 0xffafcc }, { hat: 'straw', robe: 0x8d99ae, accent: 0x2b2d42 }],
  [{ hat: 'topknot', robe: 0x3a5a40, accent: 0xdda15e }, { hat: 'bald', robe: 0x2b2d42, accent: 0xf2cc8f }, { hat: 'bun', robe: 0x6d597a, accent: 0xe5989b }, { hat: 'kabuto', robe: 0x780000, accent: 0xffd166 }],
  [{ hat: 'kabuto', robe: 0x023e8a, accent: 0xffd166 }, { hat: 'topknot', robe: 0x6a040f, accent: 0xffd166 }, { hat: 'straw', robe: 0xb08055, accent: 0x343a40 }, { hat: 'bun', robe: 0xe76f51, accent: 0x2a9d8f }],
  [{ hat: 'bun', robe: 0xe76f51, accent: 0x2a9d8f }, { hat: 'topknot', robe: 0x1d3557, accent: 0xe9c46a }, { hat: 'straw', robe: 0x8d99ae, accent: 0x2b2d42 }, { hat: 'bun', robe: 0x457b9d, accent: 0xffafcc }],
  [{ hat: 'ribbon', robe: 0xc77dff, accent: 0xd62828 }, { hat: 'cap', robe: 0x343a40, accent: 0xffbe0b }, { hat: 'hair', robe: 0x495057, accent: 0x1d3557 }, { hat: 'bun', robe: 0x457b9d, accent: 0xffafcc }],
  [{ hat: 'ponytail', robe: 0x1d3557, accent: 0xff4d6d }, { hat: 'hair', robe: 0x343a40, accent: 0x1d3557 }, { hat: 'hair', robe: 0x6c757d, accent: 0xd62828, outfit: 'western' }, { hat: 'cap', robe: 0xff7f11, accent: 0x1d3557, outfit: 'western' }],
];
