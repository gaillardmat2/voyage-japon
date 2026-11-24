// Monuments et décors construits à partir de formes simples (low-poly coloré).
import * as THREE from 'three';

// ───────── Outils de base
import { get as T } from './textures.js';
const matCache = new Map();
// Choix du matériau réaliste selon la couleur (bois, pierre, tuiles, or…)
const KIND = {
  0x8d5a3b: 'wood', 0x5d3a24: 'wood', 0x6b4226: 'wood', 0x5e3b2a: 'wood', 0x7a2e1f: 'wood', 0xa0703a: 'wood', 0xb08055: 'wood', 0xc9a66b: 'wood', 0x6d4c41: 'wood', 0x4e342e: 'wood', 0x7f5539: 'wood', 0xa47148: 'wood', 0xc49a6c: 'wood', 0x8d6e63: 'wood', 0x5d4037: 'wood',
  0xb0aaa0: 'stone', 0x9e9e9e: 'stone', 0x9a9a9a: 'stone', 0xbdbdbd: 'stone', 0xe8e2d0: 'stone', 0x8a8680: 'stone', 0xcfcfcf: 'stone', 0xd6d6d6: 'stone', 0xbcb8b1: 'stone', 0x8a8a8a: 'stone', 0xa58f78: 'stone', 0x616161: 'stone',
  0x3d4f5c: 'tiles', 0x2f3e46: 'tiles', 0x50606e: 'tiles', 0x5c6f7b: 'tiles', 0x546e7a: 'tiles', 0x3e2723: 'tiles', 0x37474f: 'tiles', 0x40594b: 'tiles',
  0xd9a95b: 'thatch', 0xe0b07a: 'thatch', 0xd4a373: 'thatch', 0xb5833f: 'thatch',
  0xf8f1e5: 'plaster', 0xf3e5c8: 'plaster', 0xf1e3c8: 'plaster', 0xfbfbf7: 'plaster', 0xe8dcc7: 'plaster', 0xf3efe6: 'plaster', 0xefe6d4: 'dirt', 0xf2d6a2: 'dirt', 0xc9b79c: 'dirt',
  0x5f9e86: 'bronze', 0xd4a017: 'bronze',
  0xb5453a: 'brick', 0x2b2b35: 'asphalt', 0x3a3a52: 'asphalt',
};
const METAL = new Set([0xffc93c, 0xffcc33, 0x5f9e86, 0xd4a017, 0x8e8e8e, 0x777777, 0x4a4a4a]);
export function M(color, o = {}) {
  if (color && color.isColor) color = color.getHex();
  const key = color + '|' + JSON.stringify(o);
  if (!matCache.has(key)) {
    const kind = KIND[color] || 'grain';
    const metal = METAL.has(color);
    const p = {
      color, roughness: metal ? 0.32 : kind === 'tiles' ? 0.55 : kind === 'plaster' ? 0.95 : 0.85, metalness: metal ? 0.85 : 0,
      map: T(kind), bumpMap: T('grainBump'), bumpScale: kind === 'grain' ? 0.6 : 1.4, ...o,
    };
    if (o.wireframe) { delete p.map; delete p.bumpMap; }
    matCache.set(key, new THREE.MeshStandardMaterial(p));
  }
  return matCache.get(key);
}
function mk(geo, color, o) {
  const m = new THREE.Mesh(geo, M(color, o));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export const box = (w, h, d, c, o) => mk(new THREE.BoxGeometry(w, h, d), c, o);
export const cyl = (rt, rb, h, c, s = 12, o) => mk(new THREE.CylinderGeometry(rt, rb, h, s), c, o);
export const cone = (r, h, c, s = 12, o) => mk(new THREE.ConeGeometry(r, h, s), c, o);
export const sph = (r, c, w = 14, hs = 10, o) => mk(new THREE.SphereGeometry(r, w, hs), c, o);
export function P(o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); return o; }
export function S(o, x, y = x, z = x) { o.scale.set(x, y, z); return o; }
export function R(o, x = 0, y = 0, z = 0) { o.rotation.set(x, y, z); return o; }
export function G(...kids) { const g = new THREE.Group(); kids.forEach(k => g.add(k)); return g; }

// Toit en pyramide (croupe) : origine en bas, taille w × d, hauteur h
export function roof(w, d, h, c) {
  const m = cone(Math.SQRT1_2, 1, c, 4);
  m.rotation.y = Math.PI / 4; m.position.y = 0.5;
  const g = G(m); g.scale.set(w, h, d); return g;
}
// Toit à deux pans (pignon) : faîtage selon z
export function gable(w, d, h, c) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  geo.translate(0, 0, -d / 2);
  return mk(geo, c);
}
export const WATERS = [];
export function water(w, d, c = 0x4fc3f7, round = false) {
  const geo = round ? new THREE.CircleGeometry(0.5, 48) : new THREE.PlaneGeometry(1, 1);
  const n = T('waterNormal').clone(); n.needsUpdate = true; n.repeat.set(w / 6, d / 6);
  const col = new THREE.Color(c).lerp(new THREE.Color(0x0b3d4f), 0.55);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.06, metalness: 0.35, normalMap: n, normalScale: new THREE.Vector2(0.6, 0.6), transparent: true, opacity: 0.92 }));
  m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.position.y = 0.06; m.receiveShadow = true;
  WATERS.push(n);
  return m;
}
export function textTexture(lines, { w = 512, h = 256, bg = '#fff8e7', fg = '#3b2a1a', font = 'bold 90px serif', border = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  if (border) { x.strokeStyle = border; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16); }
  x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines];
  arr.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (arr.length - 1) / 2) * (h / (arr.length + 0.6))));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function panel(w, h, tex, emissive = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, emissive: emissive ? 0xffffff : 0x000000, emissiveMap: emissive ? tex : null, side: THREE.DoubleSide }));
  return m;
}
let seed = 1;
export function rng(s) { seed = s; }
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

const WOOD = 0x8d5a3b, DARKWOOD = 0x5d3a24, STRAW = 0xd9a95b, STONE = 0xb0aaa0, VERM = 0xd9381e, ROOF = 0x3d4f5c, WHITE = 0xf8f1e5, GOLD = 0xffc93c;

// Personnage générique (aussi utilisé pour les PNJ)
export function person({ robe = 0x457b9d, accent = 0xffd166, skin = 0xf5cba7, hat = 'hair' } = {}) {
  const g = new THREE.Group();
  if (hat === 'robot') {
    g.add(P(cyl(0.55, 0.75, 1.3, robe, 16), 0, 0.75, 0));
    g.add(P(sph(0.5, robe), 0, 1.75, 0));
    g.add(P(S(sph(0.28, 0x111111), 1, 0.7, 0.3), 0, 1.78, 0.42));
    g.add(P(sph(0.07, accent, 8, 6, { emissive: accent }), -0.12, 1.8, 0.5));
    g.add(P(sph(0.07, accent, 8, 6, { emissive: accent }), 0.12, 1.8, 0.5));
    g.add(P(cyl(0.02, 0.02, 0.4, 0x888888, 6), 0, 2.35, 0));
    g.add(P(sph(0.08, 0xff006e, 8, 6, { emissive: 0xff006e }), 0, 2.58, 0));
    g.add(P(S(sph(0.3, accent), 1, 1, 0.3), 0, 0.95, 0.6));
    return g;
  }
  // corps (kimono / vêtement)
  g.add(P(cone(0.62, 1.55, robe, 14), 0, 0.78, 0));
  g.add(P(cyl(0.3, 0.42, 0.5, robe, 12), 0, 1.45, 0));
  g.add(P(cyl(0.44, 0.44, 0.14, accent, 14), 0, 1.05, 0)); // ceinture (obi)
  g.add(P(R(cyl(0.11, 0.11, 0.8, robe, 8), 0, 0, 0.35), -0.42, 1.25, 0));
  g.add(P(R(cyl(0.11, 0.11, 0.8, robe, 8), 0, 0, -0.35), 0.42, 1.25, 0));
  g.add(P(sph(0.1, skin, 8, 6), -0.56, 0.9, 0));
  g.add(P(sph(0.1, skin, 8, 6), 0.56, 0.9, 0));
  // tête
  g.add(P(sph(0.36, skin), 0, 1.98, 0));
  g.add(P(sph(0.045, 0x222222, 6, 4), -0.12, 2.02, 0.32));
  g.add(P(sph(0.045, 0x222222, 6, 4), 0.12, 2.02, 0.32));
  g.add(P(S(sph(0.06, 0xff8fa3, 6, 4), 1, 0.6, 0.5), -0.2, 1.92, 0.28));
  g.add(P(S(sph(0.06, 0xff8fa3, 6, 4), 1, 0.6, 0.5), 0.2, 1.92, 0.28));
  const hairC = 0x2b2118;
  switch (hat) {
    case 'straw': g.add(P(cone(0.85, 0.42, STRAW, 16), 0, 2.4, 0)); break;
    case 'band': g.add(P(S(sph(0.38, hairC), 1, 0.8, 1), 0, 2.1, -0.04)); g.add(P(cyl(0.38, 0.38, 0.1, accent, 14), 0, 2.15, 0)); break;
    case 'crown':
      g.add(P(S(sph(0.38, hairC), 1, 0.8, 1), 0, 2.1, -0.05));
      g.add(P(cyl(0.3, 0.34, 0.25, GOLD, 10, { emissive: 0x7a4b00 }), 0, 2.38, 0));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(P(cone(0.06, 0.25, GOLD, 5), Math.sin(a) * 0.3, 2.6, Math.cos(a) * 0.3)); }
      g.add(P(sph(0.12, 0x2ec4b6, 8, 6), 0, 2.4, 0.33)); break;
    case 'eboshi': g.add(P(R(cyl(0.18, 0.3, 0.7, 0x1b1b1b, 10), -0.25, 0, 0), 0, 2.5, -0.05)); break;
    case 'kabuto':
      g.add(P(S(sph(0.42, 0x2b2b2b), 1, 0.7, 1), 0, 2.16, 0));
      g.add(P(cyl(0.6, 0.6, 0.06, 0x2b2b2b, 16), 0, 2.05, -0.05));
      g.add(P(R(box(0.08, 0.5, 0.04, GOLD, { emissive: 0x553300 }), 0, 0, 0.5), -0.17, 2.55, 0.25));
      g.add(P(R(box(0.08, 0.5, 0.04, GOLD, { emissive: 0x553300 }), 0, 0, -0.5), 0.17, 2.55, 0.25));
      g.add(P(sph(0.07, accent, 8, 6), 0, 2.3, 0.4)); break;
    case 'longhair':
      g.add(P(S(sph(0.4, hairC), 1, 0.85, 1), 0, 2.08, -0.06));
      g.add(P(box(0.6, 1.4, 0.2, hairC), 0, 1.45, -0.35)); break;
    case 'bald': g.add(P(sph(0.05, 0x8d5a3b, 6, 4), 0, 1.6, 0.42)); break;
    case 'topknot': g.add(P(S(sph(0.37, hairC), 1, 0.6, 1), 0, 2.13, -0.08)); g.add(P(R(cyl(0.06, 0.06, 0.35, hairC, 6), Math.PI / 2, 0, 0), 0, 2.38, 0.05)); break;
    case 'bun': g.add(P(S(sph(0.38, hairC), 1, 0.8, 1), 0, 2.1, -0.05)); g.add(P(sph(0.22, hairC), 0, 2.42, -0.15)); g.add(P(cyl(0.02, 0.02, 0.6, accent, 6), 0.1, 2.45, -0.15)); break;
    case 'cap': g.add(P(S(sph(0.38, 0x1d3557), 1, 0.55, 1), 0, 2.15, 0)); g.add(P(box(0.5, 0.05, 0.35, 0x1d3557), 0, 2.15, 0.35)); break;
    case 'ponytail': g.add(P(S(sph(0.39, hairC), 1, 0.85, 1), 0, 2.09, -0.05)); g.add(P(R(cone(0.15, 0.7, hairC, 8), 2.6, 0, 0), 0, 1.95, -0.45)); g.add(P(sph(0.08, accent, 8, 6), 0, 2.2, -0.38)); break;
    case 'ribbon': g.add(P(S(sph(0.39, hairC), 1, 0.85, 1), 0, 2.09, -0.05)); g.add(P(S(sph(0.16, accent), 1.6, 0.8, 0.5), 0, 2.4, -0.2)); break;
    default: g.add(P(S(sph(0.38, hairC), 1, 0.8, 1), 0, 2.1, -0.04));
  }
  return g;
}

export function fox() {
  const o = 0xff8c42, w = 0xfff3e0;
  const g = G(
    P(S(sph(0.45, o), 1, 0.85, 1.25), 0, 0.6, 0),
    P(sph(0.36, o), 0, 1.05, 0.45),
    P(S(sph(0.2, w), 1, 0.7, 1), 0, 0.98, 0.72),
    P(sph(0.06, 0x222222, 6, 4), 0, 1.0, 0.9),
    P(R(cone(0.13, 0.35, o, 6), -0.2, 0, 0.25), -0.18, 1.42, 0.4),
    P(R(cone(0.13, 0.35, o, 6), -0.2, 0, -0.25), 0.18, 1.42, 0.4),
    P(sph(0.05, 0x222222, 6, 4), -0.13, 1.12, 0.75),
    P(sph(0.05, 0x222222, 6, 4), 0.13, 1.12, 0.75),
    P(R(S(sph(0.28, o), 0.8, 0.8, 1.9), 0.9, 0, 0), 0, 0.95, -0.7),
    P(sph(0.2, w), 0, 1.35, -1.12),
    P(cyl(0.3, 0.32, 0.08, 0xd62828, 14), 0, 0.82, 0.32),
  );
  const flame = P(sph(0.14, 0x9bf6ff, 10, 8, { emissive: 0x4cc9f0, emissiveIntensity: 1 }), 0.5, 1.6, -0.2);
  flame.name = 'flame'; g.add(flame);
  return g;
}

// ───────── Monuments : chaque fonction renvoie { g, r, solid?, update? }
export const BUILD = {
  pitHouse() {
    const g = G(
      P(cyl(3, 3.3, 0.8, 0x8d6e63, 16), 0, 0.4, 0),
      P(cone(4.4, 4.6, STRAW, 14), 0, 3.1, 0),
      P(cone(1.2, 1, 0xb5833f, 8), 0, 5.7, 0),
      P(box(1.3, 1.5, 1, 0x3e2723), 0, 0.9, 3.0),
    );
    const h2 = G(P(cyl(2, 2.2, 0.6, 0x8d6e63, 14), 0, 0.3, 0), P(cone(3, 3.3, 0xe0b07a, 12), 0, 2.2, 0));
    g.add(P(h2, -6, 0, -4));
    g.add(P(cyl(0.8, 0.9, 0.3, 0x616161, 10), 4.5, 0.15, 4));
    const fire = P(cone(0.5, 1, 0xff7043, 6, { emissive: 0xff5722, emissiveIntensity: 0.9 }), 4.5, 0.8, 4);
    g.add(fire);
    return { g, r: 6.5, update: t => { fire.scale.y = 1 + Math.sin(t * 9) * 0.25; } };
  },
  pottery() {
    const g = G(P(cyl(3.2, 3.4, 0.4, 0xc9b79c, 20), 0, 0.2, 0));
    const pot = (x, z, s, c) => {
      const p = G(P(cyl(1.1, 0.7, 2.4, c, 16), 0, 1.2, 0), P(cyl(1.35, 1.1, 0.5, c, 16), 0, 2.6, 0));
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; p.add(P(R(cone(0.35, 1, c, 6), Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4), Math.sin(a) * 1.1, 3.2, Math.cos(a) * 1.1)); }
      for (let i = 0; i < 3; i++) p.add(P(cyl(1.02 - i * 0.08, 1.02 - i * 0.08, 0.1, 0x5d3a24, 16), 0, 0.8 + i * 0.5, 0));
      S(p, s); P(p, x, 0.4, z); g.add(p);
    };
    pot(0, 0, 1, 0xc2702b); pot(-2, 1.2, 0.6, 0xa65b23); pot(2, 1, 0.7, 0xd08a4a); pot(1, -2, 0.55, 0xb8652a);
    return { g, r: 4 };
  },
  dogu() {
    const c = 0xb08968;
    const g = G(
      P(box(4, 1, 4, STONE), 0, 0.5, 0),
      P(S(sph(1, c), 1.1, 0.7, 0.8), -0.7, 1.7, 0), P(S(sph(1, c), 1.1, 0.7, 0.8), 0.7, 1.7, 0),
      P(S(sph(1.4, c), 1.2, 1.3, 0.9), 0, 3.3, 0),
      P(R(S(sph(0.6, c), 1, 1.8, 1), 0, 0, 1.1), -1.8, 3.6, 0), P(R(S(sph(0.6, c), 1, 1.8, 1), 0, 0, -1.1), 1.8, 3.6, 0),
      P(S(sph(1.2, c), 1.25, 1, 1), 0, 5.3, 0),
      P(S(sph(0.55, 0x7f5539), 1, 0.45, 0.4), -0.55, 5.35, 1.0), P(S(sph(0.55, 0x7f5539), 1, 0.45, 0.4), 0.55, 5.35, 1.0),
      P(box(1.8, 0.12, 0.1, 0x5e3b22), 0, 5.35, 1.12),
      P(cyl(0.9, 1.1, 0.6, c, 12), 0, 6.4, 0),
    );
    for (let i = 0; i < 5; i++) g.add(P(cyl(1.3, 1.3, 0.08, 0x7f5539, 16), 0, 2.8 + i * 0.3, 0));
    return { g, r: 3.2 };
  },
  shellMound() {
    const g = G(P(S(sph(4.5, 0xd7ccc8, 20, 12), 1, 0.35, 1), 0, 0, 0));
    rng(77);
    for (let i = 0; i < 45; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 3.8, y = Math.sqrt(Math.max(0, 1 - (d / 4.5) ** 2)) * 1.55;
      const c = [0xfff1e6, 0xffcad4, 0xf4acb7, 0xe9edc9][i % 4];
      g.add(P(S(sph(0.35, c, 8, 6), 1, 0.5, 1), Math.cos(a) * d, y, Math.sin(a) * d));
    }
    return { g, r: 4.8 };
  },
  riceField() {
    const g = G(P(water(16, 12, 0x7fd1c7), 0, 0.05, 0));
    for (const [w, d, x, z] of [[16.6, 0.6, 0, 6.2], [16.6, 0.6, 0, -6.2], [0.6, 12, 8.2, 0], [0.6, 12, -8.2, 0], [0.5, 12, 0, 0]]) g.add(P(box(w, 0.4, d, 0x8d6e63), x, 0.2, z));
    for (let i = -7; i <= 7; i++) for (let j = -5; j <= 5; j++) if (i !== 0) g.add(P(cone(0.18, 0.7, 0x8bc34a, 5), i + 0.0, 0.4, j));
    const sc = G(P(cyl(0.08, 0.08, 2.2, WOOD, 6), 0, 1.1, 0), P(R(cyl(0.06, 0.06, 1.8, WOOD, 6), 0, 0, Math.PI / 2), 0, 1.6, 0), P(sph(0.3, 0xf5f5dc), 0, 2.3, 0), P(cone(0.6, 0.4, STRAW, 10), 0, 2.6, 0));
    g.add(P(sc, 4.5, 0, -3));
    return { g, r: 8.5, solid: false };
  },
  granary() {
    const g = new THREE.Group();
    for (const [x, z] of [[-1.6, -1.4], [1.6, -1.4], [-1.6, 1.4], [1.6, 1.4]]) {
      g.add(P(cyl(0.2, 0.2, 2.6, DARKWOOD, 8), x, 1.3, z));
      g.add(P(cyl(0.45, 0.45, 0.1, WOOD, 10), x, 2.2, z));
    }
    g.add(P(box(4.2, 2.4, 3.6, 0xb08055), 0, 3.8, 0));
    g.add(P(R(gable(5.4, 5, 2.8, STRAW), 0, Math.PI / 2, 0), 0, 5, 0));
    g.add(P(R(box(0.6, 3.2, 0.15, WOOD), -0.5, 0, 0), 2.2, 1.6, 2.6));
    return { g, r: 3.6 };
  },
  kofun() {
    const green = 0x4caf50;
    const g = G(
      P(water(26, 32, 0x48cae4, true), 0, 0.05, -1),
      P(S(sph(8, green, 24, 14), 1, 0.45, 1), 0, 0, -5),
      P(S(R(cyl(5.5, 8, 3.4, green, 4), 0, Math.PI / 4, 0), 1.25, 1, 0.8), 0, 1.7, 5),
    );
    rng(5);
    for (let i = 0; i < 16; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 5; g.add(P(cone(0.7, 2.2, 0x2d6a4f, 7), Math.cos(a) * d, 3.2 + rnd() * 0.3, -5 + Math.sin(a) * d)); }
    for (let i = -3; i <= 3; i++) g.add(P(cyl(0.18, 0.2, 0.7, 0xe07a3a, 8), i * 1.4, 3.7, 7.2));
    return { g, r: 13 };
  },
  haniwa() {
    const c = 0xe07a3a, g = G(P(box(10, 0.3, 4, 0x6aa84f), 0, 0.15, 0));
    for (let i = 0; i < 4; i++) {
      const f = G(P(cyl(0.45, 0.6, 2.2, c, 12), 0, 1.4, 0), P(sph(0.45, c), 0, 2.8, 0),
        P(sph(0.09, 0x3b1f0e, 6, 4), -0.15, 2.9, 0.4), P(sph(0.09, 0x3b1f0e, 6, 4), 0.15, 2.9, 0.4), P(sph(0.1, 0x3b1f0e, 6, 4), 0, 2.62, 0.42),
        P(R(cyl(0.12, 0.12, 0.9, c, 6), 0, 0, 0.6), -0.6, 1.9, 0), P(R(cyl(0.12, 0.12, 0.9, c, 6), 0, 0, -1.2), 0.6, 2.1, 0));
      if (i === 1) f.add(P(cone(0.5, 0.6, c, 10), 0, 3.35, 0));
      g.add(P(f, -3.6 + i * 1.9, 0.3, -0.6));
    }
    const horse = G(P(box(2, 1, 0.8, c), 0, 1.6, 0), P(R(box(0.5, 1.2, 0.5, c), 0, 0, -0.5), 1.1, 2.3, 0), P(box(0.9, 0.45, 0.45, c), 1.6, 2.8, 0));
    for (const [x, z] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) horse.add(P(cyl(0.15, 0.18, 1.1, c, 6), x, 0.55, z));
    g.add(P(horse, 3.2, 0.3, 1.2));
    return { g, r: 5 };
  },
  pagoda() {
    const g = G(P(box(7, 0.7, 7, STONE), 0, 0.35, 0));
    let y = 0.7;
    for (let i = 0; i < 5; i++) {
      const s = 4.2 - i * 0.55;
      g.add(P(box(s, 1.7, s, i % 2 ? 0xf1e3c8 : VERM), 0, y + 0.85, 0));
      g.add(P(roof(s + 2.8, s + 2.8, 0.75, ROOF), 0, y + 1.7, 0));
      y += 2.15;
    }
    g.add(P(cyl(0.12, 0.12, 4, GOLD, 6, { emissive: 0x5a3d00 }), 0, y + 2, 0));
    for (let i = 0; i < 7; i++) g.add(P(cyl(0.35, 0.35, 0.1, GOLD, 10), 0, y + 0.8 + i * 0.4, 0));
    return { g, r: 5 };
  },
  suzakumon() {
    const g = G(P(box(14, 0.8, 7, STONE), 0, 0.4, 0));
    for (let i = 0; i < 6; i++) for (const z of [-2, 2]) g.add(P(cyl(0.35, 0.35, 5, VERM, 10), -6 + i * 2.4, 3.3, z));
    g.add(P(box(12.5, 1.2, 5, WHITE), 0, 6.2, 0));
    g.add(P(roof(16, 9, 1.6, ROOF), 0, 6.6, 0));
    g.add(P(box(10, 2.2, 4, VERM), 0, 8.8, 0));
    g.add(P(roof(14, 7.5, 3.2, ROOF), 0, 9.8, 0));
    g.add(P(box(1.2, 0.8, 0.4, GOLD, { emissive: 0x553300 }), -4.5, 12.8, 0));
    g.add(P(box(1.2, 0.8, 0.4, GOLD, { emissive: 0x553300 }), 4.5, 12.8, 0));
    return { g, r: 7.5 };
  },
  deer() {
    const g = new THREE.Group();
    const parts = [];
    g.add(P(cyl(0.3, 0.45, 3, DARKWOOD, 7), 3, 1.5, -2)); g.add(P(sph(2, 0xffb7c5), 3, 4, -2));
    for (let i = 0; i < 4; i++) {
      const c = 0xb5651d, d = G(P(box(1.5, 0.75, 0.6, c), 0, 1.2, 0));
      for (const [x, z] of [[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]]) d.add(P(cyl(0.07, 0.07, 0.9, c, 6), x, 0.45, z));
      const head = G(P(R(box(0.3, 0.8, 0.3, c), 0, 0, -0.4), 0, 0.3, 0), P(box(0.55, 0.35, 0.32, c), 0.3, 0.7, 0), P(sph(0.06, 0x111111, 6, 4), 0.58, 0.72, 0));
      if (i % 2 === 0) { head.add(P(R(cyl(0.03, 0.03, 0.6, 0xe9d8a6, 5), 0, 0, 0.4), 0.1, 1.1, 0.15)); head.add(P(R(cyl(0.03, 0.03, 0.6, 0xe9d8a6, 5), 0, 0, 0.4), 0.1, 1.1, -0.15)); }
      for (let k = 0; k < 5; k++) d.add(P(sph(0.07, 0xfff8e7, 6, 4), -0.5 + k * 0.25, 1.58, (k % 2 ? 0.1 : -0.1)));
      P(head, 0.7, 1.4, 0); d.add(head);
      const a = i * 1.6;
      P(d, Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); d.rotation.y = -a + Math.PI / 2;
      g.add(d); parts.push({ d, head, a });
    }
    return { g, r: 3.5, solid: false, update: t => parts.forEach((p, i) => { p.head.rotation.z = Math.max(0, Math.sin(t * 1.3 + i * 2)) * -0.9; }) };
  },
  todaiji() {
    const g = G(P(box(26, 1, 19, STONE), 0, 0.5, 0));
    for (let i = 0; i < 9; i++) g.add(P(cyl(0.45, 0.45, 7, 0x7a2e1f, 10), -11 + i * 2.75, 4.5, 7.5));
    g.add(P(box(22, 7, 14, 0xf3e5c8), 0, 4.5, -0.5));
    g.add(P(box(23, 0.6, 15, 0x7a2e1f), 0, 8.2, -0.5));
    g.add(P(roof(29, 21, 3, 0x2f3e46), 0, 8.4, -0.5));
    g.add(P(box(17, 3.4, 11, 0x7a2e1f), 0, 12, -0.5));
    g.add(P(roof(24, 16, 6, 0x2f3e46), 0, 13.5, -0.5));
    g.add(P(box(5, 2, 0.3, GOLD, { emissive: 0x6b4500 }), 0, 11.8, 5.1));
    g.add(P(R(cone(0.7, 1.6, GOLD, 6, { emissive: 0x6b4500 }), 0, 0, 0.3), -1.2, 19.8, -0.5));
    g.add(P(R(cone(0.7, 1.6, GOLD, 6, { emissive: 0x6b4500 }), 0, 0, -0.3), 1.2, 19.8, -0.5));
    g.add(P(box(5, 5, 0.3, 0x3b2a1a), 0, 3.5, 6.6));
    const bud = BUILD._buddha(0xd4a017, 0.45); P(bud, 0, 1, 6.2); g.add(bud);
    for (const x of [-9, 9]) g.add(P(cyl(0.6, 0.8, 9, 0xc0392b, 4), x, 4.5, 12));
    return { g, r: 14 };
  },
  _buddha(c, s = 1) {
    const g = G(
      P(cyl(3.6, 3.2, 0.9, 0xe5989b, 16), 0, 0.45, 0),
      P(S(sph(3, c), 1.15, 0.45, 0.85), 0, 1.6, 0),
      P(S(sph(2.1, c), 1, 1.35, 0.8), 0, 4, 0),
      P(sph(1.45, c), 0, 6.9, 0.1),
      P(sph(0.7, c), 0, 8.2, 0.1),
      P(S(sph(0.6, c), 1.4, 0.6, 1), 0, 2.4, 1.6),
      P(S(sph(0.35, c), 0.6, 1.6, 0.6), -1.45, 6.8, 0),
      P(S(sph(0.35, c), 0.6, 1.6, 0.6), 1.45, 6.8, 0),
    );
    S(g, s); return g;
  },
  kamakuraBuddha() {
    const g = G(P(box(10, 1.2, 10, STONE), 0, 0.6, 0));
    g.add(P(BUILD._buddha(0x5f9e86, 1.25), 0, 1.2, 0));
    g.add(P(box(1.4, 0.8, 1, 0x8d6e63), 0, 1.6, 5.4));
    g.add(P(cyl(0.5, 0.4, 0.5, 0x6d4c41, 10), 0, 2.2, 5.4));
    return { g, r: 5.8 };
  },
  heianPalace() {
    const g = G(P(box(20, 1.2, 12, 0xe8e2d0), 0, 0.6, 0));
    for (let i = 0; i < 8; i++) g.add(P(cyl(0.3, 0.3, 4, VERM, 8), -8.4 + i * 2.4, 3.2, 4.6));
    g.add(P(box(17, 4, 9, WHITE), 0, 3.2, -0.5));
    g.add(P(roof(22, 14, 4, 0x6d4c41), 0, 5.2, -0.5));
    for (let i = 0; i < 5; i++) g.add(P(box(6, 0.3, 1, 0xe8e2d0), 0, 0.15 + i * 0.25, 6.5 + i * 0.6));
    const sak = G(P(cyl(0.3, 0.4, 3, DARKWOOD, 7), 0, 1.5, 0), P(sph(1.6, 0xffafcc), 0, 3.5, 0), P(sph(1.2, 0xffc8dd), 0.9, 3.9, 0.5));
    const tach = G(P(cyl(0.3, 0.4, 2.5, DARKWOOD, 7), 0, 1.2, 0), P(sph(1.5, 0x2d6a4f), 0, 3.1, 0));
    for (let i = 0; i < 8; i++) { const a = i * 0.8; tach.add(P(sph(0.18, 0xffa62b, 6, 4), Math.cos(a) * 1.3, 3 + Math.sin(a * 2) * 0.6, Math.sin(a) * 1.3)); }
    g.add(P(sak, -6, 0, 9)); g.add(P(tach, 6, 0, 9));
    return { g, r: 10.5 };
  },
  kanaDesk() {
    const g = G(P(box(6, 0.2, 4, 0xc9a66b), 0, 0.1, 0));
    g.add(P(box(3, 0.7, 1.5, 0x6d2e46), 0, 0.45, 0.6));
    g.add(P(box(1.6, 0.05, 1, 0xfffdf5), 0, 0.82, 0.6));
    g.add(P(R(cyl(0.04, 0.03, 0.8, 0x222222, 6), 0, 0, 0.7), 0.6, 1, 0.6));
    for (const x of [-1.8, 1.8]) g.add(P(cyl(0.1, 0.1, 5, DARKWOOD, 6), x, 2.5, -1));
    g.add(P(box(3.8, 0.15, 0.15, DARKWOOD), 0, 5, -1));
    const scr = panel(3.2, 4.4, textTexture(['あいう', 'アイウ'], { w: 384, h: 512, bg: '#fffaf0', fg: '#2b2118', font: 'bold 110px serif', border: '#b5838d' }));
    P(scr, 0, 2.7, -0.92); g.add(scr);
    for (const x of [-2.6, 2.6]) { g.add(P(cyl(0.05, 0.05, 1.6, 0x222222, 6), x, 0.8, 1.2)); g.add(P(cyl(0.35, 0.35, 0.8, 0xfff1d6, 10, { emissive: 0xffb703, emissiveIntensity: 0.6 }), x, 1.9, 1.2)); }
    return { g, r: 3.8 };
  },
  byodoin() {
    const g = G(P(water(30, 22, 0x56cfe1), 0, 0.05, 0), P(box(22, 0.8, 9, STONE), 0, 0.4, -1));
    const hall = (w, d, h, x, z, roofH) => {
      for (const px of [-w / 2 + 0.3, w / 2 - 0.3]) for (const pz of [-d / 2 + 0.3, d / 2 - 0.3]) g.add(P(cyl(0.22, 0.22, h, VERM, 8), x + px, 0.8 + h / 2, z + pz));
      g.add(P(box(w - 0.6, h * 0.6, d - 0.6, WHITE), x, 0.8 + h * 0.6, z));
      g.add(P(roof(w + 2.4, d + 2.4, roofH, 0x5c6f7b), x, 0.8 + h, z));
    };
    hall(8, 6, 4.2, 0, -1, 2.2);
    g.add(P(box(5, 2, 4, WHITE), 0, 7.3, -1)); g.add(P(roof(7, 6, 2, 0x5c6f7b), 0, 8.2, -1));
    hall(6, 2.4, 3, -7.5, -1, 1.2); hall(6, 2.4, 3, 7.5, -1, 1.2);
    hall(2.4, 2.4, 4.4, -11, -1, 1.6); hall(2.4, 2.4, 4.4, 11, -1, 1.6);
    for (const x of [-1.4, 1.4]) { g.add(P(R(cone(0.35, 1.1, GOLD, 5, { emissive: 0x6b4500 }), 0, 0, x > 0 ? -0.5 : 0.5), x, 10.6, -1)); g.add(P(sph(0.25, GOLD, 8, 6, { emissive: 0x6b4500 }), x, 10.3, -1)); }
    g.add(P(box(1.5, 0.4, 5, VERM), 0, 0.5, 5.5));
    return { g, r: 12 };
  },
  kinkakuji() {
    const g = G(P(water(26, 20, 0x4fc3f7), 0, 0.05, 0), P(box(12, 0.6, 9, STONE), 0, 0.3, -2));
    const gold = { emissive: 0x7a5200, emissiveIntensity: 0.55 };
    g.add(P(box(7, 2.4, 5.5, 0xe8dcc7), 0, 1.8, -2));
    for (const x of [-3.2, -1.1, 1.1, 3.2]) g.add(P(cyl(0.15, 0.15, 2.4, DARKWOOD, 6), x, 1.8, 0.8));
    g.add(P(roof(9.5, 8, 1, 0x3e2723), 0, 3, -2));
    g.add(P(box(6.4, 2.2, 5, GOLD, gold), 0, 4.8, -2));
    g.add(P(roof(9, 7.6, 1, 0x3e2723), 0, 5.9, -2));
    g.add(P(box(4.2, 2, 3.6, GOLD, gold), 0, 7.6, -2));
    g.add(P(roof(6.4, 5.8, 2.4, 0x3e2723), 0, 8.6, -2));
    g.add(P(sph(0.35, GOLD, 8, 6, gold), 0, 11.1, -2)); g.add(P(R(cone(0.3, 0.9, GOLD, 5, gold), 0.4, 0, 0), 0, 11.5, -2.2));
    // reflet doré dans l'eau
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: 0.35 }));
    refl.rotation.x = -Math.PI / 2; P(refl, 0, 0.08, 5); g.add(refl);
    for (const [x, z] of [[-10, -6], [10, -7], [-11, 4], [11, 5]]) g.add(P(G(P(cyl(0.25, 0.35, 2, DARKWOOD, 6), 0, 1, 0), P(S(sph(1.6, 0x2d6a4f), 1.4, 0.6, 1), 0, 2.4, 0)), x, 0, z));
    return { g, r: 10 };
  },
  zenGarden() {
    const g = G(P(box(15, 0.2, 10, 0xefe6d4), 0, 0.1, 0));
    for (let i = 0; i < 10; i++) g.add(P(box(14.6, 0.06, 0.12, 0xd6cab1), 0, 0.22, -4.5 + i));
    g.add(P(box(15.4, 2.2, 0.6, 0xc58f5e), 0, 1.1, -5.2));
    g.add(P(roof(16, 1.6, 0.6, ROOF), 0, 2.2, -5.2));
    rng(15);
    const groups = [[-5, -1.5, 5], [-1.5, 1.5, 2], [1.5, -2, 3], [4.5, 1, 2], [5.8, -2.5, 3]];
    for (const [x, z, n] of groups) {
      g.add(P(S(sph(1.4, 0x6a994e, 12, 6), 1.3, 0.12, 1), x, 0.2, z));
      for (let k = 0; k < n; k++) {
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + rnd() * 0.5), M(0x7d7d7d, { flatShading: true }));
        r.castShadow = true; P(r, x + (rnd() - 0.5) * 1.6, 0.4, z + (rnd() - 0.5) * 1.2); r.scale.y = 0.7 + rnd() * 0.6; g.add(r);
      }
    }
    return { g, r: 7.5, solid: false };
  },
  mongolWreck() {
    const g = G(P(box(16, 0.15, 10, 0xf2d6a2), 0, 0.08, -1), P(water(16, 8, 0x3fa7d6), 0, 0.1, 6));
    g.add(P(box(16, 1.6, 1.2, 0x8a8680), 0, 0.8, -4.5));
    for (let i = 0; i < 12; i++) g.add(P(new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), M(0x9e9a93, { flatShading: true })), -7.5 + i * 1.35, 1.8, -4.5));
    const hull = G(P(box(7, 1.6, 2.6, 0x6d4c41), 0, 0, 0), P(R(cone(1.3, 2.2, 0x6d4c41, 4), 0, 0, -Math.PI / 2), 4.5, 0, 0), P(box(2, 1, 2.4, 0x5d4037), -3, 1.2, 0));
    hull.rotation.set(0.15, 0.4, 0.28); P(hull, 1, 0.7, 3); g.add(hull);
    g.add(P(R(cyl(0.15, 0.15, 6, DARKWOOD, 6), 0, 0.3, 1.4), -3, 0.3, 1.5));
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), new THREE.MeshStandardMaterial({ color: 0xc1121f, side: THREE.DoubleSide }));
    sail.rotation.set(-1.2, 0.2, 0.5); P(sail, -4.5, 0.3, 2.5); g.add(sail);
    return { g, r: 7, solid: false };
  },
  castleHimeji() {
    const g = new THREE.Group();
    g.add(P(R(cyl(7.3, 10, 5.5, 0x9a9a9a, 4), 0, Math.PI / 4, 0), 0, 2.75, 0));
    let y = 5.5;
    for (let i = 0; i < 5; i++) {
      const w = 9.5 - i * 1.6, d = w * 0.8;
      g.add(P(box(w, 2.6, d, 0xfbfbf7), 0, y + 1.3, 0));
      g.add(P(roof(w + 2.4, d + 2.4, 1.2, 0x50606e), 0, y + 2.3, 0));
      if (i < 4) g.add(P(R(gable(w * 0.45, 0.6, 1.3, 0xfbfbf7), 0, 0, 0), 0, y + 2.6, d / 2 + 0.9));
      y += 3.1;
    }
    g.add(P(R(cone(0.35, 1.2, GOLD, 5, { emissive: 0x6b4500 }), 0, 0, 0.5), -1.4, y + 0.6, 0));
    g.add(P(R(cone(0.35, 1.2, GOLD, 5, { emissive: 0x6b4500 }), 0, 0, -0.5), 1.4, y + 0.6, 0));
    const t2 = G(P(box(5, 3, 4, 0x9a9a9a), 0, 1.5, 0), P(box(4, 2.4, 3.2, 0xfbfbf7), 0, 4.2, 0), P(roof(6, 5, 1.4, 0x50606e), 0, 5.4, 0));
    g.add(P(t2, 9.5, 0, 4));
    rng(3);
    for (let i = 0; i < 6; i++) g.add(P(G(P(cyl(0.25, 0.3, 2, DARKWOOD, 6), 0, 1, 0), P(sph(1.3, 0xffafcc), 0, 2.6, 0)), -9 + rnd() * 3, 0, 6 + i * 1.5 - 4));
    return { g, r: 10 };
  },
  nanbanShip() {
    const g = G(P(water(22, 14, 0x3fa7d6), 0, 0.05, 0), P(box(4, 0.6, 12, 0x8d6e63), -9, 0.3, 0));
    const ship = G(P(box(11, 2.6, 3.6, 0x5d4037), 0, 1.3, 0), P(R(cone(1.8, 3, 0x5d4037, 4), 0, Math.PI / 4, -Math.PI / 2), 6.8, 1.6, 0), P(box(3, 2, 3.4, 0x6d4c41), -4.2, 3.4, 0), P(box(11.2, 0.3, 3.8, GOLD), 0, 2.6, 0));
    const crossTex = textTexture('✚', { w: 256, h: 256, bg: '#fffaf0', fg: '#c1121f', font: 'bold 200px sans-serif' });
    for (const [x, h] of [[-2.5, 8], [1, 10], [4.2, 7]]) {
      ship.add(P(cyl(0.18, 0.2, h, DARKWOOD, 6), x, 2.6 + h / 2, 0));
      const s = panel(3.2, 3, crossTex); s.rotation.y = Math.PI / 2; P(s, x + 0.25, 2.6 + h * 0.62, 0); ship.add(s);
    }
    ship.add(P(box(0.6, 0.4, 0.05, 0xd62828), 1, 13, 0.3));
    P(ship, 1, 0.2, 0); ship.rotation.y = 0.15; g.add(ship);
    return { g, r: 9, update: t => { ship.rotation.z = Math.sin(t * 0.8) * 0.04; ship.position.y = 0.2 + Math.sin(t * 1.1) * 0.12; } };
  },
  sekigahara() {
    const g = G(P(box(14, 0.12, 10, 0xc9d67e), 0, 0.06, 0));
    const maku = textTexture('◯', { w: 512, h: 128, bg: '#fafafa', fg: '#111', font: 'bold 110px sans-serif' });
    const m = panel(10, 2, maku); P(m, 0, 1.4, -4); g.add(m);
    for (const x of [-5, 5]) g.add(P(cyl(0.08, 0.08, 2.6, DARKWOOD, 6), x, 1.3, -4));
    const cols = [0x1d4ed8, 0xdc2626, 0xf8fafc, 0x111827, 0xf59e0b, 0x16a34a];
    for (let i = 0; i < 12; i++) {
      const x = -6 + (i % 6) * 2.4, z = i < 6 ? 0 : 3;
      g.add(P(cyl(0.06, 0.06, 5, DARKWOOD, 6), x, 2.5, z));
      g.add(P(box(0.04, 3, 1, cols[(i * 5) % 6]), x, 3.3, z + 0.55));
    }
    g.add(P(box(0.8, 0.6, 0.8, 0x6d4c41), -2, 0.3, -2)); g.add(P(box(0.8, 0.6, 0.8, 0x6d4c41), 2, 0.3, -2));
    return { g, r: 7, solid: false };
  },
  nihonbashi() {
    const g = G(P(water(26, 7, 0x3fa7d6), 0, 0.05, 0));
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, z = -6 + t * 12, y = 0.5 + Math.sin(t * Math.PI) * 1.8;
      const a = Math.cos(t * Math.PI) * 0.45;
      g.add(P(R(box(4, 0.3, 1.05, 0xa0703a), a, 0, 0), 0, y, z));
      for (const x of [-1.9, 1.9]) g.add(P(cyl(0.08, 0.08, 1, DARKWOOD, 6), x, y + 0.6, z));
    }
    for (const x of [-1.9, 1.9]) for (const z of [-2, 0, 2]) g.add(P(cyl(0.2, 0.2, 3, DARKWOOD, 6), x, 0.5, z));
    g.add(P(box(1, 3, 1, 0x555555), 3.5, 1.5, -6.5));
    const sign = panel(0.9, 2.6, textTexture(['日', '本', '橋'], { w: 128, h: 384, bg: '#2b2b2b', fg: '#ffffff', font: 'bold 96px serif' }));
    sign.rotation.y = Math.PI / 2; P(sign, 4.02, 1.6, -6.5); g.add(sign);
    return { g, r: 7, solid: false };
  },
  ukiyoeStall() {
    const g = G(P(box(6, 0.2, 4, 0xc9a66b), 0, 0.1, 0));
    for (const [x, z] of [[-2.6, -1.6], [2.6, -1.6], [-2.6, 1.6], [2.6, 1.6]]) g.add(P(cyl(0.12, 0.12, 3.2, DARKWOOD, 6), x, 1.6, z));
    g.add(P(R(gable(6.4, 4.6, 1.4, 0x6d4c41), 0, Math.PI / 2, 0), 0, 3.2, 0));
    g.add(P(box(5, 0.8, 1.4, WOOD), 0, 0.6, 1));
    const c = document.createElement('canvas'); c.width = 512; c.height = 340; const x = c.getContext('2d');
    x.fillStyle = '#f4e9d0'; x.fillRect(0, 0, 512, 340);
    x.fillStyle = '#e63946'; x.beginPath(); x.arc(390, 90, 45, 0, 7); x.fill();
    x.fillStyle = '#1d3557'; x.beginPath(); x.moveTo(60, 300); x.lineTo(256, 70); x.lineTo(452, 300); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(205, 130); x.lineTo(256, 70); x.lineTo(307, 130); x.lineTo(280, 120); x.lineTo(256, 135); x.lineTo(230, 120); x.fill();
    x.fillStyle = '#457b9d'; x.fillRect(0, 290, 512, 50);
    x.strokeStyle = '#2b2118'; x.lineWidth = 14; x.strokeRect(7, 7, 498, 326);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const p = panel(3.6, 2.4, t); P(p, 0, 2.1, -1.55); g.add(p);
    for (let i = 0; i < 4; i++) g.add(P(box(0.9, 0.05, 0.7, [0xffafcc, 0xa2d2ff, 0xffd166, 0xcdb4db][i]), -1.8 + i * 1.2, 1.03, 1));
    const lan = textTexture('浮世絵', { w: 384, h: 128, bg: '#c1121f', fg: '#fff', font: 'bold 90px serif' });
    const lp = panel(3, 1, lan); P(lp, 0, 3.0, 2.35); g.add(lp);
    return { g, r: 3.8 };
  },
  kabuki() {
    const g = G(P(box(14, 0.6, 10, STONE), 0, 0.3, 0));
    g.add(P(box(12, 6, 8, 0xf1e3c8), 0, 3.6, -0.5));
    g.add(P(roof(14.5, 10.5, 3, 0x2f3e46), 0, 6.6, -0.5));
    g.add(P(box(3, 2.2, 3, 0xf1e3c8), 0, 9.5, 2)); g.add(P(roof(4.4, 4.4, 1.2, 0x2f3e46), 0, 10.6, 2));
    const c = document.createElement('canvas'); c.width = 600; c.height = 300; const x = c.getContext('2d');
    ['#111111', '#c8621b', '#1e6b3a'].forEach((col, i) => { x.fillStyle = col; for (let k = 0; k < 2; k++) x.fillRect((i + k * 3) * 100, 0, 100, 300); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const cur = panel(8, 4, t); P(cur, 0, 2.9, 3.52); g.add(cur);
    const ban = textTexture('歌舞伎', { w: 512, h: 160, bg: '#fffaf0', fg: '#c1121f', font: 'bold 120px serif' });
    const b = panel(6, 1.6, ban); P(b, 0, 5.6, 3.52); g.add(b);
    const cols = [0xe63946, 0xffb703, 0x2a9d8f, 0x8338ec, 0xff006e];
    for (let i = 0; i < 6; i++) { const xx = -6.2 + i * 2.48; g.add(P(cyl(0.06, 0.06, 5, DARKWOOD, 6), xx, 2.5, 4.8)); g.add(P(box(0.9, 3, 0.04, cols[i % 5]), xx + 0.5, 3.2, 4.8)); }
    for (let i = 0; i < 8; i++) g.add(P(cyl(0.3, 0.3, 0.7, 0xff4d4d, 10, { emissive: 0xff2a00, emissiveIntensity: 0.5 }), -5.6 + i * 1.6, 6.3, 4.4));
    return { g, r: 8 };
  },
  blackShip() {
    const g = G(P(water(26, 16, 0x2f8fc0), 0, 0.05, 0));
    const ship = G(P(box(13, 2.8, 3.8, 0x1b1b1b), 0, 1.4, 0), P(R(cone(1.9, 3.4, 0x1b1b1b, 4), 0, Math.PI / 4, -Math.PI / 2), 8.1, 1.6, 0), P(box(13.2, 0.25, 4, 0xf8f8f8), 0, 2.2, 0));
    for (const z of [-2.1, 2.1]) { const w = P(R(cyl(1.8, 1.8, 0.6, 0x3a3a3a, 14), Math.PI / 2, 0, 0), 0, 2, z); ship.add(w); }
    ship.add(P(cyl(0.6, 0.6, 4, 0x2b2b2b, 12), 0.5, 4.8, 0));
    for (const [x, h] of [[-4, 9], [4, 8]]) { ship.add(P(cyl(0.15, 0.18, h, DARKWOOD, 6), x, 2.8 + h / 2, 0)); ship.add(P(R(cyl(0.08, 0.08, 4, DARKWOOD, 6), Math.PI / 2, 0, 0), x, 2.8 + h * 0.7, 0)); }
    for (let i = 0; i < 5; i++) ship.add(P(box(0.4, 0.4, 0.1, 0x111111), -4 + i * 2, 1.5, 1.95));
    ship.add(P(box(1, 0.6, 0.05, 0x3c3b6e), 4, 12, 0.3));
    const smoke = [];
    for (let i = 0; i < 5; i++) { const s = P(sph(0.7 + i * 0.25, 0x9e9e9e, 8, 6), 0.5, 7 + i * 1.2, 0); ship.add(s); smoke.push(s); }
    P(ship, 0, 0.2, 0); ship.rotation.y = -0.3; g.add(ship);
    return { g, r: 10, update: t => { ship.rotation.z = Math.sin(t * 0.7) * 0.03; smoke.forEach((s, i) => { const k = (t * 0.5 + i / 5) % 1; s.position.set(0.5 - k * 3, 7 + k * 6, 0); s.scale.setScalar(0.6 + k * 1.4); }); } };
  },
  train() {
    const g = new THREE.Group();
    for (let i = -16; i <= 16; i += 1.2) g.add(P(box(0.5, 0.15, 3, 0x6d4c41), i, 0.08, 0));
    for (const z of [-0.8, 0.8]) g.add(P(box(34, 0.15, 0.15, 0x8e8e8e), 0, 0.25, z));
    const plat = G(P(box(10, 1, 3, 0xbcb8b1), 0, 0.5, 0), P(box(10, 0.2, 3.4, 0x8d6e63), 0, 4, 0));
    for (const x of [-4.5, 0, 4.5]) plat.add(P(cyl(0.12, 0.12, 3, 0x4a4a4a, 6), x, 2.5, 1));
    const sg = panel(4, 1, textTexture('新橋 SHIMBASHI', { w: 512, h: 128, bg: '#ffffff', fg: '#1d3557', font: 'bold 60px sans-serif', border: '#1d3557' }));
    P(sg, 0, 3.3, -1.52); sg.rotation.y = Math.PI; plat.add(sg);
    g.add(P(plat, 0, 0, -3.6));
    const tr = new THREE.Group();
    tr.add(P(R(cyl(0.8, 0.8, 4, 0x1b1b1b, 14), 0, 0, Math.PI / 2), 0, 1.6, 0));
    tr.add(P(box(1.8, 2.4, 2, 0x2b2b2b), -2.6, 1.9, 0));
    tr.add(P(box(2, 0.2, 2.2, 0xd62828), -2.6, 3.2, 0));
    tr.add(P(cyl(0.3, 0.2, 1.2, 0x1b1b1b, 8), 1.4, 2.9, 0));
    tr.add(P(cone(0.8, 0.7, 0x1b1b1b, 4), 2.2, 0.6, 0));
    for (const x of [-2.4, -0.8, 0.8]) for (const z of [-0.85, 0.85]) tr.add(P(R(cyl(0.5, 0.5, 0.15, 0xd62828, 12), Math.PI / 2, 0, 0), x, 0.6, z));
    for (let c = 0; c < 2; c++) {
      const w = G(P(box(4.4, 2, 2, c ? 0x2a9d8f : 0x9b2226), 0, 1.6, 0), P(box(4.6, 0.2, 2.2, 0x333333), 0, 2.7, 0));
      for (let k = 0; k < 4; k++) for (const z of [-1.01, 1.01]) w.add(P(box(0.6, 0.6, 0.02, 0xfff3b0, { emissive: 0xffd166, emissiveIntensity: 0.4 }), -1.5 + k, 1.9, z));
      for (const x of [-1.5, 1.5]) for (const z of [-0.85, 0.85]) w.add(P(R(cyl(0.4, 0.4, 0.15, 0x333333, 10), Math.PI / 2, 0, 0), x, 0.5, z));
      P(w, -6.2 - c * 4.8, 0, 0); tr.add(w);
    }
    const puffs = [];
    for (let i = 0; i < 4; i++) { const s = sph(0.5, 0xeeeeee, 8, 6); tr.add(s); puffs.push(s); }
    g.add(tr);
    return { g, r: 4, solid: false, update: t => {
      const k = (t * 0.06) % 1, x = -20 + k * 40; tr.position.x = x; tr.visible = Math.abs(x) < 18;
      puffs.forEach((s, i) => { const q = (t * 0.8 + i / 4) % 1; s.position.set(1.4 - q * 3, 3.4 + q * 2.5, 0); s.scale.setScalar(0.5 + q * 1.5); });
    }};
  },
  brick() {
    const red = 0xb5453a, wh = 0xf3efe6;
    const g = G(P(box(22, 0.4, 8, 0xbdbdbd), 0, 0.2, 0));
    g.add(P(box(20, 7, 6, red), 0, 3.9, 0));
    for (const y of [2, 4.6, 7.2]) g.add(P(box(20.2, 0.3, 6.2, wh), 0, y, 0));
    for (const x of [-8.5, 8.5]) { g.add(P(box(4, 9, 6.6, red), x, 4.9, 0)); g.add(P(S(sph(2.6, 0x40594b, 16, 10), 1, 0.9, 1), x, 9.4, 0)); g.add(P(cyl(0.1, 0.1, 1.6, 0x40594b, 6), x, 12.2, 0)); }
    g.add(P(box(5, 8.5, 6.8, red), 0, 4.6, 0)); g.add(P(roof(6, 7.5, 2.4, 0x40594b), 0, 8.85, 0));
    for (let i = 0; i < 14; i++) for (let j = 0; j < 2; j++) { const xx = -9.5 + i * 1.45; if (Math.abs(xx) < 2.2) continue; g.add(P(box(0.6, 1.1, 0.05, 0xfff3b0, { emissive: 0xffd166, emissiveIntensity: 0.35 }), xx, 3.2 + j * 2.6, 3.32)); }
    g.add(P(box(2.4, 3, 0.1, 0x3b2a1a), 0, 1.9, 3.42));
    return { g, r: 10.5 };
  },
  genbaku() {
    const g = G(P(box(14, 0.3, 12, 0x9e9e9e), 0, 0.15, 0));
    const c = 0xa58f78;
    for (let i = 0; i < 7; i++) g.add(P(box(1, 3 + (i % 3) * 1.2, 1, c), -6 + i * 2, (3 + (i % 3) * 1.2) / 2 + 0.3, -3));
    for (let i = 0; i < 4; i++) g.add(P(box(1, 2 + (i % 2) * 2, 1, c), -6 + i * 4, (2 + (i % 2) * 2) / 2 + 0.3, 3));
    g.add(P(box(13, 0.6, 0.8, c), 0, 4.2, -3));
    const tower = mk(new THREE.CylinderGeometry(2.4, 2.4, 4, 8, 1, true), c, { side: THREE.DoubleSide });
    P(tower, 0, 6.5, -0.5); g.add(tower);
    for (let i = 0; i < 8; i++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.07, 6, 16, Math.PI / 2), M(0x4a4a4a));
      rib.rotation.y = i / 8 * Math.PI * 2; P(rib, 0, 8.5, -0.5); g.add(rib);
    }
    g.add(P(R(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.07, 6, 24), M(0x4a4a4a)), Math.PI / 2, 0, 0), 0, 8.5, -0.5));
    const cols = [0xff4d6d, 0xffd166, 0x06d6a0, 0x118ab2, 0xc77dff, 0xff9f1c];
    for (let i = 0; i < 18; i++) g.add(P(R(cone(0.2, 0.45, cols[i % 6], 4), 0, i, 0), -4 + (i % 9), 0.55 + Math.floor(i / 9) * 0.25, 5 + Math.floor(i / 9) * 0.5));
    g.add(P(box(10, 0.3, 1.4, 0x6a994e), 0, 0.3, 5.3));
    return { g, r: 7 };
  },
  tokyoTower() {
    const g = new THREE.Group();
    const OR = 0xff5a1f, WH = 0xf8f8f8;
    const levels = [[7, 5.2, 10], [5.2, 3.4, 8], [3.4, 2, 8], [2, 1, 8], [1, 0.4, 8]];
    let y = 0;
    levels.forEach(([rb, rt, h], i) => {
      const segs = 4;
      for (let k = 0; k < segs; k++) {
        const r0 = rb + (rt - rb) * k / segs, r1 = rb + (rt - rb) * (k + 1) / segs;
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h / segs, 4, 1, true), new THREE.MeshStandardMaterial({ color: k % 2 ? WH : OR, wireframe: true }));
        m.rotation.y = Math.PI / 4; P(m, 0, y + (k + 0.5) * h / segs, 0); g.add(m);
        const core = new THREE.Mesh(new THREE.CylinderGeometry(r1 * 0.55, r0 * 0.55, h / segs, 4), M(k % 2 ? WH : OR)); core.rotation.y = Math.PI / 4; P(core, 0, y + (k + 0.5) * h / segs, 0); core.castShadow = true; g.add(core);
      }
      y += h;
      if (i === 0 || i === 2) { const deck = P(R(cyl(rt * 0.95, rt * 0.95, 1.4, 0x9ad1f5, 4, { emissive: 0x3a86ff, emissiveIntensity: 0.3 }), 0, Math.PI / 4, 0), 0, y, 0); g.add(deck); }
    });
    g.add(P(cyl(0.12, 0.25, 6, WH, 6), 0, y + 3, 0));
    const lamp = P(sph(0.3, 0xff0000, 8, 6, { emissive: 0xff0000 }), 0, y + 6.2, 0); g.add(lamp);
    return { g, r: 6.5, update: t => { lamp.visible = Math.sin(t * 3) > 0; } };
  },
  shinkansen() {
    const g = new THREE.Group();
    for (let i = -3; i <= 3; i++) g.add(P(box(1.4, 3, 1.4, 0xd6d6d6), i * 5, 1.5, 0));
    g.add(P(box(36, 0.8, 4, 0xbdbdbd), 0, 3.4, 0));
    for (const z of [-0.7, 0.7]) g.add(P(box(36, 0.12, 0.12, 0x777777), 0, 3.86, z));
    const tr = new THREE.Group();
    const body = (x, nose) => {
      const c = G(P(box(7, 1.7, 2, 0xfafafa), 0, 0.85, 0), P(box(7.02, 0.3, 2.02, 0x1d4ed8), 0, 0.6, 0));
      for (let k = 0; k < 6; k++) for (const z of [-1.01, 1.01]) c.add(P(box(0.6, 0.45, 0.02, 0x9ad1f5, { emissive: 0x3a86ff, emissiveIntensity: 0.4 }), -2.6 + k * 1.05, 1.2, z));
      if (nose) { c.add(P(S(sph(1, 0xfafafa, 16, 10), 2.6, 0.85, 1), 3.6, 0.85, 0)); c.add(P(S(sph(1, 0x1b263b, 12, 8), 0.8, 0.35, 0.8), 4.3, 1.35, 0)); }
      P(c, x, 3.95, 0); tr.add(c);
    };
    body(0, true); body(-7.3, false); body(-14.6, false);
    g.add(tr);
    const sg = panel(3, 1.2, textTexture('1964', { w: 256, h: 128, bg: '#1d4ed8', fg: '#fff', font: 'bold 80px sans-serif' }));
    P(sg, 0, 1.5, 0.72); g.add(sg);
    return { g, r: 4, solid: false, update: t => { const k = (t * 0.12) % 1; const x = -26 + k * 52; tr.position.x = x; tr.visible = x > -14 && x < 22; } };
  },
  skytree() {
    const g = new THREE.Group();
    g.add(P(cyl(4, 6.5, 6, 0x8ecae6, 3), 0, 3, 0));
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 3.4, 52, 8, 12), new THREE.MeshStandardMaterial({ color: 0xdff6ff, wireframe: true, emissive: 0x4cc9f0, emissiveIntensity: 0.5 }));
    P(shaft, 0, 30, 0); g.add(shaft);
    g.add(P(cyl(0.8, 2.4, 52, 0xe0f2fe, 8), 0, 30, 0));
    const d1 = P(cyl(3, 3, 2, 0x90e0ef, 16, { emissive: 0x00b4d8, emissiveIntensity: 0.8 }), 0, 36, 0);
    const d2 = P(cyl(2, 2, 1.4, 0x90e0ef, 16, { emissive: 0x00b4d8, emissiveIntensity: 0.8 }), 0, 46, 0);
    g.add(d1, d2);
    g.add(P(cyl(0.2, 0.5, 10, 0xe0f2fe, 6), 0, 61, 0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.12, 6, 32), new THREE.MeshBasicMaterial({ color: 0xc77dff }));
    ring.rotation.x = Math.PI / 2; P(ring, 0, 37.2, 0); g.add(ring);
    return { g, r: 6, update: t => { const h = (t * 0.05) % 1; ring.material.color.setHSL(h, 1, 0.6); ring.position.y = 37.2 + Math.sin(t) * 0.3; } };
  },
  shibuya() {
    const g = G(P(box(26, 0.1, 26, 0x2b2b35), 0, 0.05, 0));
    const stripe = (x, z, rot, len) => { for (let i = -len; i <= len; i++) { const s = box(0.7, 0.04, 3.4, 0xfafafa); s.castShadow = false; R(s, 0, rot, 0); const dx = Math.cos(rot) * i * 1.4, dz = -Math.sin(rot) * i * 1.4; P(s, x + dx, 0.12, z + dz); g.add(s); } };
    stripe(0, -9, 0, 5); stripe(0, 9, 0, 5); stripe(-9, 0, Math.PI / 2, 5); stripe(9, 0, Math.PI / 2, 5);
    stripe(0, 0, Math.PI / 4, 6); stripe(0, 0, -Math.PI / 4, 6);
    const screens = [];
    for (const [x, z, w, h] of [[-15, -15, 7, 18], [15, -15, 6, 14], [-15, 15, 6, 12]]) {
      g.add(P(box(w, h, w, 0x3a3a52), x, h / 2, z));
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.85, 3.5), new THREE.MeshBasicMaterial({ color: 0xff006e, side: THREE.DoubleSide }));
      sc.rotation.y = z < 0 ? 0 : Math.PI;
      P(sc, x, h - 3, z + (z < 0 ? w / 2 + 0.05 : -w / 2 - 0.05));
      g.add(sc); screens.push(sc);
    }
    const crowd = [];
    const cols = [0xff4d6d, 0x4cc9f0, 0xffd166, 0x06d6a0, 0xc77dff, 0xffffff, 0xf77f00];
    for (let i = 0; i < 28; i++) {
      const p = G(P(cyl(0.22, 0.3, 1.1, cols[i % 7], 8), 0, 0.6, 0), P(sph(0.2, 0xf5cba7, 8, 6), 0, 1.35, 0));
      g.add(p); crowd.push({ p, a: (i % 4) * Math.PI / 2 + (i % 2 ? Math.PI / 4 : 0), o: i / 28, l: (i % 3) - 1 });
    }
    return { g, r: 11, solid: false, update: t => {
      screens.forEach((s, i) => s.material.color.setHSL((t * 0.07 + i * 0.3) % 1, 0.95, 0.55));
      crowd.forEach(c => { const k = ((t * 0.05 + c.o) % 1) * 2 - 1; c.p.position.set(Math.cos(c.a) * k * 11 + Math.sin(c.a) * c.l, 0.1, Math.sin(c.a) * k * 11 - Math.cos(c.a) * c.l); c.p.position.y = 0.1 + Math.abs(Math.sin(t * 8 + c.o * 20)) * 0.08; });
    }};
  },
  gameCenter() {
    const g = G(P(box(12, 0.3, 10, 0x3a3a52), 0, 0.15, 0));
    g.add(P(box(11, 9, 8, 0x5a189a), 0, 4.8, -1));
    const neon = [];
    for (const [y, c] of [[9.3, 0xff006e], [0.6, 0x00f5d4]]) { const n = box(11.2, 0.25, 8.2, c, { emissive: c, emissiveIntensity: 1 }); P(n, 0, y, -1); g.add(n); neon.push(n); }
    const sign = panel(8, 2.4, textTexture(['GAME', 'ゲーム'], { w: 512, h: 160, bg: '#10002b', fg: '#ffd60a', font: 'bold 64px sans-serif', border: '#ff006e' }), true);
    P(sign, 0, 7, 3.02); g.add(sign);
    g.add(P(box(3, 4, 0.1, 0xb8f2e6, { emissive: 0x4cc9f0, emissiveIntensity: 0.6 }), 0, 2.3, 3.05));
    const cols = [0xff4d6d, 0x3a86ff, 0xffbe0b, 0x8338ec];
    for (let i = 0; i < 4; i++) {
      const cab = G(P(box(1.2, 2.2, 1, cols[i]), 0, 1.4, 0), P(box(0.9, 0.7, 0.05, 0x111111, { emissive: [0x06d6a0, 0xff006e, 0x4cc9f0, 0xffd60a][i], emissiveIntensity: 0.9 }), 0, 1.9, 0.53));
      P(cab, -4.8 + i * 1.5 + (i > 1 ? 4.6 : 0), 0.3, 4); g.add(cab);
    }
    const claw = G(P(box(1.6, 1, 1.6, 0xff4d6d), 0, 0.8, 0));
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.5), new THREE.MeshStandardMaterial({ color: 0xbde0fe, transparent: true, opacity: 0.35 }));
    P(glass, 0, 2.1, 0); claw.add(glass);
    for (let i = 0; i < 6; i++) claw.add(P(sph(0.22, [0xffafcc, 0xffd166, 0xa2d2ff][i % 3], 8, 6), -0.4 + (i % 3) * 0.4, 1.5, -0.3 + Math.floor(i / 3) * 0.6));
    g.add(P(claw, 4.5, 0.3, 2)); g.add(P(claw.clone(), -4.5, 0.3, 2));
    return { g, r: 6.5, update: t => neon.forEach((n, i) => { n.material.emissiveIntensity = 0.6 + Math.sin(t * 4 + i * 2) * 0.4; }) };
  },
  memorial2011() {
    const g = G(P(S(sph(6, 0x52b788, 20, 10), 1, 0.15, 1), 0, 0, 0));
    g.add(P(cyl(0.3, 0.45, 16, 0x7f5539, 8), 0, 8, 0));
    g.add(P(S(sph(2.2, 0x1b4332, 12, 8), 1.3, 0.55, 1.3), 0, 16, 0));
    g.add(P(S(sph(1.6, 0x2d6a4f, 12, 8), 1.2, 0.5, 1.2), 0.6, 17, 0.3));
    for (let i = 0; i < 6; i++) { const a = -0.8 + i * 0.32; g.add(P(R(box(2, 1.6, 0.8, 0x9e9e9e), 0, -a, 0), Math.sin(a) * 7, 0.8, -Math.cos(a) * 7)); }
    const wave = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.4, 10, 24, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0x48cae4, emissive: 0x0077b6, emissiveIntensity: 0.4 }));
    P(wave, -4, 2.2, 3); wave.rotation.y = 0.6; g.add(wave);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(P(cyl(0.12, 0.12, 0.4, 0xfff3b0, 8, { emissive: 0xffb703, emissiveIntensity: 1 }), Math.cos(a) * 2.5, 0.9, Math.sin(a) * 2.5)); }
    return { g, r: 5 };
  },
};

// ───────── Torii (porte entre les époques)
export function torii(color = VERM) {
  const g = new THREE.Group();
  for (const x of [-5, 5]) { g.add(P(cyl(0.55, 0.65, 10, color, 14), x, 5, 0)); g.add(P(cyl(0.8, 0.8, 0.8, 0x222222, 14), x, 0.4, 0)); }
  g.add(P(box(13.5, 0.9, 1.3, 0x222222), 0, 10.4, 0));
  g.add(P(box(12.5, 0.8, 1.1, color), 0, 9.7, 0));
  g.add(P(box(11.5, 0.6, 0.8, color), 0, 7.8, 0));
  g.add(P(box(0.7, 1.9, 0.6, color), 0, 8.8, 0));
  return g;
}

// ───────── Décors instanciés (arbres, rochers…)
function inst(parts, list) {
  const out = [];
  for (const pr of parts) {
    const mat = pr.basic ? new THREE.MeshBasicMaterial({ color: pr.color }) : M(pr.color, { ...(pr.o || {}), ...(pr.colors ? { map: T('grain') } : {}) });
    const im = new THREE.InstancedMesh(pr.geo, mat, list.length);
    im.castShadow = true; im.receiveShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    list.forEach((it, i) => {
      q.setFromEuler(new THREE.Euler(0, it.rot, 0));
      const k = it.s; s.set(k * (pr.sx || 1), k * (pr.sy || 1), k * (pr.sz || 1));
      const ox = (pr.dx || 0) * k, oz = (pr.dz || 0) * k, cr = Math.cos(it.rot), sr = Math.sin(it.rot);
      p.set(it.x + ox * cr + oz * sr, (it.y || 0) + (pr.y || 0) * k, it.z - ox * sr + oz * cr);
      m.compose(p, q, s); im.setMatrixAt(i, m);
      if (pr.colors) im.setColorAt(i, new THREE.Color(pr.colors[i % pr.colors.length]));
    });
    out.push(im);
  }
  return out;
}
export const DECOR = {
  pine: l => inst([
    { geo: new THREE.CylinderGeometry(0.25, 0.4, 2, 6), color: 0x6b4226, y: 1 },
    { geo: new THREE.ConeGeometry(1.8, 3.2, 7), color: 0xffffff, y: 3.2, colors: [0x2d6a4f, 0x40916c, 0x1b4332] },
    { geo: new THREE.ConeGeometry(1.3, 2.6, 7), color: 0xffffff, y: 4.8, colors: [0x40916c, 0x52b788, 0x2d6a4f] },
  ], l),
  maple: l => inst([
    { geo: new THREE.CylinderGeometry(0.22, 0.35, 2.4, 6), color: 0x6b4226, y: 1.2 },
    { geo: new THREE.IcosahedronGeometry(1.7, 0), color: 0xffffff, y: 3.4, colors: [0xe63946, 0xf77f00, 0xfcbf49, 0xd62828], o: { flatShading: true } },
  ], l),
  sakura: l => inst([
    { geo: new THREE.CylinderGeometry(0.22, 0.38, 2.4, 6), color: 0x5e3b2a, y: 1.2 },
    { geo: new THREE.IcosahedronGeometry(1.8, 1), color: 0xffffff, y: 3.5, colors: [0xffafcc, 0xffc8dd, 0xf9a8d4], o: { flatShading: true } },
    { geo: new THREE.IcosahedronGeometry(1.2, 1), color: 0xffffff, y: 4.3, dx: 0.9, dz: 0.4, colors: [0xffc8dd, 0xfbcfe8], o: { flatShading: true } },
  ], l),
  bamboo: l => inst([
    { geo: new THREE.CylinderGeometry(0.12, 0.14, 7, 6), color: 0x80b918, y: 3.5 },
    { geo: new THREE.CylinderGeometry(0.1, 0.12, 6, 6), color: 0x55a630, y: 3, dx: 0.5, dz: 0.3 },
    { geo: new THREE.CylinderGeometry(0.1, 0.12, 5.5, 6), color: 0xaacc00, y: 2.75, dx: -0.4, dz: 0.4 },
    { geo: new THREE.IcosahedronGeometry(0.9, 0), color: 0x55a630, y: 6.6, o: { flatShading: true } },
  ], l),
  rock: l => inst([{ geo: new THREE.DodecahedronGeometry(0.9), color: 0xffffff, y: 0.4, sy: 0.7, colors: [0x8d8d8d, 0xa3a3a3, 0x7a7a7a], o: { flatShading: true } }], l),
  flower: l => inst([{ geo: new THREE.IcosahedronGeometry(0.28, 0), color: 0xffffff, y: 0.3, colors: [0xff4d6d, 0xffd166, 0xc77dff, 0xffffff, 0x4cc9f0] }], l),
  lantern: l => inst([
    { geo: new THREE.CylinderGeometry(0.5, 0.6, 0.4, 6), color: 0x9e9e9e, y: 0.2 },
    { geo: new THREE.CylinderGeometry(0.18, 0.18, 1.3, 6), color: 0x9e9e9e, y: 1 },
    { geo: new THREE.BoxGeometry(0.8, 0.7, 0.8), color: 0xfff3b0, y: 1.9, o: { emissive: 0xffb703, emissiveIntensity: 0.7 } },
    { geo: new THREE.ConeGeometry(0.85, 0.6, 6), color: 0x8a8a8a, y: 2.55 },
  ], l),
  machiya: l => inst([
    { geo: new THREE.BoxGeometry(5, 3.4, 4), color: 0xffffff, y: 1.7, colors: [0xa47148, 0x8d5a3b, 0xc49a6c] },
    { geo: new THREE.BoxGeometry(5.6, 0.3, 4.6), color: 0x3d4f5c, y: 3.5 },
    { geo: new THREE.ConeGeometry(Math.SQRT1_2, 1, 4), color: 0x3d4f5c, y: 4.3, sx: 6.6, sy: 1.6, sz: 5.4 },
    { geo: new THREE.BoxGeometry(3, 1.2, 0.1), color: 0xffffff, y: 2.6, dz: 2.05, colors: [0x1d3557, 0xe63946, 0x2a9d8f] },
  ].map(p => p.sx ? { ...p, geo: (() => { const gg = p.geo.clone(); gg.rotateY(Math.PI / 4); return gg; })() } : p), l),
  lamp: l => inst([
    { geo: new THREE.CylinderGeometry(0.1, 0.14, 4, 6), color: 0x2b2d42, y: 2 },
    { geo: new THREE.SphereGeometry(0.4, 10, 8), color: 0xfff3b0, y: 4.2, o: { emissive: 0xffd166, emissiveIntensity: 1 } },
  ], l),
  house: l => inst([
    { geo: new THREE.BoxGeometry(5, 4, 5), color: 0xffffff, y: 2, colors: [0xf1faee, 0xffe8d6, 0xe9ecef, 0xd8e2dc] },
    { geo: (() => { const gg = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4); gg.rotateY(Math.PI / 4); return gg; })(), color: 0xffffff, y: 4.9, sx: 6, sy: 1.8, sz: 6, colors: [0x457b9d, 0xe63946, 0x2a9d8f, 0x6d597a] },
  ], l),
  skyscraper: l => inst([
    { geo: new THREE.BoxGeometry(6, 1, 6), color: 0xffffff, y: 11, sy: 22, colors: [0x3c096c, 0x240046, 0x3a0ca3, 0x1b263b] },
    { geo: new THREE.BoxGeometry(6.1, 0.3, 6.1), color: 0xffffff, y: 8, colors: [0xff006e, 0x00f5d4, 0xffd60a, 0x4cc9f0], basic: true },
    { geo: new THREE.BoxGeometry(6.1, 0.3, 6.1), color: 0xffffff, y: 15, colors: [0x4cc9f0, 0xff006e, 0x00f5d4, 0xc77dff], basic: true },
    { geo: new THREE.BoxGeometry(5.6, 18, 0.1), color: 0xfff3b0, y: 11, dz: 3.02, o: { emissive: 0xffd166, emissiveIntensity: 0.25, transparent: true, opacity: 0.5 } },
  ], l),
};
