'use strict';
/* «Қоспалар және концентрация» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

// Стақан: ішінде таза зат (алтын) және су (көгілдір) қабаттары; total — толық масса, pure — таза зат массасы
const beaker = (g, k, x, y, w, h, total, pure, o = {}) => {
  const max = o.max || total, H = (h - 8) * total / max, ph = (h - 8) * pure / max;
  const water = g.rect(x + 4, y + h - 4, w - 8, 0.01, { rx: 3, fill: 'c3', op: .55, now: true });
  const salt = g.rect(x + 4, y + h - 4, w - 8, 0.01, { rx: 3, fill: 'gold', now: true });
  g.path(`M${x} ${y} L${x} ${y + h - 10} Q${x} ${y + h} ${x + 10} ${y + h} L${x + w - 10} ${y + h} Q${x + w} ${y + h} ${x + w} ${y + h - 10} L${x + w} ${y}`, { stroke: 'ink', sw: 3.5, draw: true, d: 450 });
  g.par(() => { water.to({ y: y + h - 4 - H, height: Math.max(.01, H) }, 700); salt.to({ y: y + h - 4 - ph, height: Math.max(.01, ph) }, 700); });
  if (o.label) g.text(x + w / 2, y + h + 26, o.label, { size: o.size || 20, bold: true, math: true });
  return {
    water, salt,
    set(t, p, d = 900) { const H2 = (h - 8) * t / max, p2 = (h - 8) * p / max; g.par(() => { water.to({ y: y + h - 4 - H2, height: Math.max(.01, H2) }, d); salt.to({ y: y + h - 4 - p2, height: Math.max(.01, p2) }, d); }); }
  };
};

S('mixtures-01', (g, k) => {
  return [
    ['Қоспадағы заттың үлесі = таза зат массасы ÷ **барлық** қоспа массасы. 200 г қоспада 30 г тұз бар.', () => {
      beaker(g, k, 120, 80, 180, 280, 200, 30, { label: '200 г' });
      g.text(330, 330, '30 г тұз', { size: 20, bold: true, color: 'goldt', anchor: 'start' });
      g.text(330, 200, '170 г су', { size: 20, bold: true, color: 'c3', anchor: 'start' });
    }],
    ['Үлес: 30 ÷ 200 = 0,15 = **15%**. Бөлімге барлық қоспаның массасы жазылады.', () => {
      g.text(600, 140, '30 ÷ 200 = 0,15', { size: 28, math: true, bold: true });
      g.text(600, 185, '= 15%', { size: 32, math: true, bold: true, color: 'ok' });
      k.tag(600, 250, '30 ÷ 170 — қате', { size: 20, fill: 'rsoft', stroke: 'red', math: true });
    }],
    ['500 г қорытпаның 40%-ы мыс. Мыс массасы: 500 × 0,4 = **200 г**, қалғаны 300 г.', () => {
      const b = k.bar(460, 330, 300, 40, { ticks: [0, 40, 100] });
      b.fill(0, 40, 'gold', '200 г'); b.fill(40, 100, 'cell', '');
      g.text(610, 300, '500 × 0,4 = 200 г', { size: 24, math: true, bold: true });
    }]
  ];
});

S('mixtures-02', (g, k) => {
  return [
    ['Концентрация — еріген таза заттың ерітіндінің толық массасындағы үлесі. 300 г 12% ерітінді.', () => {
      beaker(g, k, 100, 80, 170, 280, 300, 36, { label: '300 г, 12%' });
    }],
    ['Тұз массасы: 300 × 0,12 = **36 г**.', () => {
      g.text(290, 345, '36 г', { size: 20, bold: true, color: 'goldt', anchor: 'start' });
      g.text(510, 120, '300 × 0,12 = 36 г', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['20 г тұзды 80 г суда ерітсек, ерітінді 20 + 80 = 100 г болады.', () => {
      beaker(g, k, 430, 190, 150, 180, 100, 20, { label: '100 г' });
      g.text(510, 170, '20 + 80 = 100 г', { size: 22, math: true, bold: true });
    }],
    ['Концентрация: 20 ÷ 100 = **20%**. Қателеспе: 20 ÷ 80 = 25% — қате, бөлімде судың емес, ерітіндінің массасы.', () => {
      g.text(680, 280, '20 ÷ 100', { size: 24, math: true, bold: true });
      g.text(680, 320, '= 20%', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(680, 400, '20 ÷ 80 — қате', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('mixtures-03', (g, k) => {
  let c;
  return [
    ['Араластырғанда таза зат массалары да, толық массалар да қосылады. 100 г 10% және 100 г 30% ерітінді.', () => {
      beaker(g, k, 60, 120, 120, 160, 100, 10, { label: '100 г, 10%', max: 200 });
      beaker(g, k, 230, 120, 120, 160, 100, 30, { label: '100 г, 30%', max: 200 });
      g.text(120, 100, '10 г тұз', { size: 18, bold: true, color: 'goldt' }); g.text(290, 100, '30 г тұз', { size: 18, bold: true, color: 'goldt' });
    }],
    ['Тұз: 10 + 30 = 40 г. Ерітінді: 100 + 100 = 200 г.', () => {
      g.arrow(370, 220, 440, 220, { stroke: 'muted', sw: 3 });
      c = beaker(g, k, 460, 60, 140, 260, 200, 40, { label: '200 г', max: 200 });
      g.text(705, 120, '10 + 30 = 40 г', { size: 22, math: true, bold: true });
    }],
    ['Жаңа концентрация: 40 ÷ 200 = **20%**.', () => {
      g.text(705, 180, '40 ÷ 200 = 20%', { size: 26, math: true, bold: true, color: 'ok' });
    }],
    ['200 г 10% + 100 г 40%: тұз 20 + 40 = 60 г, барлығы 300 г → **20%**. Қателеспе: массалар әртүрлі болса, (10 + 40) ÷ 2 = 25% деп орташалауға болмайды.', () => {
      g.text(400, 380, '(20 + 40) ÷ (200 + 100) = 60 ÷ 300 = 20%', { size: 22, math: true, bold: true });
      k.tag(400, 425, '(10% + 40%) ÷ 2 = 25% — қате', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('mixtures-04', (g, k) => {
  let b;
  return [
    ['Таза су қосқанда тұздың массасы өзгермейді, тек ерітінді массасы өседі. 200 г 20% ерітінді: тұз 40 г.', () => {
      b = beaker(g, k, 120, 60, 170, 300, 200, 40, { max: 400 });
      g.text(310, 320, '40 г тұз', { size: 20, bold: true, color: 'goldt', anchor: 'start' });
      g.text(205, 390, '200 г, 20%', { size: 20, bold: true, math: true });
    }],
    ['200 г су қосамыз: ерітінді 400 г, ал тұз сол 40 г.', () => {
      k.icon('tap', 260, 40, { scale: 1.1 });
      b.set(400, 40, 1400);
      g.text(310, 120, '+200 г су', { size: 20, bold: true, color: 'c3', anchor: 'start' });
    }],
    ['Концентрация: 40 ÷ 400 = **10%** — екі есе азайды.', () => {
      g.text(590, 160, '40 ÷ 400 = 10%', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['Кері есеп: 100 г 30% → 10%. Тұз 30 г, керек масса 30 ÷ 0,1 = 300 г, қосылатын су **200 г**. Қателеспе: су қосқанда тұз массасы өспейді.', () => {
      g.text(590, 250, '30 ÷ 0,1 = 300 г', { size: 24, math: true, bold: true });
      g.text(590, 290, '300 − 100 = 200 г су', { size: 24, math: true, bold: true });
      k.tag(590, 370, 'тұз массасы тұрақты', { size: 20, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('mixtures-05', (g, k) => {
  let b;
  return [
    ['Буланғанда тек су ұшып кетеді, тұз қалады. 500 г 10% ерітінді: тұз 50 г.', () => {
      b = beaker(g, k, 120, 70, 170, 300, 500, 50, { max: 500 });
      g.text(205, 400, '500 г, 10%', { size: 20, bold: true, math: true });
      g.text(310, 340, '50 г тұз', { size: 20, bold: true, color: 'goldt', anchor: 'start' });
    }],
    ['250 г су буланады.', () => {
      g.stagger([0, 1, 2], 200, i => g.path(`M${160 + i * 45} 60 q-10 -14 0 -28 q10 -14 0 -28`, { stroke: 'muted', sw: 3, draw: true }));
      b.set(250, 50, 1500);
      g.text(310, 120, '−250 г су', { size: 20, bold: true, color: 'red', anchor: 'start' });
    }],
    ['Тұз 50 г, ерітінді 250 г: 50 ÷ 250 = **20%**. Концентрация артты.', () => {
      g.text(590, 160, '50 ÷ 250 = 20%', { size: 30, math: true, bold: true, color: 'ok' });
    }],
    ['200 г 15% → 30%: тұз 30 г, керек масса 30 ÷ 0,3 = 100 г, буландыру **100 г**. Қателеспе: су буланса, концентрация кемімейді, артады.', () => {
      g.text(590, 250, '30 ÷ 0,3 = 100 г', { size: 24, math: true, bold: true });
      g.text(590, 290, '200 − 100 = 100 г', { size: 24, math: true, bold: true });
      k.tag(590, 370, 'булану → концентрация ↑', { size: 20, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('mixtures-06', (g, k) => {
  return [
    ['Таза зат = толық масса × пайыздық үлес. 1,5 кг 8% қоспа.', () => {
      g.text(400, 50, 'таза зат = масса × үлес', { size: 28, bold: true, color: 'modt' });
      beaker(g, k, 100, 100, 150, 260, 1500, 120, { label: '1,5 кг, 8%' });
    }],
    ['Алдымен бірліктерді келтіреміз: 1,5 кг = 1 500 г. 1 500 × 0,08 = **120 г**.', () => {
      g.text(500, 150, '1,5 кг = 1 500 г', { size: 26, math: true, bold: true });
      g.text(500, 200, '1 500 × 0,08 = 120 г', { size: 28, math: true, bold: true, color: 'ok' });
    }],
    ['Кері есеп: 24 г қант — ерітіндінің 12%-ы. Толық масса: 24 ÷ 0,12 = **200 г**.', () => {
      g.text(500, 290, '24 ÷ 0,12 = 200 г', { size: 28, math: true, bold: true });
    }],
    ['Қателеспе: таза затты табу үшін массаны үлеске бөлмейміз — көбейтеміз. Ал толық массаны тапқанда бөлеміз.', () => {
      k.tag(500, 380, 'таза: ×,   толық: ÷', { size: 22, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});
})();
