'use strict';
/*
 * MathQuest · сервер (Vercel Function).
 * Бір нүкте: POST /api/rpc  { op, args }  + Authorization: Bearer <token>
 * Деректер: Redis. Vercel → Storage арқылы қосылған кез келген Redis жарайды:
 *   • Upstash for Redis — REST айнымалылары (…_REST_API_URL + …_REST_API_TOKEN, префикс кез келген);
 *   • Redis (Redis Cloud т.б.) — REDIS_URL (redis:// немесе rediss://, префикс кез келген).
 */
const crypto = require('crypto');
const net = require('net');
const tls = require('tls');

const P = 'mq:';
const SESSION_TTL = 60 * 24 * 3600;
const LOGIN_RE = /^[a-z0-9._-]{3,24}$/;
const CODE_RE = /^[A-Z0-9]{6}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_STATE = 900 * 1024;

class ApiError extends Error { constructor(code, status = 400) { super(code); this.code = code; this.status = status; } }

/* ---------------- Дерекқорды табу ---------------- */
function findStorage(env = process.env) {
  const keys = Object.keys(env).sort((a, b) => a.length - b.length);
  // 1) Upstash REST: <PREFIX>_REST_API_URL + <PREFIX>_REST_API_TOKEN немесе <PREFIX>_REDIS_REST_URL + _TOKEN
  for (const k of keys) {
    if (!/(_REST_API_URL|_REDIS_REST_URL)$/.test(k) || !/^https?:\/\//.test(env[k] || '')) continue;
    const t = env[k.replace(/URL$/, 'TOKEN')];
    if (t) return { kind: 'rest', url: env[k].replace(/\/+$/, ''), token: t };
  }
  // 2) TCP: REDIS_URL / KV_URL / <PREFIX>_REDIS_URL / <PREFIX>_URL (redis://…)
  const tcp = keys.filter(k => /^rediss?:\/\//.test(env[k] || '') && /(^|_)(REDIS_URL|KV_URL|URL)$/.test(k));
  const best = tcp.find(k => /REDIS_URL$/.test(k)) || tcp[0];
  if (best) return { kind: 'tcp', url: env[best] };
  return null;
}
const STORAGE = findStorage();

/* ---------------- Redis: REST (Upstash) ---------------- */
async function restCall(path, body) {
  const res = await fetch(STORAGE.url + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STORAGE.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) { console.error('redis rest', res.status, data); throw new ApiError('server', 502); }
  return data;
}

/* ---------------- Redis: TCP (RESP2) ---------------- */
class RespClient {
  constructor(url) {
    this.u = new URL(url); this.sock = null; this.buf = Buffer.alloc(0); this.queue = []; this.ready = null;
  }
  connect() {
    if (this.ready) return this.ready;
    this.ready = new Promise((ok, fail) => {
      const u = this.u, port = +u.port || 6379, host = u.hostname;
      const opts = { host, port, servername: host };
      const s = u.protocol === 'rediss:' ? tls.connect(opts) : net.connect(opts);
      const onErr = e => { this.reset(e); fail(e); };
      s.setNoDelay(true);
      s.once(u.protocol === 'rediss:' ? 'secureConnect' : 'connect', async () => {
        s.off('error', onErr);
        s.on('error', e => this.reset(e));
        try {
          const pass = decodeURIComponent(u.password || ''), user = decodeURIComponent(u.username || '');
          if (pass) await this.send(user && user !== 'default' ? ['AUTH', user, pass] : ['AUTH', pass]);
          const db = +(u.pathname || '').slice(1);
          if (db) await this.send(['SELECT', db]);
          ok();
        } catch (e) { this.reset(e); fail(e); }
      });
      s.once('error', onErr);
      s.on('data', d => this.onData(d));
      s.on('close', () => this.reset(new Error('closed')));
      s.setTimeout(10000, () => s.destroy(new Error('timeout')));
      this.sock = s;
    });
    return this.ready;
  }
  reset(err) {
    const q = this.queue; this.queue = []; this.ready = null; this.buf = Buffer.alloc(0);
    if (this.sock) { this.sock.removeAllListeners('close'); this.sock.destroy(); this.sock = null; }
    for (const w of q) w.fail(err);
  }
  encode(cmd) {
    const parts = [`*${cmd.length}\r\n`];
    for (const a of cmd) { const b = Buffer.from(String(a)); parts.push(`$${b.length}\r\n`, b, '\r\n'); }
    return Buffer.concat(parts.map(x => Buffer.isBuffer(x) ? x : Buffer.from(x)));
  }
  send(cmd) {
    return new Promise((ok, fail) => { this.queue.push({ ok, fail }); this.sock.write(this.encode(cmd)); });
  }
  parse(i) { // → [value, nextIndex] немесе null (деректер жеткіліксіз)
    const b = this.buf; if (i >= b.length) return null;
    const end = b.indexOf('\r\n', i); if (end < 0) return null;
    const t = String.fromCharCode(b[i]), line = b.toString('utf8', i + 1, end), next = end + 2;
    if (t === '+') return [line, next];
    if (t === '-') return [{ __err: line }, next];
    if (t === ':') return [Number(line), next];
    if (t === '$') { const n = +line; if (n < 0) return [null, next]; if (b.length < next + n + 2) return null; return [b.toString('utf8', next, next + n), next + n + 2]; }
    if (t === '*') {
      const n = +line; if (n < 0) return [null, next];
      const arr = []; let j = next;
      for (let k = 0; k < n; k++) { const r = this.parse(j); if (!r) return null; arr.push(r[0]); j = r[1]; }
      return [arr, j];
    }
    throw new Error('bad resp');
  }
  onData(d) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, d]) : d;
    let r;
    while (this.queue.length && (r = this.parse(0))) {
      this.buf = this.buf.subarray(r[1]);
      const w = this.queue.shift();
      if (r[0] && r[0].__err) w.fail(Object.assign(new Error(r[0].__err), { redis: true })); else w.ok(r[0]);
    }
  }
  async run(cmds) { // pipelined
    await this.connect();
    return Promise.all(cmds.map(c => this.send(c)));
  }
}
let tcpClient = null;
async function tcpRun(cmds) {
  if (!tcpClient) tcpClient = new RespClient(STORAGE.url);
  try { return await tcpClient.run(cmds); }
  catch (e) { console.error('redis tcp', e.message); tcpClient.reset(e); throw new ApiError('server', 502); }
}

/* ---------------- Ортақ интерфейс ---------------- */
const norm = cmd => cmd.map(String);
async function r(...cmd) {
  if (!STORAGE) throw new ApiError('storage_missing', 503);
  if (STORAGE.kind === 'tcp') return (await tcpRun([norm(cmd)]))[0];
  const d = await restCall('', norm(cmd));
  if (d.error) { console.error('redis', d.error); throw new ApiError('server', 502); }
  return d.result;
}
async function pipe(cmds, atomic = false) {
  if (!cmds.length) return [];
  if (!STORAGE) throw new ApiError('storage_missing', 503);
  if (STORAGE.kind === 'tcp') {
    if (!atomic) return tcpRun(cmds.map(norm));
    const res = await tcpRun([['MULTI'], ...cmds.map(norm), ['EXEC']]);
    const out = res[res.length - 1];
    if (!Array.isArray(out)) throw new ApiError('server', 502);
    return out;
  }
  const d = await restCall(atomic ? '/multi-exec' : '/pipeline', cmds.map(norm));
  if (!Array.isArray(d)) throw new ApiError('server', 502);
  return d.map(x => { if (x.error) { console.error('redis', x.error); throw new ApiError('server', 502); } return x.result; });
}
const tx = cmds => pipe(cmds, true);
const J = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
const hashToObj = arr => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; };

/* ---------------- Көмекшілер ---------------- */
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const normLogin = s => String(s || '').trim().toLowerCase();
const normCode = s => String(s || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
const normEmail = s => String(s || '').trim().toLowerCase();

function hashPw(pw, salt) {
  return new Promise((ok, fail) => crypto.scrypt(String(pw), salt, 32, { N: 16384, r: 8, p: 1 }, (e, k) => e ? fail(e) : ok(k.toString('hex'))));
}
async function checkPw(pw, u) {
  const h = Buffer.from(await hashPw(pw, u.salt), 'hex'), stored = Buffer.from(u.pw, 'hex');
  return h.length === stored.length && crypto.timingSafeEqual(h, stored);
}
const pub = u => ({ id: u.id, role: u.role, full_name: u.full_name, login: u.login || null, school: u.school || null, email: u.login ? null : u.email });

async function getUser(id) { return id ? J(await r('GET', P + 'u:' + id)) : null; }
async function getClass(id) { return id ? J(await r('GET', P + 'c:' + id)) : null; }
async function ownClass(user, id) {
  const c = await getClass(id);
  if (!c || c.teacher_id !== user.id) throw new ApiError('forbidden', 403);
  return c;
}
async function teacherOwnsStudent(user, studentId) {
  const ids = await r('SMEMBERS', P + 'tc:' + user.id);
  if (!ids.length) return false;
  const res = await pipe(ids.map(cid => ['HEXISTS', P + 'cm:' + cid, studentId]));
  return res.some(x => x === 1);
}
async function newSession(u) {
  const token = crypto.randomBytes(32).toString('base64url');
  await r('SET', P + 'sess:' + token, u.id, 'EX', SESSION_TTL);
  return { token, user: pub(u) };
}
function validateSignup(kind, d) {
  if (!str(d.full_name, 80)) throw new ApiError('name_required');
  if (String(d.password || '').length < 6) throw new ApiError('weak_password');
  if (String(d.password).length > 200) throw new ApiError('weak_password');
  if (kind === 'student' && !LOGIN_RE.test(normLogin(d.login))) throw new ApiError('bad_login');
  if (kind === 'teacher' && !EMAIL_RE.test(str(d.email, 160))) throw new ApiError('bad_email');
  if (d.class_code && !CODE_RE.test(normCode(d.class_code))) throw new ApiError('class_not_found');
}
async function createUser({ email, password, role, full_name, login, school }, indexKey) {
  const salt = crypto.randomBytes(16).toString('hex');
  const u = { id: uid(), email, salt, pw: await hashPw(password, salt), role, full_name: str(full_name, 80), login: login || null, school: str(school, 120) || null, created_at: now() };
  // логин/email бірегейлігі: SET NX
  const claimed = await r('SET', indexKey, u.id, 'NX');
  if (claimed !== 'OK') throw new ApiError(role === 'student' ? 'login_taken' : 'email_taken');
  await r('SET', P + 'u:' + u.id, JSON.stringify(u));
  return u;
}
async function rateCheck(key) {
  const n = await r('GET', P + 'fail:' + key);
  if (+n >= 10) throw new ApiError('rate_limit', 429);
}
async function rateHit(key) { await pipe([['INCR', P + 'fail:' + key], ['EXPIRE', P + 'fail:' + key, 900]]); }
function genCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(6), b => a[b % a.length]).join('');
}

/* ---------------- Операциялар ---------------- */
const PUBLIC = {
  async ping() {
    if (!STORAGE) return { ok: true, storage: false, configured: false };
    try { await r('PING'); return { ok: true, storage: true, kind: STORAGE.kind }; }
    catch { return { ok: true, storage: false, configured: true, kind: STORAGE.kind }; }
  },

  async signIn({ identifier, password }) {
    const id = normEmail(identifier);
    if (!id || !password) throw new ApiError('invalid_credentials', 401);
    await rateCheck(id);
    const userId = await r('GET', P + (id.includes('@') ? 'email:' : 'login:') + id);
    const u = await getUser(userId);
    if (!u || !(await checkPw(password, u))) { await rateHit(id); throw new ApiError('invalid_credentials', 401); }
    return newSession(u);
  },
  async signUpTeacher(d) {
    validateSignup('teacher', d);
    const email = normEmail(d.email);
    const u = await createUser({ email, password: d.password, role: 'teacher', full_name: d.full_name, school: d.school }, P + 'email:' + email);
    return newSession(u);
  },
  async signUpStudent(d) {
    validateSignup('student', d);
    const login = normLogin(d.login), code = normCode(d.class_code);
    let classId = null;
    if (code) { classId = await r('GET', P + 'code:' + code); if (!classId) throw new ApiError('class_not_found'); }
    const u = await createUser({ email: `${login}@student.mathquest.app`, password: d.password, role: 'student', full_name: d.full_name, login }, P + 'login:' + login);
    if (classId) await tx([['HSET', P + 'cm:' + classId, u.id, now()], ['SADD', P + 'sc:' + u.id, classId]]);
    return newSession(u);
  },
  async classPreview({ code }) {
    const c = normCode(code);
    if (!CODE_RE.test(c)) return null;
    const cls = await getClass(await r('GET', P + 'code:' + c));
    if (!cls) return null;
    const t = await getUser(cls.teacher_id);
    return { class_name: cls.name, teacher_name: t?.full_name || '' };
  },
  async loginAvailable({ login }) { return !(await r('EXISTS', P + 'login:' + normLogin(login))); }
};

const PRIVATE = {
  async me(_, user) { return pub(user); },
  async signOut(_, user, token) { await r('DEL', P + 'sess:' + token); return true; },
  async updateProfile({ full_name, school }, user) {
    const u = await getUser(user.id);
    u.full_name = str(full_name, 80) || u.full_name;
    if (school !== undefined && school !== null) u.school = str(school, 120) || null;
    await r('SET', P + 'u:' + u.id, JSON.stringify(u));
    return pub(u);
  },

  /* ---- оқушы ---- */
  async loadProgress(_, user) {
    const s = J(await r('GET', P + 'pst:' + user.id));
    return s && Object.keys(s).length ? s : null;
  },
  async saveProgress({ state, summary }, user) {
    const raw = JSON.stringify(state || {});
    if (raw.length > MAX_STATE) throw new ApiError('too_large', 413);
    const s = summary || {};
    const sum = {
      xp: +s.xp || 0, answered: +s.answered || 0, correct: +s.correct || 0, mastered_count: +s.mastered_count || 0,
      lessons_done: +s.lessons_done || 0, streak: +s.streak || 0,
      module_mastery: s.module_mastery && typeof s.module_mastery === 'object' ? s.module_mastery : {},
      lesson_mastery: s.lesson_mastery && typeof s.lesson_mastery === 'object' ? s.lesson_mastery : {},
      last_active: s.last_active || null, updated_at: now()
    };
    await pipe([['SET', P + 'pst:' + user.id, raw], ['SET', P + 'ps:' + user.id, JSON.stringify(sum)]]);
    return true;
  },
  async myClasses(_, user) {
    const ids = await r('SMEMBERS', P + 'sc:' + user.id);
    if (!ids.length) return [];
    const cls = (await r('MGET', ...ids.map(id => P + 'c:' + id))).map(J).filter(Boolean);
    const teachers = cls.length ? (await r('MGET', ...cls.map(c => P + 'u:' + c.teacher_id))).map(J) : [];
    return cls.map((c, i) => ({ id: c.id, name: c.name, code: c.code, teacher_name: teachers[i]?.full_name || '' }));
  },
  async joinClass({ code }, user) {
    if (user.role !== 'student') throw new ApiError('only_students', 403);
    const c = await getClass(await r('GET', P + 'code:' + normCode(code)));
    if (!c) throw new ApiError('class_not_found');
    if (!(await r('HEXISTS', P + 'cm:' + c.id, user.id))) await tx([['HSET', P + 'cm:' + c.id, user.id, now()], ['SADD', P + 'sc:' + user.id, c.id]]);
    return { id: c.id, name: c.name, code: c.code };
  },
  async leaveClass({ classId }, user) {
    await tx([['HDEL', P + 'cm:' + classId, user.id], ['SREM', P + 'sc:' + user.id, classId]]);
    return true;
  },
  async studentAssignments(_, user) {
    const ids = await r('SMEMBERS', P + 'sc:' + user.id);
    if (!ids.length) return [];
    const [cls, ...hashes] = await pipe([['MGET', ...ids.map(id => P + 'c:' + id)], ...ids.map(id => ['HGETALL', P + 'as:' + id])]);
    const names = Object.fromEntries(cls.map(J).filter(Boolean).map(c => [c.id, c.name]));
    return hashes.flatMap(h => Object.values(hashToObj(h)).map(J).filter(Boolean))
      .map(a => ({ ...a, classes: { name: names[a.class_id] || '' } }))
      .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')));
  },

  /* ---- мұғалім ---- */
  async teacherClasses(_, user) {
    const ids = await r('SMEMBERS', P + 'tc:' + user.id);
    if (!ids.length) return [];
    const [cls, ...counts] = await pipe([['MGET', ...ids.map(id => P + 'c:' + id)], ...ids.map(id => ['HLEN', P + 'cm:' + id])]);
    return cls.map((c, i) => { c = J(c); return c && { ...c, students: counts[i] || 0 }; })
      .filter(Boolean).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  async createClass({ name }, user) {
    const nm = str(name, 60);
    if (!nm) throw new ApiError('name_required');
    const c = { id: uid(), teacher_id: user.id, name: nm, code: '', created_at: now() };
    for (let i = 0; i < 8 && !c.code; i++) { const code = genCode(); if ((await r('SET', P + 'code:' + code, c.id, 'NX')) === 'OK') c.code = code; }
    if (!c.code) throw new ApiError('server', 500);
    await tx([['SET', P + 'c:' + c.id, JSON.stringify(c)], ['SADD', P + 'tc:' + user.id, c.id]]);
    return c;
  },
  async renameClass({ id, name }, user) {
    const c = await ownClass(user, id);
    c.name = str(name, 60) || c.name;
    await r('SET', P + 'c:' + id, JSON.stringify(c));
    return true;
  },
  async deleteClass({ id }, user) {
    const c = await ownClass(user, id);
    const members = Object.keys(hashToObj(await r('HGETALL', P + 'cm:' + id)));
    await tx([
      ['DEL', P + 'c:' + id, P + 'cm:' + id, P + 'as:' + id, P + 'code:' + c.code],
      ['SREM', P + 'tc:' + user.id, id],
      ...members.map(sid => ['SREM', P + 'sc:' + sid, id])
    ]);
    return true;
  },
  async roster({ classId }, user) {
    await ownClass(user, classId);
    const joined = hashToObj(await r('HGETALL', P + 'cm:' + classId));
    const ids = Object.keys(joined);
    if (!ids.length) return [];
    const [users, sums] = await pipe([['MGET', ...ids.map(id => P + 'u:' + id)], ['MGET', ...ids.map(id => P + 'ps:' + id)]]);
    return ids.map((id, i) => {
      const u = J(users[i]), g = J(sums[i]) || {};
      return u && { id: u.id, full_name: u.full_name, login: u.login, joined_at: joined[id], xp: g.xp || 0, answered: g.answered || 0, correct: g.correct || 0, mastered_count: g.mastered_count || 0, lessons_done: g.lessons_done || 0, streak: g.streak || 0, module_mastery: g.module_mastery || {}, lesson_mastery: g.lesson_mastery || {}, last_active: g.last_active || null };
    }).filter(Boolean).sort((a, b) => a.full_name.localeCompare(b.full_name, 'kk'));
  },
  async studentState({ studentId }, user) {
    if (!(await teacherOwnsStudent(user, studentId))) throw new ApiError('forbidden', 403);
    return J(await r('GET', P + 'pst:' + studentId));
  },
  async removeStudent({ classId, studentId }, user) {
    await ownClass(user, classId);
    await tx([['HDEL', P + 'cm:' + classId, studentId], ['SREM', P + 'sc:' + studentId, classId]]);
    return true;
  },
  async resetPassword({ studentId, password }, user) {
    if (String(password || '').length < 6) throw new ApiError('weak_password');
    if (!(await teacherOwnsStudent(user, studentId))) throw new ApiError('forbidden', 403);
    const u = await getUser(studentId);
    if (!u || u.role !== 'student') throw new ApiError('forbidden', 403);
    u.salt = crypto.randomBytes(16).toString('hex');
    u.pw = await hashPw(password, u.salt);
    await r('SET', P + 'u:' + u.id, JSON.stringify(u));
    return true;
  },
  async assignments({ classId }, user) {
    await ownClass(user, classId);
    return Object.values(hashToObj(await r('HGETALL', P + 'as:' + classId))).map(J).filter(Boolean)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async createAssignment(a, user) {
    await ownClass(user, a.class_id);
    const title = str(a.title, 120);
    if (!title) throw new ApiError('name_required');
    const row = {
      id: uid(), class_id: a.class_id, title, note: str(a.note, 1000) || null,
      lesson_ids: Array.isArray(a.lesson_ids) ? a.lesson_ids.slice(0, 200).map(x => str(x, 40)) : [],
      due_date: /^\d{4}-\d{2}-\d{2}$/.test(a.due_date || '') ? a.due_date : null, created_at: now()
    };
    await r('HSET', P + 'as:' + a.class_id, row.id, JSON.stringify(row));
    return row;
  },
  async deleteAssignment({ id }, user) {
    const ids = await r('SMEMBERS', P + 'tc:' + user.id);
    if (ids.length) await pipe(ids.map(cid => ['HDEL', P + 'as:' + cid, id]));
    return true;
  }
};
const TEACHER_ONLY = new Set(['teacherClasses', 'createClass', 'renameClass', 'deleteClass', 'roster', 'studentState', 'removeStudent', 'resetPassword', 'assignments', 'createAssignment', 'deleteAssignment']);

/* ---------------- HTTP ---------------- */
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  try {
    let body;
    try { body = await readBody(req); } catch { throw new ApiError('bad_request'); }
    const op = String(body.op || ''), args = body.args && typeof body.args === 'object' ? body.args : {};
    if (Object.prototype.hasOwnProperty.call(PUBLIC, op)) return send(res, 200, { data: await PUBLIC[op](args) });
    if (!Object.prototype.hasOwnProperty.call(PRIVATE, op)) throw new ApiError('bad_request');
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token || token.length > 100) throw new ApiError('unauthorized', 401);
    const user = await getUser(await r('GET', P + 'sess:' + token));
    if (!user) throw new ApiError('unauthorized', 401);
    if (TEACHER_ONLY.has(op) && user.role !== 'teacher') throw new ApiError('forbidden', 403);
    return send(res, 200, { data: await PRIVATE[op](args, user, token) });
  } catch (e) {
    if (e instanceof ApiError) return send(res, e.status, { error: e.code });
    console.error(e);
    return send(res, 500, { error: 'server' });
  }
};
module.exports.findStorage = findStorage;
