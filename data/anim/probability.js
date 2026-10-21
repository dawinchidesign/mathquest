'use strict';
/* «Ықтималдық» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

// 0..1 ықтималдық шкаласы
const scale01 = (g, k, y, o = {}) => {
  const x0 = o.x0 ?? 100, x1 = o.x1 ?? 700, X = p => x0 + p * (x1 - x0);
  g.rect(x0, y - 10, x1 - x0, 20, { rx: 10, fill: 'cell', stroke: 'line', sw: 2, fade: true });
  g.par(() => [[0, '0'], [.5, '0,5'], [1, '1']].forEach(([p, t]) => { g.line(X(p), y + 12, X(p), y + 22, { stroke: 'muted', sw: 2, fade: true }); g.text(X(p), y + 40, t, { size: 18, bold: true, color: 'muted', fade: true }); }));
  return X;
};
const coin = (g, k, x, y, side, o = {}) => { const grp = g.group({ hide: true }); g.into(grp, () => { g.circle(x, y, o.r || 26, { fill: side === 'Е' ? 'gold' : 'c3', now: true }); g.text(x, y + 1, side, { size: o.size || 24, bold: true, color: 'on', now: true }); }); grp.origin(x, y); grp.st.op = 1; grp.apply(); grp.in(300); return grp; };
const balls = (g, x, y, cols, list, r = 15) => { const out = []; g.stagger(list, 50, (c, i) => out.push(g.circle(x + (i % cols) * (2 * r + 8), y - Math.floor(i / cols) * (2 * r + 6), r, { fill: c, d: 250 }))); return out; };

S('probability-01', (g, k) => {
  let X;
  return [
    ['Ықтималдық 0-ден 1-ге дейін болады. 0 — мүмкін емес оқиға, 1 — ақиқат (міндетті) оқиға.', () => {
      X = scale01(g, k, 120);
      g.text(X(0), 70, 'мүмкін емес', { size: 18, bold: true, color: 'red' });
      g.text(X(.5), 70, 'кездейсоқ', { size: 18, bold: true, color: 'gold' });
      g.text(X(1), 70, 'ақиқат', { size: 18, bold: true, color: 'ok' });
    }],
    ['Кәдімгі ойын сүйегі: 1-ден 6-ға дейін. «9 түседі» — мүмкін емес оқиға, P = 0.', () => {
      g.stagger([1, 2, 3, 4, 5, 6], 90, n => k.die(165 + (n - 1) * 94, 260, n, 60));
      g.circle(X(0), 120, 12, { fill: 'red' });
      g.text(X(0), 190, '«9» → 0', { size: 20, bold: true, color: 'red' });
    }],
    ['«1-ден 6-ға дейінгі сан түседі» — ақиқат оқиға, P = 6/6 = **1**.', () => {
      g.circle(X(1), 120, 12, { fill: 'ok' });
      g.text(X(1), 190, '«1–6» → 1', { size: 20, bold: true, color: 'ok' });
    }],
    ['«Жұп сан түседі» — кездейсоқ оқиға: болуы да, болмауы да мүмкін. P = 3/6 = 0,5.', () => {
      g.circle(X(.5), 120, 12, { fill: 'gold' });
      g.text(X(.5), 190, '«жұп» → 0,5', { size: 20, bold: true, color: 'goldt' });
      k.tag(400, 380, 'кездейсоқ оқиға әрқашан орындала бермейді', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('probability-02', (g, k) => {
  return [
    ['Тең ықтималды жағдайларда: P = қолайлы жағдайлар ÷ барлық жағдайлар. 10 карточканың 4-еуі ұтысты.', () => {
      g.stagger(Array.from({ length: 10 }), 90, (_, i) => k.card(130 + i * 60, 110, i < 4 ? '★' : '·', { w: 50, h: 70, size: 28, fill: i < 4 ? 'goldsoft' : 'sheet', stroke: i < 4 ? 'gold' : 'line', color: i < 4 ? 'goldt' : 'muted' }));
    }],
    ['Қолайлы — 4, барлығы — 10. P = 4/10 = **0,4**.', () => {
      g.text(400, 220, 'P = 4 / 10 = 0,4', { size: 34, math: true, bold: true, color: 'modt' });
    }],
    ['8 билеттің 2-еуі ұтады: P = 2/8 = 0,25 = **25%**.', () => {
      g.stagger(Array.from({ length: 8 }), 70, (_, i) => g.rect(170 + i * 60, 280, 50, 34, { rx: 5, fill: i < 2 ? 'ok' : 'cell', stroke: 'line', sw: 1.5 }));
      g.text(400, 355, '2 / 8 = 0,25 = 25%', { size: 28, math: true, bold: true });
    }],
    ['Қателеспе: ықтималдық ешқашан 1-ден үлкен болмайды — қолайлы жағдайлар барлығынан көп бола алмайды.', () => {
      k.tag(400, 420, '0 ≤ P ≤ 1', { size: 24, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('probability-03', (g, k) => {
  const cards = [];
  return [
    ['Қолайлы жағдайлар — есептің шартын орындайтын нәтижелер. 1-ден 12-ге дейінгі карточкалар.', () => {
      g.stagger(Array.from({ length: 12 }), 70, (_, i) => cards.push(k.card(95 + i * 56, 110, i + 1, { w: 46, h: 64, size: 22 })));
    }],
    ['Шарт: 4-ке бөлінеді. Ондай карточкалар: 4, 8, 12 — **3** қолайлы жағдай.', () => {
      g.stagger([3, 7, 11], 250, i => { g.rect(95 + i * 56 - 25, 76, 50, 68, { rx: 9, fill: 'none', stroke: 'ok', sw: 3.5 }); cards[i].pulse(400, .15); });
      g.text(400, 200, 'қолайлы: 3,  барлығы: 12', { size: 26, bold: true });
    }],
    ['Сүйекте 4-тен үлкен сан: 5 және 6 — **2** қолайлы жағдай.', () => {
      g.stagger([1, 2, 3, 4, 5, 6], 80, n => { const d = k.die(165 + (n - 1) * 94, 300, n, 60, n > 4 ? { fill: 'oksoft' } : {}); });
      g.text(400, 380, '5, 6 → 2 жағдай', { size: 26, bold: true, color: 'ok' });
    }],
    ['Қателеспе: қолайлы жағдайлар барлық жағдайлардың бөлігі, сондықтан олардан көп бола алмайды.', () => {
      k.tag(400, 428, 'қолайлы ≤ барлығы', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('probability-04', (g, k) => {
  return [
    ['Барлық нәтижелерді толық әрі қайталамай санаймыз. Тиынды екі рет лақтырайық — ағаш сызбасы.', () => {
      coin(g, k, 120, 200, '?');
    }],
    ['Бірінші лақтыру: Е (елтаңба) немесе С (сан).', () => {
      g.par(() => { g.line(148, 192, 268, 120, { stroke: 'muted', sw: 2.5, draw: true }); g.line(148, 208, 268, 280, { stroke: 'muted', sw: 2.5, draw: true }); });
      coin(g, k, 295, 115, 'Е'); coin(g, k, 295, 285, 'С');
    }],
    ['Әрқайсысынан екінші лақтыру тағы екіге тармақталады: ЕЕ, ЕС, СЕ, СС — барлығы **4** нәтиже.', () => {
      const ends = [[470, 65, 'Е', 'ЕЕ'], [470, 165, 'С', 'ЕС'], [470, 235, 'Е', 'СЕ'], [470, 335, 'С', 'СС']];
      ends.forEach(([x, y, s, lbl], i) => { const from = i < 2 ? [321, 115] : [321, 285]; g.line(...from, x - 27, y, { stroke: 'muted', sw: 2.5, draw: true, d: 300 }); coin(g, k, x, y, s, { r: 22, size: 20 }); g.text(x + 70, y, lbl, { size: 24, bold: true, math: true }); });
      g.text(660, 400, '2 × 2 = 4', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Сүйек пен тиын: 6 × 2 = **12** нәтиже. Қателеспе: екі сүйекте 12 емес, 6 × 6 = 36 нәтиже бар.', () => {
      k.tag(680, 220, '6 × 2 = 12', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
      k.tag(680, 290, 'екі сүйек: 6 × 6 = 36', { size: 18, math: true, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('probability-05', (g, k) => {
  let c;
  return [
    ['Әділ тиынның екі беті бар және екеуі де бірдей мүмкін: елтаңба (Е) және сан (С).', () => {
      c = coin(g, k, 200, 150, 'Е', { r: 50, size: 44 });
      coin(g, k, 360, 150, 'С', { r: 50, size: 44 });
    }],
    ['Елтаңба түсу ықтималдығы: 1 қолайлы ÷ 2 барлығы = **0,5**.', () => {
      c.pulse(600, .15);
      g.text(280, 260, 'P(Е) = 1/2 = 0,5', { size: 32, math: true, bold: true, color: 'modt' });
    }],
    ['Екі рет лақтырсақ: ЕЕ, ЕС, СЕ, СС — 4 тең мүмкін нәтиже. Тек біреуі ЕЕ.', () => {
      g.stagger(['ЕЕ', 'ЕС', 'СЕ', 'СС'], 160, (t, i) => k.tag(570, 70 + i * 60, t, { size: 26, w: 100, math: true, fill: i === 0 ? 'goldsoft' : 'inksoft', stroke: i === 0 ? 'gold' : 'ink' }));
    }],
    ['P(ЕЕ) = 1/4 = **0,25**. Қателеспе: елтаңба түсу ықтималдығы 1 емес — бұл кездейсоқ оқиға.', () => {
      g.text(280, 340, 'P(ЕЕ) = 1/4 = 0,25', { size: 30, math: true, bold: true, color: 'goldt' });
      k.tag(280, 410, 'P(Е) = 0,5,  1 емес', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('probability-06', (g, k) => {
  const dice = [];
  return [
    ['Әділ сүйектің 6 беті бар, әрқайсысы бірдей мүмкін: P(бір сан) = 1/6.', () => {
      g.stagger([1, 2, 3, 4, 5, 6], 100, n => dice.push(k.die(150 + (n - 1) * 100, 110, n, 70)));
    }],
    ['Жұп сан: 2, 4, 6 — үш қолайлы жағдай. P = 3/6 = **0,5**.', () => {
      g.stagger([1, 3, 5], 200, i => { g.rect(150 + i * 100 - 42, 68, 84, 84, { rx: 16, fill: 'none', stroke: 'gold', sw: 4 }); });
      g.text(400, 210, 'P(жұп) = 3/6 = 0,5', { size: 30, math: true, bold: true, color: 'goldt' });
    }],
    ['5-тен кіші: 1, 2, 3, 4 — төрт қолайлы. P = 4/6 ≈ 0,667 ≈ **66,7%**.', () => {
      g.line(150 - 40, 160, 450 + 40, 160, { stroke: 'ok', sw: 6, draw: true });
      g.text(400, 280, 'P(< 5) = 4/6 ≈ 66,7%', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['Қателеспе: 6 түсу ықтималдығы 1/2 емес, 1/6 — алты нәтиженің тек біреуі.', () => {
      k.tag(400, 370, 'P(6) = 1/6', { size: 24, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('probability-07', (g, k) => {
  return [
    ['Қораптан затты кездейсоқ аламыз — әр зат бірдей мүмкін. Қорапта 6 ақ және 4 қара қалам.', () => {
      g.path('M90 120 L90 360 L390 360 L390 120', { stroke: 'ink', sw: 4, draw: true });
      g.stagger(Array.from({ length: 10 }), 80, (_, i) => g.rect(110 + i * 27, 200, 16, 140, { rx: 6, fill: i < 6 ? 'sheet' : 'text', stroke: 'ink', sw: 2 }));
    }],
    ['Ақ қалам: қолайлы 6, барлығы 10. P = 6/10 = **0,6**.', () => {
      g.text(600, 150, 'P(ақ) = 6/10 = 0,6', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['12 заттың 3-еуі ақаулы. Жарамды: 12 − 3 = 9. P(жарамды) = 9/12 = **0,75**.', () => {
      g.text(600, 230, 'P = 9/12 = 0,75', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['Жарамды мен ақаулы ықтималдықтарының қосындысы — 1: 0,75 + 0,25 = 1 (0 емес).', () => {
      const X = scale01(g, k, 340, { x0: 440, x1: 760 });
      const r = g.rect(440, 330, 0.01, 20, { rx: 0, fill: 'ok', now: true }); r.to({ width: 240 }, 700);
      const r2 = g.rect(680, 330, 0.01, 20, { rx: 0, fill: 'red', now: true }); r2.to({ width: 80 }, 500);
      k.tag(600, 420, '0,75 + 0,25 = 1', { size: 22, fill: 'oksoft', stroke: 'ok', math: true });
    }]
  ];
});

S('probability-08', (g, k) => {
  return [
    ['Қорапта 5 қызыл, 3 көк және 2 жасыл шар бар. Бөлімге барлық шарлардың санын жазамыз.', () => {
      g.path('M80 110 L80 350 Q80 370 100 370 L340 370 Q360 370 360 350 L360 110', { stroke: 'ink', sw: 4, draw: true });
      balls(g, 112, 345, 6, ['red', 'red', 'red', 'red', 'red', 'ink', 'ink', 'ink', 'ok', 'ok'], 18);
      g.text(220, 400, 'барлығы: 10', { size: 22, bold: true });
    }],
    ['Көк шар: 3 қолайлы, барлығы 10. P(көк) = 3/10 = **0,3**.', () => {
      g.text(590, 140, 'P(көк) = 3/10 = 0,3', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['8 шардың 6-уы қызыл. Қызыл емесі: 8 − 6 = 2. P = 2/8 = **0,25**.', () => {
      g.text(590, 230, 'P(қызыл емес) = 2/8 = 0,25', { size: 24, math: true, bold: true });
    }],
    ['Қателеспе: бөлімге тек бір түсті шарлар саны емес, **барлық** шарлардың саны жазылады.', () => {
      k.tag(590, 330, 'бөлім = барлық шарлар', { size: 22, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('probability-09', (g, k) => {
  const cards = [];
  return [
    ['1-ден 20-ға дейінгі карточкалардан біреуін аламыз. 5-ке еселі сан шығу ықтималдығы қандай?', () => {
      g.stagger(Array.from({ length: 20 }), 40, (_, i) => cards.push(k.card(85 + (i % 10) * 70, 80 + Math.floor(i / 10) * 86, i + 1, { w: 54, h: 70, size: 22 })));
    }],
    ['Қолайлы: 5, 10, 15, 20 — 4 карточка. P = 4/20 = **0,2**.', () => {
      g.stagger([4, 9, 14, 19], 200, i => g.rect(85 + (i % 10) * 70 - 30, 80 + Math.floor(i / 10) * 86 - 38, 60, 76, { rx: 10, fill: 'none', stroke: 'gold', sw: 4 }));
      g.text(400, 270, 'P = 4/20 = 0,2', { size: 30, math: true, bold: true, color: 'goldt' });
    }],
    ['1–10 ішінде жай сандар: 2, 3, 5, 7 — 4 сан. P = 4/10 = **0,4**.', () => {
      k.chips(400, 320, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { w: 52, h: 46, gap: 10, size: 20 });
      g.text(400, 410, 'жай: 2, 3, 5, 7  →  4/10 = 0,4', { size: 24, math: true, bold: true, color: 'ok' });
    }],
    ['Қателеспе: 1 — жай сан емес, оны жай сандарға қоспаймыз.', () => {
      k.tag(130, 410, '1 — жай емес', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('probability-10', (g, k) => {
  let X;
  return [
    ['Қарама-қарсы оқиғалар: «жаңбыр жауады» және «жаңбыр жаумайды». Олардың ықтималдықтарының қосындысы 1.', () => {
      X = scale01(g, k, 160);
      k.icon('drop', 140, 90); g.circle(660, 90, 24, { fill: 'gold' });
    }],
    ['Жаңбыр жауу ықтималдығы 0,35.', () => {
      g.rect(100, 150, 0.01, 20, { rx: 0, fill: 'c3', now: true }).to({ width: 600 * .35 }, 700);
      g.text(X(.175), 125, '0,35', { size: 22, bold: true, color: 'c3' });
    }],
    ['Жаумау ықтималдығы: 1 − 0,35 = **0,65**.', () => {
      g.rect(X(.35), 150, 0.01, 20, { rx: 0, fill: 'gold', now: true }).to({ width: 600 * .65 }, 700);
      g.text(X(.675), 125, '0,65', { size: 22, bold: true, color: 'goldt' });
      g.text(400, 260, 'P(жаумау) = 1 − 0,35 = 0,65', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['20 мүмкіндіктің 7-еуі қолайлы: қолайсыз 13, P = 13/20 = **0,65**. Қателеспе: оқиға мен оған қарсы оқиғаның ықтималдықтары тең болуы міндетті емес.', () => {
      g.text(400, 330, '13/20 = 0,65', { size: 28, math: true, bold: true });
      k.tag(400, 400, 'P(A) + P(A емес) = 1', { size: 22, fill: 'oksoft', stroke: 'ok', math: true });
    }]
  ];
});
})();
