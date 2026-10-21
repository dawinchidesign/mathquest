'use strict';
/*
 * MathQuest Cloud — аккаунттар, сыныптар және прогресс.
 * Барлық деректер осы браузердің localStorage-інде сақталады (сервер жоқ).
 */
const Cloud = (() => {
  const cfg = window.MATHQUEST_CONFIG || {};
  const DOMAIN = cfg.STUDENT_EMAIL_DOMAIN || 'student.mathquest.app';
  const LOGIN_RE = /^[a-z0-9._-]{3,24}$/;
  const CODE_RE = /^[A-Z0-9]{6}$/;
  const normLogin = s => String(s || '').trim().toLowerCase();
  const normCode = s => String(s || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const loginEmail = l => `${normLogin(l)}@${DOMAIN}`;
  const PROFILE_CACHE = 'mathquest-profile';

  class CloudError extends Error {
    constructor(code, detail) { super(detail || code); this.code = code; }
  }

  function cacheProfile(p) { try { p ? localStorage.setItem(PROFILE_CACHE, JSON.stringify(p)) : localStorage.removeItem(PROFILE_CACHE); } catch {} }

  function validateSignup(kind, d) {
    if (!String(d.full_name || '').trim()) throw new CloudError('name_required');
    if (String(d.password || '').length < 6) throw new CloudError('weak_password');
    if (kind === 'student' && !LOGIN_RE.test(normLogin(d.login))) throw new CloudError('bad_login');
    if (kind === 'teacher' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email || '').trim())) throw new CloudError('bad_email');
    if (d.class_code && !CODE_RE.test(normCode(d.class_code))) throw new CloudError('class_not_found');
  }

  /* ------------------------------------------------------------------ */
  /* Жергілікті сақтау (localStorage)                                     */
  /* ------------------------------------------------------------------ */
  function demoBackend() {
    const KEY = 'mathquest-demo-db', SESSION = 'mathquest-demo-session';
    const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
    const empty = () => ({ users: [], classes: [], members: [], progress: {}, assignments: [] });
    const load = () => { try { return { ...empty(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; } catch { return empty(); } };
    const store = db => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { throw new CloudError('storage'); } };
    const pause = () => new Promise(r => setTimeout(r, 120));
    async function hash(pw, salt) {
      const text = salt + ':' + pw;
      if (crypto.subtle && window.TextEncoder) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      }
      let h = 5381; for (const c of text) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return 'f' + h.toString(16);
    }
    let user = null;
    const pub = u => ({ id: u.id, role: u.role, full_name: u.full_name, login: u.login || null, school: u.school || null, email: u.login ? null : u.email });
    const need = role => { if (!user) throw new CloudError('forbidden'); if (role && user.role !== role) throw new CloudError(role === 'teacher' ? 'forbidden' : 'only_students'); };
    const ownClass = (db, id) => { const c = db.classes.find(c => c.id === id && c.teacher_id === user.id); if (!c) throw new CloudError('forbidden'); return c; };
    const genCode = db => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c; do { c = Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join(''); } while (db.classes.some(x => x.code === c)); return c; };

    async function createUser(db, { email, password, role, full_name, login, school }) {
      const salt = uid();
      const u = { id: uid(), email, salt, pw: await hash(password, salt), role, full_name: full_name.trim().slice(0, 80), login: login || null, school: (school || '').trim() || null, created_at: new Date().toISOString() };
      db.users.push(u);
      db.progress[u.id] = { state: {}, xp: 0, answered: 0, correct: 0, mastered_count: 0, lessons_done: 0, streak: 0, module_mastery: {}, lesson_mastery: {}, last_active: null };
      return u;
    }
    function startSession(u) { user = pub(u); try { localStorage.setItem(SESSION, u.id); } catch {} cacheProfile(user); return user; }

    return {
      mode: 'local',
      get user() { return user; },
      async init() {
        let id; try { id = localStorage.getItem(SESSION); } catch {}
        const u = id && load().users.find(u => u.id === id);
        return u ? startSession(u) : null;
      },
      async signIn(identifier, password) {
        await pause();
        const id = String(identifier || '').trim().toLowerCase();
        const db = load();
        const u = db.users.find(u => (id.includes('@') ? u.email === id : u.login === id));
        if (!u || u.pw !== await hash(password, u.salt)) throw new CloudError('invalid_credentials');
        return startSession(u);
      },
      async signUpTeacher(d) {
        validateSignup('teacher', d); await pause();
        const db = load(), email = d.email.trim().toLowerCase();
        if (db.users.some(u => u.email === email)) throw new CloudError('email_taken');
        const u = await createUser(db, { ...d, email, role: 'teacher' });
        store(db); return startSession(u);
      },
      async signUpStudent(d) {
        validateSignup('student', d); await pause();
        const db = load(), login = normLogin(d.login), code = normCode(d.class_code);
        if (db.users.some(u => u.login === login)) throw new CloudError('login_taken');
        const cls = code ? db.classes.find(c => c.code === code) : null;
        if (code && !cls) throw new CloudError('class_not_found');
        const u = await createUser(db, { ...d, login, email: loginEmail(login), role: 'student' });
        if (cls) db.members.push({ class_id: cls.id, student_id: u.id, joined_at: new Date().toISOString() });
        store(db); return startSession(u);
      },
      async signOut() { user = null; try { localStorage.removeItem(SESSION); } catch {} cacheProfile(null); },
      async updateProfile(p) {
        need(); const db = load(), u = db.users.find(u => u.id === user.id);
        u.full_name = String(p.full_name || '').trim().slice(0, 80) || u.full_name;
        if (p.school !== undefined) u.school = p.school;
        store(db); return startSession(u);
      },
      async classPreview(code) {
        const db = load(), c = db.classes.find(c => c.code === normCode(code));
        if (!c) return null;
        return { class_name: c.name, teacher_name: db.users.find(u => u.id === c.teacher_id)?.full_name || '' };
      },
      async loginAvailable(login) { return !load().users.some(u => u.login === normLogin(login)); },

      async loadProgress() { need(); const s = load().progress[user.id]?.state; return s && Object.keys(s).length ? s : null; },
      async saveProgress(state, summary) {
        need(); const db = load();
        db.progress[user.id] = { ...(db.progress[user.id] || {}), state, ...summary, updated_at: new Date().toISOString() };
        store(db);
      },

      async myClasses() {
        need(); const db = load();
        return db.members.filter(m => m.student_id === user.id).map(m => {
          const c = db.classes.find(c => c.id === m.class_id);
          return c && { id: c.id, name: c.name, code: c.code, teacher_name: db.users.find(u => u.id === c.teacher_id)?.full_name || '' };
        }).filter(Boolean);
      },
      async joinClass(code) {
        need('student'); await pause();
        const db = load(), c = db.classes.find(c => c.code === normCode(code));
        if (!c) throw new CloudError('class_not_found');
        if (!db.members.some(m => m.class_id === c.id && m.student_id === user.id)) db.members.push({ class_id: c.id, student_id: user.id, joined_at: new Date().toISOString() });
        store(db); return c;
      },
      async leaveClass(classId) { need(); const db = load(); db.members = db.members.filter(m => !(m.class_id === classId && m.student_id === user.id)); store(db); },
      async studentAssignments() {
        need(); const db = load(), mine = db.members.filter(m => m.student_id === user.id).map(m => m.class_id);
        return db.assignments.filter(a => mine.includes(a.class_id))
          .map(a => ({ ...a, classes: { name: db.classes.find(c => c.id === a.class_id)?.name || '' } }))
          .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')));
      },

      async teacherClasses() {
        need('teacher'); const db = load();
        return db.classes.filter(c => c.teacher_id === user.id).sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map(c => ({ ...c, students: db.members.filter(m => m.class_id === c.id).length }));
      },
      async createClass(name) {
        need('teacher'); await pause(); const db = load();
        const c = { id: uid(), teacher_id: user.id, name: String(name).trim().slice(0, 60), code: genCode(db), created_at: new Date().toISOString() };
        db.classes.push(c); store(db); return c;
      },
      async renameClass(id, name) { need('teacher'); const db = load(); ownClass(db, id).name = String(name).trim().slice(0, 60); store(db); },
      async deleteClass(id) {
        need('teacher'); const db = load(); ownClass(db, id);
        db.classes = db.classes.filter(c => c.id !== id); db.members = db.members.filter(m => m.class_id !== id); db.assignments = db.assignments.filter(a => a.class_id !== id);
        store(db);
      },
      async roster(classId) {
        need('teacher'); await pause(); const db = load(); ownClass(db, classId);
        return db.members.filter(m => m.class_id === classId).map(m => {
          const u = db.users.find(u => u.id === m.student_id), g = db.progress[m.student_id] || {};
          return u && { id: u.id, full_name: u.full_name, login: u.login, joined_at: m.joined_at, xp: g.xp || 0, answered: g.answered || 0, correct: g.correct || 0, mastered_count: g.mastered_count || 0, lessons_done: g.lessons_done || 0, streak: g.streak || 0, module_mastery: g.module_mastery || {}, lesson_mastery: g.lesson_mastery || {}, last_active: g.last_active || null };
        }).filter(Boolean).sort((a, b) => a.full_name.localeCompare(b.full_name, 'kk'));
      },
      async studentState(studentId) {
        need('teacher'); const db = load();
        const mine = db.classes.filter(c => c.teacher_id === user.id).map(c => c.id);
        if (!db.members.some(m => m.student_id === studentId && mine.includes(m.class_id))) throw new CloudError('forbidden');
        return db.progress[studentId]?.state || null;
      },
      async removeStudent(classId, studentId) { need('teacher'); const db = load(); ownClass(db, classId); db.members = db.members.filter(m => !(m.class_id === classId && m.student_id === studentId)); store(db); },
      async resetPassword(studentId, password) {
        need('teacher'); if (String(password).length < 6) throw new CloudError('weak_password');
        const db = load(), mine = db.classes.filter(c => c.teacher_id === user.id).map(c => c.id);
        if (!db.members.some(m => m.student_id === studentId && mine.includes(m.class_id))) throw new CloudError('forbidden');
        const u = db.users.find(u => u.id === studentId); u.salt = uid(); u.pw = await hash(password, u.salt); store(db);
      },
      async assignments(classId) { need('teacher'); const db = load(); ownClass(db, classId); return db.assignments.filter(a => a.class_id === classId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
      async createAssignment(a) {
        need('teacher'); const db = load(); ownClass(db, a.class_id);
        const row = { id: uid(), class_id: a.class_id, title: String(a.title).trim().slice(0, 120), note: a.note || null, lesson_ids: a.lesson_ids || [], due_date: a.due_date || null, created_at: new Date().toISOString() };
        db.assignments.push(row); store(db); return row;
      },
      async deleteAssignment(id) {
        need('teacher'); const db = load(), a = db.assignments.find(a => a.id === id);
        if (a) ownClass(db, a.class_id);
        db.assignments = db.assignments.filter(a => a.id !== id); store(db);
      },
      /* Сыныпты мысал оқушылармен толтыру (журналды көрсету үшін). */
      async seedStudents(classId, students) {
        need('teacher'); const db = load(); ownClass(db, classId);
        for (const s of students) {
          let login = s.login, n = 1;
          while (db.users.some(u => u.login === login)) login = s.login + (++n);
          const u = await createUser(db, { email: loginEmail(login), password: 'demo123', role: 'student', full_name: s.full_name, login });
          db.members.push({ class_id: classId, student_id: u.id, joined_at: new Date(Date.now() - 20 * 864e5).toISOString() });
          db.progress[u.id] = { state: s.state, ...s.summary, updated_at: new Date().toISOString() };
        }
        store(db);
      }
    };
  }

  const backend = demoBackend();
  backend.CloudError = CloudError;
  backend.normCode = normCode;
  backend.normLogin = normLogin;
  backend.LOGIN_RE = LOGIN_RE;
  return backend;
})();
