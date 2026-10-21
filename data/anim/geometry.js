'use strict';
/* «Геометрия» бөлімінің анимациялары */
(() => {
const S = Anim.scene;
const rad = d => d * Math.PI / 180;
// Бұрыш доғасы: төбе (cx, cy), бұрыштар градуспен (математикалық бағыт, y жоғары)
const P = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
const arcPath = (cx, cy, r, a0, a1) => { const p0 = P(cx, cy, r, a0), p1 = P(cx, cy, r, a1); return `M${p0[0]} ${p0[1]} A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${p1[0]} ${p1[1]}`; };
const wedge = (cx, cy, r, a0, a1) => { const p0 = P(cx, cy, r, a0), p1 = P(cx, cy, r, a1); return `M${cx} ${cy} L${p0[0]} ${p0[1]} A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${p1[0]} ${p1[1]} Z`; };
const angle = (g, cx, cy, r, a0, a1, label, o = {}) => {
  g.path(wedge(cx, cy, r, a0, a1), { fill: o.fill || 'goldsoft', stroke: 'none', sw: 0, fade: true });
  g.path(arcPath(cx, cy, r, a0, a1), { stroke: o.stroke || 'gold', sw: 3, draw: true, d: 400 });
  if (label != null) { const m = (a0 + a1) / 2, lp = P(cx, cy, r + (o.lr ?? 26), m); g.text(lp[0], lp[1], label, { size: o.size || 22, bold: true, color: o.color || o.stroke || 'gold', math: true }); }
};
const angDeg = (a, b) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180 / Math.PI;
// Төбесі V, қабырғалары V→P1 және V→P2 болатын ішкі бұрыш
const vAngle = (g, V, P1, P2, r, label, o) => {
  const a = angDeg(V, P1), b = angDeg(V, P2), d = ((b - a) % 360 + 360) % 360;
  if (d <= 180) angle(g, V[0], V[1], r, a, a + d, label, o); else angle(g, V[0], V[1], r, b, b + 360 - d, label, o);
};

S('geometry-01', (g, k) => {
  const y = 170, A = 120, B = 120 + 7 * 45, C = 120 + 12 * 45;
  return [
    ['Кесінді — екі нүкте арасындағы түзудің бөлігі. B нүктесі A мен C-ның арасында жатыр.', () => {
      g.line(A, y, C, y, { stroke: 'text', sw: 4, draw: true });
      g.stagger([[A, 'A'], [B, 'B'], [C, 'C']], 200, ([x, n]) => { g.circle(x, y, 8, { fill: 'ink' }); g.text(x, y - 32, n, { size: 26, bold: true, math: true, italic: true }); });
    }],
    ['AB = 7 см, BC = 5 см.', () => {
      g.line(A, y, B, y, { stroke: 'mod', sw: 9, draw: true }); g.text((A + B) / 2, y + 34, '7 см', { size: 22, bold: true, color: 'modt' });
      g.line(B, y, C, y, { stroke: 'gold', sw: 9, draw: true }); g.text((B + C) / 2, y + 34, '5 см', { size: 22, bold: true, color: 'gold' });
    }],
    ['Бүтін кесінді бөліктердің қосындысына тең: AC = 7 + 5 = **12 см**.', () => {
      g.line(A, y + 64, C, y + 64, { stroke: 'ok', sw: 3, draw: true });
      g.par(() => { g.line(A, y + 56, A, y + 72, { stroke: 'ok', sw: 3 }); g.line(C, y + 56, C, y + 72, { stroke: 'ok', sw: 3 }); });
      g.text((A + C) / 2, y + 96, 'AC = 7 + 5 = 12 см', { size: 26, bold: true, color: 'ok', math: true });
    }],
    ['Кері есеп: AC = 20 см, AB = 8 см болса, BC = AC − AB = 20 − 8 = **12 см**. Ұзындық ешқашан теріс болмайды.', () => {
      g.text(400, 380, 'BC = AC − AB = 20 − 8 = 12 см', { size: 28, math: true, bold: true });
    }]
  ];
});

S('geometry-02', (g, k) => {
  const O = [400, 220];
  return [
    ['Сыбайлас бұрыштар ортақ қабырғамен жанасып, бірге жазыңқы бұрыш (180°) құрайды.', () => {
      g.line(120, 220, 680, 220, { stroke: 'text', sw: 4, draw: true });
      const e = P(400, 220, 230, 65); g.line(400, 220, e[0], e[1], { stroke: 'text', sw: 4, draw: true });
      g.circle(400, 220, 6, { fill: 'text' });
    }],
    ['Бір бұрыш 65°. Екеуінің қосындысы 180°.', () => {
      angle(g, 400, 220, 70, 0, 65, '65°', { stroke: 'mod', fill: 'modsoft', color: 'modt' });
      angle(g, 400, 220, 50, 65, 180, '?', { stroke: 'gold' });
    }],
    ['Екінші бұрыш: 180° − 65° = **115°**.', () => {
      g.text(400, 300, '180° − 65° = 115°', { size: 32, math: true, bold: true, color: 'goldt' });
    }],
    ['Тік бұрыш — 90°. Ол екіге бөлінсе: 90° − 28° = 62°. Вертикаль бұрыштар өзара тең. Қателеспе: сыбайлас бұрыштар қосындысы 90° емес, 180°.', () => {
      k.tag(400, 380, 'сыбайлас: 180°,   тік бұрыш: 90°', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
      g.text(400, 430, '90° − 28° = 62°', { size: 26, math: true, bold: true });
    }]
  ];
});

S('geometry-03', (g, k) => {
  const A = [130, 340], B = [470, 340], C = [331, 100];
  return [
    ['Кез келген үшбұрыштың ішкі бұрыштарының қосындысы 180°.', () => {
      g.poly([A, B, C], { fill: 'modsoft', stroke: 'ink', sw: 3.5 });
    }],
    ['Есепте екі бұрыш берілген: 50° және 60°. Үшіншісін табу керек.', () => {
      vAngle(g, A, B, C, 50, '50°', { stroke: 'mod', fill: 'inksoft', color: 'modt' });
      vAngle(g, B, C, A, 50, '60°', { stroke: 'c4', fill: 'c4soft', color: 'c4' });
      vAngle(g, C, A, B, 40, null, { stroke: 'c3', fill: 'c3soft' });
    }],
    ['Үш бұрышты қатар қойсақ, жазыңқы бұрыш (180°) шығады.', () => {
      const cx = 640, cy = 330, r = 110;
      g.line(cx - r - 20, cy, cx + r + 20, cy, { stroke: 'text', sw: 3, draw: true });
      g.path(wedge(cx, cy, r, 0, 60), { fill: 'c4', stroke: 'sheet', sw: 2 });
      g.path(wedge(cx, cy, r, 60, 130), { fill: 'c3', stroke: 'sheet', sw: 2 });
      g.path(wedge(cx, cy, r, 130, 180), { fill: 'mod', stroke: 'sheet', sw: 2 });
      g.text(640, 180, '50° + 60° + ? = 180°', { size: 24, math: true, bold: true });
    }],
    ['Үшінші бұрыш: 180° − 50° − 60° = **70°**.', () => {
      g.text(331, 172, '70°', { size: 22, bold: true, color: 'c3', math: true });
      g.text(640, 395, '180 − 50 − 60 = 70°', { size: 26, math: true, bold: true, color: 'ok' });
    }],
    ['Теңбүйірлі үшбұрышта табан бұрыштары тең: төбесі 40° болса, (180° − 40°) ÷ 2 = 70°. Қателеспе: қосынды 360° емес, 180°.', () => {
      k.tag(300, 420, 'үшбұрыш: 180°', { size: 22, fill: 'oksoft', stroke: 'ok', math: true });
    }]
  ];
});

S('geometry-04', (g, k) => {
  const A = [110, 330], B = [450, 350], C = [400, 120], D = [170, 150];
  return [
    ['Дөңес төртбұрыштың ішкі бұрыштарының қосындысы 360°.', () => {
      g.poly([A, B, C, D], { fill: 'modsoft', stroke: 'ink', sw: 3.5 });
    }],
    ['Неге? Диагональ төртбұрышты екі үшбұрышқа бөледі: 180° + 180° = 360°.', () => {
      g.line(...A, ...C, { stroke: 'red', sw: 3, dash: '8 6', draw: true });
      g.text(210, 260, '180°', { size: 24, bold: true, color: 'red' });
      g.text(360, 260, '180°', { size: 24, bold: true, color: 'red' });
    }],
    ['Үш бұрыш: 80°, 90°, 100°. Төртіншісі: 360° − 270° = **90°**.', () => {
      g.text(620, 140, '80° + 90° + 100° = 270°', { size: 24, math: true, bold: true });
      g.text(620, 190, '360° − 270° = 90°', { size: 28, math: true, bold: true, color: 'ok' });
    }],
    ['Периметр есебі: 4 + 6 + 7 = 17 см, ал периметр 22 см. Төртінші қабырға: 22 − 17 = **5 см**. Қателеспе: төртбұрыштың барлық бұрышы тік болуы міндетті емес.', () => {
      g.text(620, 290, '22 − (4 + 6 + 7) = 5 см', { size: 26, math: true, bold: true });
      k.tag(620, 360, 'бұрыштар әрқашан 90° емес', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-05', (g, k) => {
  return [
    ['Тіктөртбұрыштың ауданы — ішіне сиятын бірлік шаршылардың саны: S = a · b. Еден 9 м × 4 м.', () => {
      const gr = k.grid(60, 90, 9, 4, 36, { gap: 2, fill: 'modsoft' }); gr.fill(0, 36, 'mod', 900);
      k.dim(60, 242, 400, 242, '9 м', { off: 14 });
      g.text(35, 165, '4 м', { size: 22, bold: true, color: 'gold' });
    }],
    ['9 × 4 = **36 м²**. Ал периметр 2(9 + 4) = 26 м — бұл қоршаудың ұзындығы, аудан емес.', () => {
      g.text(230, 320, 'S = 9 × 4 = 36 м²', { size: 30, math: true, bold: true, color: 'modt' });
      k.tag(230, 380, '2(a + b) — периметр', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }],
    ['Шаршы: периметрі 28 см болса, қабырғасы 28 ÷ 4 = 7 см.', () => {
      const gr = k.grid(500, 90, 7, 7, 30, { gap: 2, fill: 'goldsoft' });
      k.dim(500, 312, 722, 312, '7 см', { off: 14 });
    }],
    ['Ауданы: 7^{2} = 7 × 7 = **49 см²**.', () => {
      g.text(610, 400, 'S = 7^{2} = 49 см²', { size: 30, math: true, bold: true, color: 'goldt' });
    }]
  ];
});

S('geometry-06', (g, k) => {
  let tri;
  const y0 = 120, h = 150, a = 300, off = 90, x0 = 80;
  return [
    ['Параллелограмның ауданы: табан × биіктік. Табаны 12 см, биіктігі 5 см.', () => {
      g.poly([[x0, y0 + h], [x0 + a, y0 + h], [x0 + a + off, y0], [x0 + off, y0]], { fill: 'modsoft', stroke: 'ink', sw: 3 });
      g.line(x0 + off, y0, x0 + off, y0 + h, { stroke: 'red', sw: 2.5, dash: '7 6', draw: true });
      g.text(x0 + off + 22, y0 + h / 2, 'h = 5', { size: 20, bold: true, color: 'red', anchor: 'start' });
      g.text(x0 + a / 2, y0 + h + 26, 'a = 12', { size: 20, bold: true, color: 'modt' });
    }],
    ['Сол жақтағы үшбұрышты кесіп, оң жаққа жылжытамыз — тіктөртбұрыш шығады!', () => {
      tri = g.poly([[x0, y0 + h], [x0 + off, y0 + h], [x0 + off, y0]], { fill: 'gold', stroke: 'ink', sw: 2.5 });
      tri.move(a, 0, 1200);
    }],
    ['Тіктөртбұрыштың ауданы: 12 × 5 = **60 см²**. Параллелограмның ауданы да сондай.', () => {
      g.text(x0 + a / 2 + off, 340, 'S = a · h = 12 × 5 = 60 см²', { size: 26, math: true, bold: true, color: 'modt' });
    }],
    ['Ромб ауданы: диагональдардың көбейтіндісінің жартысы. 10 × 8 ÷ 2 = **40 см²** — ромб тіктөртбұрыштың тура жартысы.', () => {
      const cx = 640, cy = 190, d1 = 150, d2 = 120;
      g.rect(cx - d1 / 2, cy - d2 / 2, d1, d2, { rx: 0, fill: 'cell', stroke: 'line', sw: 2, dash: '6 6' });
      g.poly([[cx - d1 / 2, cy], [cx, cy - d2 / 2], [cx + d1 / 2, cy], [cx, cy + d2 / 2]], { fill: 'c3soft', stroke: 'c3', sw: 3 });
      g.par(() => { g.line(cx - d1 / 2, cy, cx + d1 / 2, cy, { stroke: 'c3', sw: 2, dash: '5 5' }); g.line(cx, cy - d2 / 2, cx, cy + d2 / 2, { stroke: 'c3', sw: 2, dash: '5 5' }); });
      g.text(cx, cy + 90, '10 × 8 ÷ 2 = 40', { size: 24, math: true, bold: true, color: 'c3' });
      k.tag(cx, 400, 'd₁ + d₂ емес!', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('geometry-07', (g, k) => {
  let copy;
  const y0 = 110, h = 140, b1 = 6 * 30, b2 = 10 * 30, x0 = 70, sh = 60;
  const T = [[x0, y0 + h], [x0 + b2, y0 + h], [x0 + sh + b1, y0], [x0 + sh, y0]];
  return [
    ['Трапецияның екі табаны параллель. Табандары 6 және 10 см, биіктігі 4 см.', () => {
      g.poly(T, { fill: 'modsoft', stroke: 'ink', sw: 3 });
      g.text(x0 + sh + b1 / 2, y0 - 20, '6', { size: 22, bold: true, color: 'modt' });
      g.text(x0 + b2 / 2, y0 + h + 26, '10', { size: 22, bold: true, color: 'modt' });
      g.line(x0 + sh, y0, x0 + sh, y0 + h, { stroke: 'red', sw: 2.5, dash: '7 6', draw: true });
      g.text(x0 + sh - 26, y0 + h / 2, 'h', { size: 22, bold: true, color: 'red', math: true, italic: true });
    }],
    ['Дәл сондай трапецияны төңкеріп, жанына қоямыз. Екеуі бірге параллелограмм құрайды.', () => {
      const R = T.map(([x, y]) => [x0 + b2 + x0 + sh + b1 - x, y0 + h + y0 - y]);
      copy = g.poly(R, { fill: 'goldsoft', stroke: 'gold', sw: 3, hide: true });
      copy.to({ ty: 40, op: 0 }, 1); copy.to({ ty: 0, op: 1 }, 900);
    }],
    ['Параллелограмның табаны 6 + 10 = 16, ауданы 16 × 4 = 64. Бір трапеция — оның жартысы.', () => {
      k.dim(x0, y0 + h + 40, x0 + b2 + b1, y0 + h + 40, '6 + 10 = 16', { off: 10, size: 22 });
    }],
    ['S = (6 + 10) × 4 ÷ 2 = **32 см²**. Кері есеп: 45 = (6 + 9) · h ÷ 2 → h = 6 см.', () => {
      g.text(400, 380, 'S = (a + b) · h ÷ 2 = 16 × 4 ÷ 2 = 32 см²', { size: 26, math: true, bold: true, color: 'modt' });
      k.tag(400, 428, 'табандардың айырмасы емес, қосындысы', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-08', (g, k) => {
  const A = [110, 330], B = [410, 330], C = [230, 110];
  return [
    ['Периметр — фигураны айнала жүргендегі жолдың ұзындығы, яғни барлық қабырғалардың қосындысы.', () => {
      g.poly([A, B, C], { fill: 'modsoft', stroke: 'line', sw: 3 });
      g.text(260, 360, '9 см', { size: 20, bold: true }); g.text(345, 210, '7 см', { size: 20, bold: true }); g.text(135, 210, '5 см', { size: 20, bold: true });
    }],
    ['Қабырғаларды бір-бірлеп жүріп өтеміз: 5 + 7 + 9 = **21 см**.', () => {
      g.path(`M${A} L${C} L${B} Z`, { stroke: 'red', sw: 5, draw: true, d: 1800 });
      g.text(260, 60, 'P = 5 + 7 + 9 = 21 см', { size: 28, math: true, bold: true, color: 'red' });
    }],
    ['Бақ 12 м × 8 м. Қоршау ұзындығы: 2 × (12 + 8) = **40 м**.', () => {
      g.rect(500, 140, 240, 160, { rx: 0, fill: 'oksoft', stroke: 'ok', sw: 3 });
      g.text(620, 320, '12 м', { size: 20, bold: true }); g.text(770, 220, '8 м', { size: 20, bold: true });
      g.path('M500 140 L740 140 L740 300 L500 300 Z', { stroke: 'gold', sw: 6, draw: true, d: 1600 });
      g.text(620, 380, '2(12 + 8) = 40 м', { size: 28, math: true, bold: true, color: 'goldt' });
    }],
    ['Периметр ұзындық бірлігімен (см, м) өлшенеді, шаршы метрмен емес.', () => {
      k.tag(400, 425, 'периметр — м,  аудан — м²', { size: 22, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-09', (g, k) => {
  return [
    ['Құрама фигураның ауданы: бүтін фигурадан кесілген бөлікті аламыз. 10 × 8 м тіктөртбұрыш.', () => {
      const gr = k.grid(60, 70, 10, 8, 28, { gap: 2, fill: 'modsoft' }); gr.fill(0, 80, 'mod', 800);
      g.text(210, 330, '10 × 8 = 80 м²', { size: 24, math: true, bold: true });
    }],
    ['Бұрышынан 3 × 2 м бөлік кесілді — 6 м².', () => {
      g.rect(60 + 7 * 30, 70, 3 * 30 - 2, 2 * 30 - 2, { rx: 0, fill: 'rsoft', stroke: 'red', sw: 3 });
      g.text(60 + 8.5 * 30, 100, '−6', { size: 22, bold: true, color: 'red' });
    }],
    ['Қалған аудан: 80 − 6 = **74 м²**.', () => { g.text(210, 380, '80 − 6 = 74 м²', { size: 30, math: true, bold: true, color: 'ok' }); }],
    ['Үшбұрыш ауданы — тіктөртбұрыштың жартысы: S = a · h ÷ 2 = 14 × 6 ÷ 2 = **42 см²**.', () => {
      g.rect(440, 120, 300, 130, { rx: 0, fill: 'cell', stroke: 'line', sw: 2, dash: '6 6' });
      g.poly([[440, 250], [740, 250], [560, 120]], { fill: 'goldsoft', stroke: 'gold', sw: 3 });
      g.line(560, 120, 560, 250, { stroke: 'red', sw: 2, dash: '6 5', draw: true });
      g.text(590, 280, '14', { size: 20, bold: true }); g.text(578, 190, '6', { size: 20, bold: true, color: 'red' });
      g.text(590, 340, '14 × 6 ÷ 2 = 42 см²', { size: 26, math: true, bold: true, color: 'goldt' });
      k.tag(590, 400, 'үшбұрыш: ÷ 2 ұмытпа', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-10', (g, k) => {
  let wheel;
  const r = 50, y = 300, x0 = 110, C = 2 * Math.PI * r;
  return [
    ['Шеңбер ұзындығы — шеңбердің бойымен жүрген жол. Дөңгелекті түзу бойымен бір рет домалатайық.', () => {
      g.line(60, y + r, 760, y + r, { stroke: 'muted', sw: 3, draw: true });
      wheel = g.group();
      g.into(wheel, () => { g.circle(x0, y, r, { fill: 'modsoft', cls: 's-ink', now: true }); g.line(x0, y - r, x0, y + r, { stroke: 'gold', sw: 4, now: true }); g.circle(x0, y + r, 7, { fill: 'red', now: true }); });
      wheel.origin(x0, y); wheel.fade(300);
      k.dim(x0 - r, y - r - 12, x0 + r, y - r - 12, 'd', { off: -14, size: 22 });
    }],
    ['Бір толық айналымда дөңгелек шеңбер ұзындығына тең жол жүреді.', () => {
      g.par(() => { wheel.to({ tx: C, rot: 360 }, 2600, 'lin'); g.line(x0, y + r, x0 + C, y + r, { stroke: 'red', sw: 6, draw: true, d: 2600 }); });
    }],
    ['Бұл жол диаметрден шамамен 3,14 есе ұзын: C = πd, π ≈ 3,14.', () => {
      g.par(() => { for (let i = 0; i < 3; i++) g.rect(x0 + i * 2 * r, y + r + 14, 2 * r - 4, 12, { rx: 3, fill: 'gold' }); g.rect(x0 + 6 * r, y + r + 14, .14 * 2 * r, 12, { rx: 2, fill: 'gold' }); });
      g.text(x0 + C / 2, y + r + 48, '≈ 3,14 · d', { size: 22, bold: true, color: 'goldt' });
    }],
    ['d = 10 см болса: C = 3,14 × 10 = **31,4 см**. r = 7, π = 22/7 болса: C = 2 × 22/7 × 7 = 44 см.', () => {
      g.text(400, 70, 'C = πd = 2πr', { size: 32, math: true, bold: true, color: 'modt' });
      g.text(400, 125, '3,14 × 10 = 31,4 см', { size: 28, math: true, bold: true });
      k.tag(400, 180, 'πr² — бұл аудан, ұзындық емес', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('geometry-11', (g, k) => {
  const cx = 230, cy = 240, R = 150;
  return [
    ['Дөңгелек ауданы S = πr^{2}. Мұнда r^{2} — қабырғасы радиусқа тең шаршы.', () => {
      g.circle(cx, cy, R, { fill: 'modsoft', cls: 's-ink' });
      g.line(cx, cy, cx + R, cy, { stroke: 'red', sw: 3, draw: true }); g.text(cx + R / 2, cy + 22, 'r = 5', { size: 20, bold: true, color: 'red' });
    }],
    ['r^{2} шаршысы дөңгелектің ішіне шамамен 3,14 рет сияды.', () => {
      g.rect(cx, cy - R, R, R, { rx: 0, fill: 'gold', op: .55, stroke: 'gold', sw: 2.5 });
      g.text(cx + R / 2, cy - R / 2, 'r²', { size: 28, bold: true, math: true });
      g.text(600, 120, 'S ≈ 3,14 · r²', { size: 30, math: true, bold: true, color: 'goldt' });
    }],
    ['r = 5: r^{2} = 25, S = 3,14 × 25 = **78,5 см²**.', () => {
      g.text(600, 190, '3,14 × 5² = 3,14 × 25', { size: 26, math: true, bold: true });
      g.text(600, 235, '= 78,5 см²', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['Диаметр берілсе, алдымен радиусты табамыз: d = 8 → r = 4, S = 3 × 4^{2} = 48 см². Қателеспе: диаметрді радиустың орнына қоюға болмайды.', () => {
      g.text(600, 320, 'd = 8 → r = 4', { size: 26, math: true, bold: true });
      g.text(600, 365, 'S = 3 × 16 = 48 см²', { size: 26, math: true, bold: true });
      k.tag(600, 420, 'r орнына d қойма!', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-12', (g, k) => {
  const u = 18, A = [200, 300], B = [200 + 8 * u, 300], C = [200, 300 - 6 * u];
  return [
    ['Тікбұрышты үшбұрыштың катеттері 6 және 8 см. Гипотенузаны табайық.', () => {
      g.poly([A, B, C], { fill: 'sheet', stroke: 'ink', sw: 3.5 });
      g.rect(A[0], A[1] - 16, 16, 16, { rx: 0, fill: 'none', stroke: 'ink', sw: 2 });
      g.text(A[0] + 14, (A[1] + C[1]) / 2, '6', { size: 20, bold: true, anchor: 'start' }); g.text((A[0] + B[0]) / 2, A[1] - 16, '8', { size: 20, bold: true });
    }],
    ['Әр катетке шаршы саламыз: 6^{2} = 36 және 8^{2} = 64.', () => {
      g.rect(A[0] - 6 * u, C[1], 6 * u, 6 * u, { rx: 0, fill: 'modsoft', stroke: 'mod', sw: 2.5 }); g.text(A[0] - 3 * u, (A[1] + C[1]) / 2, '36', { size: 26, bold: true, color: 'modt' });
      g.rect(A[0], A[1], 8 * u, 8 * u, { rx: 0, fill: 'goldsoft', stroke: 'gold', sw: 2.5 }); g.text(A[0] + 4 * u, A[1] + 4 * u, '64', { size: 26, bold: true, color: 'goldt' });
    }],
    ['Гипотенузаға салынған шаршының ауданы: 36 + 64 = 100. Пифагор теоремасы: a^{2} + b^{2} = c^{2}.', () => {
      const dx = B[0] - C[0], dy = B[1] - C[1];
      const Q = [[C[0], C[1]], [B[0], B[1]], [B[0] + dy, B[1] - dx], [C[0] + dy, C[1] - dx]];
      g.poly(Q, { fill: 'c3soft', stroke: 'c3', sw: 2.5 });
      g.text(Q.reduce((a, p) => a + p[0], 0) / 4, Q.reduce((a, p) => a + p[1], 0) / 4, '100', { size: 26, bold: true, color: 'c3' });
    }],
    ['c^{2} = 100, c = **10 см**. Кері есеп: c = 13, a = 5 болса, b^{2} = 169 − 25 = 144, b = 12. Теорема тек тікбұрышты үшбұрышқа орындалады.', () => {
      g.text(620, 250, '6² + 8² = 100', { size: 26, math: true, bold: true });
      g.text(620, 300, 'c = √100 = 10', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(620, 380, 'тек тікбұрышты үшбұрыш', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-13', (g, k) => {
  return [
    ['Ұқсас фигуралардың пішіні бірдей, өлшемі әртүрлі. Сәйкес қабырғалар 4 және 12 см.', () => {
      g.poly([[70, 220], [150, 220], [70, 160]], { fill: 'modsoft', stroke: 'ink', sw: 3 });
      g.text(110, 245, '4', { size: 20, bold: true });
      g.poly([[220, 220], [460, 220], [220, 40]], { fill: 'goldsoft', stroke: 'gold', sw: 3 });
      g.text(340, 245, '12', { size: 20, bold: true });
    }],
    ['Ұқсастық коэффициенті: k = 12 ÷ 4 = **3**. Барлық ұзындықтар 3 есе үлкен.', () => {
      g.text(620, 130, 'k = 12 ÷ 4 = 3', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['Ал аудан k^{2} есе өзгереді. 2 есе үлкейтсек, бір шаршының орнына 2 × 2 = 4 шаршы сияды.', () => {
      g.rect(80, 300, 50, 50, { rx: 0, fill: 'mod' }); g.text(105, 370, '15 см²', { size: 16, bold: true });
      g.stagger([0, 1, 2, 3], 200, i => g.rect(200 + (i % 2) * 52, 248 + Math.floor(i / 2) * 52, 50, 50, { rx: 0, fill: i ? 'gold' : 'mod' }));
      g.text(252, 370, '× 2', { size: 18, bold: true, color: 'goldt' });
    }],
    ['Жаңа аудан: 15 × 2^{2} = 15 × 4 = **60 см²**. Қателеспе: қабырға 3 есе өссе, аудан 3 есе емес, 9 есе өседі.', () => {
      g.text(560, 300, 'S₂ = 15 × 2² = 60 см²', { size: 26, math: true, bold: true, color: 'ok' });
      k.tag(560, 370, 'k = 3  →  аудан × 9', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('geometry-14', (g, k) => {
  let P_;
  return [
    ['Координаталық жазықтықта нүкте (x; y) жұбымен беріледі: алдымен x (көлденең), сосын y (тік).', () => {
      P_ = k.plane(260, 40, 390, -5, 5);
    }],
    ['A(−2; 3) және B(4; 3). Екеуінің y-і бірдей, сондықтан олар бір көлденең сызықта жатыр.', () => {
      P_.guide(-2, 3, 'muted'); P_.pt(-2, 3, { label: 'A(−2; 3)', fill: 'mod', dy: 22, dx: -100 });
      P_.pt(4, 3, { label: 'B(4; 3)', fill: 'mod', dy: 24, dx: -60 });
    }],
    ['Арақашықтық — x-тердің айырмасы: 4 − (−2) = **6** бірлік.', () => {
      P_.seg(-2, 3, 4, 3, { stroke: 'gold', sw: 5 });
      g.text(P_.X(1), P_.Y(3) + 24, '6', { size: 24, bold: true, color: 'goldt' });
    }],
    ['C(2; −1) нүктесін 5 бірлік жоғары жылжытамыз: x өзгермейді, y = −1 + 5 = 4.', () => {
      const c = P_.pt(2, -1, { label: 'C(2; −1)', fill: 'red', dy: -28 });
      g.arrow(P_.X(2), P_.Y(-1) - 10, P_.X(2), P_.Y(4) + 10, { stroke: 'red', sw: 3 });
      P_.pt(2, 4, { label: '(2; 4)', fill: 'ok', dy: 18, dx: -66 });
      g.text(130, 250, 'y = −1 + 5 = 4', { size: 24, math: true, bold: true });
      k.tag(130, 330, '(x; y) — x бірінші', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('geometry-15', (g, k) => {
  return [
    ['Кубтың көлемі V = a^{3}: қабырғасы 4 см кубқа 4 × 4 × 4 бірлік текше сияды.', () => {
      k.box(80, 340, 160, 160, 160, { front: 'modsoft' });
      g.par(() => { for (let i = 1; i < 4; i++) { g.line(80 + i * 40, 340, 80 + i * 40, 180, { stroke: 'mod', sw: 1.5 }); g.line(80, 340 - i * 40, 240, 340 - i * 40, { stroke: 'mod', sw: 1.5 }); } });
      g.text(160, 380, 'a = 4 см', { size: 20, bold: true });
    }],
    ['Бір қабатта 4 × 4 = 16 текше, қабаттар саны 4: 16 × 4 = **64 см³**.', () => {
      g.text(210, 60, 'V = 4³ = 64 см³', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Параллелепипед: V = a · b · c = 3 × 5 × 8 = **120 см³**.', () => {
      k.box(440, 340, 200, 75, 120, { front: 'goldsoft' });
      g.text(540, 380, '8', { size: 20, bold: true }); g.text(670, 295, '3', { size: 20, bold: true }); g.text(420, 280, '5', { size: 20, bold: true });
      g.text(580, 100, 'V = 3 × 5 × 8 = 120 см³', { size: 26, math: true, bold: true, color: 'goldt' });
    }],
    ['Қателеспе: 6a^{2} — кубтың бет ауданы (см²), ал көлем a^{3} (см³).', () => {
      k.tag(400, 425, 'көлем a³,   бет ауданы 6a²', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('geometry-16', (g, k) => {
  let w;
  return [
    ['Призма көлемі = табан ауданы × биіктік. Табан ауданы 18 см², биіктігі 7 см: 18 × 7 = **126 см³**.', () => {
      k.box(80, 360, 170, 90, 200, { front: 'modsoft' });
      g.text(165, 400, 'Sₜ = 18', { size: 20, bold: true, math: true });
      g.text(170, 60, 'V = 18 × 7 = 126', { size: 26, math: true, bold: true, color: 'modt' });
    }],
    ['Пирамиданың табаны мен биіктігі призмамен бірдей болса, оның көлемі призманың үштен бірі.', () => {
      g.poly([[440, 360], [610, 360], [660, 300], [550, 140]], { fill: 'goldsoft', stroke: 'gold', sw: 3 });
      g.line(440, 360, 550, 140, { stroke: 'gold', sw: 3 }); g.line(610, 360, 550, 140, { stroke: 'gold', sw: 3 });
      g.line(490, 300, 660, 300, { stroke: 'muted', sw: 1.5, dash: '5 6' }); g.line(440, 360, 490, 300, { stroke: 'muted', sw: 1.5, dash: '5 6' });
    }],
    ['Пирамида толы суды призмаға үш рет құйсақ, призма толады.', () => {
      w = g.rect(82, 358, 166, 0.01, { rx: 0, fill: 'c3', op: .6, now: true });
      [1, 2, 3].forEach(i => { w.to({ y: 358 - i * 66, height: i * 66 }, 600); g.text(270, 358 - i * 66 + 33, i + '', { size: 20, bold: true, color: 'c3' }); });
    }],
    ['Пирамида: V = 36 × 9 ÷ 3 = **108 см³**. Қателеспе: призма мен пирамиданың көлемдері тең емес — 3 есе ерекшеленеді.', () => {
      g.text(560, 410, 'V = Sₜ · h ÷ 3 = 108', { size: 24, math: true, bold: true, color: 'goldt' });
    }]
  ];
});

S('geometry-17', (g, k) => {
  return [
    ['Цилиндр көлемі = табан ауданы × биіктік = πr^{2}h. r = 3, h = 5, π = 3: V = 3 × 9 × 5 = **135 см³**.', () => {
      g.path('M60 140 L60 320 A80 24 0 0 0 220 320 L220 140', { fill: 'modsoft', stroke: 'ink', sw: 3, fade: true });
      g.path('M60 140 A80 24 0 0 1 220 140 A80 24 0 0 1 60 140 Z', { fill: 'inksoft', stroke: 'ink', sw: 3, fade: true });
      g.text(140, 380, 'V = πr²h = 135', { size: 22, math: true, bold: true, color: 'modt' });
    }],
    ['Конус — табаны мен биіктігі бірдей цилиндрдің үштен бірі: V = πr^{2}h ÷ 3.', () => {
      g.path('M300 320 A80 24 0 0 0 460 320 L380 140 Z', { fill: 'goldsoft', stroke: 'gold', sw: 3, fade: true });
      g.path('M300 320 A80 24 0 0 1 460 320', { stroke: 'gold', sw: 2, dash: '5 5' });
      g.text(380, 380, 'V = πr²h ÷ 3 = 45', { size: 22, math: true, bold: true, color: 'goldt' });
    }],
    ['Шар көлемі: V = 4πr^{3} ÷ 3. r = 3: 4 × 3 × 27 ÷ 3 = **108 см³**.', () => {
      g.circle(630, 230, 95, { fill: 'c3soft', cls: 's-c3' });
      g.path('M535 230 A95 28 0 0 0 725 230', { stroke: 'c3', sw: 2 });
      g.line(630, 230, 725, 230, { stroke: 'red', sw: 2.5, draw: true }); g.text(678, 215, 'r', { size: 20, bold: true, color: 'red', math: true });
      g.text(630, 380, 'V = 4πr³ ÷ 3 = 108', { size: 22, math: true, bold: true, color: 'c3' });
    }],
    ['Қателеспе: конус көлемі цилиндрмен тең емес — 3 есе кіші.', () => {
      k.tag(400, 428, 'конус = цилиндр ÷ 3', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('geometry-18', (g, k) => {
  const s = 56, x0 = 120, y0 = 70;
  const net = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
  return [
    ['Бет ауданы — дененің барлық сыртқы беттерінің аудандарының қосындысы. Кубты жазық етіп ашайық.', () => {
      k.box(560, 260, 120, 120, 120, { front: 'modsoft' });
    }],
    ['Кубтың 6 беті бар — бұл оның жазбасы. Әр бет — қабырғасы 5 см шаршы.', () => {
      g.stagger(net, 180, ([c, r]) => { g.rect(x0 + c * s, y0 + r * s, s, s, { rx: 0, fill: 'modsoft', stroke: 'ink', sw: 2.5 }); g.text(x0 + c * s + s / 2, y0 + r * s + s / 2, '25', { size: 18, bold: true }); });
    }],
    ['Бір беттің ауданы 5 × 5 = 25 см². Толық бет ауданы: 6 × 25 = **150 см²**.', () => {
      g.text(250, 290, 'S = 6 × 25 = 150 см²', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Қорап 2 × 3 × 4 см: әр беттің жұбы бар. S = 2(2·3 + 3·4 + 2·4) = 2(6 + 12 + 8) = **52 см²**. Бет ауданы см²-пен, көлем см³-пен өлшенеді.', () => {
      g.text(400, 370, 'S = 2(6 + 12 + 8) = 52 см²', { size: 28, math: true, bold: true });
      k.tag(400, 425, 'бет ауданы — см²,  көлем — см³', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});
})();
