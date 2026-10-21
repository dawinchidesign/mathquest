'use strict';
/* «Жиындар» бөлімінің анимациялары */
(() => {
const S = Anim.scene;

S('sets-01', (g, k) => {
  let ch;
  return [
    ['Жиын — элементтер тобы. Бір жиында әр элемент бір рет қана есептеледі. A = {1, 2, 2, 3, 3, 4}.', () => {
      ch = k.chips(400, 90, [1, 2, 2, 3, 3, 4], { w: 70 });
    }],
    ['Қайталанған элементтерді алып тастаймыз.', () => {
      g.par(() => { ch.mark(2, 'red'); ch.mark(4, 'red'); });
      g.par(() => { ch.items[2].grp.to({ ty: 70, op: 0 }, 700); ch.items[4].grp.to({ ty: 70, op: 0 }, 700); });
    }],
    ['A = {1, 2, 3, 4} — **4** әртүрлі элемент.', () => {
      g.path('M150 190 Q150 160 190 160 L610 160 Q650 160 650 190 L650 250 Q650 280 610 280 L190 280 Q150 280 150 250 Z', { fill: 'modsoft', stroke: 'mod', sw: 3, fade: true });
      g.stagger([1, 2, 3, 4], 150, (v, i) => g.text(250 + i * 100, 222, String(v), { size: 34, bold: true, math: true }));
      g.text(400, 310, 'n(A) = 4', { size: 28, math: true, bold: true, color: 'modt' });
    }],
    ['10-нан кіші оң жұп сандар: {2, 4, 6, 8} — **4** элемент.', () => {
      k.tag(400, 390, '{2, 4, 6, 8} → 4', { size: 24, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('sets-02', (g, k) => {
  let v;
  return [
    ['Бірігу A ∪ B — екі жиынның кем дегенде біреуіне кіретін барлық элементтер. A = {1, 2, 3}, B = {3, 4, 5}.', () => {
      v = k.venn(330, 220, 130, 2, { labels: ['A', 'B'] });
      g.stagger([[230, 190, '1'], [230, 260, '2'], [430, 190, '4'], [430, 260, '5']], 150, ([x, y, t]) => g.text(x, y, t, { size: 30, bold: true, math: true }));
      g.text(330, 225, '3', { size: 30, bold: true, math: true, color: 'goldt' });
    }],
    ['3 — екеуінде де бар, бірақ бірігуде бір рет қана жазылады: A ∪ B = {1, 2, 3, 4, 5} — **5** элемент.', () => {
      g.text(650, 140, 'A ∪ B', { size: 30, math: true, bold: true, color: 'modt' });
      g.text(650, 190, '{1, 2, 3, 4, 5}', { size: 26, math: true, bold: true });
    }],
    ['Формула: n(A ∪ B) = n(A) + n(B) − n(A ∩ B). Ортақ бөлік екі рет саналмауы үшін оны бір рет аламыз.', () => {
      g.text(650, 270, 'n(A) + n(B) − n(A∩B)', { size: 22, math: true, bold: true });
    }],
    ['A-да 12, B-да 10, ортағы 4: 12 + 10 − 4 = **18**. Қателеспе: бірігу қуаты жай қосындыға тең емес.', () => {
      g.text(650, 330, '12 + 10 − 4 = 18', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(650, 400, '12 + 10 = 22 — қате', { size: 18, fill: 'rsoft', stroke: 'red', math: true });
    }]
  ];
});

S('sets-03', (g, k) => {
  return [
    ['Қиылысу A ∩ B — екі жиынға да кіретін элементтер. A = {2, 4, 6, 8}, B = {1, 2, 3, 4}.', () => {
      k.venn(330, 220, 130, 2, { labels: ['A', 'B'] });
      g.stagger([[225, 180, '6'], [225, 265, '8'], [435, 180, '1'], [435, 265, '3']], 120, ([x, y, t]) => g.text(x, y, t, { size: 30, bold: true, math: true }));
    }],
    ['Ортақ элементтер — 2 және 4. Олар дөңгелектердің қабысқан бөлігінде: A ∩ B = {2, 4} — **2** элемент.', () => {
      g.text(330, 190, '2', { size: 32, bold: true, math: true, color: 'goldt' });
      g.text(330, 255, '4', { size: 32, bold: true, math: true, color: 'goldt' });
      g.text(650, 150, 'A ∩ B = {2, 4}', { size: 28, math: true, bold: true, color: 'goldt' });
    }],
    ['Санмен: футболға 15, шахматқа 12, кемінде біреуіне 20 оқушы. Ортақ: 15 + 12 − 20 = **7**.', () => {
      g.text(650, 240, '15 + 12 − 20 = 7', { size: 28, math: true, bold: true, color: 'ok' });
    }],
    ['Қателеспе: қиылысуға тек бір жиында бар элементтер кірмейді — тек екеуінде де бар элементтер.', () => {
      k.tag(650, 330, 'қиылысу = екеуінде де', { size: 20, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});

S('sets-04', (g, k) => {
  return [
    ['Эйлер–Венн диаграммасы: тіктөртбұрыш — барлық элементтер, дөңгелектер — жиындар. A = 18, B = 14, ортақ бөлігі 6.', () => {
      g.rect(50, 50, 560, 360, { rx: 14, fill: 'none', stroke: 'muted', sw: 2.5 });
      g.text(90, 80, 'U', { size: 22, bold: true, color: 'muted', math: true });
      k.venn(330, 230, 130, 2, { labels: ['A', 'B'] });
      g.text(330, 232, '6', { size: 32, bold: true, math: true, color: 'goldt' });
    }],
    ['Тек A бөлігі: 18 − 6 = **12**. Тек B: 14 − 6 = 8. Ортақ бөлік әр жиынның санына кіріп тұр.', () => {
      g.text(230, 232, '12', { size: 32, bold: true, math: true, color: 'modt' });
      g.text(430, 232, '8', { size: 32, bold: true, math: true, color: 'goldt' });
      g.text(710, 150, 'тек A = 18 − 6', { size: 20, math: true, bold: true });
      g.text(710, 185, '= 12', { size: 26, math: true, bold: true, color: 'ok' });
    }],
    ['Бірігу: 12 + 6 + 8 = 26. Ал дөңгелектердің сыртындағы бөлік — ешқайсысына кірмейтіндер.', () => {
      g.text(710, 260, 'A ∪ B = 26', { size: 22, math: true, bold: true });
    }],
    ['Мысал: барлығы 40 оқушы, бірігу 32 → сыртында 40 − 32 = **8** оқушы.', () => {
      g.text(560, 385, '8', { size: 30, bold: true, math: true, color: 'red' });
      g.text(710, 330, '40 − 32 = 8', { size: 24, math: true, bold: true, color: 'red' });
    }]
  ];
});

S('sets-05', (g, k) => {
  return [
    ['30 оқушының 17-сі жүзеді, 15-і жүгіреді, 8-і екеуін де істейді.', () => {
      g.rect(40, 50, 540, 360, { rx: 14, fill: 'none', stroke: 'muted', sw: 2.5 }); g.text(80, 80, '30', { size: 22, bold: true, color: 'muted' });
      k.venn(310, 230, 125, 2, { labels: ['жүзу 17', 'жүгіру 15'] });
      g.text(310, 232, '8', { size: 32, bold: true, math: true, color: 'goldt' });
    }],
    ['Тек жүзетіндер: 17 − 8 = 9. Тек жүгіретіндер: 15 − 8 = 7.', () => {
      g.text(215, 232, '9', { size: 30, bold: true, math: true, color: 'modt' }); g.text(405, 232, '7', { size: 30, bold: true, math: true, color: 'goldt' });
    }],
    ['Кемінде біреуін істейтіндер: 17 + 15 − 8 = 24.', () => {
      g.text(690, 160, '17 + 15 − 8', { size: 24, math: true, bold: true }); g.text(690, 200, '= 24', { size: 28, math: true, bold: true });
    }],
    ['Ешқайсысын істемейтіндер: 30 − 24 = **6**. Ортақ бөлікті екі рет қоспаймыз, бір рет аламыз. Кері есеп: 16 + 14 − 25 = 5.', () => {
      g.text(520, 380, '6', { size: 30, bold: true, math: true, color: 'red' });
      g.text(690, 270, '30 − 24 = 6', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(690, 350, '16 + 14 − 25 = 5', { size: 18, math: true, fill: 'oksoft', stroke: 'ok' });
    }]
  ];
});

S('sets-06', (g, k) => {
  const cx = 300, cy = 235, r = 120;
  const put = (x, y, t, c = 'text') => g.text(x, y, t, { size: 26, bold: true, math: true, color: c });
  return [
    ['Үш жиын: n(A) = 10, n(B) = 12, n(C) = 8. Жұп қиылысулар 3, 2, 4, үшеуінікі 1.', () => {
      k.venn(cx, cy, r, 3, { labels: ['A 10', 'B 12', 'C 8'] });
    }],
    ['Ортадан бастаймыз: үш жиынның қиылысуы — 1.', () => { put(cx, cy - 8, '1', 'red'); }],
    ['Тек жұп қиылысу бөліктері: A∩B: 3 − 1 = 2, A∩C: 2 − 1 = 1, B∩C: 4 − 1 = 3.', () => {
      put(cx, cy - 90, '2'); put(cx - 70, cy + 40, '1'); put(cx + 70, cy + 40, '3');
    }],
    ['Тек бір жиын: A: 10 − 2 − 1 − 1 = 6, B: 12 − 2 − 3 − 1 = 6, C: 8 − 1 − 3 − 1 = 3.', () => {
      put(cx - 110, cy - 70, '6', 'modt'); put(cx + 110, cy - 70, '6', 'goldt'); put(cx, cy + 120, '3', 'c3');
    }],
    ['Барлық бөліктер: 6 + 6 + 3 + 2 + 1 + 3 + 1 = **22**. Формуламен: 10 + 12 + 8 − 3 − 2 − 4 + 1 = 22. Үштік қиылысуды соңында қайта қосамыз!', () => {
      g.text(640, 160, '10 + 12 + 8', { size: 24, math: true, bold: true });
      g.text(640, 200, '− 3 − 2 − 4', { size: 24, math: true, bold: true, color: 'red' });
      g.text(640, 240, '+ 1', { size: 24, math: true, bold: true, color: 'ok' });
      g.text(640, 295, '= 22', { size: 32, math: true, bold: true, color: 'modt' });
    }]
  ];
});

S('sets-07', (g, k) => {
  const cells = [];
  return [
    ['1-ден 30-ға дейінгі сандардың ішінде 2-ге де, 3-ке де бөлінетіндерін табайық.', () => {
      g.stagger(Array.from({ length: 30 }), 20, (_, i) => { const x = 70 + (i % 10) * 66, y = 70 + Math.floor(i / 10) * 66; cells.push(g.rect(x - 28, y - 28, 56, 56, { rx: 8, fill: 'sheet', stroke: 'line', sw: 2, d: 200 })); g.text(x, y + 1, String(i + 1), { size: 22, bold: true, d: 200 }); });
    }],
    ['2-ге бөлінетіндер — жұп сандар (көк жиек).', () => {
      g.stagger(Array.from({ length: 15 }), 40, (_, j) => cells[2 * j + 1].cls('f-modsoft s-line'));
    }],
    ['Олардың ішінде 3-ке де бөлінетіндер — 6-ға бөлінетін сандар: 6, 12, 18, 24, 30 — **5** сан.', () => {
      g.stagger([5, 11, 17, 23, 29], 200, i => { cells[i].cls('f-gold s-gold'); cells[i].pulse(300, .15); });
      g.text(400, 290, '2-ге және 3-ке → 6-ға: 5 сан', { size: 26, bold: true, color: 'goldt' });
    }],
    ['«Немесе» есебі: 1–20 ішінде 2-ге немесе 5-ке бөлінетін: 10 + 4 − 2 = **12** (10 мен 20 екі рет саналмасын).', () => {
      g.text(400, 360, '10 + 4 − 2 = 12', { size: 28, math: true, bold: true, color: 'ok' });
      k.tag(400, 420, '2-ге және 3-ке бөлінсе → 6-ға (5-ке емес)', { size: 18, fill: 'rsoft', stroke: 'red' });
    }]
  ];
});
})();
