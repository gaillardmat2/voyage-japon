// Mini-jeux d'époque, dessinés sur un canevas 2D. playMinigame(id) → Promise<{ win, score }>
const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ───────────────────────── Habillage commun
function grad(c, W, H, top, bottom) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function txt(c, s, x, y, size = 22, color = '#2b2118', align = 'center', weight = 800) { c.font = `${weight} ${size}px system-ui, sans-serif`; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function emo(c, e, x, y, size = 40) { c.font = `${size}px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y); }
function rr(c, x, y, w, h, r, fill, stroke, lw = 3) { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
function btn(c, b, label, color = '#d9381e', fg = '#fff', size = 20) { rr(c, b.x, b.y, b.w, b.h, 14, color, 'rgba(0,0,0,.25)'); txt(c, label, b.x + b.w / 2, b.y + b.h / 2, size, fg, 'center', 700); }
const inside = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
function water(c, W, H, y0, t, col = '#2f8fc0') { c.fillStyle = col; c.fillRect(0, y0, W, H - y0); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, y0 + 18 + k * 28 + Math.sin(x * 0.03 + t * 2 + k) * 4); c.stroke(); } }

// ───────────────────────── Moteurs de jeu
const GAMES = {};

// Empiler (colombins de poterie ou pierres de muraille)
function stacker(kind) {
  return {
    title: kind === 'coils' ? 'Monter le pot en colombins' : 'Élever la muraille',
    help: kind === 'coils' ? "Les potiers Jōmon montent leurs pots sans tour, avec des boudins d'argile. Appuie (clic, espace ou toucher) pour poser chaque colombin bien aligné sur le précédent. 9 rangs à réussir !" : "Les murailles des châteaux sont faites de pierres empilées sans mortier. Pose chaque rangée bien au-dessus de la précédente. 9 rangées !",
    init(s) { s.rows = [{ x: s.W / 2 - 120, w: 240 }]; s.cur = { x: 0, w: 240, dir: 1 }; s.speed = 260; s.goal = 9; },
    update(s, dt) { const c = s.cur; c.x += c.dir * s.speed * dt; if (c.x < 20) { c.x = 20; c.dir = 1; } if (c.x + c.w > s.W - 20) { c.x = s.W - 20 - c.w; c.dir = -1; } },
    tap(s) {
      const prev = s.rows[s.rows.length - 1], c = s.cur;
      const l = Math.max(prev.x, c.x), r = Math.min(prev.x + prev.w, c.x + c.w);
      if (r - l < 14) return s.end(false, s.rows.length - 1);
      s.rows.push({ x: l, w: r - l }); s.sfx('tick');
      if (s.rows.length - 1 >= s.goal) return s.end(true, s.goal);
      s.cur = { x: Math.random() < 0.5 ? 20 : s.W - 20 - (r - l), w: r - l, dir: Math.random() < 0.5 ? 1 : -1 }; s.speed += 22;
    },
    draw(s, c, t) {
      grad(c, s.W, s.H, kind === 'coils' ? '#cfe8c4' : '#ffe1c9', kind === 'coils' ? '#8fbf7a' : '#c9b8a6');
      const rh = 30, base = s.H - 40;
      c.fillStyle = kind === 'coils' ? '#6d4c41' : '#7a7a7a'; c.fillRect(0, base + rh / 2, s.W, 40);
      s.rows.forEach((r, i) => {
        const y = base - i * rh;
        if (kind === 'coils') { rr(c, r.x, y - rh / 2, r.w, rh - 2, rh / 2, i ? (i % 2 ? '#c2702b' : '#b5651d') : '#8d5a3b', '#5d3a24', 2); c.strokeStyle = 'rgba(60,30,10,.4)'; for (let x = r.x + 8; x < r.x + r.w - 6; x += 10) { c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 6, y + 8); c.stroke(); } }
        else { for (let x = r.x, k = 0; x < r.x + r.w - 2; x += 40, k++) rr(c, x + (i % 2) * 6, y - rh / 2, Math.min(38, r.x + r.w - x), rh - 3, 6, ['#9e9e9e', '#8a8680', '#b0aaa0'][(k + i) % 3], '#555', 1.5); }
      });
      const y = base - s.rows.length * rh, cu = s.cur;
      if (kind === 'coils') rr(c, cu.x, y - rh / 2, cu.w, rh - 2, rh / 2, '#e08a4a', '#5d3a24', 2);
      else rr(c, cu.x, y - rh / 2, cu.w, rh - 3, 6, '#b8b2a8', '#555', 2);
      txt(c, `${s.rows.length - 1} / ${s.goal}`, s.W - 70, 34, 26);
    }
  };
}
GAMES.coils = stacker('coils');
GAMES.stones = stacker('stones');

// Pêche au harpon
GAMES.fishing = {
  title: 'Pêche au harpon', help: "Les poissons nagent entre deux eaux. Touche-les (clic ou toucher) quand ils remontent dans la zone claire, près de la surface. 6 poissons en 45 secondes !",
  init(s) { s.fish = []; s.caught = 0; s.time = 45; s.splash = []; },
  update(s, dt, t) {
    s.time -= dt; if (s.time <= 0) return s.end(s.caught >= 6, s.caught);
    if (s.fish.length < 5 && Math.random() < dt * 1.2) { const dir = Math.random() < 0.5 ? 1 : -1; s.fish.push({ x: dir > 0 ? -40 : s.W + 40, dir, sp: rnd(80, 170), ph: rnd(0, 6), y: 0, big: Math.random() < 0.3 }); }
    s.fish.forEach(f => { f.x += f.dir * f.sp * dt; f.y = s.H * 0.55 + Math.sin(t * 1.4 + f.ph) * s.H * 0.22; });
    s.fish = s.fish.filter(f => f.x > -60 && f.x < s.W + 60);
    s.splash = s.splash.filter(p => (p.t -= dt) > 0);
  },
  tap(s, x, y) {
    if (s.t < (s.cool || 0)) return; s.cool = s.t + 0.35;
    const zone = s.H * 0.45;
    const f = s.fish.find(f => Math.hypot(f.x - x, f.y - y) < 42);
    s.splash.push({ x, y, t: 0.4, ok: !!(f && f.y < zone) });
    if (f && f.y < zone) { s.caught++; s.fish.splice(s.fish.indexOf(f), 1); s.sfx('stamp'); if (s.caught >= 6) s.end(true, s.caught); }
    else s.sfx('wrong');
  },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#9bd8f0', '#e9f7fb'); c.fillStyle = '#f2d6a2'; c.fillRect(0, s.H * 0.16, s.W, 12);
    water(c, s.W, s.H, s.H * 0.2, t, '#3fa7d6');
    c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(0, s.H * 0.2, s.W, s.H * 0.25);
    c.fillStyle = 'rgba(0,40,80,.25)'; c.fillRect(0, s.H * 0.45, s.W, s.H * 0.55);
    s.fish.forEach(f => { c.save(); c.translate(f.x, f.y); c.scale(f.dir > 0 ? -1 : 1, 1); c.globalAlpha = f.y < s.H * 0.45 ? 1 : 0.55; emo(c, f.big ? '🐠' : '🐟', 0, 0, f.big ? 52 : 40); c.restore(); });
    s.splash.forEach(p => { c.strokeStyle = p.ok ? '#06d6a0' : '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(p.x, p.y, 30 * (1.4 - p.t * 2), 0, 7); c.stroke(); });
    emo(c, '🛶', s.W / 2, s.H * 0.13, 60);
    txt(c, `🐟 ${s.caught}/6`, 70, 30, 24); txt(c, `⏱ ${Math.ceil(s.time)}`, s.W - 60, 30, 24);
  }
};

// Jeux de rythme (repiquage du riz, game center, cormorans)
GAMES.riceplant = {
  title: 'Repiquer le riz', help: "Un repère glisse le long du rang. Appuie quand il passe sur la ligne pour planter la pousse au bon endroit. 12 pousses, au moins 9 bien plantées !",
  init(s) { s.n = 0; s.good = 0; s.pos = 0; s.sp = 0.9; s.planted = []; s.fb = null; },
  update(s, dt) { s.pos += s.sp * dt; if (s.pos > 1.1) { s.pos = -0.1; s.n++; s.fb = { ok: false, t: 0.6 }; s.sfx('wrong'); if (s.n >= 12) s.finish(); } if (s.fb) s.fb.t -= dt; },
  finish() {},
  tap(s) {
    const d = Math.abs(s.pos - 0.5);
    const ok = d < 0.07; s.n++; if (ok) { s.good++; s.sfx('tick'); } else s.sfx('wrong');
    s.planted.push(ok); s.fb = { ok, t: 0.6 }; s.pos = -0.1; s.sp += 0.05;
    if (s.n >= 12) s.end(s.good >= 9, s.good);
  },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#ffd6a5', '#9ccc65'); water(c, s.W, s.H, s.H * 0.35, t, '#7fd1c7');
    s.planted.forEach((ok, i) => { const x = 60 + (i % 12) * ((s.W - 120) / 11); emo(c, ok ? '🌱' : '🥀', x, s.H * 0.5, 34); });
    const ly = s.H * 0.78, x0 = 60, x1 = s.W - 60;
    c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x0, ly - 6, x1 - x0, 12);
    c.fillStyle = '#d9381e'; c.fillRect((x0 + x1) / 2 - 4, ly - 34, 8, 68);
    emo(c, '🌾', x0 + (x1 - x0) * s.pos, ly, 46);
    if (s.fb && s.fb.t > 0) txt(c, s.fb.ok ? 'Parfait !' : 'Raté…', s.W / 2, s.H * 0.68, 26, s.fb.ok ? '#2b9348' : '#d62828');
    txt(c, `🌱 ${s.good} / ${s.n}  (12)`, 100, 30, 22);
  }
};
GAMES.riceplant.update = (s, dt) => { s.pos += s.sp * dt; if (s.fb) s.fb.t -= dt; if (s.pos > 1.1) { s.n++; s.planted.push(false); s.fb = { ok: false, t: 0.6 }; s.pos = -0.1; s.sfx('wrong'); if (s.n >= 12) s.end(s.good >= 9, s.good); } };

function lanes({ title, help, n = 4, keys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], notes = 36, speed = 300, need = 0.7, skin = 'neon' }) {
  return {
    title, help,
    init(s) { s.notes = []; let t = 1.2; for (let i = 0; i < notes; i++) { t += pick([0.35, 0.5, 0.5, 0.7]); s.notes.push({ lane: Math.floor(Math.random() * n), t, hit: null }); } s.clock = 0; s.hits = 0; s.miss = 0; s.flash = Array(n).fill(0); },
    update(s, dt) {
      s.clock += dt; s.flash = s.flash.map(f => Math.max(0, f - dt));
      s.notes.forEach(o => { if (o.hit === null && s.clock - o.t > 0.18) { o.hit = false; s.miss++; } });
      if (s.notes.every(o => o.hit !== null)) { const sc = Math.max(0, s.hits - Math.floor((s.wrong || 0) / 2)); s.end(sc / notes >= need, sc); }
    },
    press(s, lane) {
      s.flash[lane] = 0.15;
      const o = s.notes.filter(o => o.hit === null && o.lane === lane).sort((a, b) => Math.abs(a.t - s.clock) - Math.abs(b.t - s.clock))[0];
      if (o && Math.abs(o.t - s.clock) < 0.16) { o.hit = true; s.hits++; s.sfx('tick'); } else { s.wrong = (s.wrong || 0) + 1; s.sfx('wrong'); }
    },
    tap(s, x) { this.press(s, Math.min(n - 1, Math.floor(x / (s.W / n)))); },
    key(s, code) { const k = keys.indexOf(code); if (k >= 0) this.press(s, k); if (/^Digit[1-9]$/.test(code)) { const d = +code.slice(5) - 1; if (d < n) this.press(s, d); } },
    draw(s, c, t) {
      const lw = s.W / n, hitY = s.H - 70;
      if (skin === 'neon') grad(c, s.W, s.H, '#10002b', '#3c096c'); else { grad(c, s.W, s.H, '#0b1d3a', '#13315c'); }
      const cols = skin === 'neon' ? ['#ff006e', '#00f5d4', '#ffd60a', '#4cc9f0'] : ['#ffb703', '#fb8500', '#ffd166'];
      for (let i = 0; i < n; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + s.flash[i] * 2})`; c.fillRect(i * lw + 4, 0, lw - 8, s.H); }
      c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(0, hitY - 2, s.W, 4);
      if (skin === 'river') { for (let i = 0; i < n; i++) emo(c, '🐦', i * lw + lw / 2, hitY + 34, 34); }
      s.notes.forEach(o => {
        if (o.hit === true) return; const y = hitY - (o.t - s.clock) * speed; if (y < -40 || y > s.H + 40) return;
        if (skin === 'river') { c.globalAlpha = o.hit === false ? 0.3 : 1; emo(c, '🐟', o.lane * lw + lw / 2, y, 36); c.globalAlpha = 1; }
        else rr(c, o.lane * lw + 12, y - 14, lw - 24, 28, 12, o.hit === false ? '#555' : cols[o.lane % cols.length], '#fff', 2);
      });
      if (skin === 'river') for (let i = 0; i < n; i++) { c.fillStyle = '#ff9f1c'; c.beginPath(); c.arc(i * lw + lw / 2, 22, 8 + Math.sin(t * 9 + i) * 2, 0, 7); c.fill(); }
      txt(c, `${s.hits} / ${notes}${s.wrong ? `  ✗${s.wrong}` : ''}`, s.W - 80, 30, 24, '#fff');
      if (s.clock < 1.2) txt(c, isTouch() ? 'Touche les colonnes' : `Touches : ${keys.map(k => k.replace('Key', '').replace('Digit', '')).join(' ')}  (ou clic)`, s.W / 2, s.H / 2, 22, '#fff');
    }
  };
}
GAMES.rhythm = lanes({ title: 'Record au game center', help: "Les notes descendent dans 4 colonnes. Appuie sur D, F, J, K (ou touche la colonne) quand une note arrive sur la ligne blanche. Réussis 70 % des notes !" });
GAMES.ukai = lanes({ title: 'Pêche au cormoran', help: "Les poissons remontent la rivière dans 3 couloirs. Envoie le cormoran (touches 1, 2, 3 ou toucher le couloir) quand un poisson arrive sur la ligne. Attrapes-en 60 % !", n: 3, keys: ['Digit1', 'Digit2', 'Digit3'], notes: 24, speed: 220, need: 0.6, skin: 'river' });

// Jauge à maintenir (four à haniwa)
GAMES.kiln = {
  title: 'Cuire les haniwa', help: "Maintiens le bouton (ou la barre d'espace) pour souffler sur les braises avec le soufflet. Garde la température dans la zone verte, qui se déplace. Il faut 12 secondes dans la zone !",
  init(s) { s.temp = 0.3; s.v = 0; s.inZone = 0; s.time = 40; s.zone = 0.55; },
  update(s, dt, t) {
    s.time -= dt; if (s.time <= 0) return s.end(false, Math.floor(s.inZone));
    s.zone = 0.55 + Math.sin(t * 0.5) * 0.22;
    s.v += (s.holding ? 0.9 : -0.6) * dt; s.v *= 0.96; s.temp = Math.max(0, Math.min(1, s.temp + s.v * dt));
    if (Math.abs(s.temp - s.zone) < 0.09) { s.inZone += dt; if (s.inZone >= 12) s.end(true, 12); }
  },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#2b1d14', '#5d3a24');
    const x = s.W * 0.7, y0 = 40, h = s.H - 100;
    rr(c, x, y0, 60, h, 18, '#1b1b1b', '#fff');
    c.fillStyle = 'rgba(6,214,160,.55)'; c.fillRect(x + 4, y0 + h * (1 - s.zone - 0.09), 52, h * 0.18);
    const g = c.createLinearGradient(0, y0 + h, 0, y0); g.addColorStop(0, '#ffb703'); g.addColorStop(1, '#ff006e');
    c.fillStyle = g; c.fillRect(x + 14, y0 + h * (1 - s.temp), 32, h * s.temp);
    c.fillStyle = '#6d4c41'; c.beginPath(); c.ellipse(s.W * 0.32, s.H * 0.62, 150, 110, 0, Math.PI, 0); c.fill();
    for (let i = 0; i < 6; i++) emo(c, '🔥', s.W * 0.32 + Math.sin(t * 5 + i) * 60 + (i - 2.5) * 22, s.H * 0.58 - Math.random() * 20 * s.temp, 26 + s.temp * 30);
    emo(c, '🧱', s.W * 0.32, s.H * 0.48, 40);
    txt(c, `Zone : ${s.inZone.toFixed(1)} / 12 s`, 140, 30, 22, '#fff'); txt(c, `⏱ ${Math.ceil(s.time)}`, s.W - 60, 30, 22, '#fff');
    btnHold(c, s, 'Soufflet 💨');
  }
};
function btnHold(c, s, label) { s.holdBtn = { x: 30, y: s.H - 80, w: 220, h: 60 }; btn(c, s.holdBtn, label, s.holding ? '#06d6a0' : '#d9381e'); }

// Calligraphie
const KANJI = [
  { k: '一', name: 'un', strokes: [[[0.2, 0.5], [0.8, 0.5]]] },
  { k: '十', name: 'dix', strokes: [[[0.18, 0.45], [0.82, 0.45]], [[0.5, 0.15], [0.5, 0.88]]] },
  { k: '山', name: 'montagne', strokes: [[[0.5, 0.15], [0.5, 0.82]], [[0.22, 0.4], [0.22, 0.82], [0.78, 0.82]], [[0.78, 0.4], [0.78, 0.82]]] },
  { k: '川', name: 'rivière', strokes: [[[0.28, 0.18], [0.26, 0.6], [0.18, 0.86]], [[0.5, 0.25], [0.5, 0.75]], [[0.74, 0.15], [0.74, 0.88]]] },
];
GAMES.calligraphy = {
  title: 'Recopier les caractères', help: "Trace chaque trait au pinceau en suivant le modèle gris, dans l'ordre et dans le sens indiqué par le point rouge. Fais glisser avec la souris ou le doigt. 4 caractères !",
  init(s) { s.ki = 0; s.si = 0; s.ink = []; s.cur = null; s.scores = []; s.msg = null; },
  box(s) { const sz = Math.min(s.W * 0.55, s.H - 60); return { x: (s.W - sz) / 2, y: 30, s: sz }; },
  down(s, x, y) { s.cur = [[x, y]]; }, move(s, x, y) { if (s.cur) s.cur.push([x, y]); },
  up(s) {
    if (!s.cur || s.cur.length < 3) { s.cur = null; return; }
    const b = this.box(s), ch = KANJI[s.ki], st = ch.strokes[s.si].map(([u, v]) => [b.x + u * b.s, b.y + v * b.s]);
    const dist = (p) => { let m = 1e9; for (let i = 0; i < st.length - 1; i++) { const [a, bb] = [st[i], st[i + 1]]; const dx = bb[0] - a[0], dy = bb[1] - a[1], l2 = dx * dx + dy * dy; let tt = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2; tt = Math.max(0, Math.min(1, tt)); m = Math.min(m, Math.hypot(p[0] - a[0] - tt * dx, p[1] - a[1] - tt * dy)); } return m; };
    const avg = s.cur.reduce((a, p) => a + dist(p), 0) / s.cur.length;
    const startOk = Math.hypot(s.cur[0][0] - st[0][0], s.cur[0][1] - st[0][1]) < b.s * 0.2;
    const endOk = Math.hypot(s.cur.at(-1)[0] - st.at(-1)[0], s.cur.at(-1)[1] - st.at(-1)[1]) < b.s * 0.2;
    const ok = avg < b.s * 0.08 && startOk && endOk;
    if (ok) { s.ink.push(s.cur); s.scores.push(Math.max(0, 1 - avg / (b.s * 0.08))); s.si++; s.sfx('tick'); s.msg = { t: 0.8, s: 'Beau trait !', ok: true }; }
    else { s.sfx('wrong'); s.msg = { t: 1.2, s: !startOk || !endOk ? 'Commence au point rouge et va jusqu\'au bout !' : 'Reste plus près du modèle.', ok: false }; }
    s.cur = null;
    if (s.si >= ch.strokes.length) { s.ki++; s.si = 0; s.ink = []; if (s.ki >= KANJI.length) s.end(true, Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length * 100)); else s.msg = { t: 1.2, s: `${ch.k} « ${ch.name} » réussi !`, ok: true }; }
  },
  update(s, dt) { if (s.msg) s.msg.t -= dt; },
  draw(s, c) {
    grad(c, s.W, s.H, '#f4e9d0', '#e8d8b8'); const b = this.box(s), ch = KANJI[Math.min(s.ki, KANJI.length - 1)];
    rr(c, b.x, b.y, b.s, b.s, 10, '#fffdf5', '#b5838d', 4);
    c.strokeStyle = 'rgba(181,131,141,.35)'; c.setLineDash([8, 8]); c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + b.s / 2, b.y); c.lineTo(b.x + b.s / 2, b.y + b.s); c.moveTo(b.x, b.y + b.s / 2); c.lineTo(b.x + b.s, b.y + b.s / 2); c.stroke(); c.setLineDash([]);
    ch.strokes.forEach((st, i) => { c.strokeStyle = i < s.si ? 'transparent' : i === s.si ? 'rgba(80,80,80,.35)' : 'rgba(80,80,80,.12)'; c.lineWidth = b.s * 0.07; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); st.forEach(([u, v], k) => k ? c.lineTo(b.x + u * b.s, b.y + v * b.s) : c.moveTo(b.x + u * b.s, b.y + v * b.s)); c.stroke(); });
    const st = ch.strokes[s.si]; if (st) { c.fillStyle = '#d62828'; c.beginPath(); c.arc(b.x + st[0][0] * b.s, b.y + st[0][1] * b.s, 9, 0, 7); c.fill(); }
    const ink = (p) => { c.strokeStyle = '#111'; c.lineWidth = b.s * 0.06; c.beginPath(); p.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
    s.ink.forEach(ink); if (s.cur) ink(s.cur);
    txt(c, `${ch.k}  « ${ch.name} »  ${Math.min(s.ki + 1, 4)}/4`, 90, 30, 22, '#2b2118', 'left');
    if (s.msg && s.msg.t > 0) txt(c, s.msg.s, s.W / 2, s.H - 18, 20, s.msg.ok ? '#2b9348' : '#d62828');
  }
};

// Cerfs de Nara
GAMES.deer = {
  title: 'Nourrir les cerfs', help: "Les cerfs s'approchent. Donne un biscuit (touche le cerf) seulement quand il baisse la tête pour saluer ! 8 biscuits bien donnés en 40 secondes. Attention aux cerfs impatients…",
  init(s) { s.deer = []; s.ok = 0; s.time = 40; s.fx = []; for (let i = 0; i < 4; i++) s.deer.push(this.mk(s, i)); },
  mk(s, i) { return { x: s.W * (0.15 + i * 0.23), y: s.H * 0.62 + (i % 2) * 30, bow: 0, next: rnd(0.8, 3), fed: 0 }; },
  update(s, dt) {
    s.time -= dt; if (s.time <= 0) return s.end(s.ok >= 8, s.ok);
    s.deer.forEach(d => { d.next -= dt; if (d.next <= 0 && d.bow <= 0) { d.bow = rnd(0.7, 1.1); d.next = rnd(1.5, 3.5); } d.bow -= dt; d.fed -= dt; });
    s.fx = s.fx.filter(f => (f.t -= dt) > 0);
  },
  tap(s, x, y) {
    const d = s.deer.find(d => Math.abs(d.x - x) < 70 && Math.abs(d.y - y) < 90); if (!d) return;
    if (d.bow > 0) { s.ok++; d.bow = 0; d.fed = 0.6; s.fx.push({ x: d.x, y: d.y - 80, t: 0.8, s: '🍘 +1' }); s.sfx('tick'); if (s.ok >= 8) s.end(true, 8); }
    else { s.ok = Math.max(0, s.ok - 1); s.fx.push({ x: d.x, y: d.y - 80, t: 0.8, s: '😤 -1' }); s.sfx('wrong'); }
  },
  draw(s, c) {
    grad(c, s.W, s.H, '#bde0fe', '#86cf8a'); c.fillStyle = '#6aa84f'; c.fillRect(0, s.H * 0.45, s.W, s.H);
    s.deer.forEach(d => { c.save(); c.translate(d.x, d.y); if (d.bow > 0) c.rotate(0.35); emo(c, '🦌', 0, 0, 96); c.restore(); if (d.bow > 0) txt(c, 'ぺこり', d.x, d.y - 75, 18, '#d62828'); });
    s.fx.forEach(f => txt(c, f.s, f.x, f.y - (0.8 - f.t) * 40, 22));
    txt(c, `🍘 ${s.ok}/8`, 70, 30, 24); txt(c, `⏱ ${Math.ceil(s.time)}`, s.W - 60, 30, 24);
  }
};

// Kai-awase : retrouver les paires de coquillages
GAMES.kaiawase = {
  title: 'Kai-awase', help: "Retourne les coquillages deux par deux pour retrouver les paires peintes du même motif. Retrouve les 8 paires en moins de 24 essais !",
  init(s) { const m = ['🌸', '🌙', '🍁', '🌊', '🐦', '⛰️', '🎋', '🦢']; s.cards = shuffle([...m, ...m]).map(e => ({ e, open: false, done: false })); s.sel = []; s.tries = 0; s.wait = 0; },
  layout(s) { const cols = s.W > s.H * 1.2 ? 8 : 4, rows = 16 / cols, cw = Math.min((s.W - 40) / cols, (s.H - 70) / rows) - 8; return { cols, cw, ox: (s.W - cols * (cw + 8)) / 2, oy: 54 }; },
  update(s, dt) { if (s.wait > 0) { s.wait -= dt; if (s.wait <= 0) { s.sel.forEach(i => s.cards[i].open = false); s.sel = []; } } },
  tap(s, x, y) {
    if (s.wait > 0) return; const L = this.layout(s);
    const i = s.cards.findIndex((cd, k) => { const cx = L.ox + (k % L.cols) * (L.cw + 8), cy = L.oy + Math.floor(k / L.cols) * (L.cw + 8); return x > cx && x < cx + L.cw && y > cy && y < cy + L.cw; });
    if (i < 0 || s.cards[i].open || s.cards[i].done) return;
    s.cards[i].open = true; s.sel.push(i); s.sfx('tick');
    if (s.sel.length === 2) {
      s.tries++; const [a, b] = s.sel;
      if (s.cards[a].e === s.cards[b].e) { s.cards[a].done = s.cards[b].done = true; s.sel = []; s.sfx('stamp'); if (s.cards.every(c => c.done)) s.end(s.tries <= 24, s.tries); }
      else { s.wait = 0.8; if (s.tries >= 30) s.end(false, s.tries); }
    }
  },
  draw(s, c) {
    grad(c, s.W, s.H, '#ffe5ec', '#ffc8dd'); const L = this.layout(s);
    s.cards.forEach((cd, k) => {
      const x = L.ox + (k % L.cols) * (L.cw + 8), y = L.oy + Math.floor(k / L.cols) * (L.cw + 8);
      rr(c, x, y, L.cw, L.cw, L.cw / 2.4, cd.done ? '#fff3b0' : cd.open ? '#fffaf0' : '#e9c46a', cd.done ? '#06d6a0' : '#b5838d', 3);
      if (cd.open || cd.done) emo(c, cd.e, x + L.cw / 2, y + L.cw / 2, L.cw * 0.55);
      else { c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 2; for (let r = 0; r < 5; r++) { c.beginPath(); c.arc(x + L.cw / 2, y + L.cw * 0.95, L.cw * (0.2 + r * 0.14), Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } }
    });
    txt(c, `Essais : ${s.tries} / 24`, s.W / 2, 26, 22);
  }
};

// Kemari
GAMES.kemari = {
  title: 'Kemari', help: "Garde la balle de cuir en l'air ! Appuie quand elle descend près de ton pied (zone dorée). 15 frappes réussies. Tu as 3 balles.",
  init(s) { s.b = { x: s.W / 2, y: 80, vx: 0, vy: 0 }; s.kicks = 0; s.lives = 3; },
  update(s, dt) {
    const b = s.b; b.vy += 620 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < 30 || b.x > s.W - 30) b.vx *= -1;
    if (b.y > s.H - 30) { s.lives--; s.sfx('wrong'); if (s.lives <= 0) return s.end(false, s.kicks); Object.assign(b, { x: s.W / 2, y: 80, vx: 0, vy: 0 }); }
  },
  tap(s) { const b = s.b; if (s.t < (s.cool || 0)) return; s.cool = s.t + 0.45; if (b.y > s.H - 170 && b.vy > 0) { b.vy = -rnd(560, 680); b.vx = rnd(-120, 120); s.kicks++; s.sfx('tick'); if (s.kicks >= 15) s.end(true, 15); } else s.sfx('wrong'); },
  draw(s, c) {
    grad(c, s.W, s.H, '#ffe5ec', '#d8f3dc'); c.fillStyle = 'rgba(255,209,102,.35)'; c.fillRect(0, s.H - 170, s.W, 140);
    emo(c, '🌸', 60, 70, 60); emo(c, '🍁', s.W - 60, 70, 60);
    emo(c, '🧍', s.b.x, s.H - 60, 70);
    c.fillStyle = '#fff'; c.strokeStyle = '#8d5a3b'; c.lineWidth = 3; c.beginPath(); c.arc(s.b.x, s.b.y, 18, 0, 7); c.fill(); c.stroke();
    txt(c, `Frappes : ${s.kicks}/15`, 110, 30, 22); txt(c, '⚪'.repeat(s.lives), s.W - 70, 30, 22);
  }
};

// Tir à l'arc sur l'éventail (Nasu no Yoichi)
GAMES.archery = {
  title: "L'éventail de Nasu no Yoichi", help: "L'éventail danse sur la barque, et le vent souffle. Tire (clic, espace ou toucher) quand l'éventail est dans le cercle de visée. 3 éventails touchés sur 5 flèches !",
  init(s) { s.arrows = 5; s.hits = 0; s.fx = null; },
  fan(s, t) { return { x: s.W / 2 + Math.sin(t * 1.3) * s.W * 0.28 + Math.sin(t * 3.1) * 30, y: s.H * 0.42 + Math.sin(t * 2.2) * 40 }; },
  update(s, dt) { if (s.fx) { s.fx.t -= dt; if (s.fx.t <= 0) { s.fx = null; if (s.arrows <= 0) s.end(s.hits >= 3, s.hits); } } },
  tap(s) { if (s.fx || s.arrows <= 0) return; s.arrows--; const f = this.fan(s, s.t); const hit = Math.hypot(f.x - s.W / 2, f.y - s.H * 0.42) < 38; if (hit) { s.hits++; s.sfx('stamp'); } else s.sfx('wrong'); s.fx = { t: 0.9, hit }; },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#ffbfa3', '#f9e0c7'); water(c, s.W, s.H, s.H * 0.55, t, '#3a7ca5');
    const f = this.fan(s, t);
    emo(c, '⛵', f.x, f.y + 70, 80);
    const fx = s.fx && s.fx.hit ? (0.9 - s.fx.t) : 0; fan(c, f.x + fx * 80, f.y - fx * 160, fx * 6);
    c.strokeStyle = '#d62828'; c.lineWidth = 3; c.beginPath(); c.arc(s.W / 2, s.H * 0.42, 38, 0, 7); c.moveTo(s.W / 2 - 50, s.H * 0.42); c.lineTo(s.W / 2 + 50, s.H * 0.42); c.moveTo(s.W / 2, s.H * 0.42 - 50); c.lineTo(s.W / 2, s.H * 0.42 + 50); c.stroke();
    if (s.fx) txt(c, s.fx.hit ? 'Touché ! Les deux armées applaudissent !' : 'Manqué…', s.W / 2, s.H * 0.18, 24, s.fx.hit ? '#2b9348' : '#d62828');
    txt(c, `🏹 ${s.arrows}   🎯 ${s.hits}/3`, 110, 30, 22);
  }
};

function fan(c, x, y, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#d62828'; c.beginPath(); c.moveTo(0, 18); c.arc(0, 18, 34, Math.PI * 1.15, Math.PI * 1.85); c.closePath(); c.fill(); c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(0, -4, 9, 0, 7); c.fill(); c.strokeStyle = '#5d3a24'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 18); c.lineTo(0, 30); c.stroke(); c.restore(); }

// Yabusame
GAMES.yabusame = {
  title: 'Yabusame', help: "Ton cheval galope le long de la piste. Tire quand une cible passe dans la zone rouge. 3 passages de 3 cibles : il faut en toucher 6 !",
  init(s) { s.run = 0; s.targets = []; s.hits = 0; s.arrows = 13; s.speed = 300; this.lap(s); },
  lap(s) { s.targets = [0, 1, 2].map(i => ({ x: s.W + 200 + i * rnd(320, 420), hit: null })); s.run++; },
  update(s, dt) {
    s.targets.forEach(o => { o.x -= s.speed * dt; if (o.hit === null && o.x < s.W * 0.3 - 50) o.hit = false; });
    if (s.targets.every(o => o.x < -60)) { if (s.run >= 3) return s.end(s.hits >= 6, s.hits); s.speed += 60; this.lap(s); }
  },
  tap(s) { if (s.arrows <= 0) return; s.arrows--; const o = s.targets.find(o => o.hit === null && Math.abs(o.x - s.W * 0.3) < 46); if (o) { o.hit = true; s.hits++; s.sfx('stamp'); } else s.sfx('wrong'); },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#d5c3e8', '#e9f5db'); c.fillStyle = '#c9a66b'; c.fillRect(0, s.H * 0.7, s.W, 60);
    for (let x = -((t * s.speed) % 120); x < s.W; x += 120) { c.fillStyle = '#6d4c41'; c.fillRect(x, s.H * 0.62, 8, 50); }
    c.fillStyle = 'rgba(214,40,40,.18)'; c.fillRect(s.W * 0.3 - 46, 0, 92, s.H);
    s.targets.forEach(o => { c.fillStyle = '#6d4c41'; c.fillRect(o.x - 3, s.H * 0.38, 6, s.H * 0.3); rr(c, o.x - 34, s.H * 0.3, 68, 68, 6, o.hit ? '#ffd166' : '#fffaf0', '#2b2118'); c.fillStyle = '#d62828'; c.beginPath(); c.arc(o.x, s.H * 0.3 + 34, o.hit ? 8 : 16, 0, 7); c.fill(); });
    c.save(); c.translate(s.W * 0.3, s.H * 0.82 + Math.abs(Math.sin(t * 10)) * -8); c.scale(-1, 1); emo(c, '🏇', 0, 0, 90); c.restore();
    txt(c, `🎯 ${s.hits}/6   🏹 ${s.arrows}   Passage ${s.run}/3`, 170, 30, 22);
  }
};

// Forge du sabre
GAMES.forge = {
  title: 'Forger un sabre', help: "Le métal chauffe puis refroidit. Frappe (clic, espace ou toucher) quand il est jaune-orangé, à la bonne température. 10 bons coups de marteau, 3 erreurs maximum !",
  init(s) { s.heat = 0; s.dir = 1; s.good = 0; s.bad = 0; s.fx = 0; },
  update(s, dt) { s.heat += s.dir * dt * (0.55 + s.good * 0.05); if (s.heat >= 1) { s.heat = 1; s.dir = -1; } if (s.heat <= 0) { s.heat = 0; s.dir = 1; } s.fx = Math.max(0, s.fx - dt); },
  tap(s) {
    const ok = s.heat > 0.62 && s.heat < 0.86; s.fx = 0.25;
    if (ok) { s.good++; s.sfx('tick'); s.heat = 0.2; s.dir = 1; if (s.good >= 10) s.end(true, 10); } else { s.bad++; s.sfx('wrong'); if (s.bad > 3) s.end(false, s.good); }
  },
  draw(s, c) {
    grad(c, s.W, s.H, '#1b1b1b', '#3e2723');
    const col = s.heat < 0.3 ? `rgb(${80 + s.heat * 400},20,10)` : s.heat < 0.62 ? `rgb(220,${(s.heat - 0.3) * 300},20)` : s.heat < 0.86 ? `rgb(255,${150 + (s.heat - 0.62) * 300},40)` : `rgb(255,250,${(s.heat - 0.86) * 1500})`;
    rr(c, s.W * 0.15, s.H * 0.55, s.W * 0.6, 26, 12, col, '#000');
    c.shadowColor = col; c.shadowBlur = 30 * s.heat; rr(c, s.W * 0.15, s.H * 0.55, s.W * 0.6, 26, 12, col); c.shadowBlur = 0;
    c.fillStyle = '#555'; c.fillRect(s.W * 0.2, s.H * 0.6, s.W * 0.5, 60);
    emo(c, '🔨', s.W * 0.55, s.H * 0.4 + (s.fx > 0 ? 50 : 0), 80);
    const gx = s.W - 90, gy = 60, gh = s.H - 120;
    const g = c.createLinearGradient(0, gy + gh, 0, gy); g.addColorStop(0, '#5a0a0a'); g.addColorStop(0.5, '#e85d04'); g.addColorStop(0.75, '#ffba08'); g.addColorStop(1, '#fffbe6');
    rr(c, gx, gy, 40, gh, 10, g, '#fff'); c.strokeStyle = '#06d6a0'; c.lineWidth = 4; c.strokeRect(gx - 4, gy + gh * (1 - 0.86), 48, gh * 0.24);
    c.fillStyle = '#fff'; c.fillRect(gx - 10, gy + gh * (1 - s.heat) - 2, 60, 4);
    txt(c, `Coups : ${s.good}/10   Erreurs : ${s.bad}/3`, 170, 30, 20, '#fff');
  }
};

// Mettre dans l'ordre (cérémonie du thé, grue en papier)
function order({ title, help, steps, icon }) {
  return {
    title, help,
    init(s) { s.order = shuffle(steps.map((x, i) => i)); s.next = 0; s.err = 0; s.msg = null; },
    cards(s) { const n = steps.length, cols = s.W > 700 ? 2 : 1, rows = Math.ceil(n / cols), w = (s.W - 40 - (cols - 1) * 12) / cols, h = Math.min(56, (s.H - 110) / rows - 8); return s.order.map((st, k) => ({ st, x: 20 + (k % cols) * (w + 12), y: 90 + Math.floor(k / cols) * (h + 8), w, h })); },
    tap(s, x, y) {
      const cd = this.cards(s).find(c => inside(c, x, y)); if (!cd) return;
      if (cd.st < s.next) return;
      if (cd.st === s.next) { s.next++; s.sfx('tick'); s.msg = { s: `✓ ${steps[cd.st]}`, ok: true, t: 1 }; if (s.next >= steps.length) s.end(s.err <= 3, Math.max(0, steps.length - s.err)); }
      else { s.err++; s.sfx('wrong'); s.msg = { s: "Ce n'est pas encore le moment de ce geste…", ok: false, t: 1.2 }; }
    },
    update(s, dt) { if (s.msg) s.msg.t -= dt; },
    draw(s, c) {
      grad(c, s.W, s.H, '#f1faee', '#d8e2dc');
      emo(c, icon, 50, 44, 50); txt(c, `Étape ${Math.min(s.next + 1, steps.length)} / ${steps.length} — touche le geste suivant`, 90, 44, 20, '#2b2118', 'left', 700);
      this.cards(s).forEach(cd => { const done = cd.st < s.next; rr(c, cd.x, cd.y, cd.w, cd.h, 12, done ? '#caffbf' : '#fff', done ? '#2b9348' : '#457b9d', 3); txt(c, (done ? `${cd.st + 1}. ` : '') + steps[cd.st], cd.x + 16, cd.y + cd.h / 2, Math.min(18, cd.h * 0.4), done ? '#2b9348' : '#1d3557', 'left', 600); });
      txt(c, `Erreurs : ${s.err} / 3`, s.W - 90, 44, 18);
      if (s.msg && s.msg.t > 0) txt(c, s.msg.s, s.W / 2, s.H - 18, 18, s.msg.ok ? '#2b9348' : '#d62828');
    }
  };
}
GAMES.tea = order({ title: 'La cérémonie du thé', icon: '🍵', help: "Le maître te montre les gestes. Touche-les dans le bon ordre, de l'accueil jusqu'à la dégustation. 3 erreurs maximum !", steps: ["Saluer l'invité en s'inclinant", "Purifier le bol à l'eau chaude", "Essuyer le bol avec le linge", "Déposer le matcha avec la cuillère", "Verser l'eau chaude", "Fouetter avec le fouet en bambou", "Tourner le bol et le présenter", "L'invité boit, puis admire le bol"] });
GAMES.cranes = order({ title: 'Plier une grue en papier', icon: '🕊️', help: "Plie la grue (orizuru) en suivant les étapes dans l'ordre. 3 erreurs maximum !", steps: ["Plier le carré en triangle, deux fois", "Ouvrir et aplatir en petit carré", "Rabattre les côtés vers le milieu", "Ouvrir en losange (le « pétale »)", "Recommencer de l'autre côté", "Affiner les deux pointes du bas", "Relever le cou et la queue", "Plier la tête et ouvrir les ailes"] });

// Arquebuse
GAMES.arquebus = {
  title: "Tir à l'arquebuse", help: "Recharge dans l'ordre : poudre, balle, bourrer, mèche. Puis tire sur une cible en la touchant. 5 cibles en 60 secondes !",
  init(s) { s.time = 60; s.hits = 0; s.load = 0; s.targets = []; s.fx = []; },
  steps: ['Poudre', 'Balle', 'Bourrer', 'Mèche'],
  btns(s) { const w = (s.W - 50) / 4; return this.steps.map((n, i) => ({ x: 10 + i * (w + 10), y: s.H - 64, w, h: 54, i })); },
  update(s, dt) {
    s.time -= dt; if (s.time <= 0) return s.end(s.hits >= 5, s.hits);
    if (s.targets.length < 2 && Math.random() < dt) s.targets.push({ x: rnd(80, s.W - 80), y: rnd(90, s.H - 180), r: 34, ttl: rnd(3, 5) });
    s.targets.forEach(o => o.ttl -= dt); s.targets = s.targets.filter(o => o.ttl > 0); s.fx = s.fx.filter(f => (f.t -= dt) > 0);
  },
  tap(s, x, y) {
    const b = this.btns(s).find(b => inside(b, x, y));
    if (b) { if (b.i === s.load) { s.load++; s.sfx('tick'); } else s.sfx('wrong'); return; }
    if (s.load < 4) { s.fx.push({ x, y, t: 0.6, s: 'Recharge d\'abord !' }); s.sfx('wrong'); return; }
    s.load = 0; s.sfx('stamp'); s.fx.push({ x, y, t: 0.5, s: '💥' });
    const o = s.targets.find(o => Math.hypot(o.x - x, o.y - y) < o.r + 8);
    if (o) { s.hits++; s.targets.splice(s.targets.indexOf(o), 1); if (s.hits >= 5) s.end(true, 5); }
  },
  draw(s, c) {
    grad(c, s.W, s.H, '#d2ecf2', '#8cc06a');
    s.targets.forEach(o => { [o.r, o.r * 0.66, o.r * 0.33].forEach((r, i) => { c.fillStyle = i % 2 ? '#fff' : '#d62828'; c.beginPath(); c.arc(o.x, o.y, r, 0, 7); c.fill(); }); });
    s.fx.forEach(f => txt(c, f.s, f.x, f.y, f.s.length > 3 ? 18 : 40, '#d62828'));
    this.btns(s).forEach(b => btn(c, b, (b.i < s.load ? '✓ ' : '') + this.steps[b.i], b.i < s.load ? '#2b9348' : b.i === s.load ? '#d9381e' : '#6c757d', '#fff', 18));
    txt(c, `🎯 ${s.hits}/5   ⏱ ${Math.ceil(s.time)}   ${s.load === 4 ? '🔥 PRÊT : vise une cible !' : 'Recharge…'}`, s.W / 2, 26, 20);
  }
};

// Séquences à répéter (tambours taiko, télégraphe morse)
GAMES.taiko = {
  title: 'Les signaux des tambours', help: "Écoute et regarde la séquence de tambours, puis répète-la en touchant les tambours (ou touches 1 à 4). Atteins une séquence de 7 coups !",
  init(s) { s.seq = [Math.floor(Math.random() * 4)]; s.show = 0.8; s.idx = 0; s.input = 0; s.lit = -1; s.phase = 'show'; },
  drums(s) { const w = Math.min(150, (s.W - 60) / 4); return [0, 1, 2, 3].map(i => ({ x: s.W / 2 + (i - 2) * (w + 16) + 8, y: s.H * 0.45, w, h: w, i })); },
  update(s, dt) {
    if (s.phase !== 'show') { s.lit = s.litT > 0 ? s.lit : -1; s.litT -= dt; return; }
    s.show -= dt; if (s.show > 0) return;
    if (s.idx < s.seq.length) { s.lit = s.seq[s.idx]; s.litT = 0.4; s.sfx('drum' + s.lit); s.idx++; s.show = 0.6; setTimeout(() => s.lit = -1, 380); }
    else { s.phase = 'input'; s.input = 0; }
  },
  hit(s, i) {
    if (s.phase !== 'input') return; s.lit = i; s.litT = 0.2; s.sfx('drum' + i);
    if (s.seq[s.input] !== i) return s.end(s.seq.length - 1 >= 7, s.seq.length - 1);
    s.input++;
    if (s.input >= s.seq.length) { if (s.seq.length >= 7) return s.end(true, 7); s.seq.push(Math.floor(Math.random() * 4)); s.phase = 'show'; s.idx = 0; s.show = 1; }
  },
  tap(s, x, y) { const d = this.drums(s).find(d => inside(d, x, y)); if (d) this.hit(s, d.i); },
  key(s, code) { if (/^Digit[1-4]$/.test(code)) this.hit(s, +code.slice(5) - 1); },
  draw(s, c) {
    grad(c, s.W, s.H, '#d8d8d0', '#a7b86a'); const cols = ['#d62828', '#f77f00', '#2a9d8f', '#3a0ca3'];
    this.drums(s).forEach(d => { c.fillStyle = '#6d4c41'; c.fillRect(d.x + d.w * 0.1, d.y + d.h * 0.5, d.w * 0.8, d.h * 0.45); c.fillStyle = s.lit === d.i ? '#fff3b0' : cols[d.i]; c.beginPath(); c.ellipse(d.x + d.w / 2, d.y + d.h * 0.5, d.w / 2, d.h * 0.22, 0, 0, 7); c.fill(); c.strokeStyle = '#2b2118'; c.lineWidth = 4; c.stroke(); txt(c, String(d.i + 1), d.x + d.w / 2, d.y + d.h * 0.5, 22, '#fff'); });
    txt(c, s.phase === 'show' ? '👂 Écoute…' : `À toi ! (${s.input}/${s.seq.length})`, s.W / 2, s.H * 0.2, 26);
    txt(c, `Longueur : ${s.seq.length} / 7`, s.W - 110, 30, 20);
  }
};
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', R: '.-.', S: '...', T: '-', U: '..-', W: '.--', Y: '-.--', V: '...-', X: '-..-', Q: '--.-', Z: '--..' };
GAMES.telegraph = {
  title: 'Le télégraphe de Perry', help: "Recopie chaque mot en morse avec les deux boutons : « · » pour un point court, « — » pour un trait long (ou touches ← et →). Le code de chaque lettre est affiché. 3 mots !",
  init(s) { s.words = ['SOS', 'EDO', 'PAIX']; s.w = 0; s.typed = ''; s.err = 0; s.msg = null; },
  code(s) { return s.words[s.w].split('').map(l => MORSE[l]).join(' '); },
  btns(s) { return [{ x: s.W / 2 - 170, y: s.H - 90, w: 160, h: 70, v: '.' }, { x: s.W / 2 + 10, y: s.H - 90, w: 160, h: 70, v: '-' }]; },
  add(s, v) {
    if (s.w >= s.words.length) return;
    const target = this.code(s).replace(/ /g, ''); const nxt = target[s.typed.length];
    if (v === nxt) { s.typed += v; s.sfx(v === '.' ? 'tick' : 'open'); if (s.typed.length >= target.length) { s.msg = { s: `« ${s.words[s.w]} » transmis !`, t: 1.2 }; s.w++; s.typed = ''; if (s.w >= s.words.length) s.end(s.err <= 6, s.words.length); } }
    else { s.err++; s.sfx('wrong'); }
  },
  tap(s, x, y) { const b = this.btns(s).find(b => inside(b, x, y)); if (b) this.add(s, b.v); },
  key(s, code) { if (code === 'ArrowLeft') this.add(s, '.'); if (code === 'ArrowRight') this.add(s, '-'); },
  update(s, dt) { if (s.msg) s.msg.t -= dt; },
  draw(s, c) {
    grad(c, s.W, s.H, '#e9ecef', '#adb5bd'); const word = s.words[Math.min(s.w, s.words.length - 1)];
    txt(c, `Mot ${Math.min(s.w + 1, 3)}/3 : ${word}`, s.W / 2, 40, 30);
    let x = 60, k = 0; const target = word.split('').map(l => MORSE[l]);
    c.font = '800 34px monospace';
    target.forEach((m, li) => { txt(c, word[li], x + m.length * 13, 100, 22, '#457b9d'); m.split('').forEach(ch => { const done = k < s.typed.length; c.fillStyle = done ? '#2b9348' : '#2b2118'; if (ch === '.') { c.beginPath(); c.arc(x + 10, 150, 9, 0, 7); c.fill(); } else c.fillRect(x, 144, 30, 12); x += ch === '.' ? 26 : 42; k++; }); x += 30; });
    this.btns(s).forEach(b => btn(c, b, b.v === '.' ? '·  point' : '—  trait', '#1d3557', '#fff', 22));
    txt(c, `Erreurs : ${s.err}`, s.W - 80, 40, 18);
    if (s.msg && s.msg.t > 0) txt(c, s.msg.s, s.W / 2, s.H * 0.48, 26, '#2b9348');
  }
};

// Échoppe de sushis
const SUSHI = [{ e: '🍣', n: 'Thon' }, { e: '🍤', n: 'Crevette' }, { e: '🥚', n: 'Omelette' }, { e: '🥒', n: 'Concombre' }];
GAMES.sushi = {
  title: "L'échoppe de Yohei", help: "Les clients d'Edo sont pressés ! Sers au premier client de la file le sushi qu'il demande (boutons en bas, ou touches 1 à 4). 10 clients servis, 3 erreurs ou impatiences maximum !",
  init(s) { s.queue = []; s.served = 0; s.err = 0; s.spawn = 0; },
  btns(s) { const w = (s.W - 50) / 4; return SUSHI.map((o, i) => ({ x: 10 + i * (w + 10), y: s.H - 80, w, h: 70, i })); },
  update(s, dt) {
    s.spawn -= dt; if (s.spawn <= 0 && s.queue.length < 4) { s.queue.push({ want: Math.floor(Math.random() * 4), pat: 7 - Math.min(3, s.served * 0.3), face: pick(['🧑', '👩', '👴', '👦', '🧔']) }); s.spawn = rnd(1, 2.2); }
    const f = s.queue[0]; if (f) { f.pat -= dt; if (f.pat <= 0) { s.queue.shift(); s.err++; s.sfx('wrong'); if (s.err >= 3) s.end(false, s.served); } }
  },
  serve(s, i) { const f = s.queue[0]; if (!f) return; if (f.want === i) { s.queue.shift(); s.served++; s.sfx('tick'); if (s.served >= 10) s.end(true, 10); } else { s.err++; s.sfx('wrong'); if (s.err >= 3) s.end(false, s.served); } },
  tap(s, x, y) { const b = this.btns(s).find(b => inside(b, x, y)); if (b) this.serve(s, b.i); },
  key(s, code) { if (/^Digit[1-4]$/.test(code)) this.serve(s, +code.slice(5) - 1); },
  draw(s, c) {
    grad(c, s.W, s.H, '#e6eef2', '#c9a66b'); c.fillStyle = '#8d5a3b'; c.fillRect(0, s.H - 150, s.W, 60);
    s.queue.forEach((f, k) => { const x = 90 + k * Math.min(170, (s.W - 120) / 4), y = s.H * 0.38; emo(c, f.face, x, y, 70); rr(c, x - 44, y - 110, 88, 56, 14, '#fff', '#2b2118', 2); emo(c, SUSHI[f.want].e, x, y - 82, 36); c.fillStyle = f.pat > 2.5 ? '#2b9348' : '#d62828'; c.fillRect(x - 40, y + 46, 80 * Math.max(0, f.pat / 7), 7); if (k === 0) txt(c, '▲ premier', x, y + 66, 14); });
    this.btns(s).forEach(b => { rr(c, b.x, b.y, b.w, b.h, 14, '#fffaf0', '#2b2118'); emo(c, SUSHI[b.i].e, b.x + 34, b.y + b.h / 2, 34); txt(c, `${b.i + 1}. ${SUSHI[b.i].n}`, b.x + 62, b.y + b.h / 2, 15, '#2b2118', 'left', 700); });
    txt(c, `Servis : ${s.served}/10   Erreurs : ${s.err}/3`, s.W / 2, 26, 20);
  }
};

// Impression d'estampe (repérage kentō)
GAMES.ukiyoe = {
  title: 'Imprimer une estampe', help: "Chaque couleur a sa propre planche de bois. La feuille glisse : appuie pour la poser quand ses coins sont pile sur les repères (le kentō). 5 couleurs à imprimer avec précision !",
  init(s) { s.layer = 0; s.offs = []; s.x = 0; s.dir = 1; s.sp = 220; },
  layers: [['#a2d2ff', 'ciel'], ['#1d3557', 'montagne'], ['#ffffff', 'neige'], ['#e63946', 'soleil'], ['#2a9d8f', 'pins']],
  update(s, dt) { s.x += s.dir * s.sp * dt; if (Math.abs(s.x) > 120) { s.x = Math.sign(s.x) * 120; s.dir *= -1; } },
  tap(s) { s.offs.push(s.x); s.sfx(Math.abs(s.x) < 12 ? 'tick' : 'wrong'); s.layer++; s.x = 120; s.dir = -1; s.sp += 40; if (s.layer >= 5) { const err = s.offs.reduce((a, o) => a + Math.abs(o), 0) / 5; s.end(err < 18, Math.max(0, Math.round(100 - err * 3))); } },
  paint(c, i, ox, X, Y, W, H) {
    c.save(); c.translate(ox, 0); c.fillStyle = this.layers[i][0];
    if (i === 0) c.fillRect(X, Y, W, H * 0.7);
    if (i === 1) { c.beginPath(); c.moveTo(X + W * 0.15, Y + H * 0.85); c.lineTo(X + W * 0.5, Y + H * 0.25); c.lineTo(X + W * 0.85, Y + H * 0.85); c.fill(); }
    if (i === 2) { c.beginPath(); c.moveTo(X + W * 0.41, Y + H * 0.38); c.lineTo(X + W * 0.5, Y + H * 0.25); c.lineTo(X + W * 0.59, Y + H * 0.38); c.lineTo(X + W * 0.53, Y + H * 0.35); c.lineTo(X + W * 0.5, Y + H * 0.4); c.lineTo(X + W * 0.46, Y + H * 0.35); c.fill(); }
    if (i === 3) { c.beginPath(); c.arc(X + W * 0.78, Y + H * 0.2, H * 0.08, 0, 7); c.fill(); }
    if (i === 4) for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(X + W * (0.08 + k * 0.06), Y + H * 0.92); c.lineTo(X + W * (0.11 + k * 0.06), Y + H * 0.66); c.lineTo(X + W * (0.14 + k * 0.06), Y + H * 0.92); c.fill(); }
    c.restore();
  },
  draw(s, c) {
    grad(c, s.W, s.H, '#f4e9d0', '#e0cfa8');
    const W = Math.min(s.W * 0.6, 420), H = W * 0.66, X = (s.W - W) / 2, Y = (s.H - H) / 2 - 10;
    rr(c, X - 10, Y - 10, W + 20, H + 20, 4, '#fffaf0', '#8d5a3b', 3);
    s.offs.forEach((o, i) => this.paint(c, i, o, X, Y, W, H));
    if (s.layer < 5) { c.globalAlpha = 0.55; this.paint(c, s.layer, s.x, X, Y, W, H); c.globalAlpha = 1; c.strokeStyle = '#d62828'; c.lineWidth = 3; c.strokeRect(X + s.x, Y, W, H); }
    c.fillStyle = '#2b2118'; c.fillRect(X - 14, Y + H - 4, 14, 14); c.fillRect(X - 4, Y + H + 2, 30, 8);
    txt(c, s.layer < 5 ? `Planche ${s.layer + 1}/5 : ${this.layers[s.layer][1]}` : '', s.W / 2, 26, 22);
  }
};

// Conduite du train
GAMES.train = {
  title: 'Conduire le premier train', help: "Maintiens « Vapeur » (flèche ↑) pour accélérer et « Frein » (flèche ↓) pour ralentir. Arrête-toi à moins de 5 mètres du repère du quai, sans le dépasser de plus de 5 m !",
  init(s) { s.pos = 0; s.v = 0; s.goal = 600; s.time = 0; s.stopped = false; },
  btns(s) { return [{ x: 20, y: s.H - 84, w: 200, h: 66, k: 'gas' }, { x: s.W - 220, y: s.H - 84, w: 200, h: 66, k: 'brake' }]; },
  update(s, dt) {
    s.time += dt; const gas = s.hold === 'gas' || s.keys.has('ArrowUp'), brk = s.hold === 'brake' || s.keys.has('ArrowDown');
    s.v += (gas ? 9 : 0) * dt - (brk ? 16 : 0) * dt - 0.6 * dt; s.v = Math.max(0, Math.min(30, s.v)); s.pos += s.v * dt;
    if (s.pos > s.goal + 40) return s.end(false, 0);
    if (s.v === 0 && s.pos > 60 && !gas) { s.still = (s.still || 0) + dt; if (s.still > 0.8) { const d = Math.abs(s.pos - s.goal); s.end(d <= 5, Math.round(Math.max(0, 100 - d * 2))); } } else s.still = 0;
  },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#cde7f0', '#e8e4e0'); c.fillStyle = '#7a9e5a'; c.fillRect(0, s.H * 0.55, s.W, s.H);
    const scale = 4, camX = s.pos * scale - s.W * 0.3;
    c.fillStyle = '#555'; c.fillRect(0, s.H * 0.62, s.W, 8);
    for (let x = -(camX % 40); x < s.W; x += 40) { c.fillStyle = '#6d4c41'; c.fillRect(x, s.H * 0.6, 10, 18); }
    const px = s.goal * scale - camX;
    c.fillStyle = '#bcb8b1'; c.fillRect(px - 260, s.H * 0.5, 300, 40); c.fillStyle = '#d62828'; c.fillRect(px - 3, s.H * 0.3, 6, 90); txt(c, 'QUAI', px - 110, s.H * 0.47, 18);
    c.save(); c.translate(s.W * 0.3, s.H * 0.55); c.scale(-1, 1); emo(c, '🚂', 0, 0, 90); c.restore(); emo(c, '🚃', s.W * 0.3 - 80, s.H * 0.555, 80);
    if (s.v > 0.5) for (let i = 0; i < 3; i++) emo(c, '☁️', s.W * 0.3 + 20 - i * 30, s.H * 0.4 - i * 20 - (t * 40 % 20), 24 + i * 6);
    this.btns(s).forEach(b => btn(c, b, b.k === 'gas' ? '♨ Vapeur' : '■ Frein', s.hold === b.k ? '#2b9348' : b.k === 'gas' ? '#d9381e' : '#1d3557'));
    txt(c, `Vitesse : ${Math.round(s.v * 3.6)} km/h   Distance au quai : ${Math.round(s.goal - s.pos)} m`, s.W / 2, 28, 20);
  }
};

// Course de relais
GAMES.sprint = {
  title: 'Le relais de la flamme', help: "Alterne les deux boutons (ou les flèches ← →) le plus vite possible pour courir 100 mètres. Il faut arriver en moins de 16 secondes !",
  init(s) { s.d = 0; s.last = null; s.time = 0; s.v = 0; },
  btns(s) { return [{ x: 20, y: s.H - 90, w: s.W / 2 - 30, h: 74, k: 'L' }, { x: s.W / 2 + 10, y: s.H - 90, w: s.W / 2 - 30, h: 74, k: 'R' }]; },
  step(s, k) { if (k === s.last) return; s.last = k; s.v = Math.min(9, s.v + 1.4); s.sfx('tick'); },
  tap(s, x, y) { const b = this.btns(s).find(b => inside(b, x, y)); if (b) this.step(s, b.k); },
  key(s, code) { if (code === 'ArrowLeft') this.step(s, 'L'); if (code === 'ArrowRight') this.step(s, 'R'); },
  update(s, dt) { s.time += dt; s.v = Math.max(0, s.v - dt * 4); s.d += s.v * dt; if (s.d >= 100) s.end(s.time < 16, Math.round(s.time * 10) / 10); if (s.time > 30) s.end(false, 0); },
  draw(s, c, t) {
    grad(c, s.W, s.H, '#a8dcf0', '#ffffff'); c.fillStyle = '#c1440e'; c.fillRect(0, s.H * 0.5, s.W, s.H * 0.25);
    c.strokeStyle = '#fff'; c.lineWidth = 3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(0, s.H * 0.5 + k * s.H * 0.083); c.lineTo(s.W, s.H * 0.5 + k * s.H * 0.083); c.stroke(); }
    const x = 40 + (s.W - 120) * s.d / 100; emo(c, '🏃', x, s.H * 0.55, 70); emo(c, '🔥', x + 24, s.H * 0.45, 30); c.fillStyle = '#fff'; c.fillRect(s.W - 70, s.H * 0.48, 6, s.H * 0.28);
    this.btns(s).forEach(b => btn(c, b, b.k === 'L' ? '◀ Gauche' : 'Droite ▶', s.last === b.k ? '#2b9348' : '#d9381e'));
    txt(c, `${Math.floor(s.d)} m   ⏱ ${s.time.toFixed(1)} s`, s.W / 2, 28, 22);
  }
};

// Exercice d'évacuation (choix)
const DRILL = [
  { q: "La terre tremble fort ! Que fais-tu d'abord ?", o: ["Je cours dehors tout de suite", "Je me protège la tête sous une table solide", "Je vais regarder par la fenêtre"], a: 1, e: "On se protège d'abord des objets qui tombent." },
  { q: "Les secousses s'arrêtent. Tu habites près de la mer. Que fais-tu ?", o: ["Je monte immédiatement vers une hauteur", "J'attends de voir si la mer se retire", "Je vais chercher mes affaires"], a: 0, e: "Après un fort séisme près de la côte, on évacue tout de suite, sans attendre l'alerte." },
  { q: "Pour partir, que prends-tu ?", o: ["La voiture, c'est plus rapide", "Je pars à pied vers le refuge", "Le vélo par la route du bord de mer"], a: 1, e: "Les voitures créent des embouteillages : on évacue à pied vers les hauteurs." },
  { q: "Tu es arrivé en hauteur. Ta maison est en bas. Que fais-tu ?", o: ["Je reste jusqu'à la levée de l'alerte", "Je redescends vite chercher mon chat", "Je redescends dès que la première vague est passée"], a: 0, e: "Plusieurs vagues peuvent se suivre pendant des heures." },
  { q: "Que veut dire le mot du Tōhoku « tendenko » ?", o: ["Chacun évacue seul, sans attendre les autres", "Attendre toute la famille avant de partir", "Rester chez soi"], a: 0, e: "« Tsunami tendenko » : chacun fuit de son côté, en faisant confiance aux autres pour en faire autant." },
];
GAMES.evacuation = {
  title: "Exercice d'évacuation", help: "Un exercice comme dans les écoles japonaises. Choisis le bon geste à chaque étape. Au moins 4 bonnes réponses sur 5 !",
  init(s) { s.i = 0; s.good = 0; s.fb = null; },
  btns(s) { if (s.i >= DRILL.length) return []; return DRILL[s.i].o.map((o, k) => ({ x: 30, y: 120 + k * 72, w: s.W - 60, h: 60, k })); },
  tap(s, x, y) {
    if (s.fb) { s.fb = null; s.i++; if (s.i >= DRILL.length) s.end(s.good >= 4, s.good); return; }
    const b = this.btns(s).find(b => inside(b, x, y)); if (!b) return;
    const ok = b.k === DRILL[s.i].a; if (ok) s.good++; s.sfx(ok ? 'stamp' : 'wrong'); s.fb = { ok, e: DRILL[s.i].e };
  },
  key(s, code) { if (s.fb && (code === 'Space' || code === 'Enter')) this.tap(s, 0, 0); if (!s.fb && /^Digit[1-3]$/.test(code)) { const b = this.btns(s)[+code.slice(5) - 1]; if (b) this.tap(s, b.x + 1, b.y + 1); } },
  draw(s, c) {
    grad(c, s.W, s.H, '#dfe8ee', '#b8d8e8'); const d = DRILL[Math.min(s.i, DRILL.length - 1)];
    txt(c, `Question ${s.i + 1}/5`, s.W / 2, 26, 18, '#457b9d'); wrap(c, d.q, s.W / 2, 70, s.W - 60, 22);
    if (!s.fb) this.btns(s).forEach(b => btn(c, b, `${b.k + 1}. ${d.o[b.k]}`, '#1d3557', '#fff', 18));
    else { txt(c, s.fb.ok ? '✅ Bon réflexe !' : '❌ Attention !', s.W / 2, 150, 28, s.fb.ok ? '#2b9348' : '#d62828'); wrap(c, s.fb.e, s.W / 2, 200, s.W - 80, 20); txt(c, 'Touche pour continuer', s.W / 2, s.H - 30, 16, '#555'); }
  }
};
function wrap(c, s, x, y, maxW, size) { c.font = `700 ${size}px system-ui`; const words = s.split(' '); let line = '', yy = y; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW) { txt(c, line, x, yy, size, '#2b2118', 'center', 700); line = w; yy += size * 1.35; } else line = t; } txt(c, line, x, yy, size, '#2b2118', 'center', 700); }

// Feux d'artifice
GAMES.hanabi = {
  title: 'Le bouquet final', help: "Chaque fusée monte puis ralentit. Fais-la éclater (clic, espace ou toucher) au sommet de sa course, quand elle s'arrête presque. 8 fusées, au moins 5 parfaites !",
  init(s) { s.n = 0; s.good = 0; s.rk = null; s.bursts = []; s.wait = 0.6; },
  update(s, dt) {
    s.bursts.forEach(b => b.t += dt); s.bursts = s.bursts.filter(b => b.t < 1.6);
    if (!s.rk) { s.wait -= dt; if (s.wait <= 0) { if (s.n >= 8) return s.end(s.good >= 5, s.good); s.rk = { x: rnd(s.W * 0.2, s.W * 0.8), y: s.H, vy: -rnd(420, 520), col: pick(['#ff006e', '#ffd60a', '#00f5d4', '#c77dff', '#ff9f1c']) }; s.n++; } return; }
    const r = s.rk; r.vy += 300 * dt; r.y += r.vy * dt;
    if (r.vy > 160) { s.rk = null; s.wait = 0.5; s.sfx('wrong'); }
  },
  tap(s) { const r = s.rk; if (!r) return; const ok = Math.abs(r.vy) < 70; if (ok) s.good++; s.bursts.push({ x: r.x, y: r.y, col: r.col, t: 0, big: ok }); s.sfx(ok ? 'win' : 'tick'); s.rk = null; s.wait = 0.7; },
  draw(s, c) {
    grad(c, s.W, s.H, '#0b0033', '#3c096c'); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect((i * 97) % s.W, (i * 53) % (s.H * 0.6), 2, 2); }
    c.fillStyle = '#1b1640'; c.beginPath(); c.ellipse(s.W / 2, s.H + 40, s.W * 0.7, 90, 0, 0, 7); c.fill();
    if (s.rk) { c.fillStyle = '#fff'; c.beginPath(); c.arc(s.rk.x, s.rk.y, 4, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,200,120,.6)'; c.beginPath(); c.moveTo(s.rk.x, s.rk.y); c.lineTo(s.rk.x, s.rk.y + 40); c.stroke(); }
    s.bursts.forEach(b => { const R = (b.big ? 120 : 45) * Math.min(1, b.t * 2); c.globalAlpha = Math.max(0, 1 - b.t / 1.6); for (let k = 0; k < (b.big ? 36 : 14); k++) { const a = k / (b.big ? 36 : 14) * Math.PI * 2; c.fillStyle = b.col; c.beginPath(); c.arc(b.x + Math.cos(a) * R, b.y + Math.sin(a) * R + b.t * 30, b.big ? 4 : 3, 0, 7); c.fill(); } c.globalAlpha = 1; });
    txt(c, `Fusées : ${s.n}/8   Parfaites : ${s.good}/5`, s.W / 2, 28, 20, '#fff');
  }
};

// ───────────────────────── Lanceur
const isTouch = () => matchMedia('(pointer: coarse)').matches;
export const GAME_TITLES = Object.fromEntries(Object.entries(GAMES).map(([k, g]) => [k, g.title]));

export function playMinigame(id, sfx = () => {}) {
  const G = GAMES[id];
  return new Promise(resolve => {
    const root = $('#minigame'), cv = $('#mg-canvas'), ctx = cv.getContext('2d');
    $('#mg-title').textContent = G.title; $('#mg-help').textContent = G.help;
    root.classList.add('show'); $('#mg-intro').style.display = ''; $('#mg-result').style.display = 'none';
    let s = null, raf = 0, last = 0, running = false;
    const size = () => {
      const r = $('#mg-stage').getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = r.width * dpr; cv.height = r.height * dpr; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (s) { s.W = r.width; s.H = r.height; }
      return r;
    };
    const start = () => {
      const r = size();
      s = { W: r.width, H: r.height, t: 0, keys: new Set(), holding: false, hold: null, sfx, done: false };
      s.end = (win, score) => { if (s.done) return; s.done = true; running = false; sfx(win ? 'win' : 'wrong'); showResult(win, score); };
      G.init(s); $('#mg-intro').style.display = 'none'; running = true; last = performance.now(); loop();
    };
    const loop = () => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) { s.t += dt; G.update && G.update(s, dt, s.t); }
      if (s) { ctx.clearRect(0, 0, s.W, s.H); G.draw(s, ctx, s.t); }
      if (running) raf = requestAnimationFrame(loop);
    };
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const onDown = e => {
      if (!running) return; e.preventDefault(); const [x, y] = pos(e);
      if (s.holdBtn && inside(s.holdBtn, x, y)) s.holding = true;
      if (G.btns) { const b = G.btns(s).find(b => inside(b, x, y)); if (b && b.k && (b.k === 'gas' || b.k === 'brake')) s.hold = b.k; }
      if (G.down) G.down(s, x, y); else if (G.tap) G.tap(s, x, y);
    };
    const onMove = e => { if (running && G.move) { const [x, y] = pos(e); G.move(s, x, y); } };
    const onUp = () => { if (!s) return; s.holding = false; s.hold = null; if (running && G.up) G.up(s); };
    const onKey = e => {
      if (!running) { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if ($('#mg-intro').style.display !== 'none') start(); else finish(); } if (e.code === 'Escape') quit(); return; }
      e.preventDefault(); e.stopPropagation();
      if (e.type === 'keydown') {
        if (e.code === 'Escape') return quit();
        if (!s.keys.has(e.code)) { s.keys.add(e.code); if (e.code === 'Space' && G.holdBtn !== undefined) s.holding = true; if (e.code === 'Space') { if (id === 'kiln') s.holding = true; else if (G.tap && !G.key) G.tap(s, s.W / 2, s.H / 2); } if (G.key) G.key(s, e.code); }
      } else { s.keys.delete(e.code); if (e.code === 'Space') s.holding = false; }
    };
    let result = null;
    const showResult = (win, score) => {
      result = { win, score };
      $('#mg-result').style.display = ''; $('#mg-verdict').textContent = win ? '🎉 Réussi !' : '😅 Pas cette fois…';
      $('#mg-score').textContent = `Score : ${score}`; $('#mg-continue').textContent = win ? 'Continuer ▸' : 'Abandonner';
    };
    const cleanup = () => { cancelAnimationFrame(raf); running = false; root.classList.remove('show'); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true); window.removeEventListener('resize', size); };
    const finish = () => { cleanup(); resolve(result || { win: false, score: 0 }); };
    const quit = () => { cleanup(); resolve({ win: false, score: 0, quit: true }); };
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey, true); window.addEventListener('keyup', onKey, true); window.addEventListener('resize', size);
    $('#mg-start').onclick = start; $('#mg-retry').onclick = () => { $('#mg-result').style.display = 'none'; result = null; start(); };
    $('#mg-continue').onclick = finish; $('#mg-quit').onclick = quit;
  });
}
export { GAMES };
