// Aperçu du nouveau style graphique : un village japonais et des personnages de plusieurs époques
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BUILD, DECOR, P, torii, fox } from './builders.js';
import { person } from './humans.js';
import { get as TEX } from './textures.js';

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xe3d9e6, 50, 190);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 800);
const sky = new Sky(); sky.scale.setScalar(700); scene.add(sky);
const U = sky.material.uniforms; U.turbidity.value = 6; U.rayleigh.value = 1.8; U.mieCoefficient.value = 0.004; U.mieDirectionalG.value = 0.85;
const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 24), THREE.MathUtils.degToRad(225)); U.sunPosition.value.copy(sunDir);
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene((() => { const s = new THREE.Scene(); const k = new Sky(); k.scale.setScalar(100); Object.keys(U).forEach(n => k.material.uniforms[n].value = U[n].value); s.add(k); return s; })(), 0.04).texture;
scene.environmentIntensity = 0.75;
const sun = new THREE.DirectionalLight(0xffe2c0, 3.2); sun.position.copy(sunDir).multiplyScalar(80); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
scene.add(sun, new THREE.HemisphereLight(0xdfefff, 0x5a6b3a, 0.45));
const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.25, 0.6, 0.9)); composer.addPass(new OutputPass());

// Sol : herbe, allée de gravier, pierres de gué
const gt = TEX('grass').clone(); gt.repeat.set(30, 30); gt.needsUpdate = true;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ map: gt, color: 0xd8ecc8, roughness: 0.95 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const dt = TEX('dirt').clone(); dt.repeat.set(2, 14); dt.needsUpdate = true;
const path = new THREE.Mesh(new THREE.PlaneGeometry(6, 70), new THREE.MeshStandardMaterial({ map: dt, color: 0xd9cbb0, roughness: 1 }));
path.rotation.x = -Math.PI / 2; path.position.set(0, 0.03, 5); path.receiveShadow = true; scene.add(path);

// Monuments
const add = (type, x, z, ry = 0) => { const b = BUILD[type](); P(b.g, x, 0, z); b.g.rotation.y = ry; scene.add(b.g); return b; };
const ups = [];
add('templeHall', 0, -30); add('pagoda', -20, -26, 0.3); add('shrine', 22, -18, -0.5);
const t = torii(); P(t, 0, 0, 12); scene.add(t);
ups.push(add('dotaku', -14, 6, 0.5).update);
// Rues de maisons
const houses = []; for (let i = 0; i < 6; i++) { houses.push({ x: -16, z: 30 - i * 7, s: 1, rot: Math.PI / 2 }); houses.push({ x: 16, z: 30 - i * 7, s: 1, rot: -Math.PI / 2 }); }
DECOR.machiya(houses).forEach(m => scene.add(m));
// Végétation
const R = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const ring = (n, r0, r1, seed) => R(n, i => { const a = i / n * Math.PI * 2 + seed, r = r0 + ((i * 37) % 10) / 10 * (r1 - r0); return { x: Math.cos(a) * r, z: Math.sin(a) * r - 5, s: 0.9 + ((i * 13) % 7) / 10, rot: i }; });
DECOR.pine(ring(16, 46, 60, 0)).forEach(m => scene.add(m));
DECOR.cedar(ring(18, 62, 75, 0.2)).forEach(m => scene.add(m));
DECOR.sakura([{ x: -9, z: 18, s: 1.1 }, { x: 9, z: 22, s: 1 }, { x: -30, z: -6, s: 1.2 }, { x: 30, z: 2, s: 1.1 }, { x: -6, z: -14, s: 0.9 }]).forEach(m => scene.add(m));
DECOR.maple([{ x: 14, z: -32, s: 1 }, { x: 34, z: -30, s: 1.1 }, { x: -34, z: -24, s: 1 }]).forEach(m => scene.add(m));
DECOR.bamboo(R(14, i => ({ x: -40 + (i % 4) * 2.2, z: 8 + Math.floor(i / 4) * 2.5, s: 1, rot: i }))).forEach(m => scene.add(m));
DECOR.lantern(R(8, i => ({ x: i % 2 ? 4 : -4, z: 4 - Math.floor(i / 2) * 7, s: 1 }))).forEach(m => scene.add(m));
DECOR.jizo(R(4, i => ({ x: 9 + i * 0.8, z: -6, s: 1 }))).forEach(m => scene.add(m));
DECOR.flower(R(18, i => ({ x: (i % 2 ? 6.5 : -6.5) + ((i * 7) % 3) * 0.6, z: 26 - i * 3, s: 1 }))).forEach(m => scene.add(m));

// Personnages de plusieurs époques
const cast = [
  { look: { hat: 'band', robe: 0xc1440e, accent: 0xf4a261 }, era: 0, name: 'Potière Jōmon' },
  { look: { hat: 'crown', robe: 0xf8f9fa, accent: 0xd62828 }, era: 1, name: 'Reine Himiko' },
  { look: { hat: 'eboshi', robe: 0x6a4c93, accent: 0xffd166 }, era: 2, name: 'Prince Shōtoku' },
  { look: { hat: 'longhair', robe: 0x9d4edd, accent: 0xffafcc }, era: 3, name: 'Dame de Heian' },
  { look: { hat: 'kabuto', robe: 0x780000, accent: 0xffd166 }, era: 4, name: 'Samouraï' },
  { look: { hat: 'bald', robe: 0x2b2d42, accent: 0xf2cc8f }, era: 4, name: 'Moine zen' },
  { look: { hat: 'bun', robe: 0xe76f51, accent: 0x2a9d8f }, era: 6, name: "Marchande d'Edo" },
  { look: { hat: 'topknot', robe: 0x1d3557, accent: 0xe9c46a }, era: 6, name: 'Samouraï d’Edo' },
  { look: { hat: 'ribbon', robe: 0xc77dff, accent: 0xd62828 }, era: 7, name: 'Étudiante de Meiji' },
  { look: { hat: 'ponytail', robe: 0x1d3557, accent: 0xff4d6d }, era: 8, name: 'Lycéenne' },
  { look: { hat: 'hair', robe: 0x343a40, accent: 0x1d3557 }, era: 8, name: 'Employé de bureau' },
];
const people = [];
cast.forEach((c, i) => {
  const p = person(c.look, c.era, i + 3); const a = -1.15 + i * 0.23;
  P(p, Math.sin(a) * 9, 0, -2 - Math.cos(a) * 4); p.rotation.y = Math.PI + a * 0.4; p.lookAt(0, 0, 22); scene.add(p); people.push({ p, talk: i % 3 === 0 });
});
// Passants qui marchent
const walkers = R(5, i => { const p = person([{ hat: 'straw', robe: 0x8d99ae, accent: 0x2b2d42 }, { hat: 'bun', robe: 0x457b9d, accent: 0xffafcc }, { hat: 'topknot', robe: 0x3a5a40, accent: 0xdda15e }, { hat: 'straw', robe: 0xd4a373, accent: 0x343a40 }, { hat: 'bun', robe: 0xe5989b, accent: 0x6a4c93 }][i], 6, i + 20); scene.add(p); return { p, off: i * 14, lane: i % 2 ? 1.6 : -1.6 }; });
const pilgrim = person({ hat: 'straw', robe: 0x3a86ff, accent: 0xffbe0b }, 3, 2); P(pilgrim, 2.5, 0, 16); pilgrim.rotation.y = Math.PI * 0.9; scene.add(pilgrim);
const kiko = fox(); kiko.scale.setScalar(0.8); P(kiko, 4.2, 1, 16.5); scene.add(kiko);

// Pétales
const N = 500, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) pos.set([(Math.random() - 0.5) * 70, Math.random() * 16, (Math.random() - 0.5) * 70], i * 3);
g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const petals = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffb3cf, size: 0.22, transparent: true, opacity: 0.9, depthWrite: false })); scene.add(petals);

// Caméra en orbite lente (glisser pour tourner, molette pour zoomer)
let yaw = 0.35, pitch = 0.32, dist = 30, auto = true, drag = null;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; auto = false; });
addEventListener('pointerup', () => drag = null);
addEventListener('pointermove', e => { if (!drag) return; yaw -= (e.clientX - drag.x) * 0.006; pitch = Math.min(1.2, Math.max(0.05, pitch + (e.clientY - drag.y) * 0.004)); drag = { x: e.clientX, y: e.clientY }; });
cv.addEventListener('wheel', e => { e.preventDefault(); dist = Math.min(80, Math.max(6, dist * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { auto = false; const v = b.dataset.view; if (v === 'people') { yaw = 0; pitch = 0.12; dist = 13; } if (v === 'village') { yaw = 0.35; pitch = 0.32; dist = 34; } if (v === 'temple') { yaw = -0.2; pitch = 0.22; dist = 52; } if (v === 'auto') auto = true; });
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock();
(function loop() {
  const d = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (auto) yaw += d * 0.08;
  const target = new THREE.Vector3(0, 1.6, -2);
  camera.position.set(target.x + Math.sin(yaw) * Math.cos(pitch) * dist, target.y + Math.sin(pitch) * dist, target.z + Math.cos(yaw) * Math.cos(pitch) * dist);
  camera.lookAt(target);
  people.forEach(({ p, talk }) => p.userData.anim(t, 0, talk && Math.sin(t * 0.5) > 0, d));
  walkers.forEach(w => { const k = ((t * 1.4 + w.off) % 60) - 30; P(w.p, w.lane, 0, k * (w.lane > 0 ? -1 : 1) + 8); w.p.rotation.y = w.lane > 0 ? Math.PI : 0; w.p.userData.anim(t, 2.2, false, d); });
  pilgrim.userData.anim(t, 0, false, d); kiko.position.y = 1 + Math.sin(t * 2.4) * 0.2;
  ups.forEach(f => f(t));
  const a = g.attributes.position.array; for (let i = 0; i < N; i++) { a[i * 3 + 1] -= d * (0.8 + (i % 5) * 0.2); a[i * 3] += Math.sin(t + i) * d * 0.6; if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 16; } g.attributes.position.needsUpdate = true;
  composer.render(); requestAnimationFrame(loop);
})();
document.getElementById('loading').remove();
