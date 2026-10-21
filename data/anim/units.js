'use strict';
/* «Өлшем бірліктері» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

// Баспалдақ: бірліктер мен көбейткіштер (үлкеннен кішіге)
const ladder = (g, k, x, y, units, factors, o = {}) => {
  const sx = o.sx || 150, sy = o.sy || 62, pos = [];
  g.stagger(units, 200, (u, i) => {
    const px = x + i * sx, py = y + i * sy;
    pos.push([px, py]);
    g.rect(px - 55, py - 24, 110, 48, { rx: 10, fill: 'inksoft', stroke: 'ink', sw: 2.5 });
    g.text(px, py + 1, u, { size: 24, bold: true });
    if (i < factors.length) {
      g.curve(px + 56, py, px + sx - 56, py + sy - 26, -10, { stroke: 'ok', sw: 2.5 });
      g.text(px + sx / 2 + 14, py + sy / 2 - 30, '× ' + factors[i], { size: 18, bold: true, color: 'ok', anchor: 'start' });
    }
  });
  return pos;
};

S('units-01', (g, k) => {
  return [
    ['Ұзындық бірліктері: 1 км = 1 000 м, 1 м = 100 см, 1 см = 10 мм. Үлкен бірліктен кішіге өткенде көбейтеміз.', () => {
      ladder(g, k, 110, 70, ['км', 'м', 'см', 'мм'], ['1 000', '100', '10']);
    }],
    ['3,5 км-ді метрге: 3,5 × 1 000 = **3 500 м**.', () => {
      g.text(560, 90, '3,5 км = 3,5 × 1 000', { size: 26, math: true, bold: true });
      g.text(560, 130, '= 3 500 м', { size: 28, math: true, bold: true, color: 'ok' });
    }],
    ['Кішіден үлкенге өткенде бөлеміз: 450 см = 450 ÷ 100 = **4,5 м**.', () => {
      g.text(250, 340, '450 см = 450 ÷ 100 = 4,5 м', { size: 26, math: true, bold: true, color: 'modt' });
      g.curve(395, 205, 260, 145, 30, { stroke: 'red', sw: 2.5 }); g.text(300, 210, '÷ 100', { size: 18, bold: true, color: 'red' });
    }],
    ['Қателеспе: 1 км = 100 м емес, 1 000 м. «Кило» — мың деген сөз.', () => {
      k.tag(250, 410, '1 км = 1 000 м   (100 емес)', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-02', (g, k) => {
  let gr;
  return [
    ['Аудан бірлігінде ауысу коэффициенті квадратталады. 1 м = 10 дм, сондықтан 1 м² = 10 × 10 = 100 дм².', () => {
      g.rect(70, 70, 300, 300, { rx: 0, fill: 'modsoft', stroke: 'ink', sw: 3 });
      g.text(220, 395, '1 м', { size: 20, bold: true }); g.text(45, 220, '1 м', { size: 20, bold: true });
      g.par(() => { for (let i = 1; i < 10; i++) { g.line(70 + i * 30, 70, 70 + i * 30, 370, { stroke: 'mod', sw: 1.2 }); g.line(70, 70 + i * 30, 370, 70 + i * 30, { stroke: 'mod', sw: 1.2 }); } });
    }],
    ['Әр дм² ішінде тағы 10 × 10 = 100 см². Сондықтан 1 м² = 100 × 100 = **10 000 см²**.', () => {
      g.rect(70, 70, 30, 30, { rx: 0, fill: 'gold' });
      g.line(100, 85, 470, 110, { stroke: 'gold', sw: 2, dash: '5 5', draw: true });
      g.rect(470, 60, 150, 150, { rx: 0, fill: 'goldsoft', stroke: 'gold', sw: 2.5 });
      g.par(() => { for (let i = 1; i < 10; i++) { g.line(470 + i * 15, 60, 470 + i * 15, 210, { stroke: 'gold', sw: .8 }); g.line(470, 60 + i * 15, 620, 60 + i * 15, { stroke: 'gold', sw: .8 }); } });
      g.text(545, 235, '1 дм² = 100 см²', { size: 18, bold: true, color: 'goldt' });
      g.text(580, 290, '1 м² = 10 000 см²', { size: 26, math: true, bold: true, color: 'modt' });
    }],
    ['2,5 м² = 2,5 × 10 000 = **25 000 см²**. 350 дм² = 350 ÷ 100 = 3,5 м².', () => {
      g.text(580, 345, '2,5 × 10 000 = 25 000 см²', { size: 22, math: true, bold: true });
      g.text(580, 385, '350 ÷ 100 = 3,5 м²', { size: 22, math: true, bold: true });
    }],
    ['Қателеспе: 1 м² = 100 см² емес — ұзындық коэффициенті (100) квадратталады: 100^{2} = 10 000.', () => {
      k.tag(580, 428, '1 м² ≠ 100 см²', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-03', (g, k) => {
  return [
    ['Көлемде коэффициент кубталады: 1 дм = 10 см, сондықтан 1 дм³ = 10 × 10 × 10 = 1 000 см³.', () => {
      k.box(80, 340, 200, 200, 200, { front: 'modsoft' });
      g.par(() => { for (let i = 1; i < 10; i++) { g.line(80 + i * 20, 340, 80 + i * 20, 140, { stroke: 'mod', sw: 1 }); g.line(80, 340 - i * 20, 280, 340 - i * 20, { stroke: 'mod', sw: 1 }); } });
      g.text(180, 380, '1 дм³ = 1 000 см³', { size: 22, bold: true, math: true });
    }],
    ['Ал 1 м = 100 см, сондықтан 1 м³ = 100 × 100 × 100 = **1 000 000 см³**.', () => {
      g.text(570, 100, '1 м³ = 100³ см³', { size: 28, math: true, bold: true });
      g.text(570, 145, '= 1 000 000 см³', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['0,004 м³ = 0,004 × 1 000 000 = **4 000 см³**. 2 500 см³ = 2 500 ÷ 1 000 = 2,5 дм³.', () => {
      g.text(570, 230, '0,004 × 1 000 000 = 4 000', { size: 24, math: true, bold: true });
      g.text(570, 275, '2 500 ÷ 1 000 = 2,5 дм³', { size: 24, math: true, bold: true });
    }],
    ['Қателеспе: 1 м³ = 1 000 см³ емес, 1 000 000 см³. Ал 1 м³ = 1 000 дм³.', () => {
      k.tag(570, 360, '1 м³ = 1 000 дм³ = 1 000 000 см³', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-04', (g, k) => {
  const weight = (x, y, w, h, t, fill) => { g.path(`M${x - w / 2} ${y} L${x - w / 2 + 10} ${y - h} L${x + w / 2 - 10} ${y - h} L${x + w / 2} ${y} Z`, { fill, stroke: 'ink', sw: 2.5, fade: true }); g.text(x, y - h / 2, t, { size: 20, bold: true, color: 'on' }); };
  return [
    ['Масса бірліктері: 1 т = 1 000 кг, 1 кг = 1 000 г. Әр қадамда — 1 000.', () => {
      g.stagger([[140, 'т', 70, 90, 'mod'], [370, 'кг', 56, 70, 'gold'], [600, 'г', 40, 50, 'c3']], 250, ([x, t, w, h, f]) => weight(x, 160, w + 50, h, '1 ' + t, f));
      g.par(() => { g.arrow(205, 120, 305, 120, { stroke: 'ok' }); g.arrow(430, 120, 545, 120, { stroke: 'ok' }); });
      g.text(255, 95, '× 1 000', { size: 18, bold: true, color: 'ok' }); g.text(487, 95, '× 1 000', { size: 18, bold: true, color: 'ok' });
    }],
    ['2,75 кг = 2,75 × 1 000 = **2 750 г**.', () => { g.text(400, 250, '2,75 кг = 2,75 × 1 000 = 2 750 г', { size: 28, math: true, bold: true, color: 'modt' }); }],
    ['3 500 кг = 3 500 ÷ 1 000 = **3,5 т**.', () => { g.text(400, 310, '3 500 кг = 3 500 ÷ 1 000 = 3,5 т', { size: 28, math: true, bold: true }); }],
    ['Қателеспе: 1 тонна = 100 кг емес, 1 000 кг. (100 кг — центнер.)', () => {
      k.tag(400, 390, '1 т = 1 000 кг', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-05', (g, k) => {
  let c;
  return [
    ['Уақыт ондық жүйеде емес: 1 сағат = 60 минут, 1 минут = 60 секунд.', () => {
      c = k.clock(170, 200, 120, 0, 0);
    }],
    ['2 сағат 35 минут: 2 × 60 = 120 минут, тағы 35 минут — барлығы **155 минут**.', () => {
      c.set(2, 35, 2000);
      g.text(530, 130, '2 × 60 + 35 = 155 мин', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['5 400 секундты сағатқа: 1 сағатта 60 × 60 = 3 600 секунд. 5 400 ÷ 3 600 = **1,5 сағат**.', () => {
      g.text(530, 210, '1 сағ = 3 600 с', { size: 24, math: true, bold: true });
      g.text(530, 255, '5 400 ÷ 3 600 = 1,5 сағ', { size: 28, math: true, bold: true });
    }],
    ['Қателеспе: 1 сағат 30 минут = 1,5 сағат, 1,3 емес! 30 минут — сағаттың жартысы.', () => {
      k.tag(530, 340, '1 сағ 30 мин = 1,5 сағ', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
      g.path(k.arc(170, 200, 112, -Math.PI / 2, Math.PI / 2), { fill: 'gold', op: .35, stroke: 'none' });
    }]
  ];
});

S('units-06', (g, k) => {
  return [
    ['Км/сағ-ты м/с-қа айналдырайық: 72 км/сағ — сағатына 72 км, яғни 72 000 м.', () => {
      g.text(400, 70, '72 км/сағ = ? м/с', { size: 32, math: true, bold: true });
      g.text(400, 150, '72 км = 72 000 м', { size: 26, math: true, bold: true });
    }],
    ['1 сағат = 3 600 секунд. 72 000 ÷ 3 600 = **20 м/с**.', () => {
      g.text(400, 200, '1 сағ = 3 600 с', { size: 26, math: true, bold: true });
      g.text(400, 260, '72 000 ÷ 3 600 = 20 м/с', { size: 30, math: true, bold: true, color: 'modt' });
    }],
    ['Қысқа ереже: км/сағ → м/с үшін 3,6-ға бөлеміз; м/с → км/сағ үшін 3,6-ға көбейтеміз.', () => {
      k.tag(250, 340, 'км/сағ  ÷ 3,6  →  м/с', { size: 22, fill: 'inksoft', stroke: 'ink', math: true });
      k.tag(560, 340, 'м/с  × 3,6  →  км/сағ', { size: 22, math: true });
    }],
    ['15 м/с × 3,6 = **54 км/сағ**. Қателеспе: 36 км/сағ = 36 м/с емес, 10 м/с.', () => {
      g.text(400, 400, '15 × 3,6 = 54 км/сағ;   36 ÷ 3,6 = 10 м/с', { size: 24, math: true, bold: true });
    }]
  ];
});

S('units-07', (g, k) => {
  return [
    ['1 литр — қабырғасы 1 дм кубтың көлемі: 1 л = 1 дм³.', () => {
      k.box(90, 200, 70, 70, 70, { front: 'c3soft' });
      g.text(125, 230, '1 л = 1 дм³', { size: 18, bold: true });
    }],
    ['1 м = 10 дм, сондықтан 1 м³ = 10 × 10 × 10 = **1 000 литр**.', () => {
      k.box(240, 400, 220, 220, 220, { front: 'modsoft' });
      g.par(() => { for (let i = 1; i < 10; i++) { g.line(240 + i * 22, 400, 240 + i * 22, 180, { stroke: 'mod', sw: 1 }); g.line(240, 400 - i * 22, 460, 400 - i * 22, { stroke: 'mod', sw: 1 }); } });
      g.text(690, 110, '1 м³ = 1 000 л', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['2,4 м³ = 2,4 × 1 000 = **2 400 л**. 750 л = 750 ÷ 1 000 = 0,75 м³.', () => {
      g.text(690, 180, '2,4 × 1 000 = 2 400 л', { size: 22, math: true, bold: true });
      g.text(690, 220, '750 ÷ 1 000 = 0,75 м³', { size: 22, math: true, bold: true });
    }],
    ['Қателеспе: 1 литр = 1 м³ емес — 1 м³ ішіне 1 000 литр сияды.', () => {
      k.tag(690, 290, '1 л ≠ 1 м³', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-08', (g, k) => {
  return [
    ['1 гектар — қабырғасы 100 м шаршының ауданы: 100 × 100 = 10 000 м².', () => {
      g.rect(80, 60, 320, 320, { rx: 0, fill: 'oksoft', stroke: 'ok', sw: 3 });
      g.text(240, 400, '100 м', { size: 20, bold: true }); g.text(50, 220, '100 м', { size: 20, bold: true });
      g.text(240, 220, '1 га', { size: 34, bold: true, color: 'ok' });
    }],
    ['1 ар (сотық) — 10 × 10 = 100 м². Гектарға 100 ар сияды.', () => {
      g.par(() => { for (let i = 1; i < 10; i++) { g.line(80 + i * 32, 60, 80 + i * 32, 380, { stroke: 'ok', sw: 1 }); g.line(80, 60 + i * 32, 400, 60 + i * 32, { stroke: 'ok', sw: 1 }); } });
      g.rect(80, 60, 32, 32, { rx: 0, fill: 'gold' });
      g.text(600, 100, '1 ар = 100 м²', { size: 26, math: true, bold: true, color: 'goldt' });
      g.text(600, 150, '1 га = 10 000 м²', { size: 26, math: true, bold: true, color: 'ok' });
    }],
    ['3,2 га = 3,2 × 10 000 = **32 000 м²**. 45 000 м² = 45 000 ÷ 10 000 = 4,5 га.', () => {
      g.text(600, 240, '3,2 × 10 000 = 32 000 м²', { size: 22, math: true, bold: true });
      g.text(600, 285, '45 000 ÷ 10 000 = 4,5 га', { size: 22, math: true, bold: true });
    }],
    ['Қателеспе: 1 гектар = 100 м² емес — 100 м² бұл 1 ар.', () => {
      k.tag(600, 360, '1 га = 10 000 м²', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('units-09', (g, k) => {
  return [
    ['Шамаларды қоспас бұрын оларды бір бірлікке келтіреміз. 2 м 35 см + 85 см.', () => {
      g.text(400, 50, '2 м 35 см + 85 см = ?', { size: 30, math: true, bold: true });
      g.rect(60, 110, 470, 40, { rx: 4, fill: 'modsoft', stroke: 'mod', sw: 2 }); g.text(295, 131, '2 м 35 см', { size: 20, bold: true });
      g.rect(530, 110, 170, 40, { rx: 4, fill: 'goldsoft', stroke: 'gold', sw: 2 }); g.text(615, 131, '85 см', { size: 20, bold: true });
    }],
    ['2 м = 200 см, сондықтан 2 м 35 см = 235 см.', () => {
      g.text(295, 185, '= 235 см', { size: 24, bold: true, math: true, color: 'modt' });
    }],
    ['235 + 85 = **320 см** (немесе 3 м 20 см).', () => {
      g.line(60, 230, 700, 230, { stroke: 'ok', sw: 3, draw: true });
      g.text(380, 262, '235 + 85 = 320 см', { size: 26, bold: true, color: 'ok', math: true });
    }],
    ['Масса: 1,5 кг − 350 г = 1 500 г − 350 г = **1 150 г**. Қателеспе: 2 м + 30 см = 32 м емес, 2,3 м немесе 230 см.', () => {
      g.text(400, 330, '1,5 кг = 1 500 г;   1 500 − 350 = 1 150 г', { size: 24, math: true, bold: true });
      k.tag(400, 400, '2 м + 30 см = 230 см   (32 м емес)', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});
})();
