import * as THREE from 'three';
import { ERAS, ZONE_LENGTH as L, KIKO_TUTORIAL } from './eras.js';
import { BUILD, DECOR, M, P, box, cyl, cone, sph, person, fox, torii, rng, rnd, G, WATERS } from './builders.js';
import { get as TEX } from './textures.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = s => document.querySelector(s);
const SAVE_KEY = 'michi-save-v1';
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// ════════════════ Sauvegarde
const fresh = () => ({ name: '', done: {}, solved: 0, seen: {}, finished: false, pos: null });
let save = fresh();
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && typeof s === 'object') return { ...fresh(), ...s }; } catch (e) {} return null; }
function store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

// ════════════════ Moteur
const canvas = $('#game');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  $('#loading').textContent = "Ton navigateur ne permet pas d'afficher la 3D (WebGL). Essaie avec Chrome ou Edge à jour.";
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouch ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
let quality = 'high';
try { quality = localStorage.getItem('michi-quality') || (isTouch ? 'low' : 'high'); } catch (e) {}

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe3ee, 60, 230);
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 600);

// Ciel physique + éclairage d'environnement (reflets réalistes)
const sky = new Sky(); sky.scale.setScalar(500); scene.add(sky);
const skyU = sky.material.uniforms;
Object.assign(skyU.turbidity, { value: 5 }); skyU.rayleigh.value = 1.6; skyU.mieCoefficient.value = 0.004; skyU.mieDirectionalG.value = 0.82;
const skyScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(100); skyScene.add(sky2);
const pmrem = new THREE.PMREMGenerator(renderer);
let envRT = null;
const sunDir = new THREE.Vector3();
const skyState = { elev: 35, azim: 200, tElev: 35, tAzim: 200 };
function applySky(elev, azim, target = skyU) {
  const phi = THREE.MathUtils.degToRad(90 - elev), th = THREE.MathUtils.degToRad(azim);
  sunDir.setFromSphericalCoords(1, phi, th); target.sunPosition.value.copy(sunDir);
}
function bakeEnv(era) {
  Object.keys(skyU).forEach(k => { if (sky2.material.uniforms[k] && k !== 'sunPosition') sky2.material.uniforms[k].value = skyU[k].value; });
  applySky(era.sun[0], era.sun[1], sky2.material.uniforms);
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(skyScene, 0.04);
  scene.environment = envRT.texture;
}
// étoiles pour l'époque de nuit
const stars = (() => { const g = new THREE.BufferGeometry(), a = new Float32Array(1500 * 3); for (let k = 0; k < 1500; k++) { const v = new THREE.Vector3().randomDirection(); v.y = Math.abs(v.y) + 0.05; v.normalize().multiplyScalar(450); a.set([v.x, v.y, v.z], k * 3); } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0 })); })();
scene.add(stars);

const hemi = new THREE.HemisphereLight(0xdfefff, 0x5a6b3a, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);

// Post-traitement : léger halo lumineux (bloom)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.28, 0.6, 0.88);
composer.addPass(bloom);
composer.addPass(new OutputPass());
function applyQuality() {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality === 'high' ? 2 : 1.25));
  bloom.enabled = quality === 'high';
  composer.setPixelRatio(renderer.getPixelRatio());
  resize();
  const b = document.getElementById('btn-quality'); if (b) b.textContent = quality === 'high' ? 'HD' : 'SD';
}
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 70 : 58; // écran étroit (Fold fermé, téléphone) : champ plus large
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(document.body);
applyQuality();

// ════════════════ Relief du terrain
const FLATS = [];
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function heightAt(x, zw) {
  const ax = Math.abs(x);
  let m = smooth(9, 22, ax);
  if (m <= 0) return 0;
  const zl = ((-zw % L) + L) % L;
  m *= smooth(3, 9, Math.abs(zl - (L - 6)));
  for (const f of FLATS) { if (Math.abs(f.z - zw) > f.r + 14) continue; const d = Math.hypot(f.x - x, f.z - zw); m *= smooth(f.r + 2, f.r + 12, d); if (m <= 0) return 0; }
  const n = Math.sin(x * 0.11 + zw * 0.05) * 0.5 + Math.sin(x * 0.043 - zw * 0.09 + 1.7) * 0.8 + Math.sin(zw * 0.13 + x * 0.02) * 0.35 + 1.4;
  return Math.max(0, n * (1.2 + Math.max(0, ax - 22) * 0.12)) * m;
}

// ════════════════ Construction du monde
const zones = [];
const BUILD_SIZE = { kofun: 15, todaiji: 17, byodoin: 15, shibuya: 16, castleHimeji: 13, kinkakuji: 13, blackShip: 13, heianPalace: 13, nanbanShip: 12, mongolWreck: 10, nihonbashi: 10, brick: 12, riceField: 10, suzakumon: 9 };
const interactables = [];
const colliders = [];
const updaters = [];
const worldZ = (i, z) => -(i * L + z);

function labelSprite(text, bg = 'rgba(255,255,255,0.92)', fg = '#2b2118') {
  const c = document.createElement('canvas'); const x = c.getContext('2d');
  x.font = 'bold 44px system-ui, sans-serif';
  const w = Math.ceil(x.measureText(text).width) + 48; c.width = w; c.height = 76;
  x.font = 'bold 44px system-ui, sans-serif';
  x.fillStyle = bg; x.beginPath(); x.roundRect(2, 2, w - 4, 72, 30); x.fill();
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, 40);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(w / 76 * 0.55, 0.55, 1);
  s.renderOrder = 10;
  return s;
}
function bubbleSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ffd60a'; x.strokeStyle = '#2b2118'; x.lineWidth = 8;
  x.beginPath(); x.arc(64, 58, 46, 0, 7); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(50, 98); x.lineTo(64, 124); x.lineTo(78, 98); x.fill();
  x.fillStyle = '#2b2118'; x.font = 'bold 72px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!', 64, 62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(0.9, 0.9, 1); return s;
}
const markerGeo = new THREE.OctahedronGeometry(0.6);
const markerMat = new THREE.MeshBasicMaterial({ color: 0xffd60a });
const ringGeo = new THREE.RingGeometry(1.3, 1.7, 32);

function addSign(group, x, z, i) {
  const s = G(P(cyl(0.1, 0.1, 1.6, 0x5d3a24, 6), 0, 0.8, 0), P(box(1.4, 0.9, 0.12, 0xc9a66b), 0, 1.6, 0));
  P(s, x, 0, z); s.rotation.y = Math.atan2(-x, 0) || 0; group.add(s);
  const mk = new THREE.Mesh(markerGeo, markerMat.clone()); P(mk, x, 3.4, z); group.add(mk);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; P(ring, x, 0.12, z); group.add(ring);
  return { mk, ring };
}

function buildZone(era, i) {
  const group = new THREE.Group(); group.position.z = -i * L; scene.add(group);
  const zone = { i, era, group, items: [], colliders: [] };
  // sol (terrain en relief) + chemin
  const tg = new THREE.PlaneGeometry(260, L + 0.5, 130, 70); tg.rotateX(-Math.PI / 2); tg.translate(0, 0, -L / 2);
  const tp = tg.attributes.position;
  for (let k = 0; k < tp.count; k++) tp.setY(k, heightAt(tp.getX(k), tp.getZ(k) - i * L));
  tg.computeVertexNormals();
  const groundMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(era.ground).lerp(new THREE.Color(0xffffff), 0.25), map: TEX('grass'), roughness: 0.95 });
  if (era.night) groundMat.map = TEX('asphalt');
  const ground = new THREE.Mesh(tg, groundMat); ground.receiveShadow = true; group.add(ground);
  const pm = new THREE.MeshStandardMaterial({ color: era.path, map: TEX('dirt').clone(), roughness: 1 }); pm.map.repeat.set(2, L / 4); pm.map.needsUpdate = true;
  const path = new THREE.Mesh(new THREE.PlaneGeometry(7, L + 0.5), pm);
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0.03, -L / 2); path.receiveShadow = true; group.add(path);
  for (let k = 0; k < L; k += 4) { const st = box(1.6, 0.08, 0.9, 0xb0aaa0); st.castShadow = false; P(st, (k % 8 ? 1 : -1) * 1.4, 0.05, -k); group.add(st); }
  // herbe
  if (!era.night) {
    const grassList = []; rng(500 + i);
    for (let k = 0; k < (quality === 'high' ? 5000 : 2200); k++) {
      const x = (rnd() < 0.5 ? -1 : 1) * (4.2 + rnd() * 52), zl = rnd() * L, zw = worldZ(i, zl);
      if (FLATS.some(f => Math.abs(f.z - zw) < f.r && Math.hypot(f.x - x, f.z - zw) < f.r)) continue;
      grassList.push({ x, z: -zl, y: heightAt(x, zw), s: 0.6 + rnd() * 0.9, rot: rnd() * 6.3 });
    }
    const gg = new THREE.ConeGeometry(0.09, 0.7, 3); gg.translate(0, 0.35, 0);
    const im = new THREE.InstancedMesh(gg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), grassList.length);
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), base = new THREE.Color(era.ground);
    grassList.forEach((g2, k) => { e.set((rnd() - 0.5) * 0.4, g2.rot, (rnd() - 0.5) * 0.4); q.setFromEuler(e); mtx.compose(new THREE.Vector3(g2.x, g2.y, g2.z), q, new THREE.Vector3(g2.s, g2.s * (0.8 + rnd()), g2.s)); im.setMatrixAt(k, mtx); im.setColorAt(k, base.clone().offsetHSL((rnd() - 0.5) * 0.05, 0, (rnd() - 0.5) * 0.15)); });
    im.receiveShadow = true; group.add(im);
  }

  // monuments
  era.pois.forEach((poi, k) => {
    const b = BUILD[poi.type]();
    P(b.g, poi.x, 0, -poi.z); b.g.rotation.y = poi.x > 0 ? -Math.PI / 2 : Math.PI / 2; group.add(b.g);
    if (b.update) updaters.push({ zone: i, fn: b.update });
    if (b.solid !== false) zone.colliders.push({ x: poi.x, z: worldZ(i, poi.z), r: b.r });
    const sx = poi.x - Math.sign(poi.x) * (b.r + 2.4), sz = -poi.z;
    const sg = addSign(group, sx, sz, i);
    const id = `${i}-p${k}`;
    zone.items.push({ kind: 'poi', id, zone: i, data: poi, pos: new THREE.Vector3(sx, 0, worldZ(i, poi.z)), sign: sg, label: poi.title });
  });
  // personnages
  era.npcs.forEach((npc, k) => {
    const p = person(npc.look); P(p, npc.x, 0, -npc.z); p.rotation.y = npc.x > 0 ? -Math.PI / 2 : Math.PI / 2; group.add(p);
    const lab = labelSprite(npc.name); P(lab, npc.x, 3.25, -npc.z); group.add(lab);
    const bub = bubbleSprite(); P(bub, npc.x, 4.05, -npc.z); group.add(bub);
    const id = `${i}-n${k}`;
    zone.items.push({ kind: 'npc', id, zone: i, data: npc, pos: new THREE.Vector3(npc.x, 0, worldZ(i, npc.z)), bub, body: p, label: npc.name });
    zone.colliders.push({ x: npc.x, z: worldZ(i, npc.z), r: 0.7 });
  });
  // porte (torii) + gardien
  const gz = L - 6;
  const t = torii(i === ERAS.length - 1 ? 0xffd60a : 0xd9381e); P(t, 0, 0, -gz); group.add(t);
  zone.colliders.push({ x: -5, z: worldZ(i, gz), r: 0.9 }, { x: 5, z: worldZ(i, gz), r: 0.9 });
  const barrier = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 9.2), new THREE.MeshBasicMaterial({ color: 0x9bf6ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
  P(barrier, 0, 4.6, -gz); group.add(barrier);
  const rope = P(new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.18, 6, 24, Math.PI), M(0xe9c46a)), 0, 7.6, -gz); rope.rotation.z = Math.PI; group.add(rope);
  // haie de chaque côté de la porte
  for (const sgn of [-1, 1]) {
    const hedge = box(42, 2.2, 1.6, 0x2d6a4f); P(hedge, sgn * 27, 1.1, -gz); group.add(hedge);
    for (let k = 0; k < 6; k++) { const lt = G(P(cyl(0.4, 0.5, 0.5, 0x9e9e9e, 6), 0, 2.45, 0), P(box(0.7, 0.7, 0.7, 0xfff3b0, { emissive: 0xffb703, emissiveIntensity: 0.6 }), 0, 3, 0)); P(lt, sgn * (9 + k * 7), 0, -gz); group.add(lt); }
  }
  const keeper = person({ robe: 0xffffff, accent: 0xd62828, hat: i === ERAS.length - 1 ? 'crown' : 'eboshi' });
  P(keeper, 6.8, 0, -(gz + 2)); keeper.rotation.y = -Math.PI / 2; group.add(keeper);
  const kl = labelSprite(i === ERAS.length - 1 ? 'Gardienne du temps' : 'Gardien du torii', 'rgba(217,56,30,0.95)', '#ffffff'); P(kl, 6.8, 3.25, -(gz + 2)); group.add(kl);
  zone.gate = { kind: 'gate', id: `${i}-gate`, zone: i, pos: new THREE.Vector3(6.8, 0, worldZ(i, gz + 2)), barrier, label: 'Gardien du torii' };
  zone.colliders.push({ x: 6.8, z: worldZ(i, gz + 2), r: 0.7 });

  // décor
  rng(1000 + i * 77);
  const forbidden = era.pois.map(p => ({ x: p.x, z: p.z, r: BUILD[p.type] ? 15 : 8 }));
  const sizeOf = { kofun: 15, todaiji: 17, byodoin: 15, shibuya: 16, castleHimeji: 13, kinkakuji: 13, blackShip: 13, heianPalace: 13 };
  era.pois.forEach((p, k) => { forbidden[k].r = (sizeOf[p.type] || 9); });
  const taken = [];
  const pick = (minAbsX = 7, maxAbsX = 46) => {
    for (let tries = 0; tries < 40; tries++) {
      const side = rnd() < 0.5 ? -1 : 1, x = side * (minAbsX + rnd() * (maxAbsX - minAbsX)), z = 6 + rnd() * (L - 20);
      if (forbidden.some(f => Math.hypot(f.x - x, f.z - z) < f.r)) continue;
      if (era.npcs.some(n => Math.hypot(n.x - x, n.z - z) < 4)) continue;
      if (taken.some(t => Math.hypot(t.x - x, t.z - z) < 3)) continue;
      taken.push({ x, z }); return { x, z };
    }
    return null;
  };
  for (const [type, count] of Object.entries(era.decor)) {
    if (type === 'fuji') continue;
    const list = [];
    const big = type === 'machiya' || type === 'house' || type === 'skyscraper';
    for (let k = 0; k < count; k++) {
      const p = big ? pick(12, 46) : pick(type === 'flower' ? 4.5 : 7, 46);
      if (!p) continue;
      const s = type === 'flower' ? 0.8 + rnd() * 0.6 : type === 'skyscraper' ? 0.8 + rnd() * 0.9 : 0.8 + rnd() * 0.5;
      const rot = big ? (p.x > 0 ? -Math.PI / 2 : Math.PI / 2) : rnd() * 6.28;
      list.push({ x: p.x, z: -p.z, y: heightAt(p.x, worldZ(i, p.z)) - 0.1, s, rot });
      if (type !== 'flower') zone.colliders.push({ x: p.x, z: worldZ(i, p.z), r: big ? 3.4 * s : type === 'rock' ? 0.8 * s : 0.5 });
    }
    DECOR[type](list).forEach(m => group.add(m));
  }
  // bordure de forêt / montagnes
  const edge = [];
  for (let z = 2; z < L; z += 4) for (const sgn of [-1, 1]) for (let r2 = 0; r2 < 2; r2++) { const x = sgn * (49 + r2 * 6 + rnd() * 5); edge.push({ x, z: -z, y: heightAt(x, worldZ(i, z)) - 0.2, s: 1 + rnd() * 0.7, rot: rnd() * 6 }); }
  const edgeType = era.night ? 'skyscraper' : (era.decor.sakura > 20 ? 'sakura' : era.decor.maple > 20 ? 'maple' : 'pine');
  DECOR[edgeType](edge).forEach(m => group.add(m));
  rng(2000 + i);
  for (let k = 0; k < 7; k++) {
    const sgn = k % 2 ? 1 : -1, h = 18 + rnd() * 22;
    const mt = cone(16 + rnd() * 12, h, new THREE.Color(era.ground).offsetHSL(0.03, -0.1, -0.18).getHex(), 7);
    mt.material = M(new THREE.Color(era.ground).offsetHSL(0.03, -0.1, era.night ? -0.1 : -0.18).getHex(), { flatShading: true });
    mt.castShadow = false; P(mt, sgn * (78 + rnd() * 25), h / 2 - 1, -(k * 22 + rnd() * 10)); group.add(mt);
  }
  if (era.decor.fuji) {
    const fuji = G(cone(70, 52, 0x4a6fa5, 24), P(cone(25, 19, 0xffffff, 24), 0, 16.6, 0));
    fuji.children.forEach(c => { c.material = M(c === fuji.children[0] ? 0x5a7fb5 : 0xffffff, { fog: false }); c.castShadow = false; });
    P(fuji, -150, 25, -60); group.add(fuji);
  }
  zone.allItems = [...zone.items, zone.gate];
  zones.push(zone);
  colliders.push(...zone.colliders.map(c => ({ ...c, zone: i })));
  interactables.push(...zone.allItems);
}
ERAS.forEach((era, i) => era.pois.forEach(p => FLATS.push({ x: p.x, z: worldZ(i, p.z), r: (BUILD_SIZE[p.type] || 9) })));
ERAS.forEach(buildZone);

// Sol de départ (avant la première époque)
{
  const start = new THREE.Mesh(new THREE.PlaneGeometry(240, 60), M(ERAS[0].ground)); start.rotation.x = -Math.PI / 2; start.position.set(0, -0.01, 29); start.receiveShadow = true; scene.add(start);
  const t = torii(0xd9381e); P(t, 0, 0, 4); scene.add(t);
}

// ════════════════ Joueur et Kiko
const player = {
  pos: new THREE.Vector3(0, 0, -2), vel: new THREE.Vector3(), mesh: person({ robe: 0x3a86ff, accent: 0xffbe0b, hat: 'straw', skin: 0xf5cba7 }),
};
{
  const staff = P(cyl(0.05, 0.05, 2.6, 0x8d5a3b, 6), 0.62, 1.2, 0.15); player.mesh.add(staff);
  const pack = P(box(0.6, 0.7, 0.35, 0xd62828), 0, 1.4, -0.45); player.mesh.add(pack);
}
scene.add(player.mesh);
const kiko = fox(); S2(kiko, 0.8); scene.add(kiko);
function S2(o, s) { o.scale.setScalar(s); }

// ════════════════ Particules d'ambiance
const PCOUNT = 420;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PCOUNT * 3), pSeed = new Float32Array(PCOUNT);
for (let k = 0; k < PCOUNT; k++) { pPos[k * 3] = (Math.random() - 0.5) * 70; pPos[k * 3 + 1] = Math.random() * 18; pPos[k * 3 + 2] = (Math.random() - 0.5) * 70; pSeed[k] = Math.random() * 100; }
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
const pMat = new THREE.PointsMaterial({ size: 0.45, map: dotTex, transparent: true, depthWrite: false, color: 0xffafcc });
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
const PSTYLE = {
  sakura: { c: 0xffafcc, s: 0.5, fall: 1.2, drift: 1.4, add: false },
  momiji: { c: 0xf77f00, s: 0.55, fall: 1.5, drift: 1.2, add: false },
  leaves: { c: 0x9ccc65, s: 0.45, fall: 1.1, drift: 1, add: false },
  pollen: { c: 0xfff3b0, s: 0.35, fall: 0.2, drift: 0.6, add: true },
  snow: { c: 0xffffff, s: 0.5, fall: 1.8, drift: 0.6, add: false },
  neon: { c: 0x4cc9f0, s: 0.4, fall: -0.3, drift: 0.8, add: true },
};

// ════════════════ Contrôles
const keys = new Set();
const joy = { x: 0, y: 0, active: false, id: null };
const cam = { yaw: 0, pitch: 0.42, dist: 10, tYaw: 0 };
let uiBlocked = true;

window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys.add(e.code);
  if (dialogOpen()) {
    if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); dialogNext(); }
    if (/^Digit[1-3]$/.test(e.code)) quizPick(+e.code.slice(5) - 1);
    return;
  }
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
  if (e.code === 'KeyJ') toggleJournal();
  if (e.code === 'KeyH') hint();
  if (e.code === 'Escape') closeModals();
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

// Glisser pour tourner la caméra, pincer / molette pour zoomer
const drags = new Map();
canvas.addEventListener('pointerdown', e => { drags.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  const d = drags.get(e.pointerId); if (!d) return;
  if (drags.size === 2) {
    const [a, b] = [...drags.values()];
    const before = Math.hypot(a.x - b.x, a.y - b.y);
    d.x = e.clientX; d.y = e.clientY;
    const [a2, b2] = [...drags.values()];
    const after = Math.hypot(a2.x - b2.x, a2.y - b2.y);
    cam.dist = THREE.MathUtils.clamp(cam.dist * before / Math.max(after, 1), 5, 22);
    return;
  }
  const dx = e.clientX - d.x, dy = e.clientY - d.y; d.x = e.clientX; d.y = e.clientY;
  cam.tYaw -= dx * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + dy * 0.004, 0.08, 1.2);
});
const endDrag = e => drags.delete(e.pointerId);
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', e => { e.preventDefault(); cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.1), 5, 22); }, { passive: false });

// Joystick tactile
const joyEl = $('#joystick'), knob = $('#knob');
if (isTouch) document.body.classList.add('touch');
joyEl.addEventListener('pointerdown', e => { joy.active = true; joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
joyEl.addEventListener('pointermove', e => { if (joy.active && e.pointerId === joy.id) moveJoy(e); });
const stopJoy = () => { joy.active = false; joy.x = joy.y = 0; knob.style.transform = 'translate(-50%,-50%)'; };
joyEl.addEventListener('pointerup', stopJoy); joyEl.addEventListener('pointercancel', stopJoy);
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect(), R = r.width / 2;
  let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
  const len = Math.hypot(dx, dy); if (len > R) { dx *= R / len; dy *= R / len; }
  joy.x = dx / R; joy.y = -dy / R;
  knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

// ════════════════ Interface : dialogues
let dlg = null;
const dlgEl = $('#dialog');
function dialogOpen() { return !!dlg; }
function openDialog({ speaker, color = '#d9381e', pages, quiz = null, onDone = null, icon = '💬' }) {
  dlg = { pages: pages.map(p => p.replace('{name}', save.name || 'voyageur')), k: 0, quiz, onDone, answered: false };
  $('#dlg-speaker').textContent = speaker; $('#dlg-speaker').style.background = color;
  $('#dlg-icon').textContent = icon;
  dlgEl.classList.add('show');
  renderDialog(); sfx('open');
}
function renderDialog() {
  const opts = $('#dlg-options'); opts.innerHTML = '';
  const last = dlg.k >= dlg.pages.length - 1;
  $('#dlg-text').textContent = dlg.pages[dlg.k];
  $('#dlg-count').textContent = dlg.pages.length > 1 ? `${dlg.k + 1} / ${dlg.pages.length}` : '';
  if (last && dlg.quiz && !dlg.answered) {
    $('#dlg-next').style.display = 'none';
    dlg.quiz.options.forEach((o, n) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<span>${n + 1}</span>${o}`; b.onclick = () => quizPick(n); opts.appendChild(b); });
  } else {
    $('#dlg-next').style.display = '';
    $('#dlg-next').textContent = last ? 'Terminer ✓' : 'Suivant ▸';
  }
}
function quizPick(n) {
  if (!dlg || !dlg.quiz || dlg.answered || dlg.k < dlg.pages.length - 1) return;
  const q = dlg.quiz;
  if (n === q.answer) {
    dlg.answered = true; sfx('win');
    dlg.pages.push('✅ ' + q.explain);
    dlg.k = dlg.pages.length - 1;
    const cb = dlg.onDone; dlg.onDone = () => cb && cb(true);
    renderDialog();
  } else {
    sfx('wrong');
    const btns = $('#dlg-options').children; if (btns[n]) { btns[n].classList.add('bad'); btns[n].disabled = true; }
    toast("Pas tout à fait… Réessaie ! Les habitants de cette époque t'ont donné la réponse.");
  }
}
function dialogNext() {
  if (!dlg) return;
  if (dlg.quiz && !dlg.answered && dlg.k >= dlg.pages.length - 1) return;
  if (dlg.k < dlg.pages.length - 1) { dlg.k++; renderDialog(); sfx('tick'); return; }
  const cb = dlg.onDone; dlg = null; dlgEl.classList.remove('show');
  if (cb) cb(); updateHUD();
}
$('#dlg-next').onclick = dialogNext;

// ════════════════ Interaction
let nearest = null;
function interact() {
  if (!nearest || dialogOpen() || uiBlocked) return;
  const it = nearest;
  if (it.kind === 'poi') {
    openDialog({ speaker: it.data.title, color: '#e09f3e', icon: '⛩️', pages: it.data.text, onDone: () => markDone(it) });
  } else if (it.kind === 'npc') {
    openDialog({ speaker: it.data.name, color: '#3a86ff', icon: '🗣️', pages: it.data.lines, onDone: () => markDone(it) });
  } else if (it.kind === 'gate') {
    const z = zones[it.zone];
    if (save.solved > it.zone) { openDialog({ speaker: it.label, pages: ['Le passage est ouvert. Bonne route, pèlerin !'] }); return; }
    const left = z.items.filter(x => !save.done[x.id]);
    if (left.length) {
      openDialog({ speaker: it.label, pages: [`Halte, voyageur ! Avant de franchir ce torii, découvre encore ${left.length} ${left.length > 1 ? 'choses' : 'chose'} de l'époque ${z.era.name}.`, 'Kiko 🦊 peut t\'aider à les trouver.'] });
      return;
    }
    openDialog({ speaker: it.label, icon: '❓', pages: ['Tu as bien exploré cette époque. Voici ma question :', z.era.quiz.q], quiz: z.era.quiz, onDone: ok => { if (ok) solveGate(it.zone); } });
  }
}
function markDone(it) {
  if (save.done[it.id]) return;
  save.done[it.id] = true; store();
  const z = zones[it.zone];
  const left = z.items.filter(x => !save.done[x.id]).length;
  sfx('stamp');
  toast(left ? `✨ ${it.label} ajouté au carnet — encore ${left} à découvrir` : `🎉 Tout est découvert ! Va voir le gardien du torii.`);
  refreshMarkers();
}
function solveGate(i) {
  if (save.solved > i) return;
  save.solved = i + 1; store();
  refreshMarkers();
  if (i === ERAS.length - 1) { save.finished = true; store(); setTimeout(showCertificate, 600); }
  else toast(`⛩️ Le torii s'ouvre ! Direction : ${ERAS[i + 1].name}`);
}
function refreshMarkers() {
  zones.forEach(z => {
    z.items.forEach(it => {
      const d = !!save.done[it.id];
      if (it.sign) { it.sign.mk.visible = !d; it.sign.ring.material.color.set(d ? 0x06d6a0 : 0xffd60a); it.sign.ring.material.opacity = d ? 0.45 : 0.85; }
      if (it.bub) it.bub.visible = !d;
    });
    z.gate.barrier.visible = save.solved <= z.i;
  });
  updateHUD();
}

// ════════════════ HUD
const tl = $('#timeline');
ERAS.forEach((e, i) => { const b = document.createElement('button'); b.className = 'seg'; b.title = `${e.name} (${e.dates})`; b.innerHTML = `<i>${i + 1}</i><b>${e.name}</b>`; b.onclick = () => travelTo(i); tl.appendChild(b); });
let curZone = 0;
function updateHUD() {
  const z = zones[curZone], e = z.era;
  $('#era-name').textContent = e.name; $('#era-dates').textContent = e.dates;
  const done = z.items.filter(x => save.done[x.id]).length;
  $('#era-progress').innerHTML = z.items.map(x => `<span class="dot ${save.done[x.id] ? 'on' : ''}" title="${x.label}"></span>`).join('') + `<em>${done}/${z.items.length}</em>`;
  [...tl.children].forEach((b, i) => { b.className = 'seg' + (i < save.solved ? ' done' : '') + (i === curZone ? ' cur' : '') + (i > save.solved ? ' lock' : ''); });
  const total = zones.reduce((a, z) => a + z.items.length, 0), got = Object.keys(save.done).length;
  $('#total').textContent = `${got}/${total}`;
}
function travelTo(i) {
  if (i > save.solved || dialogOpen()) { toast('🔒 Cette époque est encore fermée. Réponds au gardien du torii pour avancer.'); return; }
  player.pos.set(0, 0, worldZ(i, 3)); cam.tYaw = 0; cam.yaw = 0;
  toast(`🦊 Hop ! Kiko t'emmène à l'époque ${ERAS[i].name}.`);
}
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600); }
function showBanner(i) {
  const b = $('#banner'); $('#banner-name').textContent = ERAS[i].name; $('#banner-dates').textContent = ERAS[i].dates; $('#banner-num').textContent = `Époque ${i + 1} / ${ERAS.length}`;
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function hint() {
  if (dialogOpen() || uiBlocked) return;
  const z = zones[curZone];
  const left = z.items.filter(x => !save.done[x.id]);
  const pages = left.length
    ? [`Dans l'époque ${z.era.name}, il te reste à découvrir :`, left.map(x => (x.kind === 'npc' ? '🗣️ ' : '⛩️ ') + x.label).join('\n')]
    : (save.solved > curZone ? ['Cette époque est terminée ! Avance vers le torii suivant, droit devant.'] : ['Tu as tout vu ici ! Va parler au gardien du torii, au bout du chemin.']);
  openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages });
}
$('#btn-hint').onclick = hint;
$('#btn-act').onclick = () => interact();

// Carnet de voyage
function toggleJournal() {
  const j = $('#journal');
  if (j.classList.contains('show')) { j.classList.remove('show'); return; }
  const body = $('#journal-body'); body.innerHTML = '';
  ERAS.forEach((e, i) => {
    if (i > save.solved) return;
    const z = zones[i];
    const sec = document.createElement('section');
    const items = z.items.filter(x => save.done[x.id]);
    sec.innerHTML = `<h3><span class="stamp ${save.solved > i ? 'ok' : ''}">${save.solved > i ? '印' : i + 1}</span>${e.name} <small>${e.dates}</small></h3>` +
      (items.length ? items.map(x => `<details><summary>${x.kind === 'npc' ? '🗣️' : '⛩️'} ${x.label}</summary><p>${(x.kind === 'npc' ? x.data.lines : x.data.text).join('</p><p>')}</p></details>`).join('') : '<p class="muted">Rien encore… explore cette époque !</p>');
    body.appendChild(sec);
  });
  j.classList.add('show');
}
$('#btn-journal').onclick = toggleJournal;
$('#journal-close').onclick = () => $('#journal').classList.remove('show');
function closeModals() { $('#journal').classList.remove('show'); }

$('#btn-quality').onclick = () => { quality = quality === 'high' ? 'low' : 'high'; try { localStorage.setItem('michi-quality', quality); } catch (e) {} applyQuality(); toast(quality === 'high' ? 'Qualité HD : lumière et ombres renforcées' : 'Qualité SD : plus fluide sur mobile'); };
$('#btn-full').onclick = () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} };

// Certificat final
function showCertificate() {
  $('#cert-name').textContent = save.name || 'Voyageur';
  $('#cert-stamps').innerHTML = ERAS.map(e => `<span title="${e.name}">${e.name.split(' ')[0]}</span>`).join('');
  $('#cert-date').textContent = new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  $('#certificate').classList.add('show'); sfx('win');
}
$('#cert-close').onclick = () => $('#certificate').classList.remove('show');
$('#cert-restart').onclick = () => { if (confirm('Recommencer le voyage depuis le début ? Ta progression sera effacée.')) { save = { ...fresh(), name: save.name }; store(); location.reload(); } };

// ════════════════ Musique (gamme japonaise, générée)
let actx = null, musicOn = false, nextNote = 0, master;
const SCALE = [0, 1, 5, 7, 8, 12, 13, 17, 19, 20, 24]; // gamme miyako-bushi
function ensureAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0.5;
    const delay = actx.createDelay(); delay.delayTime.value = 0.38;
    const fb = actx.createGain(); fb.gain.value = 0.32;
    delay.connect(fb); fb.connect(delay); master.connect(delay); delay.connect(actx.destination); master.connect(actx.destination);
  } catch (e) { actx = null; }
}
function pluck(freq, t, vol = 0.18, dur = 1.6, type = 'triangle') {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
  o.type = type; o.frequency.value = freq; f.type = 'lowpass'; f.frequency.value = 2400;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function music() {
  if (!actx || !musicOn) return;
  const t = actx.currentTime;
  if (t < nextNote - 0.1) return;
  const base = 293.66 * (curZone === 8 ? 0.75 : 1);
  const n = SCALE[Math.floor(Math.random() * SCALE.length)];
  pluck(base * Math.pow(2, n / 12), Math.max(t, nextNote), 0.13);
  if (Math.random() < 0.25) pluck(base / 2 * Math.pow(2, SCALE[Math.floor(Math.random() * 5)] / 12), Math.max(t, nextNote), 0.08, 2.4, 'sine');
  nextNote = Math.max(t, nextNote) + [0.45, 0.9, 0.9, 1.35, 1.8][Math.floor(Math.random() * 5)];
}
function sfx(kind) {
  if (!actx) return;
  const t = actx.currentTime, b = 587.33;
  if (kind === 'tick') pluck(b * 2, t, 0.05, 0.15);
  if (kind === 'open') pluck(b * 1.5, t, 0.08, 0.4);
  if (kind === 'stamp') { pluck(b, t, 0.15, 0.8); pluck(b * 1.5, t + 0.12, 0.15, 0.9); pluck(b * 2, t + 0.24, 0.15, 1.2); }
  if (kind === 'win') [0, 5, 7, 12, 17].forEach((n, k) => pluck(b * Math.pow(2, n / 12), t + k * 0.11, 0.16, 1.4));
  if (kind === 'wrong') { pluck(220, t, 0.15, 0.4, 'sawtooth'); pluck(207, t + 0.15, 0.12, 0.5, 'sawtooth'); }
}
$('#btn-music').onclick = () => { ensureAudio(); if (actx && actx.state === 'suspended') actx.resume(); musicOn = !musicOn; $('#btn-music').textContent = musicOn ? '🔊' : '🔈'; $('#btn-music').classList.toggle('on', musicOn); };

// ════════════════ Écran titre
const existing = load();
if (existing && Object.keys(existing.done).length) { $('#btn-continue').style.display = ''; $('#player-name').value = existing.name || ''; $('#btn-new').textContent = 'Nouveau voyage'; }
if (existing && existing.name) $('#player-name').value = existing.name;
function begin(cont) {
  ensureAudio(); if (actx && actx.state === 'suspended') actx.resume();
  musicOn = true; $('#btn-music').textContent = '🔊'; $('#btn-music').classList.add('on');
  const name = $('#player-name').value.trim().slice(0, 24);
  if (cont && existing) save = existing; else { if (existing && Object.keys(existing.done).length && !confirm('Commencer un nouveau voyage ? L\'ancienne progression sera effacée.')) return; save = fresh(); }
  if (name) save.name = name;
  store();
  $('#title').classList.add('hide'); uiBlocked = false;
  if (cont && save.pos) { player.pos.set(save.pos[0], 0, save.pos[1]); }
  refreshMarkers();
  if (!save.seen.tuto) {
    save.seen.tuto = true; save.seen[0] = true; store();
    setTimeout(() => { showBanner(0); openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: [...KIKO_TUTORIAL, ...ERAS[0].intro] }); }, 400);
  } else showBanner(curZoneOf(player.pos.z));
}
$('#btn-new').onclick = () => begin(false);
$('#btn-continue').onclick = () => begin(true);
$('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') begin(!!(existing && Object.keys(existing.done).length)); });
$('#loading').style.display = 'none'; $('#title-buttons').style.display = '';

function setEraSky(i, instant = false) {
  const e = ERAS[i]; skyState.tElev = e.sun[0]; skyState.tAzim = e.sun[1];
  if (instant) { skyState.elev = e.sun[0]; skyState.azim = e.sun[1]; scene.fog.color.set(e.fog); }
  skyU.turbidity.value = e.turbidity || 5;
  bakeEnv(e);
}
setEraSky(0, true);

// ════════════════ Boucle principale
const clock = new THREE.Clock();
const tmp = new THREE.Vector3(), fogTarget = new THREE.Color();
function curZoneOf(z) { return THREE.MathUtils.clamp(Math.floor(-z / L), 0, ERAS.length - 1); }
let walkT = 0, saveT = 0;

function step(dt, t) {
  // ── déplacement
  let ix = 0, iy = 0;
  if (!dialogOpen() && !uiBlocked) {
    if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    if (joy.active) { ix += joy.x; iy += joy.y; }
  }
  const len = Math.hypot(ix, iy); if (len > 1) { ix /= len; iy /= len; }
  const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || (joy.active && Math.hypot(joy.x, joy.y) > 0.95);
  const speed = run ? 15 : 9;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = -fz, rz = fx;
  const mx = (fx * iy + rx * ix) * speed, mz = (fz * iy + rz * ix) * speed;
  player.vel.x += (mx - player.vel.x) * Math.min(1, dt * 10);
  player.vel.z += (mz - player.vel.z) * Math.min(1, dt * 10);
  player.pos.x += player.vel.x * dt; player.pos.z += player.vel.z * dt;
  // collisions
  const cz = curZoneOf(player.pos.z);
  for (const c of colliders) {
    if (Math.abs(c.zone - cz) > 1) continue;
    const dx = player.pos.x - c.x, dz = player.pos.z - c.z, d = Math.hypot(dx, dz), min = c.r + 0.55;
    if (d < min && d > 0.0001) { player.pos.x = c.x + dx / d * min; player.pos.z = c.z + dz / d * min; }
  }
  player.pos.x = THREE.MathUtils.clamp(player.pos.x, -47, 47);
  const minZ = worldZ(Math.min(save.solved, ERAS.length - 1), L - 7.2);
  const maxZ = save.solved >= ERAS.length ? worldZ(ERAS.length - 1, L - 2) : minZ;
  player.pos.z = THREE.MathUtils.clamp(player.pos.z, save.solved >= ERAS.length ? maxZ : minZ, 12);
  const sp = Math.hypot(player.vel.x, player.vel.z);
  if (sp > 0.4) {
    const target = Math.atan2(player.vel.x, player.vel.z);
    let d = target - player.mesh.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    player.mesh.rotation.y += d * Math.min(1, dt * 12);
    walkT += dt * sp * 1.1;
    // la caméra se replace doucement derrière le joueur quand il avance
    if (!drags.size && iy > 0.3) { let dy = (player.mesh.rotation.y + Math.PI) - cam.tYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); cam.tYaw += dy * Math.min(1, dt * 1.2); }
  }
  player.pos.y += (heightAt(player.pos.x, player.pos.z) - player.pos.y) * Math.min(1, dt * 12);
  player.mesh.position.set(player.pos.x, player.pos.y + (player.mixer ? 0 : Math.abs(Math.sin(walkT)) * 0.18 * Math.min(1, sp / 5)), player.pos.z);
  if (player.mixer) { player.setAnim(sp > 11 ? 'run' : sp > 0.6 ? 'walk' : 'idle'); player.mixer.update(dt); }
  player.mesh.rotation.z = Math.sin(walkT) * 0.05 * Math.min(1, sp / 5);

  // ── Kiko suit le joueur
  const ky = player.mesh.rotation.y;
  tmp.set(player.pos.x - Math.sin(ky) * 2 + Math.cos(ky) * 1.6, 0, player.pos.z - Math.cos(ky) * 2 - Math.sin(ky) * 1.6);
  kiko.position.lerp(tmp, Math.min(1, dt * 3)); kiko.position.y = heightAt(kiko.position.x, kiko.position.z) + 0.9 + Math.sin(t * 2.4) * 0.25;
  kiko.lookAt(player.pos.x, kiko.position.y, player.pos.z);
  const fl = kiko.getObjectByName('flame'); if (fl) fl.position.y = 1.6 + Math.sin(t * 5) * 0.1;

  // ── caméra
  cam.yaw += Math.atan2(Math.sin(cam.tYaw - cam.yaw), Math.cos(cam.tYaw - cam.yaw)) * Math.min(1, dt * 8);
  const ch = Math.cos(cam.pitch) * cam.dist, cv = Math.sin(cam.pitch) * cam.dist;
  const cx = player.pos.x + Math.sin(cam.yaw) * ch, czz = player.pos.z + Math.cos(cam.yaw) * ch;
  camera.position.set(cx, Math.max(player.pos.y + 1.6 + cv, heightAt(cx, czz) + 0.8), czz);
  camera.lookAt(player.pos.x, player.pos.y + 2, player.pos.z);

  // ── zone courante
  if (cz !== curZone) {
    curZone = cz; updateHUD(); showBanner(cz); setEraSky(cz);
    if (!save.seen[cz]) {
      save.seen[cz] = true; store();
      setTimeout(() => { if (!dialogOpen()) openDialog({ speaker: 'Kiko 🦊', color: '#ff8c42', icon: '🦊', pages: ERAS[cz].intro }); }, 900);
    }
    const ps = PSTYLE[ERAS[cz].particles];
    points.visible = !!ps;
    if (ps) { pMat.color.set(ps.c); pMat.size = ps.s; pMat.blending = ps.add ? THREE.AdditiveBlending : THREE.NormalBlending; pMat.needsUpdate = true; }
  }
  zones.forEach(z => { z.group.visible = Math.abs(z.i - cz) <= 1; });

  // ── ciel, brouillard, lumière (fondu entre époques)
  const era = ERAS[cz];
  skyState.elev += (skyState.tElev - skyState.elev) * Math.min(1, dt * 0.8);
  skyState.azim += (skyState.tAzim - skyState.azim) * Math.min(1, dt * 0.8);
  applySky(skyState.elev, skyState.azim);
  sky.position.copy(camera.position);
  stars.position.copy(camera.position);
  const night = era.night ? 1 : 0;
  stars.material.opacity += (night - stars.material.opacity) * Math.min(1, dt);
  skyU.rayleigh.value += ((night ? 0.5 : era.rayleigh || 1.6) - skyU.rayleigh.value) * Math.min(1, dt);
  fogTarget.set(era.fog);
  scene.fog.color.lerp(fogTarget, Math.min(1, dt * 1.5));
  const low = THREE.MathUtils.clamp(skyState.elev / 30, 0, 1);
  sun.color.setRGB(1, 0.72 + 0.26 * low, 0.5 + 0.42 * low);
  sun.intensity += ((night ? 0.35 : 1.4 + 1.9 * low) - sun.intensity) * Math.min(1, dt * 2);
  hemi.intensity += ((night ? 0.5 : 0.55) - hemi.intensity) * Math.min(1, dt * 2);
  scene.environmentIntensity = night ? 0.35 : 0.9;
  renderer.toneMappingExposure = night ? 1.15 : 0.95;
  const sd = sunDir.clone(); if (sd.y < 0.15) sd.y = 0.15; // lune / soleil bas
  sun.position.set(player.pos.x + sd.x * 120, sd.y * 120, player.pos.z + sd.z * 120); sun.target.position.set(player.pos.x, 0, player.pos.z);
  WATERS.forEach((n, k) => { n.offset.set(t * 0.02 + k, t * 0.013); });

  // ── objets animés
  for (const u of updaters) if (Math.abs(u.zone - cz) <= 1) u.fn(t);
  zones.forEach(z => {
    if (!z.group.visible) return;
    z.items.forEach(it => {
      if (it.sign && it.sign.mk.visible) { it.sign.mk.rotation.y = t * 1.6; it.sign.mk.position.y = 3.4 + Math.sin(t * 2.5) * 0.25; }
      if (it.bub && it.bub.visible) it.bub.position.y = 4.05 + Math.sin(t * 3 + it.pos.x) * 0.12;
      if (it.body) it.body.position.y = Math.sin(t * 2 + it.pos.z) * 0.03;
    });
    if (z.gate.barrier.visible) z.gate.barrier.material.opacity = 0.35 + Math.sin(t * 3) * 0.12;
  });

  // ── particules
  const ps = PSTYLE[era.particles];
  if (ps) {
    const a = pGeo.attributes.position.array;
    for (let k = 0; k < PCOUNT; k++) {
      const s = pSeed[k];
      a[k * 3 + 1] -= ps.fall * dt * (0.6 + (s % 1) * 0.8);
      a[k * 3] += Math.sin(t * 0.8 + s) * ps.drift * dt;
      a[k * 3 + 2] += Math.cos(t * 0.6 + s) * ps.drift * dt * 0.5;
      if (a[k * 3 + 1] < 0) a[k * 3 + 1] = 16; if (a[k * 3 + 1] > 16) a[k * 3 + 1] = 0;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.position.set(Math.round(player.pos.x / 70) * 70, 0, Math.round(player.pos.z / 70) * 70);
    // replie les particules autour du joueur
    for (let k = 0; k < PCOUNT; k++) {
      const wx = a[k * 3] + points.position.x, wz = a[k * 3 + 2] + points.position.z;
      if (wx - player.pos.x > 35) a[k * 3] -= 70; else if (wx - player.pos.x < -35) a[k * 3] += 70;
      if (wz - player.pos.z > 35) a[k * 3 + 2] -= 70; else if (wz - player.pos.z < -35) a[k * 3 + 2] += 70;
    }
  }

  // ── interaction la plus proche
  let best = null, bd = 4.2;
  for (const it of interactables) {
    if (Math.abs(it.zone - cz) > 1) continue;
    const d = Math.hypot(it.pos.x - player.pos.x, it.pos.z - player.pos.z);
    if (d < bd) { bd = d; best = it; }
  }
  if (best !== nearest) {
    nearest = best;
    const b = $('#btn-act');
    if (best && !uiBlocked) {
      const verb = best.kind === 'npc' ? 'Parler à' : best.kind === 'gate' ? 'Parler au' : 'Découvrir :';
      const lab = best.kind === 'gate' ? 'gardien' : best.label;
      b.innerHTML = `<kbd>E</kbd> ${verb} <b>${lab}</b>`; b.classList.add('show');
    } else b.classList.remove('show');
  }

  saveT += dt; if (saveT > 3 && !uiBlocked) { saveT = 0; save.pos = [player.pos.x, player.pos.z]; store(); }
  music();
}

function loop() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  step(dt, t);
  if (bloom.enabled) composer.render(); else { renderer.render(scene, camera); }
  requestAnimationFrame(loop);
}
refreshMarkers();
updateHUD();
loop();
// ════════════════ Modèles 3D externes (optionnels, voir assets.json)
(async () => {
  try {
    const res = await fetch('assets.json', { cache: 'no-store' }); if (!res.ok) return;
    const A = await res.json(); if (!A.player) return;
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(A.player);
    const model = gltf.scene;
    const bb = new THREE.Box3().setFromObject(model), h = bb.max.y - bb.min.y || 1;
    model.scale.setScalar((A.playerHeight || 2.1) / h); model.rotation.y = A.playerRotation || 0;
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    player.mesh.clear(); player.mesh.add(model);
    const mixer = new THREE.AnimationMixer(model), acts = {};
    const find = re => gltf.animations.find(c => re.test(c.name));
    for (const [k, re] of [['idle', /idle/i], ['walk', /walk/i], ['run', /run|sprint/i]]) { const c = find(re); if (c) acts[k] = mixer.clipAction(c); }
    if (!acts.run) acts.run = acts.walk; let cur = null;
    player.setAnim = k => { const a = acts[k] || acts.idle; if (!a || a === cur) return; a.reset().fadeIn(0.2).play(); if (cur) cur.fadeOut(0.2); cur = a; };
    player.mixer = mixer; player.setAnim('idle');
  } catch (e) { console.warn('Modèle 3D non chargé :', e); }
})();
window.__michi = { player, save: () => save, zones, interact, solveGate, travelTo, markDone };
