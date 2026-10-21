'use strict';
/* «Комбинаторика және санау» бөлімінің анимациялары */
(() => {
const S = Anim.scene;
const slot = (g, k, x, y, label, o = {}) => { g.rect(x - 40, y - 40, 80, 80, { rx: 12, fill: o.fill || 'sheet', stroke: o.stroke || 'ink', sw: 3 }); if (label != null) g.text(x, y + 1, label, { size: o.size || 34, bold: true, math: true, color: o.color || 'text' }); };

S('combinatorics-01', (g, k) => {
  return [
    ['Қосу ережесі: бір ғана нәрсе таңдасақ және нұсқалар екі бөлек топта болса, нұсқалар саны қосылады.', () => {
      g.text(220, 60, 'Шай: 4 түрі', { size: 24, bold: true, color: 'gold' });
      g.stagger([0, 1, 2, 3], 120, i => g.path(`M${110 + i * 75} 110 L${120 + i * 75} 170 L${160 + i * 75} 170 L${170 + i * 75} 110 Z`, { fill: 'goldsoft', stroke: 'gold', sw: 3, fade: true }));
      g.text(580, 60, 'Шырын: 3 түрі', { size: 24, bold: true, color: 'c4' });
      g.stagger([0, 1, 2], 120, i => g.rect(500 + i * 70, 100, 44, 74, { rx: 6, fill: 'c4soft', stroke: 'c4', sw: 3 }));
    }],
    ['Бір ғана сусын аламыз: не шай, не шырын. Барлық нұсқа: 4 + 3 = **7**.', () => {
      g.text(400, 260, '4 + 3 = 7', { size: 40, math: true, bold: true, color: 'modt' });
    }],
    ['Сөрелер: A-да 8, B-да басқа 5 кітап. Бір кітап таңдау тәсілі: 8 + 5 = **13**.', () => {
      g.text(400, 340, '8 + 5 = 13', { size: 32, math: true, bold: true });
    }],
    ['Қателеспе: «немесе» — қосу, «және» (бірінен кейін бірі) — көбейту. Бір таңдауда көбейтпейміз.', () => {
      k.tag(250, 410, '«немесе» → +', { size: 22, fill: 'oksoft', stroke: 'ok', math: true });
      k.tag(550, 410, '«және» → ×', { size: 22, fill: 'inksoft', stroke: 'ink', math: true });
    }]
  ];
});

S('combinatorics-02', (g, k) => {
  const shirts = ['mod', 'gold', 'c3'], pants = ['ink', 'c4', 'muted', 'ok'];
  return [
    ['Көбейту ережесі: таңдаулар бірінен кейін бірі жасалса, нұсқалар көбейтіледі. 3 жейде және 4 шалбар.', () => {
      g.stagger(shirts, 120, (c, i) => g.path(`M${60} ${150 + i * 80} l20 -18 l30 0 l20 18 l-10 12 l-8 -6 l0 34 l-34 0 l0 -34 l-8 6 z`, { fill: c, stroke: 'ink', sw: 2, fade: true }));
      g.stagger(pants, 120, (c, i) => g.path(`M${190 + i * 120} 70 l40 0 l4 60 l-14 0 l-6 -40 l-6 40 l-14 0 z`, { fill: c, stroke: 'ink', sw: 2, fade: true }));
    }],
    ['Әр жейдеге 4 шалбардың кез келгені сәйкес келеді — кестенің әр торы бір жұп.', () => {
      g.stagger(Array.from({ length: 12 }), 80, (_, n) => { const r = Math.floor(n / 4), c = n % 4; g.rect(170 + c * 120, 130 + r * 80, 100, 64, { rx: 8, fill: 'cell', stroke: 'line', sw: 2 }); g.text(220 + c * 120, 162 + r * 80, String(n + 1), { size: 22, bold: true }); });
    }],
    ['3 жол × 4 баған = **12** жұп.', () => { g.text(650, 400, '3 × 4 = 12', { size: 32, math: true, bold: true, color: 'modt' }); }],
    ['Үш кезең: 2 сорпа × 3 негізгі ас × 2 сусын = **12**. Қателеспе: 3 + 4 = 7 емес — бұл «және» таңдауы.', () => {
      k.tag(330, 410, '2 × 3 × 2 = 12', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('combinatorics-03', (g, k) => {
  return [
    ['Нұсқаларды ағашпен санау ыңғайлы. 1, 2, 3 цифрларынан қайталамай екі таңбалы сан құрайық.', () => {
      g.circle(80, 225, 10, { fill: 'text' });
      g.stagger(['1', '2', '3'], 200, (d, i) => { g.line(90, 225, 220, 90 + i * 135, { stroke: 'muted', sw: 2.5, draw: true, d: 300 }); slot(g, k, 250, 90 + i * 135, d, { fill: 'inksoft' }); });
    }],
    ['Бірінші цифрға 3 таңдау. Әрқайсысынан кейін екінші цифрға қалған 2 цифр.', () => {
      const ends = [['1', ['2', '3']], ['2', ['1', '3']], ['3', ['1', '2']]];
      ends.forEach(([a, bs], i) => bs.forEach((b, j) => { const y = 55 + i * 135 + j * 70; g.line(290, 90 + i * 135, 400, y, { stroke: 'muted', sw: 2, draw: true, d: 250 }); g.rect(405, y - 26, 52, 52, { rx: 8, fill: 'goldsoft', stroke: 'gold', sw: 2.5 }); g.text(431, y + 1, b, { size: 24, bold: true, math: true }); g.text(520, y, a + b, { size: 26, bold: true, math: true, color: 'modt' }); }));
    }],
    ['Барлығы: 3 × 2 = **6** сан: 12, 13, 21, 23, 31, 32.', () => { g.text(670, 225, '3 × 2 = 6', { size: 32, math: true, bold: true, color: 'ok' }); }],
    ['Рет маңызды: 12 мен 21 — әртүрлі сандар. Екі тиын лақтыру да осылай: ЕЕ, ЕС, СЕ, СС — 4 нәтиже.', () => {
      k.tag(670, 320, '12 ≠ 21', { size: 24, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('combinatorics-04', (g, k) => {
  return [
    ['Орналастыруда рет маңызды. 5 адамнан төраға мен орынбасарды таңдаймыз.', () => {
      g.stagger(['A', 'B', 'C', 'D', 'E'], 90, (n, i) => { k.icon('person', 140 + i * 70, 90, { scale: .7 }); g.text(140 + i * 70, 135, n, { size: 18, bold: true }); });
      g.text(260, 210, 'төраға', { size: 20, bold: true, color: 'muted' }); g.text(540, 210, 'орынбасар', { size: 20, bold: true, color: 'muted' });
      slot(g, k, 260, 270, null); slot(g, k, 540, 270, null);
    }],
    ['Төрағаға 5 адамның кез келгені — 5 таңдау. Орынбасарға қалған 4 адам — 4 таңдау.', () => {
      g.text(260, 272, '5', { size: 40, bold: true, math: true, color: 'modt' });
      g.text(400, 272, '×', { size: 34, bold: true });
      g.text(540, 272, '4', { size: 40, bold: true, math: true, color: 'gold' });
    }],
    ['5 × 4 = **20** тәсіл. A — төраға, B — орынбасар және B — төраға, A — орынбасар — әртүрлі нәтиже.', () => {
      g.text(400, 370, '5 × 4 = 20', { size: 32, math: true, bold: true, color: 'ok' });
    }],
    ['4 кітапты сөреге орналастыру: 4 × 3 × 2 × 1 = **24** рет.', () => {
      k.tag(400, 425, '4 × 3 × 2 × 1 = 24', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('combinatorics-05', (g, k) => {
  const n = 5, cx = 220, cy = 230, R = 150, P = Array.from({ length: n }, (_, i) => [cx + R * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n), cy + R * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / n)]);
  return [
    ['Комбинацияда рет маңызды емес: {A, B} тобы мен {B, A} тобы — бір топ. 5 оқушыдан 2 адамдық топ.', () => {
      g.stagger(P, 100, (p, i) => { g.circle(p[0], p[1], 22, { fill: 'mod' }); g.text(p[0], p[1] + 1, 'ABCDE'[i], { size: 20, bold: true, color: 'on' }); });
    }],
    ['Реттелген жұптар: 5 × 4 = 20. Бірақ әр топ екі рет саналған (AB және BA).', () => {
      g.text(590, 120, '5 × 4 = 20 (ретпен)', { size: 26, math: true, bold: true });
      k.tag(590, 180, 'AB = BA', { size: 24, math: true });
    }],
    ['Сондықтан 20 ÷ 2 = **10** топ — суреттегі әр сызық бір топ.', () => {
      const L = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) L.push([P[i], P[j]]);
      g.stagger(L, 120, ([a, b]) => g.line(...a, ...b, { stroke: 'gold', sw: 3, draw: true, d: 250 }));
      g.text(590, 250, '20 ÷ 2 = 10', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['6 кітаптан 2 кітап: 6 × 5 ÷ 2 = **15**.', () => {
      k.tag(590, 340, '6 × 5 ÷ 2 = 15', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('combinatorics-06', (g, k) => {
  return [
    ['Үш цифрлы код: әр орынға 0-ден 9-ға дейінгі 10 цифрдың кез келгені, қайталауға болады.', () => {
      g.rect(200, 60, 400, 150, { rx: 24, fill: 'inksoft', stroke: 'ink', sw: 3 });
      g.stagger([0, 1, 2], 150, i => slot(g, k, 290 + i * 110, 135, '?', { stroke: 'ink' }));
    }],
    ['Әр орынға 10 мүмкіндік: 10 × 10 × 10 = **1 000** код (000-ден 999-ға дейін).', () => {
      g.stagger([0, 1, 2], 150, i => g.text(290 + i * 110, 190, '10', { size: 22, bold: true, color: 'gold' }));
      g.text(400, 270, '10 × 10 × 10 = 1 000', { size: 32, math: true, bold: true, color: 'modt' });
    }],
    ['A, B, C, D әріптерінен қайталамай екі әріптік код: 4 × 3 = **12**.', () => {
      g.text(400, 340, '4 × 3 = 12', { size: 30, math: true, bold: true });
    }],
    ['Қателеспе: 10 + 10 + 10 = 30 емес — орындар бірге таңдалады, сондықтан көбейтеміз.', () => {
      k.tag(400, 410, '10 + 10 + 10 — қате', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('combinatorics-07', (g, k) => {
  return [
    ['0, 1, 2 цифрларынан қайталамай екі таңбалы сан құрайық. Маңызды: бірінші цифр 0 бола алмайды.', () => {
      slot(g, k, 300, 110, null); slot(g, k, 400, 110, null);
      g.text(300, 175, 'ондық', { size: 16, color: 'muted' }); g.text(400, 175, 'бірлік', { size: 16, color: 'muted' });
    }],
    ['Ондыққа тек 1 немесе 2 — 2 таңдау. Бірлікке қалған 2 цифр — 2 таңдау.', () => {
      g.text(300, 112, '2', { size: 40, bold: true, math: true, color: 'modt' }); g.text(400, 112, '2', { size: 40, bold: true, math: true, color: 'gold' });
      g.text(560, 112, '2 × 2 = 4', { size: 30, math: true, bold: true });
    }],
    ['Сандар: 10, 12, 20, 21 — барлығы **4**. 012 — екі таңбалы сан, оны санамаймыз.', () => {
      k.chips(400, 240, ['10', '12', '20', '21'], { w: 76 });
      k.tag(400, 340, '012 — үш таңбалы емес', { size: 20, fill: 'rsoft', stroke: 'red' });
    }],
    ['1, 2, 3, 4 цифрларынан (нөл жоқ) үш таңбалы сан: 4 × 3 × 2 = **24**.', () => {
      k.tag(400, 415, '4 × 3 × 2 = 24', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('combinatorics-08', (g, k) => {
  const L = ['A', 'B', 'C', 'D', 'E'], s = 52, x0 = 150, y0 = 110;
  let cells = [];
  return [
    ['5 таңбадан екі таңбалы код. Қайталауға рұқсат болса: әр орынға 5 таңдау.', () => {
      g.stagger(L, 60, (t, i) => { g.text(x0 + i * s + s / 2, y0 - 20, t, { size: 20, bold: true }); g.text(x0 - 22, y0 + i * s + s / 2, t, { size: 20, bold: true }); });
      g.stagger(Array.from({ length: 25 }), 30, (_, n) => { const r = Math.floor(n / 5), c = n % 5; cells.push(g.rect(x0 + c * s + 2, y0 + r * s + 2, s - 4, s - 4, { rx: 6, fill: 'modsoft', stroke: 'mod', sw: 1.5, d: 200 })); g.text(x0 + c * s + s / 2, y0 + r * s + s / 2 + 1, L[r] + L[c], { size: 16, bold: true, d: 200 }); });
    }],
    ['5 × 5 = **25** код (AA, AB, …, EE).', () => { g.text(620, 160, '5 × 5 = 25', { size: 30, math: true, bold: true, color: 'modt' }); }],
    ['Қайталамай: AA, BB, … сияқты қайталанатын кодтар алынып тасталады — диагональдағы 5 код.', () => {
      g.stagger([0, 6, 12, 18, 24], 150, i => cells[i].cls('f-rsoft s-red'));
      g.stagger([0, 1, 2, 3, 4], 150, i => k.cross(x0 + i * s + s / 2, y0 + i * s + s / 2, .9));
    }],
    ['5 × 4 = **20** код. Қайталауға рұқсат берсек, нұсқалар азаймайды, керісінше көбейеді.', () => {
      g.text(620, 240, '5 × 4 = 20', { size: 30, math: true, bold: true, color: 'ok' });
      k.tag(620, 320, 'қайталау → 25 > 20', { size: 20, fill: 'oksoft', stroke: 'ok', math: true });
    }]
  ];
});
})();
