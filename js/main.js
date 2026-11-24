import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BUILD, DECOR, M, P, box, cyl, cone, sph, fox, torii, rng, rnd, G, WATERS } from './builders.js';
import { person, CROWD } from './humans.js';
import { get as TEX } from './textures.js';
import { ERAS, KIKO_TUTORIAL } from './places.js';
import { playMinigame, GAME_TITLES } from './minigames.js';

const $ = s => document.querySelector(s);
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const SPAWN = { x: 0, z: 58 };
const RELAY = { x: 6, z: 52 };
const GATE = { x: 0, z: -64 };
const LIMIT = 74;

// Liste à plat des lieux
const PLACES = [];
ERAS.forEach((e, ei) => e.places.forEach((p, pi) => { p.era = ei; p.idx = pi; PLACES.push(p); }));
const PLACE = Object.fromEntries(PLACES.map(p => [p.id, p]));
const placeOfQuest = {}; PLACES.forEach(p => p.quests.forEach(q => placeOfQuest[q.id] = p));

// ════════════════ Profils et sauvegardes (sur l'appareil)
const PKEY = 'michi-profiles-v2';
let store = { list: [], saves: {} };
try { const s = JSON.parse(localStorage.getItem(PKEY)); if (s && Array.isArray(s.list)) store = s; } catch (e) {}
const newSave = () => ({ place: 'sannai', unlocked: ['sannai'], quests: {}, items: {}, picks: {}, visited: {}, games: {}, gates: {}, seen: {}, tuto: false, finished: false, pos: null, time: 0 });
let profile = null, save = newSave();
function persist() { try { localStorage.setItem(PKEY, JSON.stringify(store)); } catch (e) {} }
function commit() { if (!profile) return; profile.last = Date.now(); store.saves[profile.id] = save; persist(); }
function progressOf(sv) {
  let total = 0, got = 0;
  PLACES.forEach(p => { p.quests.forEach(q => { total += 2; if (sv.quests[q.id]?.done) got += 2; }); total += 5; got += (sv.items[p.id] || []).length; });
  total += ERAS.length; got += Object.keys(sv.gates || {}).length;
  return Math.round(got / total * 100);
}

// ════════════════ Rendu
const canvas = $('#game');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { $('#loading').textContent = "Ton navigateur ne permet pas d'afficher la 3D (WebGL). Essaie avec Chrome ou Edge à jour."; throw e; }
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
let quality = 'high';
try { quality = localStorage.getItem('michi-quality') || (isTouch ? 'low' : 'high'); } catch (e) {}

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe3ee, 60, 230);
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 700);

const sky = new Sky(); sky.scale.setScalar(600); scene.add(sky);
const skyU = sky.material.uniforms;
skyU.turbidity.value = 5; skyU.rayleigh.value = 1.6; skyU.mieCoefficient.value = 0.004; skyU.mieDirectionalG.value = 0.82;
const skyScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(100); skyScene.add(sky2);
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null;
const sunDir = new THREE.Vector3();
const skyState = { elev: 35, azim: 200, tElev: 35, tAzim: 200 };
function applySky(elev, azim, u = skyU) { sunDir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(azim)); u.sunPosition.value.copy(sunDir); }
function bakeEnv(pl) {
  for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) sky2.material.uniforms[k].value = skyU[k].value;
  applySky(pl.sun[0], pl.sun[1], sky2.material.uniforms);
  if (envRT) envRT.dispose(); envRT = pmrem.fromScene(skyScene, 0.04); scene.environment = envRT.texture;
}
const stars = (() => { const g = new THREE.BufferGeometry(), a = new Float32Array(1500 * 3); for (let k = 0; k < 1500; k++) { const v = new THREE.Vector3().randomDirection(); v.y = Math.abs(v.y) + 0.05; v.normalize().multiplyScalar(500); a.set([v.x, v.y, v.z], k * 3); } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0 })); })();
scene.add(stars);

const hemi = new THREE.HemisphereLight(0xdfefff, 0x5a6b3a, 0.55); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 260 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.28, 0.6, 0.88);
composer.addPass(bloom); composer.addPass(new OutputPass());
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  camera.aspect = w / h; camera.fov = w / h < 0.8 ? 70 : 58; camera.updateProjectionMatrix();
}
function applyQuality() {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality === 'high' ? 2 : 1.25));
  composer.setPixelRatio(renderer.getPixelRatio()); bloom.enabled = quality === 'high'; resize();
  $('#btn-quality').textContent = quality === 'high' ? 'HD' : 'SD';
}
window.addEventListener('resize', resize);
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(document.body);
applyQuality();

// ════════════════ Petits utilitaires 3D
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const emojiTex = new Map();
function emojiTexture(e) {
  if (emojiTex.has(e)) return emojiTex.get(e);
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.font = '96px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; emojiTex.set(e, t); return t;
}
function emojiSprite(e, size = 1.2) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(e), depthWrite: false, transparent: true })); s.scale.set(size, size, 1); return s; }
function labelSprite(text, bg = 'rgba(255,255,255,0.92)', fg = '#2b2118') {
  const c = document.createElement('canvas'); const x = c.getContext('2d');
  x.font = 'bold 44px system-ui, sans-serif'; const w = Math.ceil(x.measureText(text).width) + 48; c.width = w; c.height = 76;
  x.font = 'bold 44px system-ui, sans-serif'; x.fillStyle = bg; x.beginPath(); x.roundRect(2, 2, w - 4, 72, 30); x.fill();
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, 40);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(w / 76 * 0.55, 0.55, 1); s.renderOrder = 10; return s;
}
function bubbleTex(ch, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = color; x.strokeStyle = '#2b2118'; x.lineWidth = 8; x.beginPath(); x.arc(64, 58, 46, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(50, 98); x.lineTo(64, 124); x.lineTo(78, 98); x.fill();
  x.fillStyle = '#2b2118'; x.font = 'bold 72px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 64, 62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const BUB = { give: bubbleTex('!', '#ffd60a'), talk: bubbleTex('?', '#4cc9f0'), game: bubbleTex('★', '#ff8fab') };
const markerGeo = new THREE.OctahedronGeometry(0.6), ringGeo = new THREE.RingGeometry(1.3, 1.7, 32);

// Colonne de lumière qui indique l'objectif
const beacon = (() => {
  const g = new THREE.CylinderGeometry(0.9, 0.9, 60, 16, 1, true); g.translate(0, 30, 0);
  const c = document.createElement('canvas'); c.width = 4; c.height = 128; const x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = gr; x.fillRect(0, 0, 4, 128);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd60a, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.renderOrder = 5; m.visible = false; scene.add(m); return m;
})();

// ════════════════ Terrain
const SIZE = { kofun: 15, todaiji: 17, byodoin: 15, shibuya: 14, castleHimeji: 13, kinkakuji: 13, blackShip: 13, heianPalace: 13, nanbanShip: 12, mongolWreck: 10, nihonbashi: 10, brick: 12, riceField: 10, suzakumon: 9, jomonTower: 8, longHouse: 14, grandRing: 26, yoyogi: 14, heikeFleet: 14, shosoin: 10, templeHall: 10, yabusameTrack: 18, gasLamp: 11, cedarRoad: 16, seawall: 16, stoneWall: 17, hillCamp: 12, pavilion: 11 };
const WATER_POI = new Set(['nanbanShip', 'blackShip', 'heikeFleet', 'mongolWreck', 'ukaiBoat', 'bridge']);

function makeTerrain(pl) {
  const T = pl.terrain;
  const flats = [];
  pl.pois.forEach(p => { if (!WATER_POI.has(p.type)) flats.push({ x: p.x, z: p.z, r: SIZE[p.type] || 8 }); });
  pl.npcs.forEach(n => flats.push({ x: n.x, z: n.z, r: 3 }));
  flats.push({ x: SPAWN.x, z: SPAWN.z, r: 10 });
  if (pl.gate) flats.push({ x: GATE.x, z: GATE.z, r: 12 });
  const amp = { forest: 3.2, plain: 1.3, paddies: 0.25, city: 0.12, night: 0, castle: 1.2, mountain: 3.8, battlefield: 2.4, coast: 1.8, river: 1.6 }[T] ?? 1.5;
  const seaX = z => 38 + Math.sin(z * 0.045) * 6;
  const riverX = z => 36 + Math.sin(z * 0.05) * 6;
  const lake = T === 'mountain' ? { x: 44, z: -46, r: 20 } : null;
  const bumps = [];
  pl.pois.forEach(p => { if (p.type === 'castleHimeji') bumps.push({ x: p.x, z: p.z, h: 5, r0: 16, r1: 32 }); if (p.type === 'hillCamp') bumps.push({ x: p.x, z: p.z, h: 4, r0: 4, r1: 22 }); });
  function h(x, z) {
    let m = 1;
    for (const f of flats) { const dx = f.x - x, dz = f.z - z; if (Math.abs(dx) > f.r + 12 || Math.abs(dz) > f.r + 12) continue; m *= smooth(f.r + 1, f.r + 12, Math.hypot(dx, dz)); if (m <= 0) break; }
    const n = Math.sin(x * 0.09 + z * 0.05) * 0.5 + Math.sin(x * 0.043 - z * 0.08 + 1.7) * 0.8 + Math.sin(z * 0.12 + x * 0.03) * 0.35 + 1.3;
    let y = Math.max(0, n) * amp * m;
    const e = T === 'coast' ? Math.max(Math.abs(z), -x) : Math.max(Math.abs(x), Math.abs(z));
    y += smooth(60, 84, e) * (7 + Math.max(0, n) * 5);
    for (const b of bumps) y += b.h * smooth(b.r1, b.r0, Math.hypot(b.x - x, b.z - z));
    if (T === 'coast') { const sx = seaX(z); if (x > sx - 12) { const k = smooth(sx - 12, sx, x); y = y * (1 - k) + 0.25 * k; } if (x > sx) y = Math.max(-5, 0.25 - (x - sx) * 0.32); }
    if (T === 'river') { const d = Math.abs(x - riverX(z)); if (d < 14) y *= smooth(6, 14, d); if (d < 6) y = 0.1 - 1.9 * (1 - d / 6); }
    if (lake) { const d = Math.hypot(x - lake.x, z - lake.z); if (d < lake.r + 10) y *= smooth(lake.r, lake.r + 10, d); if (d < lake.r) y = 0.1 - 2 * (1 - d / lake.r); }
    return y;
  }
  return { h, isWater: (x, z) => h(x, z) < -0.2, seaX, riverX, lake, flats, hasWater: T === 'coast' || T === 'river' || !!lake };
}

// ════════════════ Construction d'un lieu
let world = null;
function disposeWorld() {
  if (!world) return;
  scene.remove(world.group);
  world.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.isSprite && o.material) o.material.dispose(); });
  WATERS.length = 0; world = null;
}
function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); rng(Math.abs(h) % 2147483646 + 1); }

function buildPlace(pl) {
  disposeWorld();
  const group = new THREE.Group(); scene.add(group);
  const ter = makeTerrain(pl), H = ter.h;
  const W = { pl, group, ter, H, colliders: [], inter: [], updaters: [], npcs: {}, items: [], picks: [], decorFree: [] };
  world = W;

  // Sol en relief (couleurs par sommet)
  const tg = new THREE.PlaneGeometry(240, 240, 160, 160); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, cols = new Float32Array(tp.count * 3);
  const base = new THREE.Color(pl.ground), sand = new THREE.Color(0xe2cf9c), dirt = new THREE.Color(pl.terrain === 'city' || pl.terrain === 'castle' ? 0xc9bfae : pl.night ? 0x34344e : 0xc8a878), rock = new THREE.Color(0x8a8f7a), snow = new THREE.Color(0xf4f8fb), deep = new THREE.Color(0x6f8f7a), cc = new THREE.Color();
  const segs = [...pl.pois.map(p => [p.x, p.z]), ...pl.npcs.map(n => [n.x, n.z]), pl.gate ? [GATE.x, GATE.z] : null].filter(Boolean);
  const segDist = (x, z) => { let m = 1e9; for (const [bx, bz] of segs) { const ax = SPAWN.x, az = SPAWN.z, dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; let t = ((x - ax) * dx + (z - az) * dz) / l2; t = Math.max(0, Math.min(1, t)); m = Math.min(m, Math.hypot(x - ax - t * dx, z - az - t * dz)); } return m; };
  for (let k = 0; k < tp.count; k++) {
    const x = tp.getX(k), z = tp.getZ(k), y = H(x, z); tp.setY(k, y);
    const nz = Math.sin(x * 0.31 + z * 0.17) * 0.5 + Math.sin(x * 0.07 - z * 0.23) * 0.5;
    cc.copy(base).offsetHSL(nz * 0.02, 0, nz * 0.05);
    if (y > 5) cc.lerp(rock, smooth(5, 14, y) * 0.7);
    if (pl.terrain === 'coast' && x > ter.seaX(z) - 13) cc.lerp(sand, smooth(ter.seaX(z) - 13, ter.seaX(z) - 6, x));
    if (y < -0.1) cc.lerp(deep, 0.6);
    if ((pl.terrain === 'river' && Math.abs(x - ter.riverX(z)) < 8) || (ter.lake && Math.hypot(x - ter.lake.x, z - ter.lake.z) < ter.lake.r + 3)) cc.lerp(sand, 0.45);
    if (Math.abs(x) < 70 && Math.abs(z) < 70) { const d = segDist(x, z); if (d < 2.2) cc.lerp(dirt, smooth(2.2, 1.0, d) * 0.6); }
    if (pl.snow) cc.lerp(snow, 0.62);
    cols.set([cc.r, cc.g, cc.b], k * 3);
  }
  tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
  const gt = TEX('groundDetail').clone(); gt.repeat.set(60, 60); gt.needsUpdate = true;
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, map: gt, bumpMap: TEX('grainBump'), bumpScale: 0.8, roughness: 0.96 }));
  ground.receiveShadow = true; group.add(ground);

  // Eau (mer, rivière, lac)
  if (ter.hasWater) {
    const n = TEX('waterNormal').clone(); n.repeat.set(36, 36); n.needsUpdate = true; WATERS.push(n);
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ color: pl.night ? 0x0b1d3a : 0x1f6f8b, roughness: 0.05, metalness: 0.3, normalMap: n, normalScale: new THREE.Vector2(0.7, 0.7), transparent: true, opacity: 0.93 }));
    wm.rotation.x = -Math.PI / 2; wm.position.y = -0.15; wm.receiveShadow = true;
    if (pl.terrain === 'coast') wm.position.x = 0; group.add(wm);
  }

  // Monuments
  pl.pois.forEach((poi, k) => {
    const b = BUILD[poi.type] ? BUILD[poi.type]() : BUILD.pitHouse();
    let x = poi.x, z = poi.z, rot = Math.atan2(SPAWN.x - x, SPAWN.z - z), onWater = false;
    if (pl.terrain === 'river' && (poi.type === 'bridge' || poi.type === 'ukaiBoat')) { x = ter.riverX(z); rot = Math.PI / 2; onWater = true; }
    if (WATER_POI.has(poi.type) && pl.terrain === 'coast') onWater = H(x, z) < 0;
    const y = onWater ? -0.1 : Math.max(0, H(x, z));
    P(b.g, x, y, z); b.g.rotation.y = rot; group.add(b.g);
    if (b.update) W.updaters.push(b.update);
    if (b.solid !== false && !onWater) W.colliders.push({ x, z, r: b.r });
    // panneau + losange devant le monument, côté arrivée
    let dx = SPAWN.x - x, dz = SPAWN.z - z; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    let d = b.r + 2.4, sx = x + dx * d, sz = z + dz * d;
    for (let i = 0; i < 40 && ter.isWater(sx, sz); i++) { d += 1.5; sx = x + dx * d; sz = z + dz * d; }
    const sy = H(sx, sz);
    const sign = G(P(cyl(0.1, 0.1, 1.6, 0x5d3a24, 6), 0, 0.8, 0), P(box(1.4, 0.9, 0.12, 0xc9a66b), 0, 1.6, 0)); P(sign, sx, sy, sz); sign.rotation.y = rot; group.add(sign);
    const mk = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0xffd60a })); P(mk, sx, sy + 3.4, sz); group.add(mk);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: 0.8, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; P(ring, sx, sy + 0.12, sz); group.add(ring);
    W.inter.push({ kind: 'poi', k, data: poi, pos: new THREE.Vector3(sx, sy, sz), mk, ring, label: poi.title });
  });

  // Personnages
  pl.npcs.forEach(n => {
    const y = H(n.x, n.z), body = person(n.look, pl.era, n.id.length * 7 + n.x); P(body, n.x, y, n.z);
    body.rotation.y = Math.atan2(SPAWN.x - n.x, SPAWN.z - n.z); group.add(body);
    const lab = labelSprite(n.name); P(lab, n.x, y + 2.45, n.z); group.add(lab);
    const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: BUB.give, depthWrite: false, transparent: true })); bub.scale.set(0.8, 0.8, 1); P(bub, n.x, y + 3.15, n.z); bub.visible = false; group.add(bub);
    const it = { kind: 'npc', data: n, pos: new THREE.Vector3(n.x, y, n.z), body, bub, label: n.name, baseRot: body.rotation.y };
    W.npcs[n.id] = it; W.inter.push(it); W.colliders.push({ x: n.x, z: n.z, r: 0.7 });
  });

  // Relais du voyageur (carte du Japon)
  {
    const y = H(RELAY.x, RELAY.z);
    const s = G(P(cyl(0.15, 0.15, 3.2, 0x5d3a24, 6), 0, 1.6, 0), P(box(2.6, 1.6, 0.18, 0xd9381e), 0, 3, 0), P(roof(3.2, 0.8, 0.5, 0x3d4f5c), 0, 3.8, 0));
    const t = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.3), new THREE.MeshBasicMaterial({ map: textTex('🗾 Relais', '#d9381e'), transparent: true }));
    P(t, 0, 3, 0.1); s.add(t); P(s, RELAY.x, y, RELAY.z); s.rotation.y = -0.4; group.add(s);
    W.inter.push({ kind: 'relay', pos: new THREE.Vector3(RELAY.x, y, RELAY.z), label: 'Relais du voyageur' });
    W.colliders.push({ x: RELAY.x, z: RELAY.z, r: 0.5 });
  }

  // Torii du gardien
  if (pl.gate) {
    const y = H(GATE.x, GATE.z), t = torii(pl.final ? 0xffd60a : 0xd9381e); P(t, GATE.x, y, GATE.z); group.add(t);
    W.colliders.push({ x: GATE.x - 5, z: GATE.z, r: 0.9 }, { x: GATE.x + 5, z: GATE.z, r: 0.9 });
    const barrier = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 9.2), new THREE.MeshBasicMaterial({ color: 0x9bf6ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }));
    P(barrier, GATE.x, y + 4.6, GATE.z); group.add(barrier);
    const keeper = person({ robe: 0xffffff, accent: 0xd62828, hat: pl.final ? 'crown' : 'eboshi' }, pl.era, 5); W.updaters.push(t => keeper.userData.anim(t, 0, false)); P(keeper, GATE.x + 6.5, y, GATE.z + 2.5); keeper.rotation.y = 0.6; group.add(keeper);
    const kl = labelSprite(pl.final ? 'Gardienne du temps' : 'Gardien du torii', 'rgba(217,56,30,0.95)', '#fff'); P(kl, GATE.x + 6.5, y + 2.45, GATE.z + 2.5); group.add(kl);
    W.gate = { kind: 'gate', pos: new THREE.Vector3(GATE.x + 6.5, y, GATE.z + 2.5), barrier, label: pl.final ? 'Gardienne du temps' : 'Gardien du torii' };
    W.inter.push(W.gate); W.colliders.push({ x: GATE.x + 6.5, z: GATE.z + 2.5, r: 0.7 });
  }

  // Décors
  seeded(pl.id + '-decor');
  const free = (x, z, pad = 3) => !ter.isWater(x, z) && H(x, z) > -0.1 && !ter.flats.some(f => Math.hypot(f.x - x, f.z - z) < f.r + pad) && Math.hypot(x - RELAY.x, z - RELAY.z) > 4 && Math.abs(x) < 70 && Math.abs(z) < 70;
  const nearPath = (x, z) => segs.some(([bx, bz]) => { const ax = SPAWN.x, az = SPAWN.z, dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; let t = ((x - ax) * dx + (z - az) * dz) / l2; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - ax - t * dx, z - az - t * dz) < 3.5; });
  W.free = (x, z, pad) => free(x, z, pad) && !nearPath(x, z) && !W.colliders.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.2);
  const urban = pl.terrain === 'city' || pl.terrain === 'night' || pl.terrain === 'castle';
  for (const [type, count] of Object.entries(pl.decor || {})) {
    if (!DECOR[type]) continue;
    const big = type === 'machiya' || type === 'house' || type === 'skyscraper';
    const list = [];
    if (big && urban) {
      // quartiers en damier
      const step = type === 'skyscraper' ? 14 : 9;
      for (let gx = -66; gx <= 66; gx += step) for (let gz = -66; gz <= 66; gz += step) {
        if (list.length >= count * 2.2) break;
        const x = gx + (rnd() - 0.5) * 2, z = gz + (rnd() - 0.5) * 2;
        if (Math.abs(x) < 8 || rnd() < 0.25 || !free(x, z, 5) || nearPath(x, z)) continue;
        const s = type === 'skyscraper' ? 0.7 + rnd() * 1.1 : 0.85 + rnd() * 0.3;
        list.push({ x, z, y: H(x, z) - 0.05, s, rot: Math.round(rnd() * 3) * Math.PI / 2 });
        W.colliders.push({ x, z, r: (type === 'skyscraper' ? 3.6 : 2.9) * s });
      }
    } else {
      for (let i = 0, tries = 0; i < count && tries < count * 30; tries++) {
        const x = (rnd() - 0.5) * 136, z = (rnd() - 0.5) * 136;
        if (!free(x, z, type === 'flower' ? 1 : 3) || (type !== 'flower' && nearPath(x, z))) continue;
        const s = type === 'flower' ? 0.8 + rnd() * 0.6 : type === 'skyscraper' ? 0.8 + rnd() * 0.9 : 0.8 + rnd() * 0.5;
        list.push({ x, z, y: H(x, z) - 0.1, s, rot: big ? Math.round(rnd() * 3) * Math.PI / 2 : rnd() * 6.28 }); i++;
        if (type !== 'flower') W.colliders.push({ x, z, r: big ? 3.2 * s : type === 'rock' ? 0.8 * s : 0.5 });
      }
    }
    if (list.length) DECOR[type](list).forEach(m => group.add(m));
  }
  // Bordure : forêt ou ville sur le pourtour
  const edgeType = pl.night ? 'skyscraper' : pl.decor?.cedar ? 'cedar' : pl.decor?.sakura > 15 ? 'sakura' : pl.decor?.maple > 20 ? 'maple' : 'pine';
  const edge = [];
  for (let a = 0; a < Math.PI * 2; a += 0.035) {
    for (const r0 of [68, 75, 82]) {
      const x = Math.cos(a) * r0 * (1 + rnd() * 0.08), z = Math.sin(a) * r0 * (1 + rnd() * 0.08);
      if (ter.isWater(x, z) || H(x, z) < -0.1) continue;
      edge.push({ x, z, y: H(x, z) - 0.2, s: 1 + rnd() * 0.8, rot: rnd() * 6 });
    }
  }
  DECOR[edgeType](edge).forEach(m => group.add(m));
  // Herbe
  if (!pl.night && !urban && !pl.snow) {
    const gl = [];
    for (let k = 0, tries = 0; k < (quality === 'high' ? 6000 : 2500) && tries < 30000; tries++) {
      const x = (rnd() - 0.5) * 140, z = (rnd() - 0.5) * 140; const y = H(x, z);
      if (y < 0.15 || y > 6 || ter.flats.some(f => Math.hypot(f.x - x, f.z - z) < f.r * 0.8) || nearPath(x, z)) continue;
      if (pl.terrain === 'coast' && x > ter.seaX(z) - 12) continue;
      gl.push({ x, z, y, s: 0.5 + rnd() * 0.8, rot: rnd() * 6.3 }); k++;
    }
    const gg = new THREE.ConeGeometry(0.06, 0.55, 3); gg.translate(0, 0.27, 0);
    const im = new THREE.InstancedMesh(gg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), gl.length);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), bc = new THREE.Color(pl.ground).offsetHSL(0, 0.05, -0.08);
    gl.forEach((g2, k) => { e.set((rnd() - 0.5) * 0.5, g2.rot, (rnd() - 0.5) * 0.5); q.setFromEuler(e); mtx.compose(new THREE.Vector3(g2.x, g2.y, g2.z), q, new THREE.Vector3(g2.s, g2.s * (0.7 + rnd()), g2.s)); im.setMatrixAt(k, mtx); im.setColorAt(k, bc.clone().offsetHSL((rnd() - 0.5) * 0.06, 0, (rnd() - 0.5) * 0.14)); });
    im.receiveShadow = true; group.add(im);
  }
  // Rizières en damier (Yoshinogari)
  if (pl.terrain === 'paddies') {
    const plots = [];
    for (let gx = -64; gx <= 64; gx += 11) for (let gz = -64; gz <= 64; gz += 9) { if (!free(gx, gz, 6) || nearPath(gx, gz)) continue; plots.push([gx, gz]); }
    const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(9.6, 0.12, 7.6), new THREE.MeshStandardMaterial({ color: 0x7fc8be, roughness: 0.1, metalness: 0.2 }), plots.length);
    const sm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.12, 0.6, 4), M(0x8bc34a), plots.length * 12);
    const mtx = new THREE.Matrix4(); let si = 0;
    plots.forEach(([x, z], k) => { mtx.makeTranslation(x, 0.06, z); pm.setMatrixAt(k, mtx); for (let i = 0; i < 12; i++) { mtx.makeTranslation(x - 3.6 + (i % 4) * 2.4, 0.4, z - 2.5 + Math.floor(i / 4) * 2.5); sm.setMatrixAt(si++, mtx); } });
    group.add(pm, sm);
  }
  // Chaînes de montagnes brumeuses en couches (perspective atmosphérique)
  seeded(pl.id + '-mt');
  const fogC = new THREE.Color(pl.fog), hillC = new THREE.Color(pl.ground).offsetHSL(0.05, -0.2, pl.night ? -0.2 : -0.28);
  [[150, 22, 0.25], [200, 38, 0.5], [270, 60, 0.72]].forEach(([r0, hh, fade], li) => {
    const n = 180, pos = [], idx = [], ph = rnd() * 10;
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, x = Math.cos(a) * r0, z = Math.sin(a) * r0;
      let h = hh * (0.55 + 0.25 * Math.sin(a * 5 + ph) + 0.15 * Math.sin(a * 13 + ph * 2) + 0.08 * Math.sin(a * 31 + li));
      if (pl.terrain === 'coast' && Math.cos(a) > 0.35) h = -20;
      pos.push(x, -15, z, x, h, z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const col = hillC.clone().lerp(fogC, fade);
    const mt = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, fog: false, side: THREE.DoubleSide })); group.add(mt);
  });
  // Nuages
  for (let k = 0; k < (pl.night ? 0 : 10); k++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX('cloud'), transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
    const a = rnd() * Math.PI * 2, r = 140 + rnd() * 120; sp.position.set(Math.cos(a) * r, 55 + rnd() * 40, Math.sin(a) * r); sp.scale.set(90 + rnd() * 60, 40 + rnd() * 20, 1); group.add(sp);
  }
  if (pl.fuji || pl.id === 'edo') {
    const fuji = G(cone(90, 70, 0, 32), P(cone(32, 25, 0, 32), 0, 22.5, 0));
    fuji.children[0].material = M(0x5a7fb5, { fog: false }); fuji.children[1].material = M(0xffffff, { fog: false });
    fuji.children.forEach(c => c.castShadow = false); P(fuji, -60, 33, -260); group.add(fuji);
  }

  // Objets cachés (5 par lieu)
  seeded(pl.id + '-items');
  const found = save.items[pl.id] || [];
  for (let k = 0, tries = 0; k < 5 && tries < 400; tries++) {
    const x = (rnd() - 0.5) * 120, z = (rnd() - 0.5) * 120;
    if (!W.free(x, z, 4) || Math.hypot(x - SPAWN.x, z - SPAWN.z) < 18) continue;
    if (!found.includes(k)) {
      const y = H(x, z), sp = emojiSprite(pl.items.icon, 1.1); P(sp, x, y + 1, z); group.add(sp);
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.75, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; P(glow, x, y + 0.08, z); group.add(glow);
      W.items.push({ k, x, z, y, sp, glow });
    }
    k++;
  }

  // Passants qui vont et viennent
  W.crowd = [];
  seeded(pl.id + '-crowd');
  const pool = CROWD[pl.era] || CROWD[0];
  for (let k = 0, tries = 0; k < (quality === 'high' ? 9 : 5) && tries < 200; tries++) {
    const x = (rnd() - 0.5) * 110, z = (rnd() - 0.5) * 110; if (!W.free(x, z, 1)) continue;
    const look = pool[k % pool.length], b = person(look, pl.era, 40 + k * 3); P(b, x, H(x, z), z); group.add(b);
    W.crowd.push({ b, x, z, tx: x, tz: z, wait: rnd() * 3, sp: 1.6 + rnd() * 0.8 }); k++;
  }
  refreshQuestWorld();
  setPlaceSky(pl, true);
  return W;
}
function textTex(text, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 144; const x = c.getContext('2d');
  x.fillStyle = color; x.fillRect(0, 0, 256, 144); x.fillStyle = '#fff'; x.font = 'bold 52px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 76);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function roof(w, d, h, c) { const m = cone(Math.SQRT1_2, 1, c, 4); m.rotation.y = Math.PI / 4; m.position.y = 0.5; const g = G(m); g.scale.set(w, h, d); return g; }

// ════════════════ Quêtes
const npcName = id => world?.pl.npcs.find(n => n.id === id)?.name || id;
function qs(q) { return save.quests[q.id]; }
function curStep(q) { const s = qs(q); return s && !s.done ? q.steps[s.step] : null; }
function objectiveText(q, pl = world.pl) {
  const st = curStep(q); if (!st) return 'Terminée ✓';
  if (st.t === 'talk') return `Parle à ${npcName(st.npc)}`;
  if (st.t === 'game') return `Mini-jeu avec ${npcName(st.npc)} : ${GAME_TITLES[st.game || pl.game.id]}`;
  if (st.t === 'visit') return `Découvre : ${pl.pois[st.poi].title}`;
  if (st.t === 'collect') return `Ramasse : ${st.what} ${(save.picks[pickKey(q)] || []).length}/${st.n}`;
  return '';
}
const pickKey = q => `${q.id}#${qs(q).step}`;
function startQuest(q) { save.quests[q.id] = { step: 0, done: false }; commit(); sfx('stamp'); toast(`📜 Nouvelle quête : ${q.title}`); refreshQuestWorld(); }
function advance(q) {
  const s = qs(q); s.step++;
  if (s.step >= q.steps.length) { s.done = true; onQuestDone(q); }
  commit(); refreshQuestWorld();
}
function onQuestDone(q) {
  const pl = placeOfQuest[q.id]; sfx('win');
  if (!q.main) { toast(`✅ Quête terminée : ${q.title}`); return; }
  const next = ERAS[pl.era].places[pl.idx + 1];
  if (next) { if (!save.unlocked.includes(next.id)) save.unlocked.push(next.id); toast(`🗾 Nouveau lieu : ${next.name} ! Ouvre la carte au Relais du voyageur.`); }
  else toast(`⛩️ Quête principale terminée ! Va voir ${pl.final ? 'la gardienne du temps' : 'le gardien du torii'}, au nord.`);
}
// Objets de quête à ramasser
function spawnPicks() {
  const W = world; W.picks.forEach(p => { W.group.remove(p.sp); W.group.remove(p.glow); }); W.picks = [];
  for (const q of W.pl.quests) {
    const st = curStep(q); if (!st || st.t !== 'collect') continue;
    const got = save.picks[pickKey(q)] || [];
    seeded(pickKey(q));
    for (let k = 0, tries = 0; k < st.n && tries < 600; tries++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * st.r, x = st.near[0] + Math.cos(a) * r, z = st.near[1] + Math.sin(a) * r;
      if (!W.free(x, z, 1) || Math.abs(x) > 68 || Math.abs(z) > 68) continue;
      if (!got.includes(k)) {
        const y = W.H(x, z), sp = emojiSprite(st.icon, 1.3); P(sp, x, y + 1.1, z); W.group.add(sp);
        const glow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.95, 24), new THREE.MeshBasicMaterial({ color: q.main ? 0xffd60a : 0x4cc9f0, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; P(glow, x, y + 0.1, z); W.group.add(glow);
        W.picks.push({ q, k, x, z, y, sp, glow });
      }
      k++;
    }
  }
}
function refreshQuestWorld() {
  if (!world) return; const W = world, pl = W.pl;
  // bulles au-dessus des personnages
  Object.values(W.npcs).forEach(n => {
    let tex = null;
    if (pl.quests.some(q => q.giver === n.data.id && !qs(q))) tex = BUB.give;
    if (pl.quests.some(q => { const st = curStep(q); return st && (st.t === 'talk' || st.t === 'game') && st.npc === n.data.id; })) tex = BUB.talk;
    n.bub.visible = !!tex; if (tex) n.bub.material.map = tex;
  });
  W.inter.forEach(it => { if (it.kind === 'poi') { const d = !!save.visited[pl.id]?.[it.k]; it.mk.visible = !d; it.ring.material.color.set(d ? 0x06d6a0 : 0xffd60a); it.ring.material.opacity = d ? 0.45 : 0.85; } });
  if (W.gate) W.gate.barrier.visible = !save.gates[pl.era];
  spawnPicks(); updateHUD();
}
function questTarget() {
  const W = world, pl = W.pl, me = player.pos;
  const ordered = [...pl.quests.filter(q => q.main), ...pl.quests.filter(q => !q.main)];
  for (const q of ordered) {
    const st = curStep(q); if (!st) continue;
    if (st.t === 'talk' || st.t === 'game') return { pos: W.npcs[st.npc].pos, main: q.main };
    if (st.t === 'visit') return { pos: W.inter.find(i => i.kind === 'poi' && i.k === st.poi).pos, main: q.main };
    if (st.t === 'collect') { const ps = W.picks.filter(p => p.q === q); if (ps.length) { ps.sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z)); return { pos: new THREE.Vector3(ps[0].x, ps[0].y, ps[0].z), main: q.main }; } }
  }
  const main = pl.quests.find(q => q.main);
  if (main && !qs(main)) return { pos: W.npcs[main.giver].pos, main: true };
  if (main && qs(main)?.done && W.gate && !save.gates[pl.era]) return { pos: W.gate.pos, main: true };
  return null;
}

// ════════════════ Joueur, Kiko, caméra
const player = { pos: new THREE.Vector3(SPAWN.x, 0, SPAWN.z), vel: new THREE.Vector3(), mesh: person({ robe: 0x3a86ff, accent: 0xffbe0b, hat: 'straw' }, 3, 2) };
scene.add(player.mesh);
function dressPlayer(color) {
  scene.remove(player.mesh); player.mesh = person({ robe: color, accent: 0xffbe0b, hat: 'straw' }, 3, 2);
  const pack = P(box(0.34, 0.42, 0.2, 0x8d5a3b), 0, 0.35, -0.2); player.mesh.userData.torso?.add?.(pack); scene.add(player.mesh);
}
const kiko = fox(); kiko.scale.setScalar(0.8); scene.add(kiko);
const cam = { yaw: 0, pitch: 0.36, dist: 8, tYaw: 0 };

// Particules d'ambiance
const PCOUNT = 420, pGeo = new THREE.BufferGeometry(), pPos = new Float32Array(PCOUNT * 3), pSeed = new Float32Array(PCOUNT);
for (let k = 0; k < PCOUNT; k++) { pPos[k * 3] = (Math.random() - 0.5) * 70; pPos[k * 3 + 1] = Math.random() * 18; pPos[k * 3 + 2] = (Math.random() - 0.5) * 70; pSeed[k] = Math.random() * 100; }
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const pMat = new THREE.PointsMaterial({ size: 0.45, map: dotTex, transparent: true, depthWrite: false, color: 0xffafcc });
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
const PSTYLE = { sakura: { c: 0xffafcc, s: 0.5, fall: 1.2, drift: 1.4 }, momiji: { c: 0xf77f00, s: 0.55, fall: 1.5, drift: 1.2 }, leaves: { c: 0x9ccc65, s: 0.45, fall: 1.1, drift: 1 }, pollen: { c: 0xfff3b0, s: 0.35, fall: 0.2, drift: 0.6, add: true }, snow: { c: 0xffffff, s: 0.5, fall: 1.8, drift: 0.6 }, neon: { c: 0x4cc9f0, s: 0.4, fall: -0.3, drift: 0.8, add: true } };

function setPlaceSky(pl, instant) {
  skyState.tElev = pl.sun[0]; skyState.tAzim = pl.sun[1];
  if (instant) { skyState.elev = pl.sun[0]; skyState.azim = pl.sun[1]; }
  skyU.turbidity.value = pl.turbidity || 5; skyU.rayleigh.value = pl.night ? 0.5 : 1.6;
  applySky(skyState.elev, skyState.azim); bakeEnv(pl);
  scene.fog.color.set(pl.fog); scene.fog.near = pl.fogNear || 60; scene.fog.far = pl.fogFar || 230;
  const ps = PSTYLE[pl.particles]; points.visible = !!ps;
  if (ps) { pMat.color.set(ps.c); pMat.size = ps.s; pMat.blending = ps.add ? THREE.AdditiveBlending : THREE.NormalBlending; pMat.needsUpdate = true; }
}

// ════════════════ Contrôles
const keys = new Set();
const joy = { x: 0, y: 0, active: false, id: null };
let uiBlocked = true;
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if ($('#minigame').classList.contains('show')) return;
  keys.add(e.code);
  if (dlg) { if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); dialogNext(); } if (/^Digit[1-4]$/.test(e.code)) pickOption(+e.code.slice(5) - 1); return; }
  if (e.code === 'Escape') { closeModals(); return; }
  if (anyModal()) return;
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
  if (e.code === 'KeyJ') toggleJournal();
  if (e.code === 'KeyH') hint();
  if (e.code === 'KeyM') openTravel();
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());
const drags = new Map();
canvas.addEventListener('pointerdown', e => { drags.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  const d = drags.get(e.pointerId); if (!d) return;
  if (drags.size === 2) { const [a, b] = [...drags.values()]; const before = Math.hypot(a.x - b.x, a.y - b.y); d.x = e.clientX; d.y = e.clientY; const [a2, b2] = [...drags.values()]; cam.dist = THREE.MathUtils.clamp(cam.dist * before / Math.max(Math.hypot(a2.x - b2.x, a2.y - b2.y), 1), 5, 24); return; }
  const dx = e.clientX - d.x, dy = e.clientY - d.y; d.x = e.clientX; d.y = e.clientY;
  cam.tYaw -= dx * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + dy * 0.004, 0.08, 1.2);
});
const endDrag = e => drags.delete(e.pointerId);
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', e => { e.preventDefault(); cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.1), 5, 24); }, { passive: false });
const joyEl = $('#joystick'), knob = $('#knob');
if (isTouch) document.body.classList.add('touch');
joyEl.addEventListener('pointerdown', e => { joy.active = true; joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
joyEl.addEventListener('pointermove', e => { if (joy.active && e.pointerId === joy.id) moveJoy(e); });
const stopJoy = () => { joy.active = false; joy.x = joy.y = 0; knob.style.transform = 'translate(-50%,-50%)'; };
joyEl.addEventListener('pointerup', stopJoy); joyEl.addEventListener('pointercancel', stopJoy);
function moveJoy(e) { const r = joyEl.getBoundingClientRect(), R = r.width / 2; let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } joy.x = dx / R; joy.y = -dy / R; knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`; }

// ════════════════ Dialogues
let dlg = null;
const dlgEl = $('#dialog');
function openDialog({ speaker, color = '#d9381e', pages, quiz = null, choices = null, onDone = null, icon = '💬' }) {
  dlg = { pages: pages.map(p => p.replace('{name}', profile?.name || 'voyageur')), k: 0, quiz, choices, onDone, answered: false };
  $('#dlg-speaker').textContent = speaker; $('#dlg-speaker').style.background = color; $('#dlg-icon').textContent = icon;
  dlgEl.classList.add('show'); renderDialog(); sfx('open');
}
function renderDialog() {
  const opts = $('#dlg-options'); opts.innerHTML = '';
  const last = dlg.k >= dlg.pages.length - 1;
  $('#dlg-text').textContent = dlg.pages[dlg.k];
  $('#dlg-count').textContent = dlg.pages.length > 1 ? `${dlg.k + 1} / ${dlg.pages.length}` : '';
  const list = last && dlg.quiz && !dlg.answered ? dlg.quiz.options : last && dlg.choices ? dlg.choices.map(c => c.label) : null;
  if (list) { $('#dlg-next').style.display = 'none'; list.forEach((o, n) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<span>${n + 1}</span>${o}`; b.onclick = () => pickOption(n); opts.appendChild(b); }); }
  else { $('#dlg-next').style.display = ''; $('#dlg-next').textContent = last ? 'Terminer ✓' : 'Suivant ▸'; }
}
function pickOption(n) {
  if (!dlg || dlg.k < dlg.pages.length - 1) return;
  if (dlg.quiz && !dlg.answered) {
    const q = dlg.quiz;
    if (n === q.answer) { dlg.answered = true; sfx('win'); dlg.pages.push('✅ ' + q.explain); dlg.k = dlg.pages.length - 1; const cb = dlg.onDone; dlg.onDone = () => cb && cb(true); renderDialog(); }
    else { sfx('wrong'); const btns = $('#dlg-options').children; if (btns[n]) { btns[n].classList.add('bad'); btns[n].disabled = true; } toast("Pas tout à fait… Réessaie ! Les habitants de cette époque t'ont donné la réponse."); }
    return;
  }
  if (dlg.choices && dlg.choices[n]) { const c = dlg.choices[n]; closeDialog(); c.fn && c.fn(); }
}
function closeDialog() { dlg = null; talking = null; dlgEl.classList.remove('show'); updateHUD(); }
function dialogNext() {
  if (!dlg) return;
  const last = dlg.k >= dlg.pages.length - 1;
  if (last && ((dlg.quiz && !dlg.answered) || dlg.choices)) return;
  if (!last) { dlg.k++; renderDialog(); sfx('tick'); return; }
  const cb = dlg.onDone; closeDialog(); if (cb) cb();
}
$('#dlg-next').onclick = dialogNext;

// ════════════════ Interactions
let nearest = null;
function interact() {
  if (!nearest || dlg || uiBlocked || anyModal()) return;
  const it = nearest, pl = world.pl;
  if (it.kind === 'poi') {
    openDialog({ speaker: it.data.title, color: '#e09f3e', icon: '⛩️', pages: it.data.text, onDone: () => visitPoi(it.k) });
  } else if (it.kind === 'npc') talkTo(it);
  else if (it.kind === 'relay') openTravel();
  else if (it.kind === 'gate') {
    const main = pl.quests.find(q => q.main);
    if (save.gates[pl.era]) { openDialog({ speaker: it.label, pages: pl.final ? ['Ton voyage est accompli, pèlerin. Le chemin reste ouvert : reviens quand tu veux !'] : ['Le passage est ouvert. Bonne route, pèlerin !'], choices: pl.final ? [{ label: 'Revoir mon certificat', fn: showCertificate }, { label: 'Au revoir', fn: null }] : null }); return; }
    if (!qs(main)?.done) { openDialog({ speaker: it.label, pages: [`Halte, voyageur ! Termine d'abord la quête « ${main.title} ».`, 'Kiko 🦊 peut t\'aider à trouver ton chemin.'] }); return; }
    const era = ERAS[pl.era];
    openDialog({ speaker: it.label, icon: '❓', pages: [`Tu as parcouru l'époque ${era.name}. Voici ma question :`, era.quiz.q], quiz: era.quiz, onDone: ok => { if (ok) solveGate(pl.era); } });
  }
}
let talking = null;
function talkTo(it) {
  const n = it.data, pl = world.pl; talking = it;
  it.body.rotation.y = Math.atan2(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
  for (const q of pl.quests) {
    const st = curStep(q); if (!st) continue;
    if (st.t === 'talk' && st.npc === n.id) { openDialog({ speaker: n.name, color: '#3a86ff', icon: '🗣️', pages: st.say?.length ? st.say : n.lines, onDone: () => advance(q) }); return; }
    if (st.t === 'game' && st.npc === n.id) { openDialog({ speaker: n.name, color: '#3a86ff', icon: '🎮', pages: st.say?.length ? st.say : ['À toi de jouer !'], choices: [{ label: `Jouer : ${GAME_TITLES[st.game || pl.game.id]}`, fn: () => runGame(st.game || pl.game.id, q) }, { label: 'Plus tard', fn: null }] }); return; }
  }
  const avail = pl.quests.find(q => q.giver === n.id && !qs(q));
  if (avail) { openDialog({ speaker: n.name, color: '#3a86ff', icon: avail.main ? '⭐' : '📜', pages: avail.intro, choices: [{ label: `${avail.main ? '⭐ ' : ''}Accepter : « ${avail.title} »`, fn: () => startQuest(avail) }, { label: 'Pas maintenant', fn: null }] }); return; }
  const mine = pl.quests.find(q => q.giver === n.id && qs(q) && !qs(q).done);
  const pages = mine ? [...n.lines.slice(0, 1), `Pour « ${mine.title} » : ${objectiveText(mine)}.`] : n.lines;
  const g = pl.game.npc === n.id && save.games[pl.game.id] !== undefined ? pl.game.id : (pl.quests.flatMap(q => q.steps).find(s => s.t === 'game' && s.npc === n.id && s.game && save.games[s.game] !== undefined)?.game);
  openDialog({ speaker: n.name, color: '#3a86ff', icon: '🗣️', pages, choices: g ? [{ label: `🎮 Rejouer : ${GAME_TITLES[g]} (record : ${save.games[g]})`, fn: () => runGame(g, null) }, { label: 'Au revoir', fn: null }] : null });
}
function visitPoi(k) {
  const pl = world.pl; save.visited[pl.id] = save.visited[pl.id] || {};
  const first = !save.visited[pl.id][k]; save.visited[pl.id][k] = true;
  if (first) { sfx('stamp'); toast(`✨ ${pl.pois[k].title} ajouté au carnet`); }
  const q = pl.quests.find(q => { const st = curStep(q); return st && st.t === 'visit' && st.poi === k; });
  if (q) { const st = curStep(q); if (st.say?.length) openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: st.say, onDone: () => advance(q) }); else advance(q); }
  commit(); refreshQuestWorld();
}
async function runGame(id, q) {
  uiBlocked = true; keys.clear();
  const r = await playMinigame(id, sfx);
  uiBlocked = false;
  if (r.quit) return;
  if (r.win) {
    const prev = save.games[id]; save.games[id] = prev === undefined ? r.score : (typeof r.score === 'number' && typeof prev === 'number' ? Math.max(prev, r.score) : r.score);
    if (q && curStep(q)?.t === 'game') advance(q); else commit();
    toast(`🎉 ${GAME_TITLES[id]} réussi !`);
  } else { if (save.games[id] === undefined) {} toast('Pas grave ! Reparle au personnage pour retenter ta chance.'); }
}
function solveGate(era) {
  save.gates[era] = true; sfx('win');
  const next = ERAS[era + 1];
  if (next) {
    const id = next.places[0].id; if (!save.unlocked.includes(id)) save.unlocked.push(id); commit(); refreshQuestWorld();
    setTimeout(() => openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: [`Bravo ! Le torii s'ouvre sur une nouvelle époque : ${next.name} (${next.dates}).`], choices: [{ label: `Voyager vers ${next.places[0].name}`, fn: () => travel(id) }, { label: 'Rester ici encore un peu', fn: null }] }), 400);
  } else { save.finished = true; commit(); refreshQuestWorld(); setTimeout(showCertificate, 600); }
}

// ════════════════ Voyage
let travelling = false;
async function travel(id) {
  if (travelling) return; travelling = true; closeModals();
  const fade = $('#fade'); fade.classList.add('show'); await new Promise(r => setTimeout(r, 450));
  save.place = id; save.pos = null; commit();
  buildPlace(PLACE[id]);
  player.pos.set(SPAWN.x, world.H(SPAWN.x, SPAWN.z), SPAWN.z); player.vel.set(0, 0, 0); cam.yaw = cam.tYaw = 0; player.mesh.rotation.y = Math.PI;
  kiko.position.set(SPAWN.x + 2, 1, SPAWN.z + 2);
  fade.classList.remove('show'); travelling = false; arrive();
}
function arrive() {
  const pl = world.pl; showBanner(pl); updateHUD();
  if (!save.tuto) { save.tuto = true; save.seen[pl.id] = true; commit(); setTimeout(() => openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: [...KIKO_TUTORIAL, ...pl.intro] }), 500); }
  else if (!save.seen[pl.id]) { save.seen[pl.id] = true; commit(); setTimeout(() => openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: pl.intro }), 700); }
}

// ════════════════ Carte du Japon
const JAPAN = [
  [[139.9, 41.4], [140.5, 41.8], [141.2, 41.8], [141, 42.4], [141.7, 42.6], [143.2, 42], [143.9, 42.9], [145.6, 43.3], [145.3, 44.3], [143, 44.5], [141.9, 45.5], [141.6, 45.2], [141.8, 44.2], [141.3, 43.3], [140.4, 43.3], [139.8, 42.6], [140, 42.2]],
  [[141.4, 41.4], [141.5, 40.5], [142, 39.5], [141.6, 38.3], [141, 37.8], [141, 36.8], [140.6, 35.7], [140.9, 35.1], [140, 34.9], [139.8, 35.3], [139.2, 34.9], [138.8, 34.6], [138.3, 34.6], [137.3, 34.6], [136.9, 34.3], [136.2, 34.2], [135.8, 33.5], [135.1, 33.9], [135.3, 34.6], [134.2, 34.7], [133, 34.4], [132.2, 34], [130.9, 33.9], [131.1, 34.4], [132.6, 35.4], [133.4, 35.5], [134.6, 35.6], [135.6, 35.5], [136.1, 35.8], [136.7, 36.8], [137.3, 36.8], [138.5, 37.4], [139.4, 38.2], [139.9, 39.2], [140, 40.3], [140.3, 41.2], [140.9, 41.5]],
  [[132, 33.3], [132.6, 32.8], [133, 32.7], [133.7, 33.5], [134.3, 33.3], [134.7, 33.8], [134.6, 34.2], [133.6, 34.3], [132.9, 34.1], [132.5, 33.8]],
  [[129.8, 33.4], [130.4, 33.8], [131, 33.9], [131.7, 33.6], [131.6, 32.6], [131.4, 31.4], [130.7, 31], [130.2, 31.3], [130.4, 32.1], [129.8, 32.7]],
  [[130.9, 30.8], [131.1, 30.75], [131.05, 30.35], [130.9, 30.4]],
];
const proj = (lon, lat) => [(lon - 128.8) * 28, (46 - lat) * 34];
const ERA_COL = ['#c1440e', '#9c6644', '#2a9d8f', '#9d4edd', '#3a5a40', '#d62828', '#1d3557', '#e76f51', '#ff006e'];
function openTravel() {
  if (uiBlocked) return;
  const svg = [`<svg viewBox="-10 -10 480 560" xmlns="http://www.w3.org/2000/svg"><rect x="-10" y="-10" width="480" height="560" fill="#bfe3f2"/>`];
  JAPAN.forEach(poly => svg.push(`<polygon points="${poly.map(([a, b]) => proj(a, b).join(',')).join(' ')}" fill="#9ccc65" stroke="#4a7c3a" stroke-width="2" stroke-linejoin="round"/>`));
  PLACES.forEach(p => {
    const [x, y] = proj(p.lon, p.lat), un = save.unlocked.includes(p.id), cur = p.id === save.place;
    svg.push(`<g class="pin ${un ? 'on' : 'off'} ${cur ? 'cur' : ''}" data-id="${p.id}"><circle cx="${x}" cy="${y}" r="${cur ? 9 : 7}" fill="${un ? ERA_COL[p.era] : '#9e9e9e'}" stroke="#fff" stroke-width="2.5"/>${cur ? `<circle cx="${x}" cy="${y}" r="14" fill="none" stroke="${ERA_COL[p.era]}" stroke-width="2"><animate attributeName="r" values="9;18;9" dur="1.6s" repeatCount="indefinite"/></circle>` : ''}</g>`);
  });
  svg.push('</svg>');
  $('#travel-map').innerHTML = svg.join('');
  const list = $('#travel-list'); list.innerHTML = '';
  ERAS.forEach((e, ei) => {
    const sec = document.createElement('section');
    sec.innerHTML = `<h3 style="color:${ERA_COL[ei]}">${ei + 1}. ${e.name} <small>${e.dates}</small></h3>`;
    e.places.forEach(p => {
      const un = save.unlocked.includes(p.id), main = p.quests.find(q => q.main), done = qs(main)?.done;
      const b = document.createElement('button'); b.className = 'place' + (un ? '' : ' lock') + (p.id === save.place ? ' cur' : '');
      const items = (save.items[p.id] || []).length;
      b.innerHTML = `<b>${un ? '' : '🔒 '}${p.name}</b><span>${p.region}</span><em>${un ? `${done ? '✅' : '⭐'} · ${items}/5 objets` : 'Termine le lieu précédent'}</em>`;
      b.onclick = () => { if (!un) { toast('🔒 Ce lieu est encore fermé.'); return; } if (p.id === save.place) { closeModals(); return; } travel(p.id); };
      b.onmouseenter = () => highlightPin(p.id);
      sec.appendChild(b);
    });
    list.appendChild(sec);
  });
  $('#travel-map').querySelectorAll('.pin').forEach(g => g.addEventListener('click', () => { const p = PLACE[g.dataset.id]; if (!save.unlocked.includes(p.id)) { toast(`🔒 ${p.name} : encore fermé`); return; } if (p.id === save.place) { closeModals(); return; } travel(p.id); }));
  $('#travel').classList.add('show');
}
function highlightPin(id) { $('#travel-map').querySelectorAll('.pin').forEach(g => g.classList.toggle('hl', g.dataset.id === id)); }
$('#travel-close').onclick = () => $('#travel').classList.remove('show');

// ════════════════ Interface
function updateHUD() {
  if (!world) return; const pl = world.pl, era = ERAS[pl.era];
  $('#era-name').textContent = pl.name; $('#era-dates').textContent = `${era.name} · ${era.dates}`;
  const items = (save.items[pl.id] || []).length;
  $('#era-progress').innerHTML = `<span title="Objets cachés">${pl.items.icon} ${items}/5</span><span title="Monuments">⛩️ ${Object.keys(save.visited[pl.id] || {}).length}/${pl.pois.length}</span><span title="Quêtes">📜 ${pl.quests.filter(q => qs(q)?.done).length}/${pl.quests.length}</span>`;
  const tr = $('#tracker'); const rows = [];
  pl.quests.forEach(q => { if (qs(q) && !qs(q).done) rows.push(`<li class="${q.main ? 'main' : ''}"><b>${q.main ? '⭐' : '📜'} ${q.title}</b><span>${objectiveText(q)}</span></li>`); });
  const main = pl.quests.find(q => q.main);
  if (!qs(main)) rows.unshift(`<li class="main"><b>⭐ Nouvelle quête</b><span>Parle à ${npcName(main.giver)} (bulle « ! »)</span></li>`);
  else if (qs(main).done) {
    const next = ERAS[pl.era].places[pl.idx + 1];
    if (next) rows.unshift(`<li class="main"><b>🗾 Suite du voyage</b><span>Relais du voyageur → ${next.name}</span></li>`);
    else if (!save.gates[pl.era]) rows.unshift(`<li class="main"><b>⛩️ Le torii</b><span>Réponds à ${pl.final ? 'la gardienne du temps' : 'au gardien'}, au nord</span></li>`);
  }
  tr.innerHTML = rows.length ? `<ul>${rows.join('')}</ul>` : '<ul><li><b>✨ Tout est fait ici !</b><span>Cherche les objets cachés ou voyage plus loin.</span></li></ul>';
  $('#total').textContent = `${progressOf(save)} %`;
  $('#btn-profile').title = profile ? `Joueur : ${profile.name}` : 'Joueur';
}
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800); }
function showBanner(pl) {
  const b = $('#banner'); $('#banner-name').textContent = pl.name; $('#banner-dates').textContent = `${ERAS[pl.era].name} · ${pl.region}`; $('#banner-num').textContent = `Époque ${pl.era + 1} / ${ERAS.length}`;
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function hint() {
  if (dlg || uiBlocked) return; const pl = world.pl;
  const t = questTarget(); let dir = '';
  if (t) { const a = Math.atan2(t.pos.x - player.pos.x, t.pos.z - player.pos.z), d = Math.round(Math.hypot(t.pos.x - player.pos.x, t.pos.z - player.pos.z)); const card = ['au sud', 'au sud-est', "à l'est", 'au nord-est', 'au nord', 'au nord-ouest', "à l'ouest", 'au sud-ouest'][((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8]; dir = `C'est ${card}, à environ ${d} pas. Suis la colonne de lumière !`; }
  const lines = pl.quests.filter(q => qs(q) && !qs(q).done).map(q => `${q.main ? '⭐' : '📜'} ${q.title} : ${objectiveText(q)}`);
  const pages = [lines.length ? lines.join('\n') : $('#tracker').innerText, dir || 'Explore librement : il reste peut-être des objets cachés !', `Objets cachés trouvés ici : ${(save.items[pl.id] || []).length}/5. Ils scintillent quand tu t'en approches.`];
  openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages });
}
$('#btn-hint').onclick = hint;
$('#btn-act').onclick = () => interact();
$('#btn-map').onclick = openTravel;

function toggleJournal() {
  const j = $('#journal'); if (j.classList.contains('show')) { j.classList.remove('show'); return; }
  const body = $('#journal-body'); body.innerHTML = '';
  ERAS.forEach((e, ei) => {
    const places = e.places.filter(p => save.unlocked.includes(p.id)); if (!places.length) return;
    const sec = document.createElement('section');
    sec.innerHTML = `<h3><span class="stamp ${save.gates[ei] ? 'ok' : ''}">${save.gates[ei] ? '印' : ei + 1}</span>${e.name} <small>${e.dates}</small></h3>` + places.map(p => {
      const v = save.visited[p.id] || {}, pois = p.pois.filter((x, k) => v[k]), qd = p.quests.filter(q => qs(q)?.done);
      const games = [...new Set([p.game.id, ...p.quests.flatMap(q => q.steps).filter(s => s.game).map(s => s.game)])].filter(g => save.games[g] !== undefined);
      return `<div class="jplace"><h4>📍 ${p.name} <small>${p.region}</small></h4><p class="muted">${p.items.icon} ${(save.items[p.id] || []).length}/5 objets cachés · 📜 ${qd.length}/${p.quests.length} quêtes${games.length ? ' · 🎮 ' + games.map(g => `${GAME_TITLES[g]} (${save.games[g]})`).join(', ') : ''}</p>` +
        (pois.length ? pois.map(x => `<details><summary>⛩️ ${x.title}</summary><p>${x.text.join('</p><p>')}</p></details>`).join('') : '<p class="muted">Aucun monument découvert pour l\'instant.</p>') + '</div>';
    }).join('');
    body.appendChild(sec);
  });
  j.classList.add('show');
}
$('#btn-journal').onclick = toggleJournal;
$('#journal-close').onclick = () => $('#journal').classList.remove('show');
const anyModal = () => ['#journal', '#travel', '#certificate', '#profile-menu'].some(s => $(s).classList.contains('show'));
function closeModals() { ['#journal', '#travel', '#profile-menu'].forEach(s => $(s).classList.remove('show')); }
$('#btn-full').onclick = () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} };
$('#btn-quality').onclick = () => { quality = quality === 'high' ? 'low' : 'high'; try { localStorage.setItem('michi-quality', quality); } catch (e) {} applyQuality(); toast(quality === 'high' ? 'Qualité HD : lumière et ombres renforcées' : 'Qualité SD : plus fluide sur mobile'); };

function showCertificate() {
  $('#cert-name').textContent = profile?.name || 'Voyageur';
  $('#cert-stamps').innerHTML = ERAS.map(e => `<span title="${e.name}">${e.name.split(' ')[0]}</span>`).join('');
  const items = Object.values(save.items).reduce((a, l) => a + l.length, 0), qd = Object.values(save.quests).filter(q => q.done).length;
  $('#cert-stats').textContent = `${qd} quêtes accomplies · ${items} objets cachés sur ${PLACES.length * 5} · ${Object.keys(save.games).length} mini-jeux réussis · progression ${progressOf(save)} %`;
  $('#cert-date').textContent = new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  $('#certificate').classList.add('show'); sfx('win');
}
$('#cert-close').onclick = () => $('#certificate').classList.remove('show');

// Menu du joueur : code de transfert, changement de joueur
$('#btn-profile').onclick = () => { $('#pm-name').textContent = profile.name; $('#pm-progress').textContent = `${progressOf(save)} % du voyage`; $('#pm-code').value = ''; $('#profile-menu').classList.add('show'); };
$('#pm-close').onclick = () => $('#profile-menu').classList.remove('show');
$('#pm-export').onclick = () => { const code = encodeSave(); $('#pm-code').value = code; $('#pm-code').select(); try { navigator.clipboard.writeText(code); toast('📋 Code copié !'); } catch (e) {} };
$('#pm-switch').onclick = () => { commit(); location.reload(); };
function encodeSave() { const json = JSON.stringify({ v: 2, name: profile.name, color: profile.color, save }); return 'MICHI-' + btoa(unescape(encodeURIComponent(json))); }
function decodeSave(code) { const json = decodeURIComponent(escape(atob(code.trim().replace(/^MICHI-/, '')))); const o = JSON.parse(json); if (!o.save || !o.name) throw new Error('code'); return o; }

// ════════════════ Musique et bruitages (générés)
let actx = null, musicOn = false, nextNote = 0, master;
const SCALE = [0, 1, 5, 7, 8, 12, 13, 17, 19, 20, 24];
function ensureAudio() {
  if (actx) return;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0.5; const delay = actx.createDelay(); delay.delayTime.value = 0.38; const fb = actx.createGain(); fb.gain.value = 0.32; delay.connect(fb); fb.connect(delay); master.connect(delay); delay.connect(actx.destination); master.connect(actx.destination); } catch (e) { actx = null; }
}
function pluck(freq, t, vol = 0.18, dur = 1.6, type = 'triangle') {
  if (!actx) return; const o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
  o.type = type; o.frequency.value = freq; f.type = 'lowpass'; f.frequency.value = 2400;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function music() {
  if (!actx || !musicOn || $('#minigame').classList.contains('show')) return;
  const t = actx.currentTime; if (t < nextNote - 0.1) return;
  const base = 293.66 * (world?.pl.night ? 0.75 : 1), n = SCALE[Math.floor(Math.random() * SCALE.length)];
  pluck(base * Math.pow(2, n / 12), Math.max(t, nextNote), 0.12);
  if (Math.random() < 0.25) pluck(base / 2 * Math.pow(2, SCALE[Math.floor(Math.random() * 5)] / 12), Math.max(t, nextNote), 0.08, 2.4, 'sine');
  nextNote = Math.max(t, nextNote) + [0.45, 0.9, 0.9, 1.35, 1.8][Math.floor(Math.random() * 5)];
}
function sfx(kind) {
  if (!actx) return; const t = actx.currentTime, b = 587.33;
  if (kind === 'tick') pluck(b * 2, t, 0.05, 0.15);
  if (kind === 'open') pluck(b * 1.5, t, 0.08, 0.4);
  if (kind === 'stamp') { pluck(b, t, 0.15, 0.8); pluck(b * 1.5, t + 0.12, 0.15, 0.9); pluck(b * 2, t + 0.24, 0.15, 1.2); }
  if (kind === 'win') [0, 5, 7, 12, 17].forEach((n, k) => pluck(b * Math.pow(2, n / 12), t + k * 0.11, 0.16, 1.4));
  if (kind === 'wrong') { pluck(220, t, 0.15, 0.4, 'sawtooth'); pluck(207, t + 0.15, 0.12, 0.5, 'sawtooth'); }
  if (kind.startsWith('drum')) { const k = +kind.slice(4); pluck([70, 95, 120, 150][k] || 90, t, 0.6, 0.5, 'sine'); pluck([140, 190, 240, 300][k] || 180, t, 0.1, 0.12, 'square'); }
}
$('#btn-music').onclick = () => { ensureAudio(); if (actx?.state === 'suspended') actx.resume(); musicOn = !musicOn; $('#btn-music').textContent = musicOn ? '🔊' : '🔈'; $('#btn-music').classList.toggle('on', musicOn); };

// ════════════════ Écran titre : profils
const COLORS = [0x3a86ff, 0xd62828, 0x2a9d8f, 0x9d4edd, 0xff8c42, 0x06d6a0, 0xff4d6d, 0x1d3557];
let newColor = COLORS[0];
function renderProfiles() {
  const box = $('#profiles'); box.innerHTML = '';
  store.list.sort((a, b) => (b.last || 0) - (a.last || 0)).forEach(p => {
    const sv = store.saves[p.id] || newSave(), pl = PLACE[sv.place] || PLACES[0];
    const card = document.createElement('div'); card.className = 'pcard';
    card.innerHTML = `<span class="pdot" style="background:#${p.color.toString(16).padStart(6, '0')}"></span><div><b>${escapeHtml(p.name)}</b><small>${pl.name} · ${progressOf(sv)} %</small></div><button class="big play">Jouer ▸</button><button class="ghost del" title="Supprimer">🗑</button>`;
    card.querySelector('.play').onclick = () => start(p);
    card.querySelector('.del').onclick = () => ask(`Supprimer le joueur « ${p.name} » et toute sa progression ?`, 'Supprimer', () => { store.list = store.list.filter(x => x !== p); delete store.saves[p.id]; persist(); renderProfiles(); });
    box.appendChild(card);
  });
  $('#profiles-title').style.display = store.list.length ? '' : 'none';
}
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function renderSwatches() { const s = $('#swatches'); s.innerHTML = ''; COLORS.forEach(c => { const b = document.createElement('button'); b.className = 'sw' + (c === newColor ? ' on' : ''); b.style.background = '#' + c.toString(16).padStart(6, '0'); b.onclick = () => { newColor = c; renderSwatches(); }; s.appendChild(b); }); }
function createProfile(name, color, sv) {
  const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name.slice(0, 24), color, created: Date.now(), last: Date.now() };
  store.list.push(p); store.saves[p.id] = sv || newSave(); persist(); return p;
}
$('#btn-new').onclick = () => { const n = $('#player-name').value.trim(); if (!n) { $('#player-name').focus(); $('#player-name').classList.add('shake'); setTimeout(() => $('#player-name').classList.remove('shake'), 500); return; } start(createProfile(n, newColor)); };
$('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-new').click(); });
$('#btn-import').onclick = () => { $('#import-box').classList.toggle('open'); };
$('#btn-import-go').onclick = () => {
  try { const o = decodeSave($('#import-code').value); const p = createProfile(o.name, o.color || COLORS[0], { ...newSave(), ...o.save }); toast('Partie importée !'); renderProfiles(); $('#import-box').classList.remove('open'); $('#import-code').value = ''; start(p); }
  catch (e) { $('#import-msg').textContent = 'Code invalide. Vérifie que tu as copié tout le code, en commençant par MICHI-.'; }
};
function ask(q, yes, fn) { $('#ask-text').textContent = q; $('#ask-yes').textContent = yes; $('#ask').classList.add('show'); $('#ask-yes').onclick = () => { $('#ask').classList.remove('show'); fn(); }; $('#ask-no').onclick = () => $('#ask').classList.remove('show'); }

function start(p) {
  profile = p; save = { ...newSave(), ...(store.saves[p.id] || {}) }; commit();
  ensureAudio(); if (actx?.state === 'suspended') actx.resume(); musicOn = true; $('#btn-music').textContent = '🔊'; $('#btn-music').classList.add('on');
  dressPlayer(p.color);
  buildPlace(PLACE[save.place] || PLACES[0]);
  if (save.pos && save.pos.place === save.place) player.pos.set(save.pos.x, world.H(save.pos.x, save.pos.z), save.pos.z);
  else player.pos.set(SPAWN.x, world.H(SPAWN.x, SPAWN.z), SPAWN.z);
  player.mesh.rotation.y = Math.PI; kiko.position.set(player.pos.x + 2, 1, player.pos.z + 2);
  $('#title').classList.add('hide'); uiBlocked = false; arrive();
}
renderProfiles(); renderSwatches();
$('#loading').style.display = 'none'; $('#title-buttons').style.display = '';

function stepWalker(c, dt, t) {
  const W = world; let moving = 0;
  if (c.wait > 0) c.wait -= dt;
  else {
    const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
    if (d < 0.5) { c.wait = 1 + Math.random() * 4; for (let i = 0; i < 12; i++) { const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 18, nx = c.x + Math.cos(a) * r, nz = c.z + Math.sin(a) * r; if (Math.abs(nx) < 66 && Math.abs(nz) < 66 && W.free(nx, nz, 0.5)) { c.tx = nx; c.tz = nz; break; } } }
    else {
      const nx = c.x + dx / d * c.sp * dt, nz = c.z + dz / d * c.sp * dt;
      if (W.ter.isWater(nx, nz) || W.colliders.some(o => Math.abs(o.x - nx) < o.r + 0.5 && Math.abs(o.z - nz) < o.r + 0.5 && Math.hypot(o.x - nx, o.z - nz) < o.r + 0.4) || Math.hypot(player.pos.x - nx, player.pos.z - nz) < 1) { c.tx = c.x; c.tz = c.z; }
      else { c.x = nx; c.z = nz; moving = c.sp; c.b.rotation.y = Math.atan2(dx, dz); }
    }
  }
  c.b.position.set(c.x, W.H(c.x, c.z), c.z); c.b.userData.anim(t, moving, false, dt);
}

// ════════════════ Boucle principale
const clock = new THREE.Clock(), tmp = new THREE.Vector3();
let walkT = 0, saveT = 0;
function step(dt, t) {
  if (!world) return;
  const W = world, H = W.H;
  let ix = 0, iy = 0;
  if (!dlg && !uiBlocked && !anyModal()) {
    if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    if (joy.active) { ix += joy.x; iy += joy.y; }
  }
  const len = Math.hypot(ix, iy); if (len > 1) { ix /= len; iy /= len; }
  const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || (joy.active && Math.hypot(joy.x, joy.y) > 0.95);
  const speed = run ? 15 : 9, fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
  player.vel.x += ((fx * iy + rx * ix) * speed - player.vel.x) * Math.min(1, dt * 10);
  player.vel.z += ((fz * iy + rz * ix) * speed - player.vel.z) * Math.min(1, dt * 10);
  const ox = player.pos.x, oz = player.pos.z;
  player.pos.x += player.vel.x * dt; player.pos.z += player.vel.z * dt;
  for (const c of W.colliders) { const dx = player.pos.x - c.x, dz = player.pos.z - c.z; if (Math.abs(dx) > c.r + 1 || Math.abs(dz) > c.r + 1) continue; const d = Math.hypot(dx, dz), min = c.r + 0.55; if (d < min && d > 0.0001) { player.pos.x = c.x + dx / d * min; player.pos.z = c.z + dz / d * min; } }
  player.pos.x = THREE.MathUtils.clamp(player.pos.x, -LIMIT, LIMIT); player.pos.z = THREE.MathUtils.clamp(player.pos.z, -LIMIT, LIMIT);
  if (W.ter.isWater(player.pos.x, player.pos.z) || H(player.pos.x, player.pos.z) > 9) { player.pos.x = ox; player.pos.z = oz; player.vel.multiplyScalar(0.2); }
  const sp = Math.hypot(player.vel.x, player.vel.z);
  if (sp > 0.4) {
    let d = Math.atan2(player.vel.x, player.vel.z) - player.mesh.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); player.mesh.rotation.y += d * Math.min(1, dt * 12);
    walkT += dt * sp * 1.1;
    if (!drags.size && iy > 0.3) { let dy = (player.mesh.rotation.y + Math.PI) - cam.tYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); cam.tYaw += dy * Math.min(1, dt * 1.2); }
  }
  player.pos.y += (H(player.pos.x, player.pos.z) - player.pos.y) * Math.min(1, dt * 12);
  player.mesh.position.set(player.pos.x, player.pos.y, player.pos.z);
  player.mesh.userData.anim(t, sp, false, dt);

  // Kiko
  const ky = player.mesh.rotation.y;
  tmp.set(player.pos.x - Math.sin(ky) * 2 + Math.cos(ky) * 1.6, 0, player.pos.z - Math.cos(ky) * 2 - Math.sin(ky) * 1.6);
  kiko.position.lerp(tmp, Math.min(1, dt * 3)); kiko.position.y = H(kiko.position.x, kiko.position.z) + 0.9 + Math.sin(t * 2.4) * 0.25;
  kiko.lookAt(player.pos.x, kiko.position.y, player.pos.z);

  // Caméra
  cam.yaw += Math.atan2(Math.sin(cam.tYaw - cam.yaw), Math.cos(cam.tYaw - cam.yaw)) * Math.min(1, dt * 8);
  const ch = Math.cos(cam.pitch) * cam.dist, cv = Math.sin(cam.pitch) * cam.dist, cx = player.pos.x + Math.sin(cam.yaw) * ch, cz = player.pos.z + Math.cos(cam.yaw) * ch;
  camera.position.set(cx, Math.max(player.pos.y + 1.6 + cv, H(cx, cz) + 0.8), cz); camera.lookAt(player.pos.x, player.pos.y + 1.5, player.pos.z);

  // Ciel et lumière
  const pl = W.pl;
  skyState.elev += (skyState.tElev - skyState.elev) * Math.min(1, dt); skyState.azim += (skyState.tAzim - skyState.azim) * Math.min(1, dt);
  applySky(skyState.elev, skyState.azim); sky.position.copy(camera.position); stars.position.copy(camera.position);
  const night = pl.night ? 1 : 0; stars.material.opacity += (night - stars.material.opacity) * Math.min(1, dt * 2);
  const low = THREE.MathUtils.clamp(skyState.elev / 30, 0, 1);
  sun.color.setRGB(1, 0.72 + 0.26 * low, 0.5 + 0.42 * low);
  sun.intensity = night ? 0.35 : 1.4 + 1.9 * low; hemi.intensity = night ? 0.5 : 0.55;
  scene.environmentIntensity = night ? 0.35 : 0.7; renderer.toneMappingExposure = night ? 1.15 : 0.95;
  const sd = sunDir.clone(); if (sd.y < 0.15) sd.y = 0.15;
  sun.position.set(player.pos.x + sd.x * 120, sd.y * 120, player.pos.z + sd.z * 120); sun.target.position.set(player.pos.x, 0, player.pos.z);
  WATERS.forEach((n, k) => n.offset.set(t * 0.02 + k, t * 0.013));

  // Animations du lieu
  W.updaters.forEach(f => f(t));
  W.inter.forEach(it => { if (it.mk && it.mk.visible) { it.mk.rotation.y = t * 1.6; it.mk.position.y = it.pos.y + 3.4 + Math.sin(t * 2.5) * 0.25; } if (it.bub?.visible) it.bub.position.y = it.pos.y + 3.15 + Math.sin(t * 3 + it.pos.x) * 0.12; });
  if (W.gate?.barrier.visible) W.gate.barrier.material.opacity = 0.32 + Math.sin(t * 3) * 0.12;
  // NPC qui se tournent vers le joueur
  Object.values(W.npcs).forEach(n => { const d = Math.hypot(n.pos.x - player.pos.x, n.pos.z - player.pos.z); const target = d < 6 ? Math.atan2(player.pos.x - n.pos.x, player.pos.z - n.pos.z) : n.baseRot; let dr = target - n.body.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); n.body.rotation.y += dr * Math.min(1, dt * 4); n.body.userData.anim(t, 0, talking === n, dt); });
  W.crowd.forEach(c => stepWalker(c, dt, t));

  // Objets cachés et objets de quête
  for (const it of W.items) {
    const d = Math.hypot(it.x - player.pos.x, it.z - player.pos.z);
    it.sp.visible = d < 20; it.glow.visible = d < 26; it.sp.position.y = it.y + 1 + Math.sin(t * 2 + it.k) * 0.2; it.glow.material.opacity = 0.3 + Math.sin(t * 4 + it.k) * 0.25;
    if (d < 1.7) {
      const list = save.items[pl.id] = save.items[pl.id] || []; if (!list.includes(it.k)) list.push(it.k);
      W.group.remove(it.sp); W.group.remove(it.glow); W.items = W.items.filter(x => x !== it);
      sfx('stamp'); toast(`🎁 Objet caché : ${pl.items.name} (${list.length}/5)`); commit(); updateHUD(); break;
    }
  }
  for (const p of W.picks) {
    p.sp.position.y = p.y + 1.1 + Math.sin(t * 3 + p.k) * 0.2; p.glow.rotation.z = t;
    if (Math.hypot(p.x - player.pos.x, p.z - player.pos.z) < 1.9) {
      const key = pickKey(p.q), st = curStep(p.q), got = save.picks[key] = save.picks[key] || [];
      if (!got.includes(p.k)) got.push(p.k);
      W.group.remove(p.sp); W.group.remove(p.glow); W.picks = W.picks.filter(x => x !== p); sfx('tick');
      if (got.length >= st.n) { const q = p.q; if (st.say?.length) openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: st.say, onDone: () => advance(q) }); else { toast(`✔ ${st.what} : ${st.n}/${st.n} !`); advance(q); } }
      else { toast(`${st.icon} ${st.what} ${got.length}/${st.n}`); commit(); updateHUD(); }
      break;
    }
  }

  // Colonne de lumière + boussole
  const tg = questTarget();
  beacon.visible = !!tg && !uiBlocked;
  if (tg) {
    beacon.position.set(tg.pos.x, tg.pos.y, tg.pos.z); beacon.material.color.set(tg.main ? 0xffd60a : 0x4cc9f0); beacon.material.opacity = 0.35 + Math.sin(t * 3) * 0.1;
    const a = Math.atan2(tg.pos.x - player.pos.x, tg.pos.z - player.pos.z) - cam.yaw, dist = Math.hypot(tg.pos.x - player.pos.x, tg.pos.z - player.pos.z);
    $('#compass').style.display = dist > 6 && !uiBlocked ? '' : 'none'; $('#compass-arrow').style.transform = `rotate(${180 - a * 180 / Math.PI}deg)`; $('#compass-dist').textContent = `${Math.round(dist)} m`;
  } else $('#compass').style.display = 'none';

  // Particules
  const ps = PSTYLE[pl.particles];
  if (ps) {
    const a = pGeo.attributes.position.array;
    for (let k = 0; k < PCOUNT; k++) { const s = pSeed[k]; a[k * 3 + 1] -= ps.fall * dt * (0.6 + (s % 1) * 0.8); a[k * 3] += Math.sin(t * 0.8 + s) * ps.drift * dt; a[k * 3 + 2] += Math.cos(t * 0.6 + s) * ps.drift * dt * 0.5; if (a[k * 3 + 1] < 0) a[k * 3 + 1] = 16; if (a[k * 3 + 1] > 16) a[k * 3 + 1] = 0; }
    pGeo.attributes.position.needsUpdate = true; points.position.set(player.pos.x, player.pos.y, player.pos.z);
    for (let k = 0; k < PCOUNT; k++) { if (a[k * 3] > 35) a[k * 3] -= 70; else if (a[k * 3] < -35) a[k * 3] += 70; if (a[k * 3 + 2] > 35) a[k * 3 + 2] -= 70; else if (a[k * 3 + 2] < -35) a[k * 3 + 2] += 70; }
  }

  // Interaction la plus proche
  let best = null, bd = 4.2;
  for (const it of W.inter) { const d = Math.hypot(it.pos.x - player.pos.x, it.pos.z - player.pos.z); if (d < bd) { bd = d; best = it; } }
  if (best !== nearest || (best && !$('#btn-act').classList.contains('show') && !uiBlocked)) {
    nearest = best; const b = $('#btn-act');
    if (best && !uiBlocked) {
      const verb = best.kind === 'npc' ? 'Parler à' : best.kind === 'gate' ? 'Parler à' : best.kind === 'relay' ? 'Ouvrir la carte :' : 'Découvrir :';
      b.innerHTML = `<kbd>E</kbd> ${verb} <b>${best.label}</b>`; b.classList.add('show');
    } else b.classList.remove('show');
  }
  if (uiBlocked) $('#btn-act').classList.remove('show');

  saveT += dt; save.time += dt;
  if (saveT > 4 && !uiBlocked) { saveT = 0; save.pos = { place: save.place, x: player.pos.x, z: player.pos.z }; commit(); }
  music();
}
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  step(dt, t);
  if (bloom.enabled) composer.render(); else renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
// Fond animé derrière l'écran titre
buildPlace(PLACES[0]); camera.position.set(30, 14, 80); camera.lookAt(0, 4, 20);
loop();
window.__michi = { player, save: () => save, world: () => world, travel, PLACES, interact, runGame, solveGate, advance, startQuest, refreshQuestWorld };
