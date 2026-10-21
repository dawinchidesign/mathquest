'use strict';
/* «Алгебра және теңдеулер» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

S('algebra-01', (g, k) => {
  let b;
  return [
    ['Сандық өрнекте амалдардың реті сақталады: жақша, дәреже, көбейту мен бөлу, қосу мен азайту.', () => {
      b = k.board(400, 90, { anchor: 'middle', size: 40, lh: 72 });
      b.line('**(36 − 12)** ÷ 4 + 7');
    }],
    ['Алдымен жақша: 36 − 12 = 24.', () => { b.line('**24 ÷ 4** + 7'); }],
    ['Енді бөлу: 24 ÷ 4 = 6. Бөлу қосудан бұрын орындалады.', () => { b.line('**6 + 7**'); }],
    ['Соңында қосу: 6 + 7 = **13**.', () => { b.line('= 13', { color: 'ok' }); k.answer(660, 306, 'Жауабы: 13', { size: 22 }); }],
    ['Қателеспе: 2 + 3 × 4 = 20 емес. Алдымен көбейту: 3 × 4 = 12, сосын 2 + 12 = 14.', () => {
      k.tag(400, 420, '2 + 3 × 4 = 2 + 12 = 14   (20 емес)', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('algebra-02', (g, k) => {
  let ta, tb, ca, cb;
  return [
    ['Әріпті өрнектің мәнін табу үшін әріптердің орнына берілген сандарды қоямыз. Өрнек: 3a − 2b.', () => {
      g.text(240, 90, '3 ·', { size: 44, math: true, bold: true });
      ta = g.text(310, 90, 'a', { size: 44, math: true, bold: true, italic: true, color: 'modt' });
      g.text(400, 90, '− 2 ·', { size: 44, math: true, bold: true });
      tb = g.text(500, 90, 'b', { size: 44, math: true, bold: true, italic: true, color: 'gold' });
    }],
    ['Берілгені: a = 4, b = −2.', () => {
      ca = k.card(250, 260, 'a = 4', { w: 130, h: 64, size: 30, stroke: 'mod' });
      cb = k.card(550, 260, 'b = −2', { w: 140, h: 64, size: 30, stroke: 'gold' });
    }],
    ['Сандарды әріптердің орнына қоямыз. Теріс санды жақшаға аламыз: 3 · 4 − 2 · (−2).', () => {
      g.par(() => { ta.out(250); tb.out(250); });
      g.par(() => { ca.to({ tx: 70, ty: -170, sc: .1, op: 0 }, 700); cb.to({ tx: -40, ty: -170, sc: .1, op: 0 }, 700); });
      g.text(320, 90, '4', { size: 44, math: true, bold: true, color: 'modt' });
      g.text(525, 90, '(−2)', { size: 44, math: true, bold: true, color: 'gold' });
    }],
    ['3 · 4 = 12, ал −2 · (−2) = +4. Сонда 12 + 4 = **16**.', () => {
      g.text(400, 200, '12 + 4 = 16', { size: 40, math: true, bold: true });
      k.answer(400, 280, 'Жауабы: 16', { size: 24 });
    }],
    ['Қателеспе: a = 3 болса, 2a = 23 емес! 2a дегеніміз 2 · a = 2 · 3 = 6.', () => {
      k.tag(400, 380, '2a = 2 · a = 6   (23 емес)', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('algebra-03', (g, k) => {
  return [
    ['Формулаға мәндерді қойғанда амал таңбалары өзгермейді. Тіктөртбұрыш ауданы: S = a × b.', () => {
      g.text(260, 50, 'S = a × b', { size: 34, math: true, bold: true });
      const gr = k.grid(120, 90, 9, 7, 30, { gap: 2, fill: 'modsoft' });
      gr.fill(0, 63, 'mod', 900);
    }],
    ['a = 7, b = 9. S = 7 × 9 = **63** шаршы бірлік.', () => {
      k.dim(120, 312, 406, 312, 'b = 9', { off: 14 });
      g.text(70, 200, 'a = 7', { size: 22, bold: true, color: 'gold', math: true });
      g.text(260, 410, 'S = 7 × 9 = 63', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['Шеңбер ұзындығы: C = 2πr. π ≈ 3, r = 5.', () => {
      g.circle(620, 200, 100, { fill: 'none', cls: 's-gold', sw: 4 }).shape.setAttribute('stroke-width', 4);
      g.circle(620, 200, 5, { fill: 'text' });
      g.line(620, 200, 720, 200, { stroke: 'red', sw: 3, draw: true });
      g.text(670, 182, 'r = 5', { size: 22, bold: true, color: 'red', math: true });
    }],
    ['C = 2 × 3 × 5 = **30**. Барлық шамалар бір өлшем бірлігінде болуы керек.', () => {
      g.text(620, 350, 'C = 2 × 3 × 5 = 30', { size: 30, math: true, bold: true, color: 'goldt' });
      k.tag(560, 415, 'көбейтуді қосуға ауыстыруға болмайды', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('algebra-04', (g, k) => {
  let left = [], seven, right, beam, b;
  const scale = () => {
    g.poly([[400, 210], [380, 250], [420, 250]], { fill: 'muted', stroke: 'muted', sw: 2 });
    beam = g.line(150, 210, 650, 210, { stroke: 'text', sw: 5 });
    g.par(() => { g.line(230, 210, 230, 240, { stroke: 'muted', sw: 2 }); g.line(570, 210, 570, 240, { stroke: 'muted', sw: 2 }); });
    g.par(() => { g.path('M150 240 Q230 262 310 240', { stroke: 'text', sw: 4 }); g.path('M490 240 Q570 262 650 240', { stroke: 'text', sw: 4 }); });
  };
  return [
    ['Теңдеу — тепе-теңдіктегі таразы. Екі жағына бірдей амал жасасақ, теңдік сақталады. 3x + 7 = 28.', () => {
      g.text(400, 40, '3x + 7 = 28', { size: 34, math: true, bold: true });
      scale();
      g.stagger([0, 1, 2], 120, i => left.push(k.card(150 + i * 44, 210, 'x', { w: 40, h: 50, size: 26, stroke: 'mod', fill: 'modsoft' })));
      seven = k.card(280, 210, '7', { w: 44, h: 50, size: 26, stroke: 'gold', fill: 'goldsoft' });
      right = k.card(570, 210, '28', { w: 70, h: 50, size: 28, stroke: 'gold', fill: 'goldsoft' });
    }],
    ['Екі жағынан да 7-ні аламыз: 3x = 28 − 7 = 21.', () => {
      g.par(() => { seven.to({ ty: -110, op: 0 }, 700); g.text(570, 150, '− 7', { size: 26, bold: true, color: 'red', math: true }); g.text(280, 150, '− 7', { size: 26, bold: true, color: 'red', math: true }); });
      g.par(() => { right.out(200); });
      k.card(570, 210, '21', { w: 70, h: 50, size: 28, stroke: 'gold', fill: 'goldsoft' });
      b = k.board(400, 320, { anchor: 'middle', size: 30, lh: 46 });
      b.line('3x = 21');
    }],
    ['Енді екі жағын да 3-ке бөлеміз: x = 21 ÷ 3 = 7.', () => {
      g.par(() => { left[1].out(300); left[2].out(300); });
      b.line('x = 21 ÷ 3 = **7**');
    }],
    ['Жауабы: x = **7**. Тексеру: 3 · 7 + 7 = 28 ✓. Қателеспе: 3x = 12 болса, x = 4 (бөлеміз), 36 емес.', () => {
      k.answer(400, 418, 'x = 7', { size: 26 });
    }]
  ];
});

S('algebra-05', (g, k) => {
  let nl;
  return [
    ['x^{2} = 49 дегеніміз: ауданы 49 болатын шаршының қабырғасы қандай?', () => {
      g.text(170, 45, 'x^{2} = 49', { size: 34, math: true, bold: true });
      const gr = k.grid(60, 80, 7, 7, 30, { gap: 2, fill: 'modsoft' }); gr.fill(0, 49, 'mod', 800);
      k.dim(60, 304, 282, 304, 'x = 7', { off: 14 });
    }],
    ['7 × 7 = 49, бірақ (−7) × (−7) = 49 де болады! Сондықтан x^{2} = 49 теңдеуінің екі түбірі бар: 7 және −7.', () => {
      nl = k.numberLine(370, 760, 130, -8, 8, { step: 1, labelEvery: 2, size: 16 });
      nl.point(7, { fill: 'ok', label: '7', size: 20 }); nl.point(-7, { fill: 'ok', label: '−7', size: 20 });
      g.text(565, 200, 'оң түбір — 7', { size: 22, bold: true, color: 'ok' });
    }],
    ['x^{2} − 5x + 6 = 0. Көбейткіштерге жіктейміз: (x − 2)(x − 3) = 0.', () => {
      g.text(565, 270, 'x^{2} − 5x + 6 = 0', { size: 28, math: true, bold: true });
      g.text(565, 315, '(x − 2)(x − 3) = 0', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Көбейтінді нөлге тең, егер көбейткіштердің бірі нөл болса: x = 2 немесе x = 3. Кіші түбір — **2**.', () => {
      g.text(565, 365, 'x = 2  немесе  x = 3', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(565, 420, 'x^{2} = 9 → x = 3 және x = −3', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('algebra-06', (g, k) => {
  let P;
  return [
    ['Теңдеулер жүйесі: x + y = 11 және x − y = 3. Шешім — екі теңдеуді де бірдей қанағаттандыратын (x; y) жұбы.', () => {
      g.text(170, 70, 'x + y = 11', { size: 32, math: true, bold: true, color: 'modt' });
      g.text(170, 120, 'x − y = 3', { size: 32, math: true, bold: true, color: 'gold' });
      P = k.plane(420, 40, 340, 0, 12, { every: 2 });
    }],
    ['Әр теңдеу — жазықтықтағы түзу. x + y = 11 түзуі: (0; 11) және (11; 0) нүктелері арқылы өтеді.', () => {
      P.seg(0, 11, 11, 0, { stroke: 'mod', sw: 4 });
    }],
    ['x − y = 3 түзуі: (3; 0) және (12; 9) арқылы өтеді.', () => {
      P.seg(3, 0, 12, 9, { stroke: 'gold', sw: 4 });
    }],
    ['Түзулер (7; 4) нүктесінде қиылысады — бұл жүйенің шешімі.', () => {
      P.guide(7, 4, 'muted'); P.pt(7, 4, { label: '(7; 4)', fill: 'red', r: 9 });
    }],
    ['Алгебралық тәсіл: теңдеулерді қосамыз — y жойылады: 2x = 14, x = **7**, y = 11 − 7 = 4.', () => {
      g.line(60, 150, 280, 150, { stroke: 'text', sw: 2.5, draw: true });
      g.text(170, 190, '2x = 14', { size: 32, math: true, bold: true });
      g.text(170, 245, 'x = 7,  y = 4', { size: 32, math: true, bold: true, color: 'ok' });
      k.answer(170, 320, 'Жауабы: x = 7', { size: 22 });
    }]
  ];
});

S('algebra-07', (g, k) => {
  let nl;
  return [
    ['Теңсіздікті теңдеу сияқты шешеміз: 2x + 3 < 11. Екі жақтан 3-ті аламыз: 2x < 8, сосын 2-ге бөлеміз: x < 4.', () => {
      const b = k.board(400, 45, { anchor: 'middle', size: 30, lh: 44 });
      b.line('2x + 3 < 11'); b.line('2x < 8'); b.line('**x < 4**');
    }],
    ['Сан түзуінде: 4-тен кіші барлық сандар. 4 нүктесі кірмейді, сондықтан оны бос дөңгелекпен белгілейміз.', () => {
      nl = k.numberLine(80, 720, 230, -2, 8, { size: 18 });
      g.line(nl.X(4) - 10, 230, 60, 230, { stroke: 'mod', sw: 9, draw: true });
      g.circle(nl.X(4), 230, 10, { fill: 'sheet', cls: 's-mod', sw: 4 }).shape.setAttribute('stroke-width', 4);
    }],
    ['Ең үлкен бүтін шешім — **3**.', () => { nl.point(3, { fill: 'ok', r: 10, label: '3' }); }],
    ['Маңызды: теріс санға көбейткенде немесе бөлгенде белгі кері бұрылады. −3x ≥ 12 → x ≤ −4.', () => {
      g.text(400, 330, '−3x ≥ 12   | ÷ (−3)', { size: 30, math: true, bold: true });
      g.text(400, 380, 'x **≤** −4', { size: 34, math: true, bold: true, color: 'red' });
      k.tag(400, 428, 'теріс санға бөлгенде  ≥  →  ≤', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('algebra-08', (g, k) => {
  let nl;
  return [
    ['Модуль — санның нөлден қашықтығы. Қашықтық теріс болмайды, сондықтан модуль әрқашан ≥ 0.', () => {
      nl = k.numberLine(70, 730, 150, -10, 10, { size: 16 });
      nl.point(0, { fill: 'text', r: 7 });
    }],
    ['|−8| = 8: −8 саны нөлден 8 бірлік қашықтықта тұр.', () => {
      nl.point(-8, { fill: 'red', label: '−8' });
      nl.seg(-8, 0, { stroke: 'gold', sw: 7 });
      g.text(nl.X(-4), 112, '8 бірлік', { size: 22, bold: true, color: 'gold' });
      g.text(400, 255, '|−8| = 8', { size: 34, math: true, bold: true });
    }],
    ['|x − 3| = 5: x саны 3-тен 5 бірлік қашықтықта. Ондай екі сан бар: 3 + 5 = 8 және 3 − 5 = −2.', () => {
      const nl2 = k.numberLine(70, 730, 350, -10, 10, { size: 16 });
      nl2.point(3, { fill: 'mod', r: 8, label: '3' });
      nl2.jump(3, 8, { label: '+5', stroke: 'ok', h: 40 });
      nl2.jump(3, -2, { label: '−5', stroke: 'ok', h: 40 });
      g.stagger([8, -2], 200, v => nl2.point(v, { fill: 'ok', r: 9 }));
    }],
    ['Шешімдер: x = 8 немесе x = −2. Үлкені — **8**. Қателеспе: теріс санның модулі теріс болмайды.', () => {
      k.answer(620, 255, 'x = 8 не x = −2', { size: 22 });
    }]
  ];
});

S('algebra-09', (g, k) => {
  const box = (x, y, t, o = {}) => k.tag(x, y, t, { size: 26, math: true, w: 100, fill: o.fill || 'inksoft', stroke: o.stroke || 'ink' });
  return [
    ['Белгісіз санмен не істелгенін ретімен жазамыз: □ → 6-ға бөлдік → 4 қостық → 13 шықты.', () => {
      g.text(400, 50, '□ ÷ 6 + 4 = 13', { size: 34, math: true, bold: true });
      g.stagger([[110, '□'], [330, '?'], [550, '13']], 250, ([x, t]) => box(x, 150, t, t === '13' ? { fill: 'goldsoft', stroke: 'gold' } : {}));
      g.par(() => { g.arrow(165, 150, 275, 150, { stroke: 'mod' }); g.arrow(385, 150, 495, 150, { stroke: 'mod' }); });
      g.text(220, 125, '÷ 6', { size: 22, bold: true, color: 'modt', math: true }); g.text(440, 125, '+ 4', { size: 22, bold: true, color: 'modt', math: true });
    }],
    ['Енді кері жүреміз: әр амалды кері амалмен ауыстырамыз. +4-тің кері амалы — −4: 13 − 4 = 9.', () => {
      g.curve(550, 185, 330, 185, 60, { stroke: 'red' });
      g.text(440, 265, '− 4', { size: 22, bold: true, color: 'red', math: true });
      box(330, 320, '9', { fill: 'rsoft', stroke: 'red' });
    }],
    ['÷6-ның кері амалы — ×6: 9 × 6 = 54. Демек □ = **54**.', () => {
      g.curve(330, 345, 110, 345, 50, { stroke: 'red', noHead: false }).move(0, -20, 1);
      g.text(220, 395, '× 6', { size: 22, bold: true, color: 'red', math: true });
      box(110, 230, '54', { fill: 'oksoft', stroke: 'ok' });
    }],
    ['Тексеру: 54 ÷ 6 + 4 = 9 + 4 = 13 ✓. Қателеспе: белгісіз қосылғышты табу үшін қосындыдан белгілі қосылғышты **аламыз**, қоспаймыз.', () => {
      k.answer(620, 410, '□ = 54', { size: 24 });
    }]
  ];
});

S('algebra-10', (g, k) => {
  return [
    ['Мәтіндік есеп: «Бір санның үш есесіне 5 қосқанда 41 шығады». Белгісіз санды x деп белгілейміз.', () => {
      g.stagger([0, 1, 2], 150, i => { g.rect(80 + i * 150, 90, 145, 50, { rx: 6, fill: 'modsoft', stroke: 'mod', sw: 2.5 }); g.text(152 + i * 150, 115, 'x', { size: 26, math: true, bold: true, italic: true }); });
      g.rect(530, 90, 60, 50, { rx: 6, fill: 'goldsoft', stroke: 'gold', sw: 2.5 }); g.text(560, 115, '5', { size: 24, math: true, bold: true });
      g.path('M80 155 Q335 185 590 155', { stroke: 'muted', sw: 2, draw: true }); g.text(335, 195, '41', { size: 26, math: true, bold: true });
    }],
    ['Шартты теңдеу етіп жазамыз: 3x + 5 = 41.', () => {
      const b = k.board(690, 70, { anchor: 'middle', size: 28, lh: 46 });
      b.line('3x + 5 = 41'); b.line('3x = 36'); b.line('x = **12**');
    }],
    ['Екінші есеп: екі санның қосындысы 26, үлкені кішісінен 8-ге артық. Кіші санды x деп аламыз, үлкені — x + 8.', () => {
      g.rect(80, 260, 220, 46, { rx: 6, fill: 'modsoft', stroke: 'mod', sw: 2.5 }); g.text(190, 283, 'x', { size: 24, math: true, bold: true, italic: true });
      g.rect(80, 320, 220, 46, { rx: 6, fill: 'modsoft', stroke: 'mod', sw: 2.5 }); g.text(190, 343, 'x', { size: 24, math: true, bold: true, italic: true });
      g.rect(300, 320, 80, 46, { rx: 6, fill: 'goldsoft', stroke: 'gold', sw: 2.5 }); g.text(340, 343, '8', { size: 24, math: true, bold: true });
      g.path('M390 260 Q420 313 390 366', { stroke: 'muted', sw: 2, draw: true }); g.text(445, 313, '26', { size: 26, math: true, bold: true });
    }],
    ['x + (x + 8) = 26 → 2x = 18 → x = **9**. Үлкен сан: 9 + 8 = 17. Тексеру: 9 + 17 = 26 ✓.', () => {
      const b = k.board(640, 270, { anchor: 'middle', size: 26, lh: 42 });
      b.line('x + x + 8 = 26'); b.line('2x = 18'); b.line('x = **9**');
      k.answer(640, 418, 'кіші сан: 9', { size: 22 });
    }]
  ];
});
})();
