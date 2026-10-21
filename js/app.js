'use strict';
/* MathQuest · негізгі қолданба: күй, синхрондау, маршруттар, оқушы беттері. */

/* ================= Утилиталар ================= */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n).toLocaleString('ru-RU');
const TZ = 'Asia/Almaty';
const dateKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const today = () => dateKey();
const yesterday = () => dateKey(new Date(Date.now() - 864e5));
const topic = id => TOPICS.find(t => t.id === id);
const question = id => BANK.find(q => q.id === id);
const moduleOf = id => CURRICULUM.find(m => m.id === id);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pad2 = n => String(n).padStart(2, '0');
const plural = (n, word) => `${fmt(n)} ${word}`;
const KZ_MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
function kzParts(d) {
  const o = {}; for (const p of new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(d))) o[p.type] = p.value;
  return o;
}
const longDate = d => { const p = kzParts(d); return `${+p.day} ${KZ_MONTHS[+p.month - 1]}`; };
const dateTime = d => { const p = kzParts(d); return `${+p.day} ${KZ_MONTHS[+p.month - 1]}, ${p.hour}:${p.minute}`; };
const csvDate = d => { const p = kzParts(d); return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`; };
function relTime(iso) {
  if (!iso) return 'әлі кірмеген';
  const diff = Date.now() - Date.parse(iso);
  if (diff < 0 || diff < 6e4) return 'жаңа ғана';
  const m = Math.floor(diff / 6e4), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 60) return `${m} мин бұрын`;
  if (h < 24) return `${h} сағ бұрын`;
  if (d === 1) return 'кеше';
  if (d < 30) return `${d} күн бұрын`;
  return longDate(new Date(iso));
}

const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  worlds: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/><path d="M9 8h7M9 11h5"/>',
  practice: '<path d="m14 3-2 7h7L9 21l2-9H4L14 3Z"/>',
  games: '<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  exam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
  progress: '<path d="M4 4v16h16"/><path d="m8 15 3.5-4 3 2.5L20 7"/>',
  badges: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
  tasks: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M14.5 9.5H17M14.5 15.5H17"/>',
  class: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.5 3-5.5 6-5.5s5.4 2 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.6c1.6.8 2.7 2.6 3 5.4"/>',
  tools: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"/>',
  account: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.6 2.8-5.6 4-9.3 2.7 1.6 3.6 4 3.2 6.2 1-.6 1.8-1.8 2-3 1.6 1.6 3.8 3.6 3.8 6.6 0 3.4-2.6 5.7-6.5 5.7Z"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  cloud: '<path d="M7 18h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 11 3.5 3.5 0 0 0 7 18Z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', board: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l4-4 4 4"/>',
  lab: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>'
};
const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.practice}</svg>`;

/* ================= Пайдаланушы мен күй ================= */
let me = null;            // профиль: {id, role, full_name, login, school}
let guestMode = false;
const isTeacher = () => me?.role === 'teacher';
const isStudent = () => me?.role === 'student';
const stateKey = () => me ? `mathquest-v2:${me.id}` : 'mathquest-v2';
const sessionKey = () => me ? `mathquest-session:${me.id}` : 'mathquest-session';

const emptyState = () => ({ version: 2, name: '', xp: 0, answered: 0, correct: 0, mastered: [], wrong: [], activity: {}, history: [], daily: {}, marathon: [], marathonDate: null, lessons: [], settings: { count: 5, level: 'all' } });
let storageOK = true;
function readStateFrom(key) {
  try { const d = JSON.parse(localStorage.getItem(key)); return d && d.version === 2 ? normalizeState(d) : emptyState(); }
  catch { storageOK = false; return emptyState(); }
}
function normalizeState(d) {
  const n = emptyState();
  for (const k of ['xp', 'answered', 'correct']) n[k] = Number.isFinite(d[k]) ? Math.max(0, Math.floor(d[k])) : 0;
  n.correct = Math.min(n.correct, n.answered);
  n.name = typeof d.name === 'string' ? d.name.slice(0, 40) : '';
  n.mastered = [...new Set(Array.isArray(d.mastered) ? d.mastered.filter(id => question(id)) : [])];
  n.xp = n.mastered.length * 10;
  n.wrong = [...new Set(Array.isArray(d.wrong) ? d.wrong.filter(id => question(id) && !n.mastered.includes(id)) : [])];
  n.lessons = [...new Set(Array.isArray(d.lessons) ? d.lessons.filter(id => typeof id === 'string') : [])];
  n.marathon = [...new Set(Array.isArray(d.marathon) ? d.marathon.filter(v => Number.isInteger(v) && v >= 1 && v <= 30) : [])].sort((a, b) => a - b);
  n.marathonDate = typeof d.marathonDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.marathonDate) ? d.marathonDate : null;
  for (const [k, v] of Object.entries(d.activity || {})) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && Number.isFinite(v.answered) && Number.isFinite(v.correct)) n.activity[k] = { answered: Math.max(0, Math.floor(v.answered)), correct: Math.max(0, Math.min(v.answered, Math.floor(v.correct))) };
  for (const [k, v] of Object.entries(d.daily || {})) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v.ok === 'boolean') n.daily[k] = { ok: v.ok, ...(question(v.qid) ? { qid: v.qid } : {}) };
  n.history = (Array.isArray(d.history) ? d.history : []).filter(h => h && Array.isArray(h.items) && h.items.length && h.items.every(i => i && question(i.id) && (i.answer === null || Number.isInteger(i.answer) && i.answer >= 0 && i.answer < question(i.id).o.length)) && typeof h.date === 'string' && Number.isFinite(Date.parse(h.date))).slice(0, 100).map(h => ({
    ...h, score: Math.max(0, Math.min(h.items.length, Number.isFinite(h.score) ? Math.floor(h.score) : 0)), total: h.items.length,
    time: Number.isFinite(h.time) ? Math.max(0, Math.floor(h.time)) : 0,
    mode: ['practice', 'exam', 'marathon'].includes(h.mode) ? h.mode : 'practice', topic: topic(h.topic) ? h.topic : 'mixed'
  }));
  if (d.settings && typeof d.settings === 'object') n.settings = { ...n.settings, ...d.settings };
  return n;
}
/* Екі құрылғының прогресін жоғалтпай біріктіру. */
function mergeStates(a, b) {
  if (!a) return normalizeState(b || emptyState());
  if (!b) return normalizeState(a);
  const m = emptyState();
  m.name = a.name || b.name;
  m.mastered = [...new Set([...(a.mastered || []), ...(b.mastered || [])])];
  m.wrong = [...new Set([...(a.wrong || []), ...(b.wrong || [])])].filter(id => !m.mastered.includes(id));
  m.answered = Math.max(a.answered || 0, b.answered || 0);
  m.correct = Math.max(a.correct || 0, b.correct || 0);
  for (const src of [a.activity || {}, b.activity || {}]) for (const [k, v] of Object.entries(src)) {
    const cur = m.activity[k] || { answered: 0, correct: 0 };
    m.activity[k] = { answered: Math.max(cur.answered, v.answered || 0), correct: Math.max(cur.correct, v.correct || 0) };
  }
  const seen = new Set();
  m.history = [...(a.history || []), ...(b.history || [])].filter(h => { const k = (h.id || '') + '|' + h.date; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => String(y.date).localeCompare(String(x.date))).slice(0, 100);
  m.daily = { ...(b.daily || {}), ...(a.daily || {}) };
  m.marathon = [...new Set([...(a.marathon || []), ...(b.marathon || [])])];
  m.marathonDate = [a.marathonDate, b.marathonDate].filter(Boolean).sort().pop() || null;
  m.lessons = [...new Set([...(a.lessons || []), ...(b.lessons || [])])];
  m.settings = { ...(b.settings || {}), ...(a.settings || {}) };
  return normalizeState(m);
}
const hasProgress = s => !!(s && (s.answered > 0 || s.mastered.length || s.history.length));

let state = emptyState(), session = null, result = null, timer = null, route = '';
function loadSession() {
  session = null;
  try {
    const s = JSON.parse(localStorage.getItem(sessionKey()));
    if (s && Array.isArray(s.items) && s.items.length && s.items.every(x => x && question(x.id) && Array.isArray(x.order)) && Number.isFinite(s.deadline) && Number.isFinite(s.started) && s.index >= 0 && s.index < s.items.length) session = s;
  } catch {}
}
function save() {
  try { localStorage.setItem(stateKey(), JSON.stringify(state)); }
  catch { storageOK = false; toast('Браузер прогресті сақтауға рұқсат бермеді.'); }
  if (me) Sync.schedule();
}
function saveSession() {
  try { session ? localStorage.setItem(sessionKey(), JSON.stringify(session)) : localStorage.removeItem(sessionKey()); } catch {}
}

/* ================= Есептеулер ================= */
const IDX = { topic: new Map(), lesson: new Map() };
function buildIndex() {
  IDX.topic.clear(); IDX.lesson.clear();
  for (const q of BANK) {
    if (!IDX.topic.has(q.topic)) IDX.topic.set(q.topic, []);
    IDX.topic.get(q.topic).push(q.id);
    if (q.lessonId) { if (!IDX.lesson.has(q.lessonId)) IDX.lesson.set(q.lessonId, []); IDX.lesson.get(q.lessonId).push(q.id); }
  }
}
const pct = (ids, s) => { if (!ids?.length) return 0; const set = new Set(s.mastered); return Math.round(ids.filter(id => set.has(id)).length / ids.length * 100); };
const masteryOf = (s, moduleId) => pct(IDX.topic.get(moduleId), s);
const lessonMasteryOf = (s, lessonId) => pct(IDX.lesson.get(lessonId), s);
const mastery = id => masteryOf(state, id);
const lessonMastery = id => lessonMasteryOf(state, id);
const lessonTasks = id => (IDX.lesson.get(id) || []).map(question);
const courseCompleted = () => COURSE_LESSONS.filter(l => lessonMastery(l.id) === 100).length;
const accuracyOf = s => s.answered ? Math.round(s.correct / s.answered * 100) : 0;
const attempts = () => accuracyOf(state);
const level = () => Math.floor(state.xp / 100) + 1;
const LEVEL_NAMES = ['Жас зерттеуші', 'Есеп іздеуші', 'Ой шебері', 'Білім навигаторы', 'Математика шебері'];
const levelName = () => LEVEL_NAMES[Math.min(level() - 1, 4)];
function streakOf(s) {
  const dates = Object.keys(s.activity).filter(d => s.activity[d].answered > 0).sort().reverse();
  if (!dates.length || dates[0] !== today() && dates[0] !== yesterday()) return 0;
  let n = 0, d = new Date(dates[0] + 'T12:00:00+05:00');
  while (s.activity[dateKey(d)]?.answered > 0) { n++; d = new Date(d.getTime() - 864e5); }
  return n;
}
const streak = () => streakOf(state);
function progressSummary(s) {
  const module_mastery = {}, lesson_mastery = {};
  for (const m of CURRICULUM) module_mastery[m.id] = masteryOf(s, m.id);
  let lessons_done = 0;
  for (const l of COURSE_LESSONS) { const v = lessonMasteryOf(s, l.id); if (v) lesson_mastery[l.id] = v; if (v === 100) lessons_done++; }
  const days = Object.keys(s.activity).filter(d => s.activity[d].answered > 0).sort();
  const lastHist = s.history[0]?.date;
  const lastDay = days.length ? new Date(days[days.length - 1] + 'T18:00:00+05:00').toISOString() : null;
  const last_active = [lastHist, lastDay].filter(Boolean).sort().pop() || null;
  return { xp: s.xp, answered: s.answered, correct: s.correct, mastered_count: s.mastered.length, lessons_done, streak: streakOf(s), module_mastery, lesson_mastery, last_active };
}

/* ================= Прогресті сақтау ================= */
const Sync = (() => {
  let t = null, dirty = false, busy = false, status = 'idle', lastSaved = null;
  const label = () => ({ idle: 'Сақталды', saving: 'Сақталуда…', saved: 'Сақталды', offline: 'Желі жоқ · кейін жіберіледі', error: 'Сақталмады · қайталанады' }[status]);
  function paint() {
    const el = $('#sync'); if (!el) return;
    el.hidden = !me;
    el.dataset.status = status;
    el.title = lastSaved ? 'Соңғы сақтау: ' + dateTime(lastSaved).split(', ')[1] : '';
    el.innerHTML = `${icon('cloud')}<span>${label()}</span>`;
  }
  function set(s) { status = s; paint(); }
  function schedule(delay = 1500) { dirty = true; clearTimeout(t); t = setTimeout(flush, delay); }
  async function flush() {
    clearTimeout(t);
    if (!me || !dirty || busy) return;
    if (Cloud.mode === 'server' && navigator.onLine === false) { set('offline'); return; }
    busy = true; dirty = false; set('saving');
    try { await Cloud.saveProgress(state, progressSummary(state)); lastSaved = Date.now(); set('saved'); }
    catch (e) {
      dirty = true; set(e.code === 'network' ? 'offline' : 'error');
      if (e.code === 'unauthorized') { toast(cloudErrorText(e)); me = null; showAuth({ tab: 'login' }); return; }
      clearTimeout(t); t = setTimeout(flush, 20000);
    }
    finally { busy = false; }
  }
  window.addEventListener('online', () => { if (dirty) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  return { schedule, flush, paint, set, get pending() { return dirty; } };
})();

/* ================= UI көмекшілері ================= */
let toastTimer;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3800); }
function modal(title, body, buttons, opts = {}) {
  const m = $('#modal');
  m.className = 'modal' + (opts.wide ? ' modal-wide' : '') + (opts.cls ? ' ' + opts.cls : '');
  $('#modal-content').innerHTML = `<button class="modal-x" data-modal="close" aria-label="Жабу">${icon('close')}</button><h2>${esc(title)}</h2><div class="modal-body">${body}</div>${buttons ? `<div class="modal-actions">${buttons}</div>` : ''}`;
  if (!m.open) m.showModal();
  m.querySelector('input,select,textarea')?.focus();
}
const closeModal = () => { const m = $('#modal'); if (m.open) m.close(); };
function confirmModal(title, text, okLabel, onOk, danger = false) {
  modal(title, `<p>${esc(text)}</p>`, `<button class="btn btn-quiet" data-modal="close">Болдырмау</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${esc(okLabel)}</button>`);
  $('#confirm-ok').onclick = async () => { $('#confirm-ok').disabled = true; try { await onOk(); } finally { closeModal(); } };
}
const meter = (v, color) => `<span class="meter" role="img" aria-label="${v}%"><i style="width:${v}%${color ? ';background:' + color : ''}"></i></span>`;
function emptyBlock(title, text, label, to) {
  return `<section class="empty"><div class="empty-mark" aria-hidden="true">∅</div><h2>${esc(title)}</h2><p>${esc(text)}</p>${label ? `<a class="btn btn-primary" href="#${to}">${esc(label)}</a>` : ''}</section>`;
}
const pageHead = (title, desc, extra = '') => `<header class="page-head"><div><h1>${title}</h1>${desc ? `<p class="lede">${desc}</p>` : ''}</div>${extra}</header>`;
function glyph(m, size = '') { return `<span class="glyph ${size}" style="--mod:${m.color}" aria-hidden="true">${m.symbol}</span>`; }
const firstName = n => String(n || '').trim().split(/\s+/)[0] || '';
const displayName = () => me ? firstName(me.full_name) : state.name;
function cloudErrorText(e, ctx) {
  const map = {
    invalid_credentials: 'Логин немесе құпиясөз қате.',
    login_taken: 'Бұл логин бос емес. Басқасын таңдаңыз.',
    email_taken: 'Бұл email бұрын тіркелген. «Кіру» бетіне өтіңіз.',
    class_not_found: 'Мұндай кодпен сынып табылмады. Кодты мұғалімнен қайта сұраңыз.',
    weak_password: 'Құпиясөз кемінде 6 таңбадан тұруы керек.',
    bad_login: 'Логин 3–24 таңбадан тұрады: латын әріптері, сандар, нүкте, сызықша.',
    bad_email: 'Email дұрыс жазылмаған.',
    name_required: 'Аты-жөніңізді жазыңыз.',
    network: 'Интернет байланысы жоқ. Байланысты тексеріп, қайталаңыз.',
    email_not_confirmed: 'Email әлі расталмаған. Поштаңыздағы хатты ашыңыз.',
    rate_limit: 'Әрекет тым жиі қайталанды. Бір минуттан кейін көріңіз.',
    forbidden: 'Бұл әрекетке рұқсат жоқ.',
    only_students: 'Сыныпқа тек оқушы аккаунты қосыла алады.',
    signup_disabled: 'Бұл сайтта тіркелу өшірілген. Әкімшіге хабарласыңыз.',
    storage: 'Браузер деректерді сақтауға рұқсат бермеді.',
    unauthorized: 'Сессия аяқталды. Қайта кіріңіз.',
    server: 'Сервер уақытша жауап бермейді. Біраздан кейін қайталаңыз.',
    storage_missing: 'Сервердің дерекқоры қосылмаған (Vercel → Storage → Upstash Redis).',
    too_large: 'Прогресс тым үлкен, сақталмады.'
  };
  return map[e?.code] || 'Бірдеңе дұрыс болмады. Қайталап көріңіз.' + (e?.message && e.code === 'unknown' ? ` (${e.message.slice(0, 120)})` : '');
}

/* ================= Навигация ================= */
const NAV_STUDENT = [['home', 'Басты бет'], ['tasks', 'Тапсырмалар'], ['worlds', 'Курс'], ['games', 'Миссиялар'], ['practice', 'Жаттығу'], ['exam', 'ҰБТ сынағы'], ['progress', 'Прогресім'], ['badges', 'Жетістіктер']];
const NAV_TEACHER = [['class', 'Сынып журналы'], ['worlds', 'Курс'], ['games', 'Миссиялар'], ['practice', 'Жаттығу'], ['tools', 'Құралдар']];
const PAGE_NAMES = { home: 'Басты бет', tasks: 'Тапсырмалар', worlds: 'Курс', games: 'Миссиялар', practice: 'Жаттығу', exam: 'ҰБТ сынағы', progress: 'Прогресім', badges: 'Жетістіктер', class: 'Сынып журналы', tools: 'Мұғалім құралдары', account: 'Аккаунт', quiz: 'Жаттығу', result: 'Нәтиже', marathon: '30 күндік марафон', errors: 'Қатені тап', mistakes: 'Қателермен жұмыс', lesson: 'Бөлім', learn: 'Тақырып', lab: 'Зертхана' };
let pendingTasks = 0;
function navItems() { return isTeacher() ? NAV_TEACHER : NAV_STUDENT.filter(([id]) => id !== 'tasks' || isStudent()); }
function activeNav(r) {
  const head = r.split('/')[0];
  if (['lesson', 'learn', 'lab'].includes(head)) return 'worlds';
  if (['quiz', 'result', 'errors', 'mistakes', 'marathon'].includes(head)) return 'practice';
  return head;
}
function updateChrome() {
  const act = activeNav(route);
  $('#nav').innerHTML = navItems().map(([id, label]) => `<a href="#${id}" class="nav-link ${act === id ? 'is-active' : ''}" ${act === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span>${id === 'tasks' && pendingTasks ? `<b class="nav-count">${pendingTasks}</b>` : ''}</a>`).join('');
  const who = me ? esc(me.full_name) : 'Қонақ';
  const roleLabel = me ? (isTeacher() ? 'Мұғалім' : 'Оқушы' + (me.login ? ' · ' + esc(me.login) : '')) : 'Прогресс тек осы құрылғыда';
  $('#side-foot').innerHTML = `<a href="#account" class="me-card ${route === 'account' ? 'is-active' : ''}"><span class="avatar">${esc((me?.full_name || state.name || 'Қ').trim()[0] || 'Қ').toUpperCase()}</span><span><b>${who}</b><small>${roleLabel}</small></span></a>${me ? `<button class="side-out" data-action="sign-out" aria-label="Шығу" title="Шығу">${icon('logout')}</button>` : `<button class="btn btn-sm btn-primary side-join" data-action="show-auth">Кіру</button>`}`;
  $('#crumb').textContent = PAGE_NAMES[route.split('/')[0]] || PAGE_NAMES[act] || '';
  const showXP = !isTeacher();
  $('#top-stats').innerHTML = showXP ? `<span class="tstat" title="Белсенді күндер қатары">${icon('flame')}<b>${streak()}</b><small>күн</small></span><span class="tstat gold" title="Тәжірибе ұпайы">✦<b>${fmt(state.xp)}</b><small>XP</small></span>` : '';
  const dark = document.documentElement.dataset.theme === 'dark';
  $('#theme-btn').innerHTML = icon(dark ? 'sun' : 'moon');
  $('#theme-btn').setAttribute('aria-label', dark ? 'Жарық тақырып' : 'Қараңғы тақырып');
  Sync.paint();
}
function routeTo(r) { if (location.hash === '#' + r) render(); else location.hash = r; }

const VIEWS = {};
let renderToken = 0;
function render() {
  clearInterval(timer);
  const token = ++renderToken;
  route = location.hash.slice(1) || (isTeacher() ? 'class' : 'home');
  if (isTeacher() && route === 'home') route = 'class';
  $('#shell').classList.remove('nav-open');
  updateChrome();
  const [head, ...rest] = route.split('/');
  const view = VIEWS[head] || VIEWS.home;
  let html;
  try { html = view(...rest); } catch (e) { console.error(e); html = emptyBlock('Бет ашылмады', 'Басты бетке оралып, қайталап көріңіз.', 'Басты бет', 'home'); }
  const main = $('#main');
  if (html instanceof Promise) {
    main.innerHTML = '<div class="loading" role="status"><span></span>Жүктелуде…</div>';
    html.then(h => { if (token === renderToken) { main.innerHTML = h; afterRender(); } })
      .catch(e => { if (token === renderToken) main.innerHTML = emptyBlock('Деректер жүктелмеді', cloudErrorText(e), 'Қайталау', route); });
  } else { main.innerHTML = (!storageOK ? '<p class="note-bar">Браузер деректерді сақтамайды: прогресс бет жабылғанда жоғалуы мүмкін.</p>' : '') + html; afterRender(); }
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function afterRender() {
  if (route === 'quiz' && session) { tick(); timer = setInterval(tick, 500); }
  if (route.startsWith('lab/')) updateLab();
  document.dispatchEvent(new CustomEvent('mq:rendered', { detail: route }));
}
function reflow() { const y = window.scrollY; render(); window.scrollTo({ top: y, behavior: 'instant' }); }

/* ================= Беттер: басты бет ================= */
function dailyQ() {
  const saved = state.daily[today()];
  if (saved?.qid && question(saved.qid)) return question(saved.qid);
  const qs = BANK.filter(q => !q.mission && (!q.type || q.type === 'choice'));
  let h = 0; for (const c of today()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return qs[h % qs.length];
}
let dailySelection = null;
function nextLesson() { return COURSE_LESSONS.find(l => lessonMastery(l.id) < 100) || COURSE_LESSONS[0]; }
function statStrip() {
  return `<div class="stat-strip">
    <div class="stat"><span class="stat-k">Тәжірибе</span><b class="gold">${fmt(state.xp)}<small> XP</small></b><span class="stat-n">${levelName()} · ${level()}-деңгей</span>${meter(state.xp % 100, 'var(--gold)')}</div>
    <div class="stat"><span class="stat-k">Дәлдік</span><b>${state.answered ? attempts() + '%' : '—'}</b><span class="stat-n">${fmt(state.answered)} жауаптан</span></div>
    <div class="stat"><span class="stat-k">Меңгерілген тақырып</span><b>${courseCompleted()}<small> / ${COURSE_LESSONS.length}</small></b><span class="stat-n">${state.mastered.length} бірегей дұрыс есеп</span></div>
    <div class="stat"><span class="stat-k">Қатарынан</span><b>${streak()}<small> күн</small></b><span class="stat-n">${state.activity[today()]?.answered ? 'Бүгін белсендісің' : 'Бүгін бір есеп шығар'}</span></div>
  </div>`;
}
function moduleTile(m) {
  const pc = mastery(m.id), count = (IDX.topic.get(m.id) || []).length;
  return `<a href="#lesson/${m.id}" class="mod-tile" style="--mod:${m.color}">${glyph(m)}<span class="mod-num">${pad2(m.number)}</span><h3>${esc(m.title)}</h3><p>${m.lessons.length} тақырып · ${count} тапсырма</p><div class="mod-foot">${meter(pc, m.color)}<small>${pc}%</small></div></a>`;
}
function dailyBlock() {
  const q = dailyQ(), done = state.daily[today()];
  return `<div class="daily" id="daily-card"><div class="daily-head"><span>Күннің есебі · ${longDate(new Date())}</span><span class="chip ${done ? (done.ok ? 'chip-ok' : 'chip-red') : 'chip-gold'}">${done ? (done.ok ? 'Дұрыс' : 'Орындалды') : '+10 XP'}</span></div>
    <p class="daily-q">${esc(q.q)}</p>${q.visual ? `<div class="daily-visual">${visual(q.visual)}</div>` : ''}
    ${done ? `<div class="feedback ${done.ok ? 'is-ok' : 'is-miss'}"><p>${esc(q.e)}</p></div>` : `<div class="daily-opts">${q.o.map((o, i) => `<button class="daily-opt ${dailySelection === i ? 'is-selected' : ''}" data-daily="${i}"><b>${'ABCD'[i]}</b>${esc(o)}</button>`).join('')}</div><div class="daily-foot"><small>Бір есеп — бір жаңа түсінік.</small><button class="btn btn-primary btn-sm" id="daily-check" data-action="daily-check" ${dailySelection === null ? 'disabled' : ''}>Тексеру</button></div>`}</div>`;
}
let studentTasks = null, tasksLoadedAt = 0;
async function loadStudentTasks(force) {
  if (!isStudent()) return [];
  if (!force && studentTasks && Date.now() - tasksLoadedAt < 60000) return studentTasks;
  try { studentTasks = await Cloud.studentAssignments(); tasksLoadedAt = Date.now(); }
  catch { studentTasks = studentTasks || []; }
  pendingTasks = studentTasks.filter(a => assignmentProgress(a) < 100).length;
  return studentTasks;
}
const assignmentProgress = (a, lm) => {
  const ids = a.lesson_ids || [];
  if (!ids.length) return 0;
  return Math.round(ids.reduce((s, id) => s + (lm ? (lm[id] || 0) : lessonMastery(id)), 0) / ids.length);
};
function dueLabel(d) {
  if (!d) return 'Мерзімсіз';
  const days = Math.round((Date.parse(d + 'T23:59:00+05:00') - Date.now()) / 864e5);
  if (days < 0) return 'Мерзімі өтті';
  if (days === 0) return 'Бүгін тапсыру';
  if (days === 1) return 'Ертең тапсыру';
  return `${days} күн қалды`;
}
VIEWS.home = () => {
  const nl = nextLesson(), m = moduleOf(nl.moduleId), name = displayName();
  const open = (studentTasks || []).filter(a => assignmentProgress(a) < 100);
  return `<section class="home">
    <div class="home-hello"><div><h1>${name ? 'Сәлем, ' + esc(name) + '!' : 'Сәлем!'}</h1><p class="lede">${state.answered ? 'Бүгін тағы бір қадам жасайық.' : 'Математикалық сауаттылыққа алғашқы қадамыңды жаса.'}</p></div>${!me ? `<button class="btn btn-quiet" data-action="show-auth">Прогресті сақтау үшін тіркел</button>` : ''}</div>
    <div class="notebook">
      <div class="nb-main">
        <span class="nb-label">Келесі қадам</span>
        <h2 class="nb-title">${esc(nl.title)}</h2>
        <p class="nb-sub">${glyph(m, 'glyph-sm')} ${esc(m.title)} · ${lessonMastery(nl.id)}% меңгерілді</p>
        <p class="nb-rule">${esc(nl.rule)}</p>
        <div class="nb-actions"><a class="btn btn-primary btn-lg" href="#learn/${nl.id}">Тақырыпты бастау</a><button class="btn btn-quiet btn-lg" data-action="start-mixed">5 аралас есеп</button></div>
        ${session ? `<button class="resume" data-route="quiz"><span class="pulse"></span>Аяқталмаған жаттығуың бар · жалғастыру</button>` : ''}
      </div>
      <div class="nb-side">${dailyBlock()}</div>
    </div>
    ${open.length ? `<div class="task-strip"><div><span class="nb-label">Мұғалімнің тапсырмасы</span><h3>${esc(open[0].title)}</h3><p>${esc(open[0].classes?.name || '')} · ${dueLabel(open[0].due_date)}${open.length > 1 ? ` · тағы ${open.length - 1} тапсырма` : ''}</p></div><div class="task-strip-meter">${meter(assignmentProgress(open[0]), 'var(--ink)')}<small>${assignmentProgress(open[0])}%</small></div><a class="btn btn-primary" href="#tasks">Ашу</a></div>` : ''}
    ${statStrip()}
    <div class="section-head"><div><h2>Курс бөлімдері</h2><p>15 бөлім, ${COURSE_LESSONS.length} тақырып. Кез келгенінен бастауға болады.</p></div><a class="link" href="#worlds">Барлық бөлім ${icon('arrow')}</a></div>
    <div class="mod-grid">${CURRICULUM.slice(0, 6).map(moduleTile).join('')}</div>
    <div class="duo">
      <a href="#marathon" class="feature feature-ink"><span class="feature-big">30</span><div><h3>Күндік марафон</h3><p>Күніне 5 есеп. ${state.marathon.length} / 30 кезең аяқталды.</p>${meter(Math.round(state.marathon.length / 30 * 100), 'var(--gold)')}</div></a>
      <a href="#errors" class="feature"><span class="feature-big math">x?</span><div><h3>Қатені тап</h3><p>Дайын шешімдегі қате қадамды анықта — ойлау жолын жаттықтыр.</p></div></a>
    </div>
  </section>`;
};

/* ================= Курс ================= */
let courseFilter = '', worldMode = 'grid';
VIEWS.worlds = () => `<section>${pageHead('Курс', `15 бөлім, ${COURSE_LESSONS.length} тақырып, ${BANK.length} тапсырма. Әр тақырыпта түсіндірме, екі есеп және ойды тексеру бар.`)}
  <div class="toolbar"><label class="search">${icon('search')}<input class="input" id="course-search" value="${esc(courseFilter)}" placeholder="Тақырып іздеу: медиана, пайыз, Венн…" aria-label="Тақырып іздеу"></label>
  <div class="seg" role="tablist"><button data-worldmode="grid" class="${worldMode === 'grid' ? 'is-on' : ''}">Бөлімдер</button><button data-worldmode="path" class="${worldMode === 'path' ? 'is-on' : ''}">Оқу жолы</button></div></div>
  <div id="course-results">${courseResults()}</div></section>`;
function courseResults() {
  const v = courseFilter.toLocaleLowerCase().trim();
  if (v) {
    const matched = COURSE_LESSONS.filter(l => (l.title + ' ' + l.moduleTitle).toLocaleLowerCase().includes(v));
    return matched.length ? `<div class="lesson-list">${matched.map(lessonRow).join('')}</div>` : emptyBlock('Тақырып табылмады', 'Басқа сөзбен іздеп көр: пайыз, аудан, теңдеу.', '', '');
  }
  if (worldMode === 'grid') return `<div class="mod-grid">${CURRICULUM.map(moduleTile).join('')}</div>`;
  return `<ol class="path">${CURRICULUM.map(m => `<li><a href="#lesson/${m.id}" class="path-step" style="--mod:${m.color}"><span class="path-dot">${mastery(m.id) === 100 ? '✓' : pad2(m.number)}</span><div><h3>${esc(m.title)}</h3><p>${m.lessons.length} тақырып · ${mastery(m.id)}% меңгерілді</p></div>${meter(mastery(m.id), m.color)}</a></li>`).join('')}</ol>`;
}
function lessonRow(l) {
  const done = lessonMastery(l.id);
  return `<a href="#learn/${l.id}" class="lesson-row ${done === 100 ? 'is-done' : ''}"><span class="lesson-n">${l.id.split('-').pop()}</span><div><h3>${esc(l.title)}</h3><small>${esc(l.moduleTitle || moduleOf(l.moduleId)?.title || '')}</small></div><span class="lesson-state">${done === 100 ? icon('check') + ' Меңгерілді' : done ? done + '%' : '3 тапсырма'}</span></a>`;
}
VIEWS.lesson = id => {
  const m = moduleOf(id);
  if (!m) return emptyBlock('Бөлім табылмады', 'Курстан бөлім таңда.', 'Курс', 'worlds');
  const first = m.lessons.find(l => lessonMastery(l.id) < 100) || m.lessons[0];
  return `<section><a href="#worlds" class="back">${icon('back')} Курс</a>
    <div class="mod-hero" style="--mod:${m.color}">${glyph(m, 'glyph-xl')}<div><span class="nb-label">${pad2(m.number)}-бөлім</span><h1>${esc(m.title)}</h1><p class="lede">${m.lessons.length} тақырып · ${(IDX.topic.get(id) || []).length} тапсырма · ${mastery(id)}% меңгерілді</p>
    <div class="btn-row"><a href="#learn/${first.id}" class="btn btn-primary">${lessonMastery(first.id) ? 'Жалғастыру' : 'Бірінші тақырыптан бастау'}</a><button class="btn btn-quiet" data-start="${id}">Аралас жаттығу</button><a class="btn btn-ghost" href="#lab/${id}">${icon('lab')} Зертхана</a><button class="btn btn-ghost" data-module-missions="${id}">${icon('games')} Миссиялар</button></div></div></div>
    <div class="lesson-list">${m.lessons.map(l => lessonRow({ ...l, moduleTitle: m.title })).join('')}</div></section>`;
};
let learningStep = 0, learningId = '';
VIEWS.learn = id => {
  const l = courseLesson(id);
  if (!l) return emptyBlock('Тақырып табылмады', 'Курсқа оралып, тақырып таңда.', 'Курс', 'worlds');
  if (learningId !== id) { learningId = id; learningStep = 0; if (!state.lessons.includes(id)) { state.lessons.push(id); save(); } }
  const m = moduleOf(l.moduleId);
  const steps = [['Түсін', 'Ереже'], ['Есепте', 'Бірінші есеп'], ['Қолдан', 'Өмірдегі есеп'], ['Тексер', 'Қате пікір']];
  const s = learningStep, tasks = lessonTasks(id);
  let body;
  if (s === 0) body = `<p class="rule-text">${esc(l.rule)}</p>`;
  else if (s === 3) body = `<p class="trap"><s>${esc(l.trap)}</s></p><p>Бұл пікір қате. ${esc(l.rule)}</p>`;
  else { const p = l.problems[s - 1]; body = `<p class="problem">${esc(p.q)}</p>${stepList(p.steps)}<p class="answer-line">Жауабы: <b class="math">${esc(String(p.answer).replace('.', ','))}</b></p>`; }
  return `<section><a href="#lesson/${m.id}" class="back">${icon('back')} ${esc(m.title)}</a>
    <header class="learn-head"><h1>${esc(l.title)}</h1><span class="chip">${lessonMastery(id)}% меңгерілді</span></header>
    <div class="learn-grid">
      <div class="learn-page" style="--mod:${m.color}">
        <ol class="stepper">${steps.map(([a, b], i) => `<li><button data-learning-step="${i}" class="${i === s ? 'is-on' : i < s ? 'is-past' : ''}" ${i === s ? 'aria-current="step"' : ''}><span>${i < s ? '✓' : i + 1}</span>${a}</button></li>`).join('')}</ol>
        <div class="learn-sheet"><span class="nb-label">${steps[s][1]}</span>${body}</div>
        <div class="learn-nav"><button class="btn btn-quiet" data-learning-move="-1" ${s === 0 ? 'disabled' : ''}>Артқа</button><span>${s + 1} / 4</span>${s < 3 ? '<button class="btn btn-primary" data-learning-move="1">Келесі</button>' : `<button class="btn btn-primary" data-course-start="${id}">Білімді бекіту</button>`}</div>
      </div>
      <aside class="learn-side">
        <div class="side-card"><h3>Бекіту тапсырмалары</h3><ol class="mini-tasks">${tasks.map(q => `<li class="${state.mastered.includes(q.id) ? 'is-done' : ''}"><span>${state.mastered.includes(q.id) ? '✓' : ''}</span>${FORMAT_LABELS[q.type || 'choice']}</li>`).join('')}</ol><button class="btn btn-primary btn-block" data-course-start="${id}">${tasks.length} тапсырманы орындау</button></div>
        <a href="#lab/${m.id}" class="side-link">${icon('lab')}<span><b>Зертханада зертте</b><small>Шамаларды өзгертіп, байланысты көр.</small></span></a>
        <p class="side-note">Қате жауап — тоқтайтын жер емес. Әр есептен кейін шешу жолын көресің.</p>
      </aside>
    </div></section>`;
};
function stepList(steps) { return `<ol class="steps">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`; }

/* ================= Жаттығу, миссиялар, сынақ ================= */
const FORMAT_LABELS = { choice: 'Бір жауап', number: 'Санды енгіз', tf: 'Ақиқат па?', multi: 'Бірнеше жауап', match: 'Сәйкестендір', order: 'Ретін қалпына келтір', plot: 'Нүктені белгіле', range: 'Шаманы бапта' };
const FORMAT_SYMBOLS = { choice: '◉', number: '123', tf: '✓×', multi: '☷', match: '⇄', order: '↕', plot: '⊕', range: '⌁' };
function recommended() { return [...CURRICULUM].sort((a, b) => mastery(a.id) - mastery(b.id))[0]; }
VIEWS.practice = () => {
  const r = recommended();
  return `<section>${pageHead('Жаттығу', 'Өз қарқыныңмен жаттық. Әр есептен кейін толық шешімін көресің.')}
  <div class="practice-grid">
    <div class="sheet build" id="practice-config"><h2>Жаттығу құрастыр</h2>
      <div class="form-grid"><label class="field"><span>Бөлім</span><select id="practice-topic" class="select"><option value="mixed">Барлық бөлім · аралас</option>${CURRICULUM.map(m => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select></label>
      <label class="field"><span>Күрделілік</span><select id="practice-level" class="select"><option value="all">Барлық деңгей</option><option value="1">Негізгі</option><option value="2">Қолдану</option><option value="3">Күрделі</option></select></label>
      <label class="field"><span>Есеп саны</span><select id="practice-count" class="select"><option value="5">5 есеп · 5 мин</option><option value="10">10 есеп · 10 мин</option><option value="15">15 есеп · 15 мин</option></select></label></div>
      <button class="btn btn-primary" data-action="custom-practice">Жаттығуды бастау</button></div>
    <div class="sheet tint"><span class="nb-label">Саған ұсыныс</span><h2>${esc(r.title)}</h2><p>${state.answered ? `Бұл бөлімде меңгеру үлесің ${mastery(r.id)}%. Түсіндірмеден бастап, 5 есеппен бекіт.` : 'Алғашқы қадам үшін түсіндірмеден баста.'}</p><a class="btn btn-quiet" href="#lesson/${r.id}">Бөлімге өту</a></div>
  </div>
  <div class="mode-row">
    <a class="mode" href="#games"><span class="mode-sym">⇄</span><h3>Интерактивті миссиялар</h3><p>Сәйкестендір, ретте, нүкте белгіле — ${MISSION_BANK.length} миссия.</p></a>
    <a class="mode" href="#errors"><span class="mode-sym math">x?</span><h3>Қатені тап</h3><p>Дайын шешімдегі алғашқы қате қадамды анықта.</p></a>
    <a class="mode" href="#mistakes"><span class="mode-sym">↻</span><h3>Қателермен жұмыс</h3><p>${state.wrong.length ? `${state.wrong.length} есепті қайта шығар.` : 'Қате шыққан есептер осында жиналады.'}</p></a>
    <a class="mode" href="#marathon"><span class="mode-sym">30</span><h3>Марафон</h3><p>Күн сайын 5 есеп, 30 кезең.</p></a>
  </div></section>`;
};
let gameFilter = 'all', gameModule = 'all';
VIEWS.games = () => `<section>${pageHead('Интерактивті миссиялар', `Есептеуден бөлек: байланыс құр, ретте, жікте, координата белгіле. 15 бөлімде ${MISSION_BANK.length} миссия.`)}
  <div class="toolbar"><div class="seg seg-wrap">${['all', 'match', 'multi', 'order', 'plot', 'range'].map(k => `<button data-game-format="${k}" class="${gameFilter === k ? 'is-on' : ''}">${k === 'all' ? 'Барлығы' : FORMAT_SYMBOLS[k] + ' ' + FORMAT_LABELS[k]}</button>`).join('')}</div>
  <select id="game-module" class="select select-auto" aria-label="Бөлім"><option value="all">Барлық бөлім</option>${CURRICULUM.map(m => `<option value="${m.id}" ${gameModule === m.id ? 'selected' : ''}>${esc(m.title)}</option>`).join('')}</select></div>
  <div id="mission-gallery" class="mission-grid">${missionCards()}</div></section>`;
function missionCards() {
  const ms = MISSION_BANK.filter(q => (gameFilter === 'all' || q.type === gameFilter) && (gameModule === 'all' || q.topic === gameModule));
  return ms.map(q => { const m = moduleOf(q.topic), done = state.mastered.includes(q.id);
    return `<button class="mission ${done ? 'is-done' : ''}" data-mission="${q.id}" style="--mod:${m.color}"><span class="mission-type">${FORMAT_SYMBOLS[q.type]} ${FORMAT_LABELS[q.type]}</span><h3>${esc(q.q)}</h3><span class="mission-foot"><span>${esc(m.title)}</span><b>${done ? '✓ Орындалды' : '+10 XP'}</b></span></button>`; }).join('') || '<p class="muted">Бұл бөлімде осы форматтағы миссия жоқ.</p>';
}
VIEWS.exam = () => `<section>${pageHead('ҰБТ-ға дайындық сынағы', 'Уақытты бақылап, аралас есептерді өз бетіңше шеш. Талдау сынақ аяқталғаннан кейін ашылады.')}
  <div class="practice-grid"><div class="sheet build"><h2>Сынақты баптау</h2><div class="form-grid form-2"><label class="field"><span>Есеп саны</span><select id="exam-count" class="select"><option value="10">10 есеп</option><option value="20">20 есеп</option><option value="30">30 есеп</option></select></label><label class="field"><span>Уақыт</span><select id="exam-time" class="select"><option value="15">15 минут</option><option value="30">30 минут</option><option value="45">45 минут</option></select></label></div>
  <p class="muted small">Уақыт біткенде сынақ өздігінен аяқталады. Бет жабылса да уақыт жүре береді.</p><button class="btn btn-primary" data-action="start-exam">Сынақты бастау</button></div>
  <div class="sheet tint"><h2>Сынақ кезінде</h2><ul class="plain"><li>Көмек пен дұрыс жауап көрсетілмейді.</li><li>Барлық бөлімнен аралас есептер, қайталанбайды.</li><li>Соңында әр есептің қадамдық шешімі ашылады.</li></ul><p class="muted small">Бұл — авторлық оқу сынағы, ресми ҰБТ регламенті емес.</p></div></div></section>`;

/* ================= Квиз қозғалтқышы ================= */
function startQuiz(conf = {}) {
  const launch = () => {
    let pool = conf.ids ? conf.ids.map(question).filter(Boolean) : BANK.filter(q => (!conf.topic || conf.topic === 'mixed' || q.topic === conf.topic) && (!conf.difficulty || conf.difficulty === 'all' || q.difficulty === +conf.difficulty));
    if (!pool.length) { toast('Бұл шарттарға сай есеп табылмады. Басқа деңгейді таңда.'); return; }
    const size = Math.min(conf.count || 5, pool.length);
    let chosen;
    if ((conf.topic === 'mixed' || !conf.topic) && !conf.ids) {
      const groups = CURRICULUM.map(m => shuffle(pool.filter(q => q.topic === m.id)));
      chosen = [];
      while (chosen.length < size) { let moved = false; for (const g of shuffle(groups)) if (g.length && chosen.length < size) { chosen.push(g.shift()); moved = true; } if (!moved) break; }
    } else chosen = conf.ids ? pool.slice(0, size) : shuffle(pool).slice(0, size);
    session = { id: Date.now().toString(36), mode: conf.mode || 'practice', topic: conf.topic || 'mixed', items: chosen.map(q => ({ id: q.id, order: shuffle(q.o.map((_, i) => i)), answer: null, checked: false, registered: false, hint: false })), index: 0, started: Date.now(), deadline: Date.now() + (conf.minutes || size) * 60000, marathonDay: conf.marathonDay || null };
    result = null; saveSession(); routeTo('quiz');
  };
  if (session) {
    modal('Аяқталмаған жаттығу бар', '<p>Жаңасын бастасаң, сақталған жаттығу ауысады. Тексерілген жауаптардың прогресі сақталады.</p>', '<button class="btn btn-quiet" data-modal="close">Болдырмау</button><button class="btn btn-primary" id="confirm-new">Жаңасын бастау</button>');
    $('#confirm-new').onclick = () => { closeModal(); session = null; launch(); };
  } else launch();
}
function parseNumeric(value) {
  const s = String(value ?? '').trim().replace(/[\s  ]/g, '').replace(/,/g, '.').replace(/−/g, '-');
  if (/^[-+]?\d+(?:\.\d+)?\/[-+]?\d+(?:\.\d+)?$/.test(s)) { const [a, b] = s.split('/').map(Number); return b === 0 ? NaN : a / b; }
  return s !== '' && /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN;
}
function responseReady(q, r) {
  if (q.type === 'number' || q.type === 'range') return Number.isFinite(parseNumeric(r));
  if (q.type === 'multi') return Array.isArray(r) && r.length > 0;
  if (q.type === 'match') return Array.isArray(r) && r.length === q.payload.left.length && r.every(v => Number.isInteger(v) && v >= 0);
  if (q.type === 'order') return Array.isArray(r) && r.length === q.payload.items.length;
  if (q.type === 'plot') return Array.isArray(r) && r.length === 2;
  return false;
}
function gradeResponse(q, r) {
  if (!responseReady(q, r)) return false;
  if (q.type === 'number' || q.type === 'range') { const exp = Number(q.type === 'number' ? q.solution : q.expected), n = parseNumeric(r); return Math.abs(n - exp) <= Math.max(1e-8, Math.abs(exp) * 1e-9); }
  if (q.type === 'multi') return JSON.stringify([...r].sort((a, b) => a - b)) === JSON.stringify([...q.expected].sort((a, b) => a - b));
  return JSON.stringify(r) === JSON.stringify(q.expected);
}
function syncResponse(q, it, response) {
  it.response = response;
  it.answer = responseReady(q, response) ? (gradeResponse(q, response) ? q.a : (q.a + 1) % q.o.length) : null;
  saveSession();
  const b = $('[data-action="quiz-check"]'); if (b) b.disabled = it.answer === null;
}
function pointGrid(q, it) {
  const p = q.payload, min = p.min, max = p.max, margin = 25, step = (320 - 2 * margin) / (max - min), coord = v => margin + (v - min) * step;
  let grid = '', pts = '';
  for (let i = 0; i <= max - min; i++) { const v = min + i, c = coord(v); grid += `<path d="M${c} 25V295M25 ${c}H295" class="${v === 0 ? 'axis' : 'gridline'}"/>${v !== 0 ? `<text x="${c}" y="${coord(0) + 15}" text-anchor="middle">${v}</text><text x="${coord(0) - 12}" y="${320 - c + 4}" text-anchor="middle">${v}</text>` : ''}`; }
  for (let xi = 0; xi <= max - min; xi++) for (let yi = 0; yi <= max - min; yi++) { const x = xi + min, y = yi + min, sel = it.response?.[0] === x && it.response?.[1] === y; pts += `<circle cx="${coord(x)}" cy="${320 - coord(y)}" r="${sel ? 6 : 10}" class="plot-point ${sel ? 'is-selected' : ''}" data-plot="${x},${y}" tabindex="${it.checked ? -1 : 0}" role="button" aria-label="(${x}; ${y})"/>`; }
  return `<div class="plot"><svg viewBox="0 0 320 320" role="group" aria-label="Координаталық жазықтық">${grid}<text x="305" y="153">x</text><text x="164" y="17">y</text>${pts}</svg><p class="plot-sel">${it.response ? `Таңдалған нүкте: <b class="math">(${it.response[0]}; ${it.response[1]})</b>` : 'Нүктені түрт немесе пернетақтамен таңда.'}</p></div>`;
}
function answerUI(q, it, ex) {
  const locked = it.checked, kind = q.type || 'choice';
  if (kind === 'choice' || kind === 'tf') return `<div class="options ${kind === 'tf' ? 'options-tf' : ''}">${it.order.filter(n => kind !== 'tf' || n < 2).map((orig, i) => `<button class="option ${it.answer === orig ? 'is-selected' : ''} ${!ex && locked ? (orig === q.a ? 'is-correct' : it.answer === orig ? 'is-wrong' : '') : ''}" data-option="${orig}" ${locked ? 'disabled' : ''}><span class="letter">${kind === 'tf' ? (orig === 0 ? '✓' : '×') : 'ABCD'[i]}</span><span>${esc(q.o[orig])}</span></button>`).join('')}</div>`;
  if (kind === 'number') return `<div class="num-answer"><label for="response-number">Жауабыңды енгіз</label><input id="response-number" inputmode="decimal" autocomplete="off" class="input input-xl" value="${esc(it.response ?? '')}" placeholder="0" ${locked ? 'disabled' : ''}><small>Үтір, нүкте немесе жай бөлшек: 0,5 · 0.5 · 1/2</small></div>`;
  if (kind === 'multi') return `<p class="hint-line">Бірнеше дұрыс жауап болуы мүмкін. Барлығын белгіле.</p><div class="options">${q.payload.items.map((s, i) => `<button class="option ${it.response?.includes(i) ? 'is-selected' : ''} ${!ex && locked ? (q.expected.includes(i) ? 'is-correct' : it.response?.includes(i) ? 'is-wrong' : '') : ''}" data-multi="${i}" ${locked ? 'disabled' : ''}><span class="letter box">${it.response?.includes(i) ? '✓' : ''}</span><span>${esc(s)}</span></button>`).join('')}</div>`;
  if (kind === 'match') {
    if (!it.matchOrder) { it.matchOrder = shuffle(q.payload.right.map((_, i) => i)); saveSession(); }
    return `<p class="hint-line">Әр сол жақ мәнге сәйкес жұбын таңда.</p><div class="match">${q.payload.left.map((s, i) => `<label class="match-row ${it.response?.[i] != null ? 'is-set' : ''}"><span>${esc(s)}</span><b aria-hidden="true">⇄</b><select data-match="${i}" class="select" ${locked ? 'disabled' : ''}><option value="">Жұбын таңда…</option>${it.matchOrder.map(j => `<option value="${j}" ${it.response?.[i] === j ? 'selected' : ''}>${esc(q.payload.right[j])}</option>`).join('')}</select></label>`).join('')}</div>`;
  }
  if (kind === 'order') {
    if (!it.response) { it.response = shuffle(q.payload.items.map((_, i) => i)); if (JSON.stringify(it.response) === JSON.stringify(q.expected) && it.response.length > 1) [it.response[0], it.response[1]] = [it.response[1], it.response[0]]; it.answer = gradeResponse(q, it.response) ? q.a : (q.a + 1) % q.o.length; saveSession(); }
    return `<p class="hint-line">Карточкаларды сүйре немесе ↑ ↓ батырмаларымен ретте.</p><div class="sort">${it.response.map((j, i) => `<div class="sort-row" draggable="${!locked}" data-drag-position="${i}"><span class="sort-handle" aria-hidden="true">⠿</span><b>${i + 1}</b><span class="sort-text">${esc(q.payload.items[j])}</span><span class="sort-btns"><button data-sort="${i},-1" aria-label="Жоғары" ${locked || i === 0 ? 'disabled' : ''}>↑</button><button data-sort="${i},1" aria-label="Төмен" ${locked || i === it.response.length - 1 ? 'disabled' : ''}>↓</button></span></div>`).join('')}</div>`;
  }
  if (kind === 'range') return `<div class="slider"><div class="slider-val"><b id="challenge-range-value">${esc(it.response ?? q.payload.start)}</b><span>${esc(q.payload.unit)}</span></div><input id="challenge-range" type="range" min="${q.payload.min}" max="${q.payload.max}" step="${q.payload.step}" value="${esc(it.response ?? q.payload.start)}" aria-label="Жауап мәні" ${locked ? 'disabled' : ''}><div class="slider-lim"><span>${q.payload.min}</span><span>${q.payload.max}</span></div></div>`;
  if (kind === 'plot') return pointGrid(q, it);
  return '';
}
VIEWS.quiz = () => {
  if (!session) return emptyBlock('Белсенді жаттығу жоқ', 'Жаңа тапсырмалар топтамасын таңда.', 'Жаттығуға өту', 'practice');
  const it = session.items[session.index], q = question(it.id), m = moduleOf(q.topic), ex = session.mode === 'exam', kind = q.type || 'choice', lesson = q.lessonId ? courseLesson(q.lessonId) : null;
  const ok = it.answer === q.a;
  return `<section class="quiz">
    <div class="quiz-top"><button class="back" data-route="${ex ? 'exam' : 'practice'}">${icon('back')} Кейін жалғастыру</button><span class="quiz-ctx">${ex ? 'Өзіндік сынақ' : session.mode === 'marathon' ? `Марафон · ${session.marathonDay || ''}-кезең` : esc(m.title)}</span><div class="timer" id="quiz-timer">--:--</div></div>
    <div class="segments" aria-label="${session.index + 1} / ${session.items.length}">${session.items.map((_, i) => `<span class="${i === session.index ? 'is-now' : i < session.index ? 'is-done' : ''}"></span>`).join('')}</div>
    <article class="quiz-card ${it.checked && !ex ? (ok ? 'is-ok' : 'is-miss') : ''}">
      <div class="quiz-meta"><span class="chip">${FORMAT_SYMBOLS[kind]} ${FORMAT_LABELS[kind]}</span><span class="muted small">${session.index + 1} / ${session.items.length} · ${['', 'Негізгі', 'Қолдану', 'Күрделі'][q.difficulty] || ''}</span></div>
      ${lesson ? `<p class="quiz-lesson">${esc(lesson.title)}</p>` : ''}
      <h1 class="quiz-q">${esc(q.q)}</h1>
      ${q.visual ? `<div class="quiz-visual">${visual(q.visual)}</div>` : ''}
      ${answerUI(q, it, ex)}
      ${it.hint && !ex ? `<p class="hint">Алғашқы қадам: ${esc(q.steps[0])}</p>` : ''}
      ${it.checked && !ex ? `<div class="feedback ${ok ? 'is-ok' : 'is-miss'}" aria-live="polite"><h3>${ok ? 'Дұрыс!' : 'Бірге талдап көрейік'}</h3>${!ok ? `<p>Дұрыс жауап: <b>${esc(q.type && !['choice', 'tf'].includes(q.type) ? correctText(q) : q.o[q.a])}</b></p>` : ''}${stepList(q.steps)}${lesson ? `<a class="link" href="#learn/${lesson.id}">Түсіндірмеге оралу</a>` : ''}</div>` : ''}
      <div class="quiz-foot"><div>${!ex && !it.checked ? '<button class="btn btn-ghost btn-sm" data-action="quiz-hint">Алғашқы қадамды көрсет</button>' : `<small class="muted">${ex ? 'Талдау сынақ соңында ашылады.' : 'Әр жаңа дұрыс есепке +10 XP.'}</small>`}</div>
      <button class="btn btn-primary" data-action="${it.checked ? 'quiz-next' : 'quiz-check'}" ${it.answer === null ? 'disabled' : ''}>${it.checked ? (session.index === session.items.length - 1 ? 'Нәтижені көру' : 'Келесі есеп') : ex ? (session.index === session.items.length - 1 ? 'Сынақты аяқтау' : 'Жауап беру') : 'Тексеру'}</button></div>
    </article>
    <div class="quiz-under"><small class="muted">${kind === 'choice' || kind === 'tf' ? '1–4 — жауап таңдау · ' : ''}Enter — тексеру / келесі</small><button class="btn btn-ghost btn-sm" data-action="end-quiz">Қазір аяқтау</button></div></section>`;
};
function correctText(q) {
  if (q.type === 'number') return String(q.solution).replace('.', ',') + (q.unit ? ' ' + q.unit : '');
  if (q.type === 'range') return String(q.expected) + ' ' + (q.payload?.unit || '');
  if (q.type === 'plot') return `(${q.expected[0]}; ${q.expected[1]})`;
  if (q.type === 'multi') return q.expected.map(i => q.payload.items[i]).join('; ');
  if (q.type === 'order') return q.expected.map(i => q.payload.items[i]).join(' → ');
  if (q.type === 'match') return q.payload.left.map((s, i) => s + ' → ' + q.payload.right[q.expected[i]]).join('; ');
  return q.o[q.a];
}
function tick() {
  if (!session || route !== 'quiz') return;
  const left = Math.max(0, Math.ceil((session.deadline - Date.now()) / 1000)), el = $('#quiz-timer');
  if (el) { el.textContent = `${pad2(Math.floor(left / 60))}:${pad2(left % 60)}`; el.classList.toggle('is-low', left < 60); }
  if (left === 0) finishQuiz(true);
}
function record(q, answer) {
  const ok = answer === q.a;
  state.answered++;
  if (ok) {
    state.correct++;
    if (!state.mastered.includes(q.id)) { state.mastered.push(q.id); state.xp += 10; if (session) session.earned = (session.earned || 0) + 10; }
    state.wrong = state.wrong.filter(id => id !== q.id);
  } else if (!state.wrong.includes(q.id)) state.wrong.push(q.id);
  const d = state.activity[today()] || { answered: 0, correct: 0 };
  d.answered++; if (ok) d.correct++;
  state.activity[today()] = d;
  save();
  return ok;
}
function checkAnswer() {
  if (!session) return;
  if (Date.now() >= session.deadline) { finishQuiz(true); return; }
  const it = session.items[session.index], q = question(it.id);
  if (q.type && !['choice', 'tf'].includes(q.type)) {
    if (!responseReady(q, it.response)) { toast('Алдымен тапсырманы толық орында.'); return; }
    it.answer = gradeResponse(q, it.response) ? q.a : (q.a + 1) % q.o.length;
  }
  if (it.answer === null || it.checked) return;
  it.checked = true;
  if (session.mode !== 'exam') { record(q, it.answer); it.registered = true; }
  saveSession();
  if (session.mode === 'exam') nextQ(); else reflow();
}
function nextQ() { if (!session) return; if (session.index >= session.items.length - 1) finishQuiz(false); else { session.index++; saveSession(); render(); } }
function finishQuiz(timedOut = false) {
  if (!session) return;
  clearInterval(timer);
  for (const it of session.items) if (it.answer !== null && it.checked && !it.registered) { record(question(it.id), it.answer); it.registered = true; }
  const valid = session.items.filter(it => it.checked && it.answer !== null), score = valid.filter(it => it.answer === question(it.id).a).length;
  result = { id: session.id, topic: session.topic, mode: session.mode, items: session.items.map(it => ({ id: it.id, answer: it.checked ? it.answer : null, response: it.checked ? it.response : undefined })), score, total: session.items.length, time: Math.min(Math.round((Date.now() - session.started) / 1000), Math.round((session.deadline - session.started) / 1000)), date: new Date().toISOString(), timedOut, xp: session.earned || 0 };
  if (session.marathonDay && score >= Math.ceil(session.items.length * .6) && !state.marathon.includes(session.marathonDay) && state.marathonDate !== today()) {
    state.marathon.push(session.marathonDay); state.marathonDate = today();
    toast(`${session.marathonDay}-кезең аяқталды! Келесісі ертең ашылады.`);
  }
  state.history.unshift(result); state.history = state.history.slice(0, 100);
  session = null; save(); saveSession(); if (me) Sync.flush();
  routeTo('result');
}
function responseText(q, response, answer) {
  if (response === undefined || response === null) return answer === null ? 'Жауап берілмеді' : q.o[answer];
  if (q.type === 'number' || q.type === 'range') return String(response) + (q.payload?.unit ? ' ' + q.payload.unit : '');
  if (q.type === 'plot') return `(${response[0]}; ${response[1]})`;
  if (q.type === 'multi') return response.map(i => q.payload.items[i]).join('; ');
  if (q.type === 'order') return response.map(i => q.payload.items[i]).join(' → ');
  if (q.type === 'match') return q.payload.left.map((s, i) => s + ' → ' + (q.payload.right[response[i]] || '—')).join('; ');
  return String(response);
}
VIEWS.result = () => {
  if (!result) return VIEWS.progress();
  const r = result, pc = Math.round(r.score / r.total * 100);
  return `<section class="quiz"><div class="result">
    <div class="result-score"><span class="math">${r.score}</span><small>/ ${r.total}</small></div>
    <div><h1>${pc >= 80 ? 'Керемет нәтиже!' : pc >= 50 ? 'Жақсы ілгеріледің.' : 'Енді түсінуге жақынсың.'}</h1><p class="lede">${r.timedOut ? 'Уақыт аяқталды. ' : ''}Төмендегі талдауды қарап шық — қате есептер «Қателермен жұмыс» бөліміне түсті.</p>
    <dl class="result-facts"><div><dt>Дәлдік</dt><dd>${pc}%</dd></div><div><dt>Жаңа XP</dt><dd class="gold">+${r.xp || 0}</dd></div><div><dt>Уақыт</dt><dd>${Math.floor(r.time / 60)}:${pad2(r.time % 60)}</dd></div></dl>
    <div class="btn-row"><button class="btn btn-primary" data-action="retry-result">Тағы жаттығу</button><a class="btn btn-quiet" href="#progress">Прогресім</a></div></div></div>
    <h2 class="sub-h">Әр есепке қайта қара</h2>
    <div class="review">${r.items.map((it, i) => { const q = question(it.id), ok = it.answer === q.a; return `<details class="review-item ${ok ? 'is-ok' : 'is-miss'}"><summary><span class="mark">${ok ? '✓' : it.answer === null ? '○' : '×'}</span><span>${i + 1}. ${esc(q.q)}</span></summary><div class="review-body"><p><small>Сенің жауабың</small>${esc(responseText(q, it.response, it.answer))}</p><p><small>Дұрыс жауап</small><b>${esc(q.type && !['choice', 'tf'].includes(q.type) ? correctText(q) : q.o[q.a])}</b></p>${q.visual ? visual(q.visual) : ''}${stepList(q.steps)}${q.lessonId ? `<a href="#learn/${q.lessonId}" class="link">Тақырыпты қайталау</a>` : ''}</div></details>`; }).join('')}</div></section>`;
};
VIEWS.mistakes = () => `<section>${pageHead('Қателермен жұмыс', 'Бұл есептерге қайта орал. Дұрыс шығарған есеп тізімнен өзі алынады.')}
  ${state.wrong.length ? `<div class="btn-row"><span class="chip chip-red">${state.wrong.length} есеп</span><button class="btn btn-primary" data-action="retry-mistakes">Қайта шығару</button></div><div class="review">${state.wrong.map(id => { const q = question(id); return `<details class="review-item is-miss"><summary><span class="mark">↻</span><span>${esc(q.q)}</span></summary><div class="review-body"><p><small>Дұрыс жауап</small><b>${esc(q.type && !['choice', 'tf'].includes(q.type) ? correctText(q) : q.o[q.a])}</b></p>${stepList(q.steps)}<button class="btn btn-quiet btn-sm" data-start="${q.topic}">Осы бөлімнен жаттығу</button></div></details>`; }).join('')}</div>` : emptyBlock('Қате есеп жоқ', 'Жаттығу кезінде қате шыққан есептер осында жиналады.', 'Жаттығуға өту', 'practice')}</section>`;

/* ================= Прогресс, жетістіктер, марафон, қатені тап ================= */
VIEWS.progress = () => {
  const days = Array.from({ length: 14 }, (_, i) => dateKey(new Date(Date.now() - (13 - i) * 864e5))), max = Math.max(1, ...days.map(d => state.activity[d]?.answered || 0));
  return `<section>${pageHead('Менің прогресім', me ? 'Прогресің аккаунтқа сақталады' + (isStudent() ? ' және мұғаліміңе көрінеді.' : '.') : 'Прогресс тек осы браузерде. Тіркелсең, кез келген құрылғыдан жалғастырасың.')}
  ${statStrip()}
  <div class="progress-grid">
    <div class="sheet"><h2>Бөлімдерді меңгеру</h2><p class="muted small">Бірегей дұрыс шығарылған есептер үлесі.</p><div class="bars">${CURRICULUM.map(m => `<a href="#lesson/${m.id}" class="bar-row"><span>${esc(m.title)}</span>${meter(mastery(m.id), m.color)}<b>${mastery(m.id)}%</b></a>`).join('')}</div></div>
    <div class="col-stack">
      <div class="sheet"><h2>Соңғы 14 күн</h2><div class="week">${days.map(d => { const n = state.activity[d]?.answered || 0; return `<div class="week-col" title="${d}: ${n} есеп"><b>${n || ''}</b><i style="height:${Math.max(3, n / max * 96)}px" class="${d === today() ? 'is-today' : ''}"></i><span>${d.slice(8)}</span></div>`; }).join('')}</div></div>
      <div class="sheet tint"><span class="nb-label">Келесі қадам</span><h3>${esc(recommended().title)}</h3><p class="muted">Түсіндірмені қайталап, 5 есеп орында.</p><a class="btn btn-quiet btn-sm" href="#lesson/${recommended().id}">Бөлімді ашу</a></div>
    </div></div>
  <div class="sheet"><div class="sheet-head"><h2>Жаттығулар тарихы</h2><button class="btn btn-ghost btn-sm" data-action="export-csv">${icon('download')} CSV</button></div>
  ${state.history.length ? `<div class="hist">${state.history.slice(0, 15).map((h, i) => `<button class="hist-row" data-history="${i}"><span class="hist-ico">${h.mode === 'exam' ? '◷' : h.mode === 'marathon' ? '30' : '✦'}</span><span><b>${h.mode === 'exam' ? 'Өзіндік сынақ' : moduleOf(h.topic)?.title || 'Аралас жаттығу'}</b><small>${dateTime(h.date)}</small></span><span class="hist-score">${h.score} / ${h.total}</span></button>`).join('')}</div>` : '<p class="muted">Алғашқы аяқталған жаттығуың осында көрінеді.</p>'}</div>
  </section>`;
};
const BADGES = [
  ['✧', 'Алғашқы қадам', 'Бірінші есепті дұрыс шығар.', () => state.correct >= 1],
  ['✦', 'Бес шағын жеңіс', '5 бірегей есепті дұрыс шығар.', () => state.mastered.length >= 5],
  ['ϟ', 'Жүздік белес', '100 XP жина.', () => state.xp >= 100],
  ['♨', 'Үш күн қатарынан', '3 күн қатарынан есеп шығар.', () => streak() >= 3],
  ['◎', 'Дәлдік шебері', 'Кемінде 20 жауапта 80% дәлдікке жет.', () => state.answered >= 20 && attempts() >= 80],
  ['◇', 'Бөлім зерттеушісі', 'Бір бөлімде 100% меңгеруге жет.', () => CURRICULUM.some(m => mastery(m.id) === 100)],
  ['◷', 'Сынақтан өттің', '10 есептік сынақта 80% жина.', () => state.history.some(h => h.mode === 'exam' && h.total >= 10 && h.score / h.total >= .8)],
  ['∑', 'Он тақырып', '10 тақырыпты толық меңгер.', () => courseCompleted() >= 10],
  ['⌕', 'Математикалық детектив', '5 миссияны орында.', () => MISSION_BANK.filter(q => state.mastered.includes(q.id)).length >= 5],
  ['✥', 'Марафоншы', '30 күндік марафонды аяқта.', () => state.marathon.length >= 30]
];
VIEWS.badges = () => { const un = BADGES.filter(b => b[3]()).length;
  return `<section>${pageHead('Жетістіктер', `${un} / ${BADGES.length} жетістік ашылды · ${fmt(state.xp)} XP`)}<div class="badge-grid">${BADGES.map(([s, t, d, fn]) => { const on = fn(); return `<div class="badge ${on ? 'is-on' : ''}"><span class="badge-medal">${s}</span><h3>${t}</h3><p>${d}</p><small>${on ? 'Ашылды' : 'Әзірге жабық'}</small></div>`; }).join('')}</div></section>`; };
VIEWS.marathon = () => {
  const next = state.marathon.length + 1, canToday = state.marathonDate !== today();
  return `<section>${pageHead('30 күндік марафон', 'Күніне бір кезең: 5 есептің кемінде 3-еуін дұрыс шығарсаң, кезең аяқталады. Келесісі ертеңгі күні ашылады.')}
  <p class="note-bar">${state.marathon.length} / 30 кезең аяқталды${!canToday ? ' · Бүгінгі кезең орындалды, келесісі ертең ашылады.' : ''}</p>
  <div class="marathon">${Array.from({ length: 30 }, (_, i) => { const d = i + 1, done = state.marathon.includes(d), avail = d === next && canToday, m = CURRICULUM[i % CURRICULUM.length]; return `<button class="mday ${done ? 'is-done' : ''} ${avail ? 'is-open' : ''}" data-marathon="${d}" ${!done && !avail ? 'disabled' : ''}><b>${done ? '✓' : pad2(d)}</b><small>${d % 7 === 0 ? 'Апталық аралас сынақ' : esc(m.title)}</small></button>`; }).join('')}</div></section>`;
};
let errorIndex = 0, errorSelected = null, errorChecked = false, errorOK = 0;
VIEWS.errors = () => { const t = ERROR_TASKS[errorIndex];
  return `<section class="quiz">${pageHead('Қатені тап', 'Шешімдегі ең алғашқы қате қадамды таңда. Жауапқа ғана емес, ойлау жолына қара.')}
  <article class="quiz-card"><div class="quiz-meta"><span class="chip">Тергеу ${errorIndex + 1} / ${ERROR_TASKS.length}</span><span class="chip chip-ok">${errorOK} дұрыс</span></div><h2 class="quiz-q">${esc(t.q)}</h2>
  <div class="err-lines">${t.lines.map((l, i) => `<button class="err-line ${errorSelected === i ? 'is-selected' : ''} ${errorChecked ? (i === t.bad ? 'is-wrong-step' : errorSelected === i ? 'is-miss' : '') : ''}" data-error="${i}" ${errorChecked ? 'disabled' : ''}><b>${i + 1}</b><span>${esc(l)}</span></button>`).join('')}</div>
  ${errorChecked ? `<div class="feedback ${errorSelected === t.bad ? 'is-ok' : 'is-miss'}"><h3>${errorSelected === t.bad ? 'Қатені таптың!' : 'Бірге талдайық'}</h3><p>${esc(t.explain)}</p></div>` : ''}
  <div class="quiz-foot"><small class="muted">Қате қадамды таңда.</small><button class="btn btn-primary" data-action="${errorChecked ? 'error-next' : 'error-check'}" ${errorSelected === null ? 'disabled' : ''}>${errorChecked ? (errorIndex === ERROR_TASKS.length - 1 ? 'Қорытынды' : 'Келесі тергеу') : 'Тексеру'}</button></div></article></section>`; };

/* ================= Оқушы: тапсырмалар ================= */
VIEWS.tasks = async () => {
  if (!isStudent()) return emptyBlock('Тапсырмалар оқушыларға арналған', 'Мұғалімнің тапсырмаларын көру үшін оқушы ретінде кір.', 'Басты бет', 'home');
  const [list, classes] = await Promise.all([loadStudentTasks(true), Cloud.myClasses().catch(() => [])]);
  updateChrome();
  if (!classes.length) return `<section>${pageHead('Тапсырмалар', 'Мұғалімнің тапсырмалары осында көрінеді.')}${joinClassBlock()}</section>`;
  const open = list.filter(a => assignmentProgress(a) < 100), done = list.filter(a => assignmentProgress(a) === 100);
  const card = a => { const p = assignmentProgress(a), firstOpen = (a.lesson_ids || []).find(id => lessonMastery(id) < 100) || a.lesson_ids?.[0];
    const overdue = a.due_date && dueLabel(a.due_date) === 'Мерзімі өтті' && p < 100;
    return `<article class="task ${p === 100 ? 'is-done' : ''}"><header><div><span class="muted small">${esc(a.classes?.name || '')}</span><h3>${esc(a.title)}</h3></div><span class="chip ${p === 100 ? 'chip-ok' : overdue ? 'chip-red' : ''}">${p === 100 ? 'Орындалды' : dueLabel(a.due_date)}</span></header>
    ${a.note ? `<p class="task-note">${esc(a.note)}</p>` : ''}
    <ol class="task-lessons">${(a.lesson_ids || []).map(id => { const l = courseLesson(id), v = lessonMastery(id); return l ? `<li><a href="#learn/${id}"><span class="${v === 100 ? 'tick is-on' : 'tick'}">${v === 100 ? '✓' : ''}</span>${esc(l.title)}<small>${v}%</small></a></li>` : ''; }).join('')}</ol>
    <footer>${meter(p, 'var(--ink)')}<b>${p}%</b>${p < 100 && firstOpen ? `<a class="btn btn-primary btn-sm" href="#learn/${firstOpen}">Жалғастыру</a>` : ''}</footer></article>`; };
  return `<section>${pageHead('Тапсырмалар', 'Мұғалім берген тақырыптар. Тақырыптың барлық тапсырмасын дұрыс орындасаң, ол меңгерілген болып саналады.', `<span class="muted small">${classes.map(c => esc(c.name)).join(', ')}</span>`)}
    ${list.length ? `<div class="task-list">${open.map(card).join('')}</div>${done.length ? `<h2 class="sub-h">Орындалған</h2><div class="task-list">${done.map(card).join('')}</div>` : ''}` : emptyBlock('Әзірге тапсырма жоқ', 'Мұғалім тапсырма бергенде, ол осында пайда болады. Әзірге курстан өзің таңда.', 'Курсқа өту', 'worlds')}</section>`;
};
function joinClassBlock() {
  return `<div class="sheet join"><h2>Сыныпқа қосыл</h2><p>Мұғалім берген 6 таңбалы кодты енгіз. Сонда мұғалім сенің прогресіңді көреді және тапсырма бере алады.</p><form class="join-form" data-form="join-class"><input class="input input-code" name="code" maxlength="6" autocomplete="off" placeholder="AB12CD" aria-label="Сынып коды" required><button class="btn btn-primary">Қосылу</button></form></div>`;
}

/* ================= Аккаунт ================= */
VIEWS.account = async () => {
  const theme = document.documentElement.dataset.theme;
  const common = `<div class="sheet"><h2>Көрініс</h2><div class="seg"><button data-set-theme="light" class="${theme !== 'dark' ? 'is-on' : ''}">Жарық</button><button data-set-theme="dark" class="${theme === 'dark' ? 'is-on' : ''}">Қараңғы</button></div></div>`;
  const backup = `<div class="sheet"><h2>Прогресс файлы</h2><p class="muted">Прогресті JSON файлына сақтап, басқа құрылғыда ашуға болады.</p><div class="btn-row"><button class="btn btn-quiet" data-action="backup">${icon('download')} Сақтау</button><button class="btn btn-quiet" data-action="restore">Файлды ашу</button></div></div>`;
  if (!me) return `<section>${pageHead('Аккаунт', 'Сен қазір қонақ ретіндесің. Прогресс тек осы браузерде сақталады.')}
    <div class="sheet tint"><h2>Тіркелу не үшін керек?</h2><ul class="plain"><li>Прогресс кез келген құрылғыда сақталады.</li><li>Мұғалім нәтижеңді көріп, тапсырма бере алады.</li><li>Осы құрылғыдағы прогресті аккаунтқа қосуға болады.</li></ul><button class="btn btn-primary" data-action="show-auth">Кіру немесе тіркелу</button></div>
    <div class="sheet"><h2>Есімің</h2><form class="inline-form" data-form="guest-name"><input class="input" name="name" maxlength="40" value="${esc(state.name)}" placeholder="Есімің"><button class="btn btn-quiet">Сақтау</button></form></div>${common}${backup}</section>`;
  const classes = isStudent() ? await Cloud.myClasses().catch(() => []) : [];
  return `<section>${pageHead('Аккаунт', isTeacher() ? 'Мұғалім аккаунты' : 'Оқушы аккаунты')}
  <div class="account-grid">
    <div class="sheet"><h2>Профиль</h2><form class="stack-form" data-form="profile"><label class="field"><span>Аты-жөні</span><input class="input" name="full_name" maxlength="80" value="${esc(me.full_name)}" required></label>${isTeacher() ? `<label class="field"><span>Мектеп</span><input class="input" name="school" maxlength="120" value="${esc(me.school || '')}"></label>` : ''}
      <p class="muted small">${me.login ? `Логин: <b>${esc(me.login)}</b>` : `Email: <b>${esc(me.email || '')}</b>`}</p><button class="btn btn-primary">Сақтау</button></form></div>
    ${isStudent() ? `<div class="sheet"><h2>Сыныптарым</h2>${classes.length ? `<ul class="class-mini">${classes.map(c => `<li><div><b>${esc(c.name)}</b><small>Мұғалім: ${esc(c.teacher_name)} · код ${esc(c.code)}</small></div><button class="btn btn-ghost btn-sm" data-leave-class="${c.id}" data-name="${esc(c.name)}">Шығу</button></li>`).join('')}</ul>` : '<p class="muted">Әзірге сыныпқа қосылмағансың.</p>'}</div>${joinClassBlock()}` : ''}
    ${common}${backup}
    <div class="sheet"><h2>Шығу</h2><p class="muted">Осы құрылғыдан аккаунттан шығасың. Прогресс аккаунтта сақталады.</p><button class="btn btn-danger" data-action="sign-out">${icon('logout')} Аккаунттан шығу</button></div>
  </div></section>`;
};

/* ================= Экспорт / импорт ================= */
function download(name, text, mime) {
  const blob = new Blob([text], { type: mime }), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const csvCell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const toCSV = rows => '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n');
function exportCSV() {
  const who = me?.full_name || state.name;
  download('MathQuest_natizheler.csv', toCSV([['Аты-жөні', 'Күні', 'Режим', 'Бөлім', 'Дұрыс', 'Барлығы', 'Пайыз', 'Уақыт (сек)'], ...state.history.map(h => [who, csvDate(h.date), h.mode, moduleOf(h.topic)?.title || 'Аралас', h.score, h.total, Math.round(h.score / h.total * 100), h.time])]), 'text/csv;charset=utf-8');
}
function restoreBackup() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
  input.onchange = async () => {
    const file = input.files[0]; if (!file) return;
    if (file.size > 3e6) { toast('Файл тым үлкен.'); return; }
    try {
      const data = JSON.parse(await file.text());
      if (data.version !== 2 || !Array.isArray(data.mastered) || !Array.isArray(data.history)) throw Error('schema');
      const n = normalizeState(data);
      modal('Прогресті файлдан ашу', `<p>Файлда ${n.mastered.length} дұрыс есеп, ${fmt(n.xp)} XP бар. Ол қазіргі прогреспен біріктіріледі — ештеңе жоғалмайды.</p>`, '<button class="btn btn-quiet" data-modal="close">Болдырмау</button><button class="btn btn-primary" id="confirm-restore">Біріктіру</button>');
      $('#confirm-restore').onclick = () => { state = mergeStates(state, n); save(); closeModal(); routeTo('progress'); toast('Прогресс қосылды.'); };
    } catch { toast('Файл MathQuest прогресіне сәйкес келмейді.'); }
  };
  input.click();
}

/* ================= Оқиғалар ================= */
const ACTIONS = {
  'start-mixed': () => startQuiz({ topic: 'mixed', count: 5, minutes: 5 }),
  'daily-check': () => {
    if (dailySelection === null || state.daily[today()]) return;
    const q = dailyQ(), ok = record(q, dailySelection);
    state.daily[today()] = { ok, qid: q.id }; dailySelection = null; save(); reflow();
    toast(ok ? 'Дұрыс! +10 XP' : 'Шешімін қарап шық — ертең жаңа есеп.');
  },
  'custom-practice': () => startQuiz({ topic: $('#practice-topic').value, difficulty: $('#practice-level').value, count: +$('#practice-count').value }),
  'start-exam': () => startQuiz({ topic: 'mixed', mode: 'exam', count: +$('#exam-count').value, minutes: +$('#exam-time').value }),
  'quiz-hint': () => { if (session) { session.items[session.index].hint = true; saveSession(); reflow(); } },
  'quiz-check': checkAnswer, 'quiz-next': nextQ,
  'end-quiz': () => { modal('Жаттығуды аяқтау', '<p>Тексерілген жауаптар есептеледі. Жауапсыз есептер қорытындыда бөлек көрсетіледі.</p>', '<button class="btn btn-quiet" data-modal="close">Жалғастыру</button><button class="btn btn-primary" id="confirm-end">Аяқтау</button>'); $('#confirm-end').onclick = () => { closeModal(); finishQuiz(); }; },
  'retry-result': () => result && startQuiz({ topic: result.topic, mode: result.mode === 'exam' ? 'exam' : 'practice', count: result.total, minutes: result.mode === 'exam' ? 15 : result.total }),
  'retry-mistakes': () => startQuiz({ ids: shuffle(state.wrong), count: Math.min(state.wrong.length, 10) }),
  'error-check': () => { if (errorSelected === null || errorChecked) return; errorChecked = true; if (errorSelected === ERROR_TASKS[errorIndex].bad) errorOK++; reflow(); },
  'error-next': () => {
    if (errorIndex < ERROR_TASKS.length - 1) { errorIndex++; errorSelected = null; errorChecked = false; render(); }
    else { const score = errorOK; errorIndex = 0; errorSelected = null; errorChecked = false; errorOK = 0; render(); modal('Тергеу аяқталды', `<p>${score} / ${ERROR_TASKS.length} қатені дұрыс таптың.</p>`, '<button class="btn btn-primary" data-modal="close">Жарайды</button>'); }
  },
  'export-csv': exportCSV,
  'backup': () => download('MathQuest_progress.json', JSON.stringify(state, null, 2), 'application/json'),
  'restore': restoreBackup,
  'toggle-theme': () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'),
  'toggle-nav': () => $('#shell').classList.toggle('nav-open'),
  'sign-out': () => confirmModal('Аккаунттан шығу', 'Осы құрылғыдан шығасыз. Прогресс аккаунтта сақталады.', 'Шығу', () => signOut()),
  'show-auth': () => showAuth({ tab: 'signup' }),
  'hide-demo': () => { try { sessionStorage.setItem('mathquest-demo-ok', '1'); } catch {} $('#demo-banner').hidden = true; }
};
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('mathquest-theme', t); } catch {} if (route === 'account') reflow(); else updateChrome(); }
let dragPosition = null;
document.addEventListener('click', e => {
  const el = e.target.closest('button,a,[data-plot]');
  if (!el) return;
  const ds = el.dataset;
  if (ds.modal === 'close') { closeModal(); return; }
  if (ds.route) { routeTo(ds.route); return; }
  if (el.matches('#shell .nav-link, #shell .me-card')) $('#shell').classList.remove('nav-open');
  if (ds.start) { startQuiz({ topic: ds.start, count: 5 }); return; }
  if (ds.worldmode) { worldMode = ds.worldmode; render(); return; }
  if (ds.setTheme) { setTheme(ds.setTheme); return; }
  if (ds.courseStart) { const l = courseLesson(ds.courseStart); if (l) startQuiz({ topic: l.moduleId, ids: lessonTasks(l.id).map(q => q.id), count: 3, minutes: 6 }); return; }
  if (ds.learningStep !== undefined) { learningStep = +ds.learningStep; reflow(); return; }
  if (ds.learningMove) { learningStep = Math.max(0, Math.min(3, learningStep + +ds.learningMove)); reflow(); return; }
  if (ds.gameFormat) { gameFilter = ds.gameFormat; render(); return; }
  if (ds.moduleMissions) { gameModule = ds.moduleMissions; gameFilter = 'all'; routeTo('games'); return; }
  if (ds.mission) { const q = question(ds.mission); startQuiz({ topic: q.topic, ids: [q.id], count: 1, minutes: 5 }); return; }
  if (ds.daily !== undefined && !state.daily[today()]) { dailySelection = +ds.daily; $$('[data-daily]').forEach(b => b.classList.toggle('is-selected', +b.dataset.daily === dailySelection)); $('#daily-check').disabled = false; return; }
  if (ds.error !== undefined && !errorChecked) { errorSelected = +ds.error; $$('[data-error]').forEach(b => b.classList.toggle('is-selected', +b.dataset.error === errorSelected)); $('[data-action="error-check"]').disabled = false; return; }
  if (ds.marathon) { const d = +ds.marathon, done = state.marathon.includes(d); if (!done && (d !== state.marathon.length + 1 || state.marathonDate === today())) return; startQuiz({ mode: 'marathon', topic: d % 7 === 0 ? 'mixed' : CURRICULUM[(d - 1) % CURRICULUM.length].id, count: 5, minutes: 7, marathonDay: done ? null : d }); return; }
  if (ds.history !== undefined) { result = state.history[+ds.history]; routeTo('result'); return; }
  if (ds.leaveClass) { confirmModal('Сыныптан шығу', `«${ds.name}» сыныбынан шығасың. Мұғалім енді прогресіңді көрмейді.`, 'Шығу', async () => { try { await Cloud.leaveClass(ds.leaveClass); toast('Сыныптан шықтың.'); studentTasks = null; render(); } catch (err) { toast(cloudErrorText(err)); } }, true); return; }
  if (ds.action && ACTIONS[ds.action]) { ACTIONS[ds.action](el); return; }
  if (!session || route !== 'quiz') return;
  const it = session.items[session.index], q = question(it.id);
  if (it.checked) return;
  if (ds.option !== undefined) { it.answer = +ds.option; saveSession(); $$('[data-option]').forEach(b => b.classList.toggle('is-selected', +b.dataset.option === it.answer)); const b = $('[data-action="quiz-check"]'); if (b) b.disabled = false; return; }
  if (ds.multi !== undefined) { const n = +ds.multi, r = Array.isArray(it.response) ? [...it.response] : []; syncResponse(q, it, r.includes(n) ? r.filter(v => v !== n) : [...r, n]); reflow(); }
  if (ds.sort) { const [pos, delta] = ds.sort.split(',').map(Number), r = [...it.response], dest = pos + delta; if (dest >= 0 && dest < r.length) { [r[pos], r[dest]] = [r[dest], r[pos]]; syncResponse(q, it, r); reflow(); } }
  if (ds.plot) { syncResponse(q, it, ds.plot.split(',').map(Number)); reflow(); }
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(f)), btn = f.querySelector('button:not([type=button])');
  const busy = on => { if (btn) btn.disabled = on; };
  if (f.dataset.form === 'guest-name') { state.name = String(data.name || '').trim().slice(0, 40); save(); toast('Сақталды.'); updateChrome(); return; }
  if (f.dataset.form === 'profile') {
    busy(true);
    try { me = await Cloud.updateProfile({ full_name: String(data.full_name).trim(), school: data.school !== undefined ? String(data.school).trim() : undefined }); toast('Профиль сақталды.'); updateChrome(); }
    catch (err) { toast(cloudErrorText(err)); } finally { busy(false); }
    return;
  }
  if (f.dataset.form === 'join-class') {
    busy(true);
    try { const c = await Cloud.joinClass(data.code); toast(`«${c.name}» сыныбына қосылдың!`); Sync.schedule(0); studentTasks = null; render(); }
    catch (err) { toast(cloudErrorText(err)); busy(false); }
    return;
  }
  document.dispatchEvent(new CustomEvent('mq:submit', { detail: { form: f, data, busy } }));
});
document.addEventListener('input', e => {
  const el = e.target, id = el.id;
  if (id === 'course-search') { courseFilter = el.value; $('#course-results').innerHTML = courseResults(); return; }
  if (id === 'game-module') { gameModule = el.value; $('#mission-gallery').innerHTML = missionCards(); return; }
  if (el.classList.contains('input-code')) { const p = el.selectionStart; el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); try { el.setSelectionRange(p, p); } catch {} }
  if (id.startsWith('xp-') || id.startsWith('lab-')) { updateLab(id); return; }
  if (!session || route !== 'quiz') return;
  const it = session.items[session.index], q = question(it.id);
  if (it.checked) return;
  if (id === 'response-number') syncResponse(q, it, el.value);
  if (id === 'challenge-range') { syncResponse(q, it, el.value); $('#challenge-range-value').textContent = el.value; }
  if (el.dataset.match !== undefined) { const i = +el.dataset.match, r = Array.isArray(it.response) ? [...it.response] : Array(q.payload.left.length).fill(null); r[i] = el.value === '' ? null : +el.value; syncResponse(q, it, r); el.closest('.match-row')?.classList.toggle('is-set', el.value !== ''); }
});
document.addEventListener('dragstart', e => { const row = e.target.closest?.('[data-drag-position]'); if (!row || !session || session.items[session.index].checked) return; dragPosition = +row.dataset.dragPosition; e.dataTransfer?.setData('text/plain', String(dragPosition)); row.classList.add('is-dragging'); });
document.addEventListener('dragover', e => { if (e.target.closest?.('[data-drag-position]')) e.preventDefault(); });
document.addEventListener('drop', e => {
  const row = e.target.closest?.('[data-drag-position]'); if (!row || dragPosition === null || !session) return;
  e.preventDefault(); const it = session.items[session.index]; if (it.checked) return;
  const q = question(it.id), r = [...it.response], dest = +row.dataset.dragPosition; r.splice(dest, 0, r.splice(dragPosition, 1)[0]); syncResponse(q, it, r); dragPosition = null; reflow();
});
document.addEventListener('dragend', () => { dragPosition = null; $$('.is-dragging').forEach(el => el.classList.remove('is-dragging')); });
document.addEventListener('keydown', e => {
  if (e.target.matches?.('[data-plot]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
  if (e.key === 'Escape') { document.body.classList.remove('board'); $('#shell')?.classList.remove('nav-open'); return; }
  if (e.target.id === 'response-number' && e.key === 'Enter') { e.preventDefault(); checkAnswer(); return; }
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || $('#modal').open || route !== 'quiz' || !session) return;
  const it = session.items[session.index];
  if (/^[1-4]$/.test(e.key) && !it.checked) $$('[data-option]')[+e.key - 1]?.click();
  if (e.key === 'Enter' && !e.target.closest('button,a')) { e.preventDefault(); it.checked ? nextQ() : checkAnswer(); }
});
window.addEventListener('hashchange', () => { if (!$('#shell').hidden) render(); });
window.addEventListener('pagehide', () => { try { localStorage.setItem(stateKey(), JSON.stringify(state)); } catch {} saveSession(); });

/* ================= Кіру / шығу ================= */
async function enterApp(user, { fresh = false } = {}) {
  me = user; guestMode = !user;
  try { user ? localStorage.removeItem('mathquest-guest') : localStorage.setItem('mathquest-guest', '1'); } catch {}
  const local = readStateFrom(stateKey());
  let remote = null, offline = false;
  if (user) { try { remote = await Cloud.loadProgress(); } catch (e) { offline = e.code === 'network'; } }
  state = remote ? mergeStates(local, normalizeState(remote)) : local;
  if (me && !state.name) state.name = firstName(me.full_name);
  loadSession();
  try { localStorage.setItem(stateKey(), JSON.stringify(state)); } catch {}
  $('#auth').hidden = true; $('#auth').innerHTML = ''; $('#shell').hidden = false; $('#boot')?.remove();
  paintDemoBanner();
  if (user && (!remote || hasProgress(local))) Sync.schedule(800);
  if (offline) Sync.set('offline');
  if (isTeacher() && (!location.hash || location.hash === '#home')) location.replace('#class');
  if (isStudent()) loadStudentTasks(true).then(() => { updateChrome(); if (route === 'home') render(); });
  render();
  const guest = user ? readStateFrom('mathquest-v2') : null;
  if (fresh && guest && hasProgress(guest) && !isTeacher()) {
    modal('Осы құрылғыдағы прогресті қосу керек пе?', `<p>Тіркелмей жинаған прогресс бар: ${guest.mastered.length} дұрыс есеп, ${fmt(guest.xp)} XP. Оны аккаунтыңа қосуға болады.</p>`, '<button class="btn btn-quiet" data-modal="close">Қажет емес</button><button class="btn btn-primary" id="merge-guest">Аккаунтқа қосу</button>');
    $('#merge-guest').onclick = () => { state = mergeStates(state, guest); save(); try { localStorage.removeItem('mathquest-v2'); } catch {} closeModal(); render(); toast('Прогресс аккаунтқа қосылды.'); };
  }
}
async function signOut() {
  await Sync.flush();
  await Cloud.signOut();
  me = null; state = emptyState(); session = null; studentTasks = null; pendingTasks = 0;
  if (typeof Teacher !== 'undefined') Teacher.reset();
  try { localStorage.removeItem('mathquest-guest'); } catch {}
  history.replaceState(null, '', location.pathname + location.search);
  showAuth({ tab: 'login' });
}
function showAuth(opts) { $('#shell').hidden = true; $('#boot')?.remove(); Auth.show(opts); }
function paintDemoBanner() {
  const el = $('#demo-banner');
  let dismissed = false; try { dismissed = sessionStorage.getItem('mathquest-demo-ok') === '1'; } catch {}
  const text = Cloud.serverIssue ? Cloud.issueText + ' Әзірге деректер осы браузерде сақталады.'
    : Cloud.mode === 'local' ? 'Аккаунт пен прогресс осы браузерде сақталады.' : '';
  if (text && me && !dismissed) { el.hidden = false; el.innerHTML = `<span>${text}</span><button class="icon-btn" data-action="hide-demo" aria-label="Жабу">${icon('close')}</button>`; }
  else el.hidden = true;
}

async function boot() {
  try { document.documentElement.dataset.theme = localStorage.getItem('mathquest-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch {}
  buildIndex();
  let user = null;
  try { user = await Cloud.init(); } catch (e) { console.warn(e); }
  let guest = false; try { guest = localStorage.getItem('mathquest-guest') === '1'; } catch {}
  if (user) await enterApp(user);
  else if (guest) await enterApp(null);
  else showAuth();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
