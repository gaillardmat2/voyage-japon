// Textures procédurales (générées dans le navigateur, aucun fichier à télécharger)
import * as THREE from 'three';

function canvas(size = 256) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function tex(c, repeat = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// bruit de valeur lissé, multi-octaves
function noiseField(size, seed, oct = 5) {
  const r = rand(seed), out = new Float32Array(size * size);
  for (let o = 0; o < oct; o++) {
    const cell = Math.max(2, size >> (o + 2)), n = Math.ceil(size / cell) + 1, g = [];
    for (let i = 0; i < n * n; i++) g.push(r());
    const amp = 1 / (1 << o);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const xa = x0 % (n - 1), ya = y0 % (n - 1), xb = (xa + 1) % (n - 1), yb = (ya + 1) % (n - 1);
      const a = g[ya * n + xa], b = g[ya * n + xb], c = g[yb * n + xa], d = g[yb * n + xb];
      out[y * size + x] += ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy) * amp;
    }
  }
  let mn = 1e9, mx = -1e9; for (const v of out) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - mn) / (mx - mn);
  return out;
}
function fromField(size, f, fn) {
  const [c, x] = canvas(size); const img = x.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const [r, g, b] = fn(f[i], i % size, (i / size) | 0); img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255; }
  x.putImageData(img, 0, 0); return c;
}

const cache = {};
export function get(kind) { if (!cache[kind]) cache[kind] = MAKERS[kind](); return cache[kind]; }

const MAKERS = {
  // détail générique : grain clair autour de 1 (multiplié par la couleur)
  grain() { const f = noiseField(256, 11); return tex(fromField(256, f, v => { const k = 200 + v * 55; return [k, k, k]; }), 1); },
  grainBump() { const f = noiseField(256, 12); return tex(fromField(256, f, v => [v * 255, v * 255, v * 255]), 1, false); },
  wood() {
    const s = 256, f = noiseField(s, 21, 4), [c, x] = canvas(s);
    const img = x.createImageData(s, s);
    for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
      const i = yy * s + xx, plank = Math.floor(xx / 64), seam = xx % 64 < 2 ? 0.55 : 1;
      const ring = 0.5 + 0.5 * Math.sin((xx + f[i] * 40 + plank * 13) * 0.35);
      const k = (175 + ring * 50 + f[i] * 30) * seam;
      img.data.set([k, k, k, 255], i * 4);
    }
    x.putImageData(img, 0, 0); return tex(c, 1);
  },
  stone() {
    const s = 256, f = noiseField(s, 31), [c, x] = canvas(s);
    x.drawImage(fromField(s, f, v => { const k = 150 + v * 100; return [k, k, k]; }), 0, 0);
    x.strokeStyle = 'rgba(40,35,30,.55)'; x.lineWidth = 3;
    for (let row = 0; row < 4; row++) {
      const y = row * 64; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke();
      for (let col = 0; col < 3; col++) { const xx = (col * 96 + (row % 2) * 48) % s; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx, y + 64); x.stroke(); }
    }
    return tex(c, 1);
  },
  tiles() { // tuiles de toit (kawara)
    const s = 256, [c, x] = canvas(s);
    for (let i = 0; i < 16; i++) { const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0); g.addColorStop(0, '#9a9a9a'); g.addColorStop(0.5, '#f0f0f0'); g.addColorStop(1, '#7a7a7a'); x.fillStyle = g; x.fillRect(i * 16, 0, 16, s); }
    x.fillStyle = 'rgba(0,0,0,.35)'; for (let r = 0; r < 8; r++) x.fillRect(0, r * 32, s, 3);
    return tex(c, 3);
  },
  thatch() {
    const s = 256, [c, x] = canvas(s), r = rand(41);
    x.fillStyle = '#b8b8b8'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 2600; i++) { const k = 120 + r() * 135; x.strokeStyle = `rgb(${k},${k},${k * 0.95})`; x.lineWidth = 1 + r(); const xx = r() * s, y = r() * s; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx + (r() - 0.5) * 6, y + 14 + r() * 16); x.stroke(); }
    return tex(c, 2);
  },
  plaster() { const f = noiseField(256, 51, 6); return tex(fromField(256, f, v => { const k = 228 + v * 27; return [k, k, k]; }), 1); },
  bronze() { const f = noiseField(256, 61); return tex(fromField(256, f, v => { const k = 170 + v * 85; return [k * 0.9, k, k * 0.95]; }), 1); },
  grass() {
    const s = 512, f = noiseField(s, 71, 6), r = rand(72);
    const c = fromField(s, f, v => [70 + v * 60, 120 + v * 70, 40 + v * 30]);
    const x = c.getContext('2d');
    for (let i = 0; i < 9000; i++) { const k = r(); x.strokeStyle = k > 0.5 ? 'rgba(160,210,90,.35)' : 'rgba(40,80,25,.35)'; x.beginPath(); const xx = r() * s, y = r() * s; x.moveTo(xx, y); x.lineTo(xx + (r() - 0.5) * 3, y - 4 - r() * 6); x.stroke(); }
    return tex(c, 30);
  },
  dirt() {
    const s = 256, f = noiseField(s, 81, 6), r = rand(82);
    const c = fromField(s, f, v => { const k = 190 + v * 65; return [k, k * 0.95, k * 0.88]; });
    const x = c.getContext('2d');
    for (let i = 0; i < 500; i++) { const k = 90 + r() * 120; x.fillStyle = `rgba(${k},${k},${k},.5)`; x.beginPath(); x.arc(r() * s, r() * s, 0.8 + r() * 2.2, 0, 7); x.fill(); }
    return tex(c, 1);
  },
  groundDetail() {
    const s = 512, f = noiseField(s, 121, 6), r = rand(122);
    const c = fromField(s, f, v => { const k = 185 + v * 70; return [k, k, k]; });
    const x = c.getContext('2d');
    for (let i = 0; i < 14000; i++) { const k = r(); x.strokeStyle = k > 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.18)'; x.lineWidth = 1; x.beginPath(); const xx = r() * s, y = r() * s; x.moveTo(xx, y); x.lineTo(xx + (r() - 0.5) * 3, y - 3 - r() * 6); x.stroke(); }
    return tex(c, 1);
  },
  cloud() {
    const s = 256, [c, x] = canvas(s);
    for (let i = 0; i < 14; i++) { const cx = 50 + Math.random() * 156, cy = 110 + Math.random() * 50, r = 30 + Math.random() * 45; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  },
  waterNormal() {
    const s = 256, f = noiseField(s, 91, 4), [c, x] = canvas(s), img = x.createImageData(s, s);
    for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
      const h = v => f[((v[1] + s) % s) * s + ((v[0] + s) % s)];
      const dx = h([xx + 1, yy]) - h([xx - 1, yy]), dy = h([xx, yy + 1]) - h([xx, yy - 1]);
      const i = (yy * s + xx) * 4; img.data[i] = 128 + dx * 600; img.data[i + 1] = 128 + dy * 600; img.data[i + 2] = 255; img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); return tex(c, 4, false);
  },
  asphalt() { const f = noiseField(256, 101, 6); return tex(fromField(256, f, v => { const k = 150 + v * 80; return [k, k, k]; }), 1); },
  brick() {
    const s = 256, [c, x] = canvas(s), f = noiseField(s, 111);
    x.drawImage(fromField(s, f, v => { const k = 200 + v * 55; return [k, k, k]; }), 0, 0);
    x.fillStyle = 'rgba(255,255,255,.7)';
    for (let row = 0; row < 16; row++) { x.fillRect(0, row * 16, s, 2); for (let col = 0; col < 8; col++) x.fillRect((col * 32 + (row % 2) * 16) % s, row * 16, 2, 16); }
    return tex(c, 2);
  },
};
