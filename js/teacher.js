'use strict';
/* MathQuest · мұғалім: сынып журналы, оқушы картасы, тапсырмалар, құралдар. */
const Teacher = (() => {
  let classes = null, rosters = {}, tasks = {}, sortKey = 'name', filter = '', loadedAt = {};
  const CURRENT = 'mathquest-teacher-class';
  const currentId = () => { try { return localStorage.getItem(CURRENT); } catch { return null; } };
  const setCurrent = id => { try { localStorage.setItem(CURRENT, id); } catch {} };
  function reset() { classes = null; rosters = {}; tasks = {}; loadedAt = {}; filter = ''; }

  async function getClasses(force) { if (force || !classes) classes = await Cloud.teacherClasses(); return classes; }
  async function getRoster(id, force) {
    if (force || !rosters[id] || Date.now() - (loadedAt[id] || 0) > 60000) { rosters[id] = await Cloud.roster(id); loadedAt[id] = Date.now(); }
    return rosters[id];
  }
  async function getTasks(id, force) { if (force || !tasks[id]) tasks[id] = await Cloud.assignments(id); return tasks[id]; }

  const acc = s => s.answered ? Math.round(s.correct / s.answered * 100) : null;
  const daysSince = iso => iso ? (Date.now() - Date.parse(iso)) / 864e5 : Infinity;
  const needsHelp = s => daysSince(s.last_active) > 7 || (s.answered >= 10 && acc(s) < 50);
  const heat = v => v >= 80 ? 4 : v >= 50 ? 3 : v >= 20 ? 2 : v > 0 ? 1 : 0;
  const siteURL = () => location.origin + location.pathname.replace(/index\.html$/, '');

  /* ---------- Сынып құру (бірінші қадам) ---------- */
  function onboarding() {
    return `<section class="t-onboard">${pageHead('Сынып журналы', 'Сынып құрыңыз — жүйе 6 таңбалы код береді. Оқушылар сол кодпен тіркеліп, прогресі осы журналға түседі.')}
      <ol class="how">
        <li><b>Сынып құрыңыз</b><span>Мысалы, «11 А» немесе «11 Ә — математикалық сауаттылық».</span></li>
        <li><b>Кодты оқушыларға беріңіз</b><span>Тақтада көрсетіңіз немесе чатқа жіберіңіз.</span></li>
        <li><b>Прогресті бақылаңыз</b><span>Кім не меңгерді, кімге көмек керек — журналда бірден көрінеді.</span></li>
      </ol>
      <form class="sheet create-class" data-form="create-class"><label class="field"><span>Сынып атауы</span><input class="input" name="name" maxlength="60" required placeholder="11 А"></label><button class="btn btn-primary">Сынып құру</button></form></section>`;
  }

  /* ---------- Журнал ---------- */
  function classHeader(c, list, tab) {
    return `<header class="t-head">
      <div class="t-title">
        ${list.length > 1 ? `<label class="class-switch"><span class="sr">Сыныпты ауыстыру</span><select class="select select-auto" id="class-switch">${list.map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)} · ${x.students} оқушы</option>`).join('')}<option value="__new">+ Жаңа сынып…</option></select></label>` : `<button class="link small" data-new-class>${icon('plus')} Тағы сынып құру</button>`}
        <h1>${esc(c.name)}</h1>
      </div>
      <div class="code-card"><span>Сынып коды</span><b class="code math" aria-label="Сынып коды ${c.code.split('').join(' ')}">${esc(c.code)}</b><div class="btn-row"><button class="btn btn-ghost btn-sm" data-copy-code="${esc(c.code)}">${icon('copy')} Көшіру</button><button class="btn btn-ghost btn-sm" data-board-code="${c.id}">${icon('board')} Тақтада көрсету</button></div></div>
    </header>
    <nav class="tabs" aria-label="Сынып бөлімдері"><a href="#class/${c.id}" class="${tab === 'journal' ? 'is-on' : ''}">Журнал</a><a href="#class/${c.id}/tasks" class="${tab === 'tasks' ? 'is-on' : ''}">Тапсырмалар</a><a href="#class/${c.id}/settings" class="${tab === 'settings' ? 'is-on' : ''}">Баптау</a></nav>`;
  }
  function sorted(roster) {
    const r = roster.filter(s => !filter || (s.full_name + ' ' + (s.login || '')).toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
    const by = { name: (a, b) => a.full_name.localeCompare(b.full_name, 'kk'), xp: (a, b) => b.xp - a.xp, acc: (a, b) => (acc(b) ?? -1) - (acc(a) ?? -1), lessons: (a, b) => b.lessons_done - a.lessons_done, active: (a, b) => daysSince(a.last_active) - daysSince(b.last_active), help: (a, b) => needsHelp(b) - needsHelp(a) || daysSince(b.last_active) - daysSince(a.last_active) };
    return r.sort(by[sortKey] || by.name);
  }
  function journalRows(c, roster) {
    const rows = sorted(roster);
    if (!rows.length) return `<tr><td colspan="${5 + CURRICULUM.length}" class="muted center">Іздеу бойынша оқушы табылмады.</td></tr>`;
    return rows.map(s => { const a = acc(s), help = needsHelp(s);
      return `<tr data-student="${s.id}" tabindex="0" class="${help ? 'is-help' : ''}">
        <th scope="row"><a href="#class/${c.id}/s/${s.id}"><b>${esc(s.full_name)}</b><small>${esc(s.login || '')}</small></a></th>
        <td><span class="${daysSince(s.last_active) > 7 ? 'txt-red' : ''}">${relTime(s.last_active)}</span></td>
        <td class="num gold">${fmt(s.xp)}</td>
        <td class="num ${a !== null && a < 50 ? 'txt-red' : ''}">${a === null ? '—' : a + '%'}</td>
        <td class="num">${s.lessons_done}<small>/${COURSE_LESSONS.length}</small></td>
        ${CURRICULUM.map(m => { const v = s.module_mastery?.[m.id] || 0; return `<td class="hc h${heat(v)}" title="${esc(m.title)}: ${v}%"><span>${v || ''}</span></td>`; }).join('')}
      </tr>`; }).join('');
  }
  function journal(c, roster) {
    if (!roster.length) return `<div class="sheet invite">
      <h2>Сыныпта әзірге оқушы жоқ</h2>
      <p>Оқушыларға осы нұсқауды беріңіз:</p>
      <ol class="steps steps-big"><li>Сайтты ашу: <b>${esc(siteURL())}</b></li><li>«Тіркелу» → «Оқушымын» таңдау</li><li>Сынып кодын енгізу: <b class="math">${esc(c.code)}</b></li></ol>
      <div class="btn-row"><button class="btn btn-primary" data-board-code="${c.id}">${icon('board')} Кодты тақтада көрсету</button>${Cloud.mode === 'local' ? `<button class="btn btn-quiet" data-seed-demo="${c.id}">Мысал оқушыларды қосу</button>` : ''}</div>
      ${Cloud.mode === 'local' ? '<p class="muted small">Журналдың қалай көрінетінін көру үшін 14 мысал оқушы қосылады (құпиясөзі demo123).</p>' : ''}</div>`;
    const n = roster.length, active = roster.filter(s => daysSince(s.last_active) <= 7).length;
    const withAcc = roster.filter(s => s.answered > 0), avgAcc = withAcc.length ? Math.round(withAcc.reduce((t, s) => t + acc(s), 0) / withAcc.length) : null;
    const avgLessons = Math.round(roster.reduce((t, s) => t + s.lessons_done, 0) / n * 10) / 10, help = roster.filter(needsHelp).length;
    const modAvg = CURRICULUM.map(m => ({ m, v: Math.round(roster.reduce((t, s) => t + (s.module_mastery?.[m.id] || 0), 0) / n) }));
    const weakest = [...modAvg].sort((a, b) => a.v - b.v).slice(0, 3);
    return `<div class="stat-strip">
      <div class="stat"><span class="stat-k">Оқушылар</span><b>${n}</b><span class="stat-n">${active} оқушы осы аптада белсенді</span></div>
      <div class="stat"><span class="stat-k">Орташа дәлдік</span><b>${avgAcc === null ? '—' : avgAcc + '%'}</b><span class="stat-n">барлық жауаптар бойынша</span></div>
      <div class="stat"><span class="stat-k">Меңгерген тақырып</span><b>${String(avgLessons).replace('.', ',')}<small> / ${COURSE_LESSONS.length}</small></b><span class="stat-n">бір оқушыға орташа</span></div>
      <div class="stat ${help ? 'stat-alert' : ''}"><span class="stat-k">Назар аудару керек</span><b>${help}</b><span class="stat-n">7 күннен көп кірмеген немесе дәлдігі 50%-дан төмен</span></div>
    </div>
    <div class="toolbar"><label class="search">${icon('search')}<input class="input" id="roster-search" value="${esc(filter)}" placeholder="Оқушыны іздеу" aria-label="Оқушыны іздеу"></label>
      <label class="sort"><span>Сұрыптау</span><select class="select select-auto" id="roster-sort">${[['name', 'Аты бойынша'], ['help', 'Көмек керек алдымен'], ['xp', 'XP'], ['acc', 'Дәлдік'], ['lessons', 'Меңгерілген тақырып'], ['active', 'Соңғы белсенділік']].map(([k, l]) => `<option value="${k}" ${sortKey === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <span class="grow"></span><button class="btn btn-ghost btn-sm" data-refresh-roster="${c.id}">${icon('refresh')} Жаңарту</button><button class="btn btn-ghost btn-sm" data-export-roster="${c.id}">${icon('download')} CSV</button></div>
    <div class="journal-wrap"><table class="journal">
      <thead><tr><th scope="col" class="sticky">Оқушы</th><th scope="col">Белсенділік</th><th scope="col">XP</th><th scope="col">Дәлдік</th><th scope="col">Тақырып</th>${CURRICULUM.map(m => `<th scope="col" class="hc-h" title="${esc(m.title)}"><span>${m.symbol}</span><small>${pad2(m.number)}</small></th>`).join('')}</tr></thead>
      <tbody id="journal-body">${journalRows(c, roster)}</tbody></table></div>
    <div class="legend"><span>Бөлімді меңгеру:</span><i class="hc h0"></i>0 <i class="hc h1"></i>1–19% <i class="hc h2"></i>20–49% <i class="hc h3"></i>50–79% <i class="hc h4"></i>80–100%</div>
    <div class="t-insights">
      <div class="sheet"><h2>Сыныптың бөлімдер бойынша меңгеруі</h2><div class="bars">${modAvg.map(({ m, v }) => `<div class="bar-row"><span>${esc(m.title)}</span>${meter(v, m.color)}<b>${v}%</b></div>`).join('')}</div></div>
      <div class="sheet tint"><h2>Ең әлсіз бөлімдер</h2><p class="muted">Осы бөлімдерді сабақта қайталап, тапсырма ретінде беруге болады.</p><ol class="weak">${weakest.map(({ m, v }) => `<li>${glyph(m, 'glyph-sm')}<span><b>${esc(m.title)}</b><small>Сынып бойынша ${v}%</small></span><a class="btn btn-ghost btn-sm" href="#class/${c.id}/tasks" data-prefill-module="${m.id}">Тапсырма беру</a></li>`).join('')}</ol></div>
    </div>`;
  }

  /* ---------- Оқушы картасы ---------- */
  async function studentView(c, sid) {
    const roster = await getRoster(c.id), s = roster.find(x => x.id === sid);
    if (!s) return emptyBlock('Оқушы табылмады', 'Ол сыныптан шығарылған болуы мүмкін.', 'Журналға оралу', 'class/' + c.id);
    const raw = await Cloud.studentState(sid).catch(() => null), st = normalizeState(raw || {});
    const classTasks = await getTasks(c.id).catch(() => []);
    const days = Array.from({ length: 14 }, (_, i) => dateKey(new Date(Date.now() - (13 - i) * 864e5))), max = Math.max(1, ...days.map(d => st.activity[d]?.answered || 0));
    const wrongBy = {}; st.wrong.forEach(id => { const q = question(id); if (q) (wrongBy[q.topic] = wrongBy[q.topic] || []).push(q); });
    const weak = Object.entries(wrongBy).sort((a, b) => b[1].length - a[1].length).slice(0, 4);
    const a = acc(s);
    return `<section><a href="#class/${c.id}" class="back">${icon('back')} ${esc(c.name)} журналы</a>
      <header class="s-head"><span class="avatar avatar-lg">${esc(s.full_name.trim()[0] || '?')}</span><div><h1>${esc(s.full_name)}</h1><p class="lede">Логин: <b>${esc(s.login || '—')}</b> · сыныпта ${longDate(new Date(s.joined_at))} бастап · соңғы белсенділік: ${relTime(s.last_active)}</p></div>
      <div class="btn-row"><button class="btn btn-quiet btn-sm" data-reset-pw="${s.id}" data-name="${esc(s.full_name)}">${icon('key')} Жаңа құпиясөз</button><button class="btn btn-ghost btn-sm txt-red" data-remove-student="${s.id}" data-class="${c.id}" data-name="${esc(s.full_name)}">Сыныптан шығару</button></div></header>
      <div class="stat-strip">
        <div class="stat"><span class="stat-k">Тәжірибе</span><b class="gold">${fmt(s.xp)}<small> XP</small></b><span class="stat-n">${s.mastered_count} бірегей дұрыс есеп</span></div>
        <div class="stat"><span class="stat-k">Дәлдік</span><b class="${a !== null && a < 50 ? 'txt-red' : ''}">${a === null ? '—' : a + '%'}</b><span class="stat-n">${fmt(s.answered)} жауап</span></div>
        <div class="stat"><span class="stat-k">Меңгерген тақырып</span><b>${s.lessons_done}<small> / ${COURSE_LESSONS.length}</small></b><span class="stat-n">${Object.keys(s.lesson_mastery || {}).length} тақырыпты бастаған</span></div>
        <div class="stat"><span class="stat-k">Қатарынан</span><b>${s.streak}<small> күн</small></b><span class="stat-n">белсенді күндер</span></div>
      </div>
      <div class="progress-grid">
        <div class="sheet"><h2>Бөлімдер</h2><div class="bars">${CURRICULUM.map(m => { const v = s.module_mastery?.[m.id] || 0; return `<div class="bar-row"><span>${esc(m.title)}</span>${meter(v, m.color)}<b>${v}%</b></div>`; }).join('')}</div></div>
        <div class="col-stack">
          <div class="sheet"><h2>Соңғы 14 күн</h2><div class="week">${days.map(d => { const n = st.activity[d]?.answered || 0; return `<div class="week-col" title="${d}: ${n} есеп"><b>${n || ''}</b><i style="height:${Math.max(3, n / max * 96)}px" class="${d === today() ? 'is-today' : ''}"></i><span>${d.slice(8)}</span></div>`; }).join('')}</div></div>
          <div class="sheet"><h2>Қиындық тудырған бөлімдер</h2>${weak.length ? `<ul class="weak-list">${weak.map(([mid, qs]) => `<li><b>${esc(moduleOf(mid)?.title || mid)}</b><span class="chip chip-red">${qs.length} қате есеп</span><small>${esc(qs[0].q.slice(0, 110))}${qs[0].q.length > 110 ? '…' : ''}</small></li>`).join('')}</ul>` : '<p class="muted">Шешілмеген қате есептер жоқ.</p>'}</div>
        </div>
      </div>
      ${classTasks.length ? `<div class="sheet"><h2>Тапсырмалар</h2><ul class="asg-mini">${classTasks.map(t => { const p = assignmentProgress(t, s.lesson_mastery || {}); return `<li><span><b>${esc(t.title)}</b><small>${dueLabel(t.due_date)}</small></span>${meter(p, p === 100 ? 'var(--ok)' : 'var(--ink)')}<b>${p}%</b></li>`; }).join('')}</ul></div>` : ''}
      <div class="sheet"><h2>Соңғы жаттығулар</h2>${st.history.length ? `<div class="hist">${st.history.slice(0, 12).map(h => `<div class="hist-row"><span class="hist-ico">${h.mode === 'exam' ? '◷' : h.mode === 'marathon' ? '30' : '✦'}</span><span><b>${h.mode === 'exam' ? 'Өзіндік сынақ' : moduleOf(h.topic)?.title || 'Аралас жаттығу'}</b><small>${dateTime(h.date)}</small></span><span class="hist-score ${h.score / h.total < .5 ? 'txt-red' : ''}">${h.score} / ${h.total}</span></div>`).join('')}</div>` : '<p class="muted">Әзірге аяқталған жаттығу жоқ.</p>'}</div>
    </section>`;
  }

  /* ---------- Тапсырмалар ---------- */
  let prefillModule = '';
  function taskForm(c) {
    const mod = prefillModule || CURRICULUM[0].id, m = moduleOf(mod);
    const due = dateKey(new Date(Date.now() + 7 * 864e5));
    return `<form class="sheet task-form" data-form="create-task" data-class="${c.id}">
      <h2>Жаңа тапсырма</h2>
      <div class="form-grid form-2"><label class="field"><span>Атауы</span><input class="input" name="title" maxlength="120" required value="${esc(m.title)}"></label><label class="field"><span>Мерзімі</span><input class="input" type="date" name="due_date" value="${due}"></label></div>
      <label class="field"><span>Бөлім</span><select class="select" id="task-module">${CURRICULUM.map(x => `<option value="${x.id}" ${x.id === mod ? 'selected' : ''}>${pad2(x.number)} · ${esc(x.title)}</option>`).join('')}</select></label>
      <fieldset class="lesson-pick" id="lesson-pick"><legend>Тақырыптар <button type="button" class="link" data-pick-all>Барлығын белгілеу</button></legend>${lessonChecks(mod)}</fieldset>
      <label class="field"><span>Түсініктеме (міндетті емес)</span><textarea class="input" name="note" maxlength="500" rows="2" placeholder="Мысалы: түсіндірмені оқып, 3 тапсырманы орында."></textarea></label>
      <button class="btn btn-primary">Тапсырма беру</button></form>`;
  }
  const lessonChecks = mod => moduleOf(mod).lessons.map((l, i) => `<label class="check"><input type="checkbox" name="lesson" value="${l.id}" ${i < 3 ? 'checked' : ''}><span>${esc(l.title)}</span></label>`).join('');
  async function tasksTab(c) {
    const [list, roster] = await Promise.all([getTasks(c.id), getRoster(c.id)]);
    const card = t => {
      const per = roster.map(s => ({ s, p: assignmentProgress(t, s.lesson_mastery || {}) }));
      const done = per.filter(x => x.p === 100).length, avg = per.length ? Math.round(per.reduce((a, x) => a + x.p, 0) / per.length) : 0;
      return `<details class="asg"><summary><div><b>${esc(t.title)}</b><small>${(t.lesson_ids || []).length} тақырып · ${dueLabel(t.due_date)}${t.due_date ? ' (' + longDate(new Date(t.due_date + 'T12:00:00+05:00')) + ')' : ''}</small></div><span class="asg-stat"><b>${done}</b>/${roster.length} орындады</span>${meter(avg, 'var(--ink)')}</summary>
        <div class="asg-body">${t.note ? `<p class="task-note">${esc(t.note)}</p>` : ''}<p class="muted small">${(t.lesson_ids || []).map(id => esc(courseLesson(id)?.title || id)).join(' · ')}</p>
        ${per.length ? `<ul class="asg-students">${per.sort((a, b) => a.p - b.p).map(({ s, p }) => `<li><a href="#class/${c.id}/s/${s.id}">${esc(s.full_name)}</a>${meter(p, p === 100 ? 'var(--ok)' : 'var(--ink)')}<b>${p}%</b></li>`).join('')}</ul>` : '<p class="muted">Сыныпта оқушы жоқ.</p>'}
        <button class="btn btn-ghost btn-sm txt-red" data-delete-task="${t.id}" data-class="${c.id}">${icon('trash')} Тапсырманы жою</button></div></details>`;
    };
    return `<div class="tasks-grid">${taskForm(c)}<div><h2 class="sub-h">Берілген тапсырмалар</h2>${list.length ? `<div class="asg-list">${list.map(card).join('')}</div>` : '<p class="muted">Әзірге тапсырма жоқ. Сол жақтағы формамен алғашқысын беріңіз — оқушылар оны «Тапсырмалар» бетінен көреді.</p>'}</div></div>`;
  }
  function settingsTab(c) {
    return `<div class="settings-grid">
      <form class="sheet" data-form="rename-class" data-class="${c.id}"><h2>Сынып атауы</h2><div class="inline-form"><input class="input" name="name" maxlength="60" value="${esc(c.name)}" required><button class="btn btn-quiet">Сақтау</button></div></form>
      <div class="sheet"><h2>Оқушылар қалай қосылады</h2><ol class="steps"><li>Сайт: <b>${esc(siteURL())}</b></li><li>«Тіркелу» → «Оқушымын»</li><li>Сынып коды: <b class="math">${esc(c.code)}</b></li></ol><p class="muted small">Бұрын тіркелген оқушы кодты «Аккаунт» бетінен енгізе алады.</p></div>
      <div class="sheet danger-zone"><h2>Сыныпты жою</h2><p class="muted">Сынып, оның тапсырмалары және оқушылардың сыныпқа мүшелігі жойылады. Оқушылардың аккаунттары мен прогресі сақталады.</p><button class="btn btn-danger" data-delete-class="${c.id}" data-name="${esc(c.name)}">${icon('trash')} Сыныпты жою</button></div></div>`;
  }

  /* ---------- Маршрут ---------- */
  VIEWS.class = async (id, sub, sid) => {
    if (!isTeacher()) return emptyBlock('Бұл бет мұғалімдерге арналған', 'Мұғалім аккаунтымен кіріңіз.', 'Басты бет', 'home');
    const list = await getClasses();
    if (!list.length) return onboarding();
    let c = list.find(x => x.id === id);
    if (!c) { c = list.find(x => x.id === currentId()) || list[0]; history.replaceState(null, '', '#class/' + c.id + (sub ? '/' + sub + (sid ? '/' + sid : '') : '')); route = 'class/' + c.id; }
    setCurrent(c.id);
    if (sub === 's' && sid) return studentView(c, sid);
    const tab = sub === 'tasks' ? 'tasks' : sub === 'settings' ? 'settings' : 'journal';
    let body;
    if (tab === 'tasks') body = await tasksTab(c);
    else if (tab === 'settings') body = settingsTab(c);
    else body = journal(c, await getRoster(c.id));
    return `<section class="t-page">${classHeader(c, list, tab)}${body}</section>`;
  };

  /* ---------- Құралдар (жұмыс парағы, тапсырмалар банкі) ---------- */
  let showAnswers = false;
  VIEWS.tools = () => `<section>${pageHead('Мұғалім құралдары', 'Жұмыс парағын басып шығарыңыз, тақта режимін қосыңыз немесе тапсырмалар банкін қараңыз.')}
    <div class="practice-grid">
      <div class="sheet build"><h2>Жұмыс парағы</h2><div class="form-grid form-2"><label class="field"><span>Бөлім</span><select id="sheet-topic" class="select"><option value="mixed">Аралас</option>${CURRICULUM.map(m => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select></label><label class="field"><span>Есеп саны</span><select id="sheet-count" class="select"><option value="5">5 есеп</option><option value="10">10 есеп</option><option value="15">15 есеп</option></select></label></div>
        <label class="check"><input type="checkbox" id="sheet-key"><span>Жауап кілтін бөлек бетке қосу</span></label>
        <button class="btn btn-primary" data-action="print-sheet">${icon('download')} Басып шығару / PDF</button><p class="muted small">Басып шығару терезесінде «PDF ретінде сақтау» таңдаңыз. Формат — A4.</p></div>
      <div class="sheet"><h2>Сабақта</h2><div class="btn-row"><button class="btn btn-quiet" data-action="board">${icon('board')} ${document.body.classList.contains('board') ? 'Қалыпты көрініс' : 'Тақта режимі'}</button><button class="btn btn-quiet" data-action="fullscreen">Толық экран</button></div><p class="muted small">Тақта режимі мәзірді жасырып, мәтінді үлкейтеді. Шығу — Esc.</p></div>
    </div>
    <div class="sheet"><div class="sheet-head"><h2>Тапсырмалар банкі</h2><span class="chip">${BANK.length} есеп</span></div>
      <div class="toolbar"><label class="search">${icon('search')}<input class="input" id="bank-search" placeholder="Есеп мәтіні бойынша іздеу" aria-label="Есеп іздеу"></label><select class="select select-auto" id="bank-topic" aria-label="Бөлім"><option value="all">Барлық бөлім</option>${CURRICULUM.map(m => `<option value="${m.id}">${esc(m.title)}</option>`).join('')}</select><button class="btn btn-quiet btn-sm" data-action="teacher-answers">${showAnswers ? 'Жауаптарды жасыру' : 'Жауаптарды көрсету'}</button></div>
      <div id="bank-table">${bankTable(BANK)}</div></div></section>`;
  function bankTable(qs) {
    const shown = qs.slice(0, 200);
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Есеп</th><th>Бөлім</th><th>Формат</th>${showAnswers ? '<th>Жауап</th>' : ''}</tr></thead><tbody>${shown.map(q => `<tr><td>${esc(q.q)}</td><td>${esc(moduleOf(q.topic)?.title || '')}</td><td>${FORMAT_LABELS[q.type || 'choice']}</td>${showAnswers ? `<td>${esc(q.type && !['choice', 'tf'].includes(q.type) ? correctText(q) : q.o[q.a])}</td>` : ''}</tr>`).join('')}</tbody></table></div>${!qs.length ? '<p class="muted">Есеп табылмады.</p>' : qs.length > 200 ? `<p class="muted small">Алғашқы 200 есеп көрсетілді (${qs.length} табылды). Іздеуді нақтылаңыз.</p>` : ''}`;
  }
  function filterBank() { const v = ($('#bank-search')?.value || '').toLocaleLowerCase(), t = $('#bank-topic')?.value || 'all'; $('#bank-table').innerHTML = bankTable(BANK.filter(q => (t === 'all' || q.topic === t) && q.q.toLocaleLowerCase().includes(v))); }
  function printableTask(q) {
    const kind = q.type || 'choice';
    if (kind === 'number') return '<div class="print-options">Жауап: _____________________</div>';
    if (kind === 'match') return `<div class="print-options">${q.payload.left.map((l, i) => `${i + 1}. ${esc(l)} → _____`).join('<br>')}<br>Нұсқалар: ${shuffle(q.payload.right).map(esc).join(' · ')}</div>`;
    if (kind === 'order') return `<div class="print-options">${shuffle(q.payload.items).map((s, i) => `${String.fromCharCode(65 + i)}. ${esc(s)}`).join('<br>')}<br>Дұрыс реті: _____________________</div>`;
    if (kind === 'multi') return `<div class="print-options">Барлық дұрыс нұсқаны белгіле.<br>${q.payload.items.map(s => '□ ' + esc(s)).join('<br>')}</div>`;
    if (kind === 'plot') return '<div class="print-options">Координата: ( _____ ; _____ )</div>';
    if (kind === 'range') return `<div class="print-options">Жауап: __________ ${esc(q.payload.unit)}</div>`;
    return `<p class="print-options">${q.o.slice(0, kind === 'tf' ? 2 : 4).map((o, i) => `${'ABCD'[i]}) ${esc(o)}`).join(' &nbsp;&nbsp; ')}</p>`;
  }
  function printSheet() {
    const t = $('#sheet-topic').value, n = +$('#sheet-count').value, key = $('#sheet-key').checked, qs = shuffle(BANK.filter(q => t === 'mixed' || q.topic === t)).slice(0, n);
    const sheet = $('#worksheet');
    sheet.innerHTML = `<h1>MathQuest · Жұмыс парағы</h1><p>${t === 'mixed' ? 'Математикалық сауаттылық' : esc(moduleOf(t).title)} · 11-сынып${me?.school ? ' · ' + esc(me.school) : ''}</p><p class="ws-credit">Жоба авторы: Рахметқұлова Жаңыл Рахметқұлқызы · №6 орта мектебі</p><p>Аты-жөні: _______________________________ Күні: ____________</p>${qs.map((q, i) => `<div class="print-q"><small>${FORMAT_LABELS[q.type || 'choice']}</small><strong>${i + 1}. ${esc(q.q)}</strong>${q.visual ? visual(q.visual) : ''}${printableTask(q)}<div class="answer-lines"></div></div>`).join('')}${key ? `<div class="print-key"><h2>Жауап кілті</h2>${qs.map((q, i) => `<p><b>${i + 1}. ${esc(q.type && !['choice', 'tf'].includes(q.type) ? correctText(q) : q.o[q.a])}</b><br>${esc(q.e)}</p>`).join('')}</div>` : ''}`;
    window.print();
  }
  Object.assign(ACTIONS, {
    'print-sheet': printSheet,
    'board': () => { document.body.classList.toggle('board'); reflow(); toast(document.body.classList.contains('board') ? 'Тақта режимі қосылды. Шығу — Esc.' : 'Қалыпты көрініс.'); },
    'fullscreen': () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().catch(() => toast('Бұл браузерде толық экран қолжетімсіз.')); },
    'teacher-answers': el => { showAnswers = !showAnswers; el.textContent = showAnswers ? 'Жауаптарды жасыру' : 'Жауаптарды көрсету'; filterBank(); }
  });

  /* ---------- Демо оқушылар ---------- */
  const DEMO_NAMES = ['Аружан Бекова', 'Діас Нұрланов', 'Айым Серікқызы', 'Нұрсұлтан Әлиев', 'Жансая Төлегенова', 'Ерасыл Қайратұлы', 'Томирис Жақсылықова', 'Алихан Мұратов', 'Дана Ержанқызы', 'Бекзат Асқаров', 'Мадина Сапарова', 'Ернұр Болатов', 'Аяулым Ғалымқызы', 'Санжар Тимурұлы'];
  const LAT = { а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'n', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'u', ү: 'u', ф: 'f', х: 'h', һ: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sh', ы: 'y', і: 'i', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '' };
  const translit = s => s.toLowerCase().split('').map(ch => LAT[ch] ?? ch).join('').replace(/[^a-z0-9]/g, '');
  function demoStudent(name, i) {
    let seed = (i + 3) * 9301; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const skill = .35 + rnd() * .6, reach = Math.floor(3 + rnd() * 11), inactive = i % 6 === 5;
    const s = emptyState(); s.name = name.split(' ')[0];
    CURRICULUM.forEach((m, mi) => { if (mi > reach) return; for (const id of IDX.topic.get(m.id) || []) if (rnd() < skill * (1 - mi / 22)) s.mastered.push(id); else if (rnd() < .25) s.wrong.push(id); });
    s.xp = s.mastered.length * 10;
    s.answered = Math.round(s.mastered.length / Math.max(.3, skill) + s.wrong.length); s.correct = Math.min(s.answered, Math.round(s.answered * skill));
    const offset = inactive ? 9 + Math.floor(rnd() * 6) : 0;
    for (let d = offset; d < 14 + offset; d++) if (rnd() < .55) { const n = 3 + Math.floor(rnd() * 12); s.activity[dateKey(new Date(Date.now() - d * 864e5))] = { answered: n, correct: Math.round(n * skill) }; }
    for (let h = 0; h < 6; h++) { const m = CURRICULUM[Math.floor(rnd() * Math.min(reach + 1, 15))], ids = IDX.topic.get(m.id).slice(0, 5), score = Math.max(0, Math.min(5, Math.round(5 * skill + (rnd() - .5) * 2.4))); s.history.push({ id: 'd' + i + h, topic: m.id, mode: h === 2 ? 'exam' : 'practice', items: ids.map((id, k) => ({ id, answer: k < score ? question(id).a : (question(id).a + 1) % question(id).o.length })), score, total: 5, time: 180 + Math.round(rnd() * 240), date: new Date(Date.now() - (offset + .08 + rnd() * .9 + h * 1.7) * 864e5).toISOString(), xp: 0 }); }
    const n = normalizeState(s);
    return { full_name: name, login: translit(name.split(' ')[0]), state: n, summary: progressSummary(n) };
  }

  const newClassModal = () => modal('Жаңа сынып', '<form data-form="create-class" id="new-class-form"><label class="field"><span>Сынып атауы</span><input class="input" name="name" maxlength="60" required placeholder="11 Ә"></label></form>', '<button class="btn btn-quiet" data-modal="close">Болдырмау</button><button class="btn btn-primary" form="new-class-form">Құру</button>');

  /* ---------- Оқиғалар ---------- */
  document.addEventListener('click', async e => {
    const el = e.target.closest('button,a,tr[data-student]'); if (!el || !isTeacher()) return;
    const ds = el.dataset;
    if (el.matches('tr[data-student]') && !e.target.closest('a')) { const cid = currentId(); location.hash = `class/${cid}/s/${ds.student}`; return; }
    if (el.hasAttribute('data-new-class')) { newClassModal(); return; }
    if (ds.copyCode) { try { await navigator.clipboard.writeText(ds.copyCode); toast('Код көшірілді: ' + ds.copyCode); } catch { toast('Код: ' + ds.copyCode); } return; }
    if (ds.boardCode) { const c = classes.find(x => x.id === ds.boardCode); modal(c.name, `<div class="board-code"><p>Сайтқа кіріп, «Тіркелу» → «Оқушымын» таңдаңдар да, кодты енгізіңдер:</p><b class="math">${esc(c.code)}</b><p class="board-url">${esc(siteURL())}</p></div>`, '', { cls: 'modal-board' }); return; }
    if (ds.refreshRoster) { await getRoster(ds.refreshRoster, true).catch(err => toast(cloudErrorText(err))); render(); toast('Журнал жаңартылды.'); return; }
    if (ds.exportRoster) {
      const r = await getRoster(ds.exportRoster), c = classes.find(x => x.id === ds.exportRoster);
      download(`MathQuest_${c.name.replace(/[^\p{L}\p{N}]+/gu, '_')}.csv`, toCSV([['Аты-жөні', 'Логин', 'XP', 'Дәлдік %', 'Жауаптар', 'Меңгерген тақырып', 'Қатарынан күн', 'Соңғы белсенділік', ...CURRICULUM.map(m => m.title + ' %')], ...r.map(s => [s.full_name, s.login, s.xp, acc(s) ?? '', s.answered, s.lessons_done, s.streak, s.last_active ? csvDate(s.last_active) : '', ...CURRICULUM.map(m => s.module_mastery?.[m.id] || 0)])]), 'text/csv;charset=utf-8');
      return;
    }
    if (ds.seedDemo) { el.disabled = true; await Cloud.seedStudents(ds.seedDemo, DEMO_NAMES.map(demoStudent)); await getRoster(ds.seedDemo, true); classes = null; render(); toast('14 мысал оқушы қосылды.'); return; }
    if (ds.prefillModule) { prefillModule = ds.prefillModule; return; }
    if (ds.pickAll !== undefined) { const boxes = $$('#lesson-pick input'); const all = boxes.every(b => b.checked); boxes.forEach(b => b.checked = !all); return; }
    if (ds.resetPw) {
      modal('Жаңа құпиясөз', `<p>${esc(ds.name)} үшін жаңа құпиясөз жазыңыз да, оқушыға айтыңыз.</p><label class="field"><span>Жаңа құпиясөз</span><input class="input" id="new-pw" minlength="6" value="${Math.random().toString(36).slice(2, 8)}"></label>`, '<button class="btn btn-quiet" data-modal="close">Болдырмау</button><button class="btn btn-primary" id="save-pw">Сақтау</button>');
      $('#save-pw').onclick = async () => { try { await Cloud.resetPassword(ds.resetPw, $('#new-pw').value); closeModal(); toast('Құпиясөз жаңартылды.'); } catch (err) { toast(cloudErrorText(err)); } };
      return;
    }
    if (ds.removeStudent) { confirmModal('Сыныптан шығару', `${ds.name} сыныптан шығарылады. Оның аккаунты мен прогресі сақталады.`, 'Шығару', async () => { try { await Cloud.removeStudent(ds.class, ds.removeStudent); delete rosters[ds.class]; classes = null; location.hash = 'class/' + ds.class; toast('Оқушы сыныптан шығарылды.'); } catch (err) { toast(cloudErrorText(err)); } }, true); return; }
    if (ds.deleteTask) { confirmModal('Тапсырманы жою', 'Тапсырма оқушылардың тізімінен де жойылады.', 'Жою', async () => { try { await Cloud.deleteAssignment(ds.deleteTask); delete tasks[ds.class]; render(); } catch (err) { toast(cloudErrorText(err)); } }, true); return; }
    if (ds.deleteClass) { confirmModal('Сыныпты жою', `«${ds.name}» сыныбы жойылады. Бұл әрекетті қайтару мүмкін емес.`, 'Жою', async () => { try { await Cloud.deleteClass(ds.deleteClass); reset(); location.hash = 'class'; toast('Сынып жойылды.'); } catch (err) { toast(cloudErrorText(err)); } }, true); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches?.('tr[data-student]')) location.hash = `class/${currentId()}/s/${e.target.dataset.student}`; });
  document.addEventListener('input', e => {
    if (!isTeacher()) return;
    const el = e.target;
    if (el.id === 'roster-search') { filter = el.value; const c = classes?.find(x => x.id === currentId()); if (c && rosters[c.id]) $('#journal-body').innerHTML = journalRows(c, rosters[c.id]); }
    if (el.id === 'roster-sort') { sortKey = el.value; const c = classes?.find(x => x.id === currentId()); if (c && rosters[c.id]) $('#journal-body').innerHTML = journalRows(c, rosters[c.id]); }
    if (el.id === 'class-switch') { if (el.value === '__new') { el.value = currentId(); newClassModal(); } else location.hash = 'class/' + el.value; }
    if (el.id === 'task-module') { prefillModule = el.value; $('#lesson-pick').innerHTML = `<legend>Тақырыптар <button type="button" class="link" data-pick-all>Барлығын белгілеу</button></legend>${lessonChecks(el.value)}`; const t = el.form.querySelector('[name=title]'); if (CURRICULUM.some(m => m.title === t.value) || !t.value) t.value = moduleOf(el.value).title; }
    if (el.id === 'bank-search' || el.id === 'bank-topic') filterBank();
  });
  document.addEventListener('mq:submit', async e => {
    const { form, data, busy } = e.detail; if (!isTeacher()) return;
    if (form.dataset.form === 'create-class') {
      busy(true);
      try { const c = await Cloud.createClass(String(data.name).trim()); classes = null; closeModal(); location.hash = 'class/' + c.id; toast(`«${c.name}» сыныбы құрылды. Коды: ${c.code}`); }
      catch (err) { toast(cloudErrorText(err)); busy(false); }
    }
    if (form.dataset.form === 'rename-class') {
      busy(true);
      try { await Cloud.renameClass(form.dataset.class, String(data.name).trim()); classes = null; toast('Атауы сақталды.'); render(); } catch (err) { toast(cloudErrorText(err)); busy(false); }
    }
    if (form.dataset.form === 'create-task') {
      const lesson_ids = [...form.querySelectorAll('input[name=lesson]:checked')].map(i => i.value);
      if (!lesson_ids.length) { toast('Кемінде бір тақырып белгілеңіз.'); return; }
      busy(true);
      try { await Cloud.createAssignment({ class_id: form.dataset.class, title: String(data.title).trim(), note: String(data.note || '').trim() || null, due_date: data.due_date || null, lesson_ids }); delete tasks[form.dataset.class]; prefillModule = ''; toast('Тапсырма берілді.'); render(); }
      catch (err) { toast(cloudErrorText(err)); busy(false); }
    }
  });
  return { reset };
})();
