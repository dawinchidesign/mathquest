'use strict';
/* «Қозғалыс есептері» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

// Жол: x0..x1 пиксель, 0..km километр
const road = (g, x0, x1, y, km, marks, o = {}) => {
  const X = v => x0 + v / km * (x1 - x0);
  g.rect(x0 - 10, y - 14, x1 - x0 + 20, 28, { rx: 6, fill: 'cell' , fade: true});
  g.line(x0, y, x1, y, { stroke: 'sheet', sw: 3, dash: '14 12', fade: true });
  g.par(() => (marks || []).forEach(v => { g.line(X(v), y + 16, X(v), y + 26, { stroke: 'muted', sw: 2, fade: true }); g.text(X(v), y + 44, k_fmt(v) + (o.unit ?? ' км'), { size: 16, color: 'muted', fade: true }); }));
  return X;
};
const k_fmt = v => String(v).replace('.', ',');

S('motion-01', (g, k) => {
  let X, bus;
  return [
    ['Қашықтық = жылдамдық × уақыт: s = v · t. Автобус 72 км/сағ жылдамдықпен 2,5 сағат жүрді.', () => {
      X = road(g, 80, 720, 150, 180, [0, 72, 144, 180]);
      bus = k.icon('bus', X(0), 118, { scale: .9 });
      g.text(400, 50, 'v = 72 км/сағ,  t = 2,5 сағ', { size: 26, bold: true, math: true });
    }],
    ['Әр сағатта автобус 72 км жүреді: 1 сағатта 72 км, 2 сағатта 144 км.', () => {
      bus.move(X(72) - X(0), 0, 900, 'lin'); g.text(X(72), 230, '1 сағ', { size: 18, bold: true, color: 'goldt' });
      bus.move(X(144) - X(72), 0, 900, 'lin'); g.text(X(144), 230, '2 сағ', { size: 18, bold: true, color: 'goldt' });
    }],
    ['Тағы жарты сағатта — 36 км. Барлығы: 72 × 2,5 = **180 км**.', () => {
      bus.move(X(180) - X(144), 0, 500, 'lin'); g.text(X(180), 230, '2,5 сағ', { size: 18, bold: true, color: 'goldt' });
      g.text(400, 290, 's = 72 × 2,5 = 180 км', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['Үшбұрыш-кеңес: s — үстінде, v мен t — астында. Біреуін жапсаң, формула шығады: t = s ÷ v, v = s ÷ t.', () => {
      g.poly([[400, 315], [330, 430], [470, 430]], { fill: 'goldsoft', stroke: 'gold', sw: 3 });
      g.line(350, 392, 450, 392, { stroke: 'gold', sw: 2.5 }); g.line(400, 392, 400, 430, { stroke: 'gold', sw: 2.5 });
      g.text(400, 368, 's', { size: 26, math: true, bold: true, italic: true }); g.text(375, 413, 'v', { size: 22, math: true, bold: true, italic: true }); g.text(425, 413, 't', { size: 22, math: true, bold: true, italic: true });
      g.text(640, 380, 't = 210 ÷ 70 = 3 сағ', { size: 24, math: true, bold: true });
      g.text(160, 380, 'Қашықтықты бөлмейміз!', { size: 18, color: 'red', bold: true });
    }]
  ];
});

S('motion-02', (g, k) => {
  let X, a, b;
  return [
    ['Екі көлік бір-біріне қарсы шықты. Арасы 300 км, жылдамдықтары 60 және 40 км/сағ.', () => {
      X = road(g, 80, 720, 170, 300, [0, 60, 120, 180, 240, 300]);
      a = k.icon('car', X(0), 138, { color: 'mod' }); b = k.icon('car', X(300), 138, { color: 'gold', flip: true });
      g.text(X(0) + 10, 95, '60 км/сағ →', { size: 20, bold: true, color: 'modt' }); g.text(X(300) - 10, 95, '← 40 км/сағ', { size: 20, bold: true, color: 'gold' });
    }],
    ['Бір сағатта олар 60 + 40 = 100 км-ге жақындайды. Бұл — жақындау жылдамдығы.', () => {
      g.par(() => { a.move(X(60) - X(0), 0, 900, 'lin'); b.move(X(260) - X(300), 0, 900, 'lin'); });
      g.text(400, 260, '1 сағатта: 300 − 100 = 200 км қалды', { size: 22, bold: true });
    }],
    ['Әр сағат сайын ара 100 км-ге қысқарады: 300 ÷ 100 = **3 сағатта** кездеседі.', () => {
      g.par(() => { a.move(X(180) - X(60), 0, 1600, 'lin'); b.move(X(180) - X(260), 0, 1600, 'lin'); });
      g.circle(X(180), 150, 30, { fill: 'none', cls: 's-ok', sw: 4 });
      g.text(400, 310, 't = 300 ÷ (60 + 40) = 3 сағ', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Жаяулар: 4 + 5 = 9 км/сағ, 2 сағатта 18 км жақындайды. Қателеспе: қарсы қозғалыста жылдамдықтар **қосылады**.', () => {
      k.icon('walker', 210, 400); k.icon('walker', 590, 400, { flip: true });
      g.text(400, 400, '(4 + 5) × 2 = 18 км', { size: 26, math: true, bold: true });
    }]
  ];
});

S('motion-03', (g, k) => {
  let X, a, b;
  return [
    ['Екі көлік бір нүктеден бір бағытқа шықты: 80 және 60 км/сағ.', () => {
      X = road(g, 70, 730, 120, 260, [0, 80, 160, 240]);
      a = k.icon('car', X(0), 90, { color: 'mod' });
      road(g, 70, 730, 230, 260, []);
      b = k.icon('car', X(0), 200, { color: 'gold' });
      g.text(110, 50, '80 км/сағ', { size: 20, bold: true, color: 'modt' }); g.text(110, 280, '60 км/сағ', { size: 20, bold: true, color: 'gold' });
    }],
    ['1 сағаттан кейін біреуі 80 км-де, екіншісі 60 км-де. Ара 80 − 60 = 20 км.', () => {
      g.par(() => { a.move(X(80) - X(0), 0, 900, 'lin'); b.move(X(60) - X(0), 0, 900, 'lin'); });
      g.line(X(60), 330, X(80), 330, { stroke: 'red', sw: 6, draw: true }); g.text(X(70), 355, '20', { size: 18, bold: true, color: 'red' });
    }],
    ['Әр сағатта ара 20 км-ге артады. 3 сағатта: 20 × 3 = **60 км**.', () => {
      g.par(() => { a.move(X(240) - X(80), 0, 1600, 'lin'); b.move(X(180) - X(60), 0, 1600, 'lin'); });
      g.line(X(180), 330, X(240), 330, { stroke: 'red', sw: 6, draw: true }); g.text(X(210), 355, '60 км', { size: 20, bold: true, color: 'red' });
      g.text(320, 410, '(80 − 60) × 3 = 60 км', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Бір бағытта жылдамдықтарды **азайтамыз**. Жаяулар: (5 − 3) × 4 = 8 км.', () => {
      k.tag(650, 410, '(5 − 3) × 4 = 8', { size: 20, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('motion-04', (g, k) => {
  let X, front, back;
  return [
    ['Алдыңғы көлік 60 км/сағ, артқысы 80 км/сағ. Арасы 40 км. Артқысы алдыңғысын қуып жетеді.', () => {
      X = road(g, 70, 730, 170, 180, [0, 40, 100, 120, 160]);
      back = k.icon('car', X(0), 138, { color: 'gold' }); front = k.icon('car', X(40), 138, { color: 'mod' });
      g.text(X(0), 95, '80', { size: 20, bold: true, color: 'gold' }); g.text(X(40), 95, '60', { size: 20, bold: true, color: 'modt' });
      g.line(X(0), 250, X(40), 250, { stroke: 'red', sw: 6, draw: true }); g.text(X(20), 275, '40 км', { size: 18, bold: true, color: 'red' });
    }],
    ['Артқы көлік сағатына 80 − 60 = 20 км жақындайды.', () => {
      g.par(() => { back.move(X(80) - X(0), 0, 900, 'lin'); front.move(X(100) - X(40), 0, 900, 'lin'); });
      g.line(X(80), 250, X(100), 250, { stroke: 'red', sw: 6, draw: true }); g.text(X(90), 275, '20', { size: 18, bold: true, color: 'red' });
    }],
    ['40 км ара 20 км/сағ-пен: 40 ÷ 20 = **2 сағатта** қуып жетеді.', () => {
      g.par(() => { back.move(X(160) - X(80), 0, 900, 'lin'); front.move(X(160) - X(100), 0, 900, 'lin'); });
      g.circle(X(160), 150, 32, { fill: 'none', cls: 's-ok', sw: 4 });
      g.text(400, 340, 't = 40 ÷ (80 − 60) = 2 сағ', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Қуып жеткенде жылдамдықтарды қоспаймыз — айырмасын аламыз. Велосипедші: ара 10 км, 15 − 5 = 10 км/сағ → 1 сағ.', () => {
      k.tag(400, 410, 'қуып жету: ара ÷ (v₁ − v₂)', { size: 22, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('motion-05', (g, k) => {
  let boat;
  return [
    ['Өзендегі қайыққа ағыс та әсер етеді. Қайықтың өз жылдамдығы 12 км/сағ, ағыс 3 км/сағ.', () => {
      g.rect(40, 100, 720, 120, { rx: 10, fill: 'c3soft' });
      g.par(() => { for (let i = 0; i < 7; i++) { const a = g.arrow(70 + i * 100, 200, 120 + i * 100, 200, { stroke: 'c3', sw: 2.5 }); } });
      g.text(400, 245, 'ағыс 3 км/сағ →', { size: 18, color: 'c3', bold: true });
      boat = k.icon('boat', 150, 150);
    }],
    ['Ағыспен жүзгенде ағыс жылдамдығы қосылады: 12 + 3 = 15 км/сағ.', () => {
      g.arrow(200, 70, 380, 70, { stroke: 'mod', sw: 4 }); g.text(290, 50, '12', { size: 20, bold: true, color: 'modt' });
      g.arrow(380, 70, 425, 70, { stroke: 'c3', sw: 4 }); g.text(403, 50, '3', { size: 20, bold: true, color: 'c3' });
      boat.move(500, 0, 1400, 'lin');
      g.text(600, 50, '= 15 км/сағ', { size: 22, bold: true, math: true });
    }],
    ['2 сағатта: 15 × 2 = **30 км**.', () => { g.text(400, 300, '(12 + 3) × 2 = 30 км', { size: 28, math: true, bold: true, color: 'modt' }); }],
    ['Ағысқа қарсы жылдамдық: 12 − 3 = 9 км/сағ. Ал ағыспен 18, қарсы 12 болса, ағыс = (18 − 12) ÷ 2 = **3 км/сағ**.', () => {
      boat.to({ sc: -1 }, 1);
      g.text(400, 355, 'қарсы: v − ағыс,   ағыспен: v + ағыс', { size: 22, bold: true });
      g.text(400, 410, 'ағыс = (18 − 12) ÷ 2 = 3', { size: 26, math: true, bold: true, color: 'c3' });
    }]
  ];
});

S('motion-06', (g, k) => {
  return [
    ['Орташа жылдамдық = барлық жол ÷ барлық уақыт. Көлік 60 км-ді 30 км/сағ, келесі 60 км-ді 60 км/сағ жүрді.', () => {
      g.rect(80, 90, 320, 44, { rx: 0, fill: 'modsoft', stroke: 'mod', sw: 2 }); g.text(240, 112, '60 км · 30 км/сағ', { size: 20, bold: true });
      g.rect(400, 90, 320, 44, { rx: 0, fill: 'goldsoft', stroke: 'gold', sw: 2 }); g.text(560, 112, '60 км · 60 км/сағ', { size: 20, bold: true });
    }],
    ['Әр бөліктің уақыты: 60 ÷ 30 = 2 сағ және 60 ÷ 60 = 1 сағ. Барлығы 3 сағат.', () => {
      g.text(400, 175, 'уақыт сызығы', { size: 18, color: 'muted' });
      g.rect(80, 195, 427, 44, { rx: 0, fill: 'mod' }); g.text(293, 217, '2 сағ', { size: 20, bold: true, color: 'on' });
      g.rect(507, 195, 213, 44, { rx: 0, fill: 'gold' }); g.text(613, 217, '1 сағ', { size: 20, bold: true, color: 'on' });
    }],
    ['Орташа жылдамдық: 120 ÷ 3 = **40 км/сағ**.', () => {
      g.text(400, 300, 'v = (60 + 60) ÷ (2 + 1) = 40 км/сағ', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['Қателеспе: (30 + 60) ÷ 2 = 45 емес! Баяу бөлікте көлік көбірек уақыт жүрді, сондықтан орташа жылдамдық төменірек.', () => {
      k.tag(400, 370, '(30 + 60) ÷ 2 = 45 — қате', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
      g.text(400, 425, '2 сағ · 50 + 1 сағ · 80 = 180 км,  180 ÷ 3 = 60 км/сағ', { size: 20, math: true, color: 'muted' });
    }]
  ];
});

S('motion-07', (g, k) => {
  let train;
  const sc = .75, bx0 = 250, bx1 = 250 + 400 * sc;
  return [
    ['Пойыз көпірден толық өтуі үшін алдыңғы вагон көпірге кіруінен бастап соңғы вагон көпірден шыққанға дейін жүреді.', () => {
      g.rect(bx0, 200, bx1 - bx0, 18, { rx: 2, fill: 'muted' });
      g.par(() => { for (let x = bx0; x <= bx1; x += 50) g.line(x, 218, x + 25, 270, { stroke: 'muted', sw: 3 }); });
      g.rect(30, 270, 740, 60, { rx: 0, fill: 'c3soft' });
      k.dim(bx0, 200, bx1, 200, 'көпір 400 м', { off: -26, size: 20, stroke: 'ink', color: 'modt' });
      train = g.group();
      g.into(train, () => { for (let i = 0; i < 3; i++) g.rect(bx0 - 200 * sc + i * 50 + 2, 166, 46, 32, { rx: 5, fill: 'red', now: true }); });
      train.fade(300);
      g.text(bx0 - 75, 150, 'пойыз 200 м', { size: 18, bold: true, color: 'red' });
    }],
    ['Алдымен алдыңғы вагон көпірдің басында. Пойыз соңғы вагон көпірдің соңынан шыққанша жүреді.', () => {
      train.move((400 + 200) * sc, 0, 2400, 'lin');
    }],
    ['Жүрген жол: көпір + пойыз = 400 + 200 = 600 м.', () => {
      k.dim(bx0 - 200 * sc, 360, bx1, 360, '600 м', { off: 0, size: 22, stroke: 'gold' });
    }],
    ['Уақыт: 600 ÷ 20 = **30 секунд**. Бағаннан өтуде жол тек пойыз ұзындығына тең: 150 ÷ 10 = 15 м/с.', () => {
      g.text(400, 60, 't = (400 + 200) ÷ 20 = 30 с', { size: 30, math: true, bold: true, color: 'modt' });
    }]
  ];
});

S('motion-08', (g, k) => {
  let X, bike, walk;
  return [
    ['Бірдей 18 км жол. Велосипедші оны 1 сағатта өтеді, жаяудың жылдамдығы 6 км/сағ.', () => {
      X = road(g, 90, 700, 120, 18, [0, 6, 12, 18]);
      road(g, 90, 700, 270, 18, [0, 6, 12, 18]);
      bike = k.icon('bike', X(0), 88); walk = k.icon('walker', X(0), 238);
      k.icon('flag', 730, 100); k.icon('flag', 730, 250);
    }],
    ['Велосипедші 1 сағатта жетеді, ал жаяу сағатына 6 км ғана жүреді.', () => {
      g.par(() => { bike.move(X(18) - X(0), 0, 1200, 'lin'); walk.move(X(6) - X(0), 0, 1200, 'lin'); });
      g.text(X(18), 190, '1 сағ', { size: 18, bold: true, color: 'c4' });
      g.text(X(6), 340, '1 сағ', { size: 18, bold: true, color: 'c3' });
    }],
    ['Жаяуға 18 ÷ 6 = **3 сағат** керек. Бір жолда жылдамдық неше есе көп болса, уақыт сонша есе аз.', () => {
      walk.move(X(18) - X(6), 0, 2400, 'lin');
      g.text(X(18), 340, '3 сағ', { size: 18, bold: true, color: 'c3' });
      g.text(400, 385, 't = 18 ÷ 6 = 3 сағ', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['Екінші есеп: велосипедші (20 км/сағ) жаяудан (5 км/сағ) 4 есе жылдам, сондықтан 40 минуттың орнына 40 ÷ 4 = **10 минут**.', () => {
      k.tag(400, 425, '20 ÷ 5 = 4 есе  →  40 ÷ 4 = 10 мин', { size: 20, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('motion-09', (g, k) => {
  let c;
  return [
    ['Жол–уақыт графигінде көлденең ось — уақыт, тік ось — жол. Кесте: t = 0, 1, 2 сағ; s = 0, 45, 90 км.', () => {
      k.table(40, 60, [90, 70, 70, 70], 46, [['t, сағ', '0', '1', '2'], ['s, км', '0', '45', '90']], { size: 20 });
      c = k.lineChart(390, 70, 250, 270, [0, 45, 90], ['0', '1', '2'], { max: 110, min: 0 });
    }],
    ['Әр сағатта жол 45 км-ге өседі. Графиктің көлбеулігі — жылдамдық: **45 км/сағ**.', () => {
      g.par(() => { g.line(c.X(1), c.Y(45), c.X(2), c.Y(45), { stroke: 'gold', sw: 2.5, dash: '6 5', draw: true }); g.line(c.X(2), c.Y(45), c.X(2), c.Y(90), { stroke: 'gold', sw: 2.5, dash: '6 5', draw: true }); });
      g.text(c.X(1.5), c.Y(45) + 20, '1 сағ', { size: 16, bold: true, color: 'gold' });
      g.text(c.X(2) + 34, c.Y(67), '45 км', { size: 16, bold: true, color: 'gold' });
      g.text(200, 230, 'v = 45 ÷ 1 = 45 км/сағ', { size: 24, math: true, bold: true, color: 'modt' });
    }],
    ['Егер графикте кесінді көлденең болса, уақыт өтіп жатыр, бірақ жол өзгермейді — дене тоқтап тұр.', () => {
      g.line(c.X(2), c.Y(90), c.X(2) + 120, c.Y(90), { stroke: 'red', sw: 4, draw: true });
      g.text(c.X(2) + 60, c.Y(90) - 22, 'тоқтап тұр', { size: 18, bold: true, color: 'red' });
    }],
    ['t = 2 және t = 3 сағатта s = 100 км болса, жылдамдық **0**. Қателеспе: көлденең кесінді жоғары жылдамдық емес, тоқтауды білдіреді.', () => {
      k.tag(200, 330, 'көлденең кесінді → v = 0', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});
})();
