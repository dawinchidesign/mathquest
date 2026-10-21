'use strict';
/* MathQuest · диаграммалар, интерактивті зертханалар, қосымша «Қатені тап» тапсырмалары. */

/* ---------- Есеп диаграммалары (visuals.js кеңейтеді) ---------- */
const CHART_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
function visual(v) {
  if (v.type === 'bars') {
    const max = Math.max(...v.values, 1) * 1.2, w = 300 / v.values.length;
    return `<svg class="chart" viewBox="0 0 360 165" role="img" aria-label="Диаграмма: ${v.labels.map((l, i) => l + ' ' + v.values[i]).join(', ')}"><path d="M30 10v125h315" class="axis"/>${v.values.map((n, i) => { const h = n / max * 95, x = 45 + i * w; return `<rect x="${x}" y="${135 - h}" width="${w * .55}" height="${h}" rx="3" style="fill:${CHART_COLORS[i % 4]}"/><text x="${x + w * .275}" y="${127 - h}" text-anchor="middle" class="t-val">${n}</text><text x="${x + w * .275}" y="155" text-anchor="middle" class="t-lab">${esc(v.labels[i])}</text>`; }).join('')}</svg>`;
  }
  if (v.type === 'rect') {
    const scale = Math.min(220 / v.w, 100 / v.h), w = v.w * scale, h = v.h * scale, x = (360 - w) / 2, y = 22 + (100 - h) / 2, id = `g${v.w}x${v.h}`;
    return `<svg class="chart" viewBox="0 0 360 165" role="img" aria-label="Тіктөртбұрыш: ${v.w} м және ${v.h} м"><defs><pattern id="${id}" x="${x}" y="${y}" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse"><path d="M${scale} 0H0V${scale}" fill="none" class="gridline"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" class="shape"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/><text x="180" y="${y + h + 22}" text-anchor="middle" class="t-val">${v.w} м</text><text x="${x - 22}" y="${y + h / 2 + 4}" text-anchor="middle" class="t-val">${v.h} м</text></svg>`;
  }
  return '';
}

/* ---------- Зертханалар ---------- */
const UNIT_SCALE = { mm: ['length', .001, 'мм'], cm: ['length', .01, 'см'], m: ['length', 1, 'м'], km: ['length', 1000, 'км'], g: ['mass', .001, 'г'], kg: ['mass', 1, 'кг'], t: ['mass', 1000, 'т'], s: ['time', 1, 'с'], min: ['time', 60, 'мин'], h: ['time', 3600, 'сағ'], cm2: ['area', .0001, 'см²'], m2: ['area', 1, 'м²'], ha: ['area', 10000, 'га'], l: ['volume', .001, 'л'], m3: ['volume', 1, 'м³'] };
const R = (id, label, min, max, value, step = 1, unit = '') => ({ id, label, min, max, value, step, unit });
const pretty = n => Number.isFinite(n) ? Number(n.toFixed(4)).toLocaleString('ru-RU') : '—';
const LABS = {
  numbers: { title: 'Санның паспорты', note: 'Бөлгіштерді, жұптықты, жай не құрама екенін бақыла.', controls: [R('xp-number', 'Зерттелетін сан', 1, 100, 24)],
    run: v => { const n = v['xp-number'], divs = Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0);
      return `<span class="sim-label">Сан</span><b class="sim-big math">${n}</b><div class="pills"><span>${n % 2 ? 'Тақ' : 'Жұп'}</span><span>${n === 1 ? 'Жай да, құрама да емес' : divs.length === 2 ? 'Жай сан' : 'Құрама сан'}</span></div><span class="sim-label">Бөлгіштері · ${divs.length}</span><div class="pills pills-num">${divs.map(d => `<b>${d}</b>`).join('')}</div>`; } },
  algebra: { title: 'Теңдеу теңгерімі', note: 'ax + b = c теңдеуінде бір шаманы өзгерту түбірге қалай әсер етеді?', controls: [R('xp-coef', 'x коэффициенті (a)', 1, 6, 3), R('xp-add', 'Қосылғыш (b)', -10, 10, 5), R('xp-total', 'Оң жағы (c)', 0, 40, 20)],
    run: v => { const a = v['xp-coef'], b = v['xp-add'], c = v['xp-total'];
      return `<span class="sim-label">Теңдікті сақта</span><div class="sim-eq math">${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${c}</div><div class="balance"><i></i><span class="math">${a}x</span><span class="math">${c - b}</span></div><div class="sim-ans">x = <b class="math">${pretty((c - b) / a)}</b></div><p class="sim-calc">${a}x = ${c} ${b >= 0 ? '−' : '+'} ${Math.abs(b)} = ${c - b} → x = ${c - b} / ${a}</p>`; } },
  percent: { title: 'Жеңілдік зертханасы', note: 'Баға мен жеңілдікті өзгертіп, төленетін соманы бақыла.', controls: [R('xp-base', 'Баға', 10000, 100000, 20000, 1000, '₸'), R('xp-pct', 'Жеңілдік', 1, 50, 15, 1, '%')],
    run: v => { const b = v['xp-base'], p = v['xp-pct'], d = b * p / 100;
      return `<span class="sim-label">Төленетін сома</span><b class="sim-big math">${fmt(b - d)} ₸</b><div class="split"><i style="width:${100 - p}%"></i><i class="is-off" style="width:${p}%"></i></div><div class="split-legend"><span>Төлем ${100 - p}%</span><span>Жеңілдік ${p}%</span></div><p class="sim-calc">${fmt(b)} − ${fmt(b)} × ${p}% = ${fmt(b)} − ${fmt(d)}</p>`; } },
  finance: { title: 'Жинақ зертханасы', note: 'Бір жылдық қарапайым пайыз. Комиссия есепке алынбайды.', controls: [R('xp-base', 'Бастапқы сома', 10000, 100000, 20000, 1000, '₸'), R('xp-pct', 'Жылдық пайыз', 1, 50, 15, 1, '%'), R('xp-years', 'Жыл саны', 1, 10, 1, 1, 'жыл')],
    run: v => { const b = v['xp-base'], p = v['xp-pct'], y = v['xp-years'], simple = b * (1 + p / 100 * y), comp = b * Math.pow(1 + p / 100, y);
      return `<span class="sim-label">${y} жылдан кейін</span><b class="sim-big math">${fmt(Math.round(comp))} ₸</b><dl class="sim-facts"><div><dt>Күрделі пайыз</dt><dd>${fmt(Math.round(comp))} ₸</dd></div><div><dt>Қарапайым пайыз</dt><dd>${fmt(Math.round(simple))} ₸</dd></div></dl><p class="sim-calc">${fmt(b)} × (1 + ${p / 100})<sup>${y}</sup></p>`; } },
  motion: { title: 'Жолды жоспарла', note: 's = v × t: жылдамдық пен уақыт қашықтықты қалай өзгертеді?', controls: [R('xp-speed', 'Жылдамдық', 10, 120, 60, 10, 'км/сағ'), R('xp-time', 'Уақыт', 1, 8, 3, 1, 'сағ')],
    run: v => { const s = v['xp-speed'] * v['xp-time'];
      return `<span class="sim-label">Қашықтық</span><b class="sim-big math">${fmt(s)} км</b><div class="road"><i style="left:${Math.min(92, s / 960 * 92)}%">➤</i></div><p class="sim-calc">${v['xp-speed']} × ${v['xp-time']} = ${s}</p>`; } },
  geometry: { title: 'Бөлмені жобала', note: 'Ұзындық пен енін өзгертіп, аудан мен периметрді салыстыр.', controls: [R('xp-w', 'Ұзындық', 2, 15, 12, 1, 'м'), R('xp-h', 'Ені', 2, 10, 5, 1, 'м')],
    run: v => { const w = v['xp-w'], h = v['xp-h'];
      return `${visual({ type: 'rect', w, h })}<dl class="sim-facts"><div><dt>Аудан</dt><dd class="math">S = ${w * h} м²</dd></div><div><dt>Периметр</dt><dd class="math">P = ${2 * (w + h)} м</dd></div></dl>`; } },
  probability: { title: 'Қаптағы шарлар', note: 'Барлығы 10 шар. Қызыл шар санын өзгерт.', controls: [R('xp-red', 'Қызыл шар', 0, 10, 3)],
    run: v => { const n = v['xp-red'];
      return `<div class="balls">${Array.from({ length: 10 }, (_, j) => `<i class="${j < n ? 'is-red' : ''}"></i>`).join('')}</div><span class="sim-label">Қызыл шар алу ықтималдығы</span><b class="sim-big math">${n} / 10 = ${n * 10}%</b>`; } },
  logic: { title: 'Тізбек құрастыр', note: 'Арифметикалық тізбекте әр мүшеге бірдей айырма қосылады.', controls: [R('xp-first', 'Алғашқы мүше', 1, 20, 3), R('xp-diff', 'Айырма', 1, 12, 4)],
    run: v => { const a = v['xp-first'], d = v['xp-diff'];
      return `<span class="sim-label">Арифметикалық тізбек</span><div class="seq">${Array.from({ length: 6 }, (_, i) => `<b class="math">${a + i * d}</b>`).join('<i>+' + d + '</i>')}</div><p class="sim-calc">aₙ = ${a} + (n − 1) · ${d} → a₁₀ = ${a + 9 * d}</p>`; } },
  data: { title: 'Орташа мән', note: 'Алғашқы үш мән: 10, 15, 20. Төртінші мәнді өзгертіп, орташа мән мен медиананы бақыла.', controls: [R('xp-data', '4-мән', 0, 50, 15)],
    run: v => { const n = v['xp-data'], arr = [10, 15, 20, n], s = [...arr].sort((a, b) => a - b);
      return `${visual({ type: 'bars', values: arr, labels: ['1', '2', '3', '4'] })}<dl class="sim-facts"><div><dt>Орташа мән</dt><dd>${pretty((45 + n) / 4)}</dd></div><div><dt>Медиана</dt><dd>${pretty((s[1] + s[2]) / 2)}</dd></div><div><dt>Құлаш</dt><dd>${s[3] - s[0]}</dd></div></dl>`; } },
  work: { title: 'Бассейнді толтыру', note: 'Бассейн көлемі 120 л. Таза өнімділік — кіріс пен шығыстың айырмасы.', controls: [R('xp-in', 'Құйылатын су', 1, 30, 12, 1, 'л/мин'), R('xp-out', 'Ағатын су', 0, 20, 4, 1, 'л/мин')],
    run: v => { const net = v['xp-in'] - v['xp-out'];
      return `<div class="tank"><i style="height:${net > 0 ? Math.min(90, 20 + net * 2) : 8}%"></i><b>${net} л/мин</b></div><div class="sim-ans">${net > 0 ? `Толтыру уақыты: <b class="math">${pretty(120 / net)} мин</b>` : net === 0 ? 'Су деңгейі өзгермейді.' : 'Кіріс шығыстан аз — бассейн толмайды.'}</div><p class="sim-calc">${v['xp-in']} − ${v['xp-out']} = ${net} л/мин</p>`; } },
  units: { title: 'Өлшемдерді түрлендір', note: 'Ұзындық, масса, уақыт, аудан немесе көлем бірліктерін таңда.', custom: () => `<label class="field"><span>Берілген мән</span><input id="xp-unit-value" class="input" inputmode="decimal" value="2.5"></label><div class="unit-pair"><label class="field"><span>Қай бірліктен</span><select class="select" id="xp-unit-from">${Object.entries(UNIT_SCALE).map(([k, u]) => `<option value="${k}" ${k === 'm' ? 'selected' : ''}>${u[2]}</option>`).join('')}</select></label><span aria-hidden="true">⇄</span><label class="field"><span>Қай бірлікке</span><select class="select" id="xp-unit-to">${Object.entries(UNIT_SCALE).map(([k, u]) => `<option value="${k}" ${k === 'cm' ? 'selected' : ''}>${u[2]}</option>`).join('')}</select></label></div>`,
    run: () => { const a = UNIT_SCALE[$('#xp-unit-from').value] || UNIT_SCALE.m, b = UNIT_SCALE[$('#xp-unit-to').value] || UNIT_SCALE.cm, n = parseNumeric($('#xp-unit-value').value);
      return a[0] !== b[0] ? '<span class="sim-label">Бірліктер сәйкес емес</span><b class="sim-big">⇄</b><p>Бір шаманы өлшейтін екі бірлікті таңда.</p>' : `<span class="sim-label">${pretty(n)} ${a[2]}</span><b class="sim-big math">${pretty(n * a[1] / b[1])} ${b[2]}</b><p class="sim-calc">Коэффициент: × ${pretty(a[1] / b[1])}</p>`; } },
  combinatorics: { title: 'Барлық нұсқаны көр', note: 'Әр жейде әр шалбармен жұптасады — көбейту ережесі.', controls: [R('xp-shirts', 'Жейде саны', 1, 6, 3), R('xp-pants', 'Шалбар саны', 1, 6, 4)],
    run: v => { const a = v['xp-shirts'], b = v['xp-pants'];
      return `<div class="outfits" style="--cols:${b}">${Array.from({ length: a }, (_, i) => Array.from({ length: b }, (_, j) => `<span style="--tint:${CHART_COLORS[i % 4]}">${i + 1}·${j + 1}</span>`).join('')).join('')}</div><div class="sim-ans math">${a} × ${b} = <b>${a * b}</b> нұсқа</div>`; } },
  sets: { title: 'Венн диаграммасы', note: 'Ортақ бөлік ешбір жиыннан үлкен бола алмайды.', controls: [R('xp-set-a', 'A жиыны', 5, 30, 18), R('xp-set-b', 'B жиыны', 5, 30, 14), R('xp-set-common', 'Ортақ элементтер', 0, 30, 6)],
    run: v => { const a = v['xp-set-a'], b = v['xp-set-b'], c = v['xp-set-common'];
      return c > Math.min(a, b) ? '<span class="sim-label">Шартты тексер</span><b class="sim-big">∩</b><p>Қиылысу әр жиынның өзінен үлкен бола алмайды. Ортақ элементтерді азайт.</p>' : `<svg viewBox="0 0 360 200" class="venn" role="img" aria-label="Тек A: ${a - c}, ортақ: ${c}, тек B: ${b - c}"><circle cx="145" cy="100" r="80" class="va"/><circle cx="215" cy="100" r="80" class="vb"/><text x="105" y="105">${a - c}</text><text x="180" y="105">${c}</text><text x="255" y="105">${b - c}</text><text x="88" y="28" class="vl">A</text><text x="266" y="28" class="vl">B</text></svg><div class="sim-ans math">n(A ∪ B) = ${a} + ${b} − ${c} = <b>${a + b - c}</b></div>`; } },
  mixtures: { title: 'Ерітінді шеберханасы', note: 'Таза су қосылғанда тұз массасы сақталады, толық масса артады.', controls: [R('xp-mm', 'Ерітінді массасы', 100, 1000, 200, 50, 'г'), R('xp-mp', 'Концентрация', 5, 50, 20, 5, '%'), R('xp-mw', 'Қосылатын су', 0, 1000, 200, 50, 'г')],
    run: v => { const m = v['xp-mm'], p = v['xp-mp'], w = v['xp-mw'], salt = m * p / 100, conc = salt / (m + w) * 100;
      return `<div class="beaker"><i style="height:${Math.min(88, (m + w) / 2000 * 70 + 18)}%;opacity:${.3 + conc / 80}"></i><b>${pretty(salt)} г тұз</b></div><div class="sim-ans">Жаңа концентрация: <b class="math">${pretty(conc)}%</b></div><p class="sim-calc">${pretty(salt)} / ${m + w} × 100%</p>`; } },
  practical: { title: 'Сапар бюджеті', note: 'Енгізген мәндер бойынша оқу есебі. Нақты бағалар қолданылмайды.', controls: [R('xp-km', 'Маршрут', 50, 1000, 300, 50, 'км'), R('xp-fuel', '100 км-ге шығын', 4, 15, 8, .5, 'л'), R('xp-price', 'Жанармай бағасы', 150, 400, 250, 10, '₸/л')],
    run: v => { const l = v['xp-km'] / 100 * v['xp-fuel'];
      return `<span class="sim-label">Жалпы құн</span><b class="sim-big math">${fmt(Math.round(l * v['xp-price']))} ₸</b><dl class="sim-facts"><div><dt>Жанармай</dt><dd>${pretty(l)} л</dd></div><div><dt>Қашықтық</dt><dd>${fmt(v['xp-km'])} км</dd></div></dl><p class="sim-calc">${v['xp-km']} / 100 × ${v['xp-fuel']} × ${v['xp-price']}</p>`; } }
};
let labId = '';
VIEWS.lab = id => {
  const m = moduleOf(id), L = LABS[id];
  if (!m || !L) return emptyBlock('Зертхана табылмады', 'Курстан бөлім таңда.', 'Курс', 'worlds');
  labId = id;
  const controls = L.custom ? L.custom() : L.controls.map(c => `<label class="lab-ctrl"><span>${c.label}<b id="${c.id}-label">${pretty(c.value)}${c.unit ? ' ' + c.unit : ''}</b></span><input type="range" id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" data-unit="${c.unit}"></label>`).join('');
  return `<section><a href="#lesson/${id}" class="back">${icon('back')} ${esc(m.title)}</a>
    <header class="page-head"><div><span class="nb-label">Зертхана · ${esc(m.title)}</span><h1>${L.title}</h1><p class="lede">${L.note}</p></div></header>
    <div class="lab" style="--mod:${m.color}"><div class="lab-controls">${controls}<p class="lab-tip">Бір шаманы ғана өзгертіп, нәтиженің қалай өзгеретінін бақыла.</p></div><div class="lab-sim" id="lab-sim" aria-live="polite"></div></div>
    <div class="lab-next"><p>Бақылағаныңды есепте қолданып көр.</p><button class="btn btn-primary" data-start="${id}">Бөлім бойынша жаттығу</button></div></section>`;
};
function updateLab() {
  const el = $('#lab-sim'), L = LABS[labId];
  if (!el || !L) return;
  const v = {};
  $$('.lab-ctrl input').forEach(i => { v[i.id] = +i.value; const b = $('#' + i.id + '-label'); if (b) b.textContent = pretty(+i.value) + (i.dataset.unit ? ' ' + i.dataset.unit : ''); });
  el.innerHTML = L.run(v);
}

/* ---------- Қосымша «Қатені тап» тапсырмалары ---------- */
ERROR_TASKS.push(
  { q: 'Есепте: 18 − 2 × (3 + 4).', lines: ['Жақша: 3 + 4 = 7.', 'Алдымен азайту: 18 − 2 = 16.', 'Соңында: 16 × 7 = 112.'], bad: 1, explain: 'Жақшадан кейін көбейту орындалады: 2 × 7 = 14. Дұрыс нәтиже: 18 − 14 = 4.' },
  { q: '500 г өнім 900 ₸, 750 г өнім 1 200 ₸. Қайсысының бірлік бағасы арзан?', lines: ['500 г қаптама 900 / 500 = 1,8 ₸/г.', '750 г қаптама 1 200 / 750 = 1,6 ₸/г.', 'Жалпы бағасы төмен болғандықтан 500 г қаптама бірлік бағамен арзан.'], bad: 2, explain: 'Бірлік бағамен салыстыр: 1,6 ₸/г < 1,8 ₸/г. Тиімдісі — 750 г қаптама.' },
  { q: '−3x ≥ 12 теңсіздігін шеш.', lines: ['Екі жағын да −3-ке бөлеміз.', 'Белгіні өзгертпей, x ≥ −4 аламыз.', 'Шешім: x ≥ −4.'], bad: 1, explain: 'Теріс санға бөлгенде теңсіздік белгісі өзгереді. Дұрыс шешім: x ≤ −4.' },
  { q: 'Бір шебер 6 сағатта, екіншісі 3 сағатта бітіреді. Бірлескен уақыт?', lines: ['Жеке уақыттар 6 және 3 сағат.', 'Бірлескен уақыт: (6 + 3) / 2.', 'Жауап: 4,5 сағат.'], bad: 1, explain: 'Уақыттарды орташаламаймыз. Өнімділік 1/6 + 1/3 = 1/2; уақыт 2 сағат.' },
  { q: '2 м² ауданды см²-ге айналдыр.', lines: ['1 м = 100 см.', 'Демек, 1 м² = 100 см².', '2 м² = 200 см².'], bad: 1, explain: 'Аудан үшін коэффициент квадратталады: 1 м² = 100 × 100 = 10 000 см². Сондықтан 2 м² = 20 000 см².' },
  { q: '9, 2, 4, 7, 3 қатарының медианасын тап.', lines: ['Берілген ретте ортадағы сан 4.', 'Реттеудің қажеті жоқ, сондықтан медиана 4.', 'Жауап: 4.'], bad: 0, explain: 'Алдымен қатарды реттеу керек: 2, 3, 4, 7, 9. Бұл мысалда жауап кездейсоқ дұрыс шықты, бірақ тәсіл қате.' },
  { q: 'Әкесі 36, баласы 12 жаста. 6 жылдан кейінгі жас қатынасы?', lines: ['Әкенің жасы: 36 + 6 = 42.', 'Баланың жасы: 12 + 6 = 18.', 'Бұрынғыдай қатынас 36 / 12 = 3 болып қалады.'], bad: 2, explain: 'Жас айырмасы 24 болып сақталады, қатынас сақталмайды. Жаңа қатынас 42 / 18 = 7/3.' },
  { q: '5 оқушыдан екі адамдық топ таңда.', lines: ['Бірінші оқушыға 5 таңдау.', 'Екінші оқушыға 4 таңдау.', 'Топ саны: 5 × 4 = 20.'], bad: 2, explain: 'Топта рет маңызды емес. Әр жұп екі рет саналды: 5 × 4 / 2 = 10 топ.' },
  { q: 'A-да 18, B-да 14, ортақ бөлігі 6 элемент. Бірігу қуаты?', lines: ['Жеке қуаттарды қосамыз: 18 + 14 = 32.', 'Ортақ бөлік екі рет саналды.', 'Ортақ бөлікті тағы қосамыз: 32 + 6 = 38.'], bad: 2, explain: 'Ортақ бөлікті бір рет алып тастау керек: 18 + 14 − 6 = 26.' },
  { q: '200 г 20% ерітіндіге 200 г таза су қосылды.', lines: ['Тұз массасы 200 × 0,2 = 40 г.', 'Жаңа толық масса 200 + 200 = 400 г.', 'Тұз үлесі өзгермейді: 20%.'], bad: 2, explain: 'Тұз массасы өзгермейді, үлесі өзгереді: 40 / 400 × 100% = 10%.' },
  { q: '23 зат әр қорапқа 5-тен салынады. Қорап саны?', lines: ['23 / 5 = 4,6.', 'Қорап саны бүтін болуы керек.', 'Төмен дөңгелектейміз: 4 қорап.'], bad: 2, explain: '4 қорапқа 20 зат қана сыяды. Барлық 23 зат сыюы үшін жоғары дөңгелектейміз: 5 қорап.' }
);
