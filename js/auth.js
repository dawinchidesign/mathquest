'use strict';
/* MathQuest · кіру және тіркелу экраны. */
const Auth = (() => {
  let tab = 'login', kind = 'student', previewTimer = null;
  const root = () => $('#auth');
  const SCHOOL = (window.MATHQUEST_CONFIG || {}).SCHOOL_NAME || '';

  function formLogin() {
    return `<form class="auth-form" data-auth="login" novalidate>
      <label class="field"><span>Логин немесе email</span><input class="input" name="identifier" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="aruzhan немесе teacher@mektep.kz"></label>
      <label class="field"><span>Құпиясөз</span><input class="input" name="password" type="password" autocomplete="current-password" required></label>
      <p class="auth-err" role="alert" hidden></p>
      <button class="btn btn-primary btn-lg btn-block">Кіру</button>
      <p class="auth-hint">Құпиясөзді ұмыттыңыз ба? Оқушы болсаңыз — мұғаліміңіз жаңа құпиясөз бере алады.</p>
    </form>`;
  }
  function formStudent() {
    return `<form class="auth-form" data-auth="student" novalidate>
      <label class="field"><span>Сынып коды</span><input class="input input-code" name="class_code" maxlength="6" autocomplete="off" placeholder="AB12CD" aria-describedby="code-preview"><small class="field-note" id="code-preview">Кодты мұғалімнен ал. Кейін де қосуға болады.</small></label>
      <label class="field"><span>Аты-жөнің</span><input class="input" name="full_name" maxlength="80" autocomplete="name" required placeholder="Аружан Бекова"></label>
      <label class="field"><span>Логин</span><input class="input" name="login" maxlength="24" autocomplete="username" autocapitalize="none" spellcheck="false" required placeholder="aruzhan"><small class="field-note">Латын әріптері, сандар, нүкте не сызықша. Кіргенде осыны жазасың.</small></label>
      <label class="field"><span>Құпиясөз</span><input class="input" name="password" type="password" minlength="6" autocomplete="new-password" required><small class="field-note">Кемінде 6 таңба.</small></label>
      <p class="auth-err" role="alert" hidden></p>
      <button class="btn btn-primary btn-lg btn-block">Оқушы ретінде тіркелу</button>
    </form>`;
  }
  function formTeacher() {
    return `<form class="auth-form" data-auth="teacher" novalidate>
      <label class="field"><span>Аты-жөніңіз</span><input class="input" name="full_name" maxlength="80" autocomplete="name" required placeholder="Жаңыл Рахметқұлқызы"></label>
      <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required placeholder="teacher@mektep.kz"></label>
      <label class="field"><span>Мектеп</span><input class="input" name="school" maxlength="120" value="${esc(SCHOOL)}" placeholder="№6 орта мектебі"></label>
      <label class="field"><span>Құпиясөз</span><input class="input" name="password" type="password" minlength="6" autocomplete="new-password" required><small class="field-note">Кемінде 6 таңба.</small></label>
      <p class="auth-err" role="alert" hidden></p>
      <button class="btn btn-primary btn-lg btn-block">Мұғалім ретінде тіркелу</button>
    </form>`;
  }
  function paint() {
    root().innerHTML = `<div class="auth">
      <aside class="auth-art" aria-hidden="true">
        <div class="auth-brand"><span class="logo">m<i></i></span><span>MathQuest</span></div>
        <div class="auth-sheet">
          <p class="auth-formula math">P(A) = <span class="frac"><b>m</b><b>n</b></span></p>
          <p class="auth-line">Математикалық сауаттылық · 11-сынып</p>
          <p class="auth-claim">Есепті жаттама — түсін. Мұғалімің әр қадамыңды көріп, қолдау көрсетеді.</p>
          <dl class="auth-facts"><div><dt>${CURRICULUM.length}</dt><dd>бөлім</dd></div><div><dt>${COURSE_LESSONS.length}</dt><dd>тақырып</dd></div><div><dt>${BANK.length}</dt><dd>тапсырма</dd></div></dl>
        </div>
        <p class="auth-credit">Жоба авторы: Рахметқұлова Жаңыл Рахметқұлқызы · №6 орта мектебі</p>
      </aside>
      <main class="auth-main" id="auth-main" tabindex="-1">
        <div class="auth-box">
          <div class="auth-brand auth-brand-sm"><span class="logo">m<i></i></span><span>MathQuest</span></div>
          <h1>${tab === 'login' ? 'Қош келдіңіз' : 'Тіркелу'}</h1>
          <p class="lede">${tab === 'login' ? 'Аккаунтыңызға кіріңіз.' : 'Оқушы сынып кодымен, мұғалім email арқылы тіркеледі.'}</p>
          <div class="seg seg-full" role="tablist"><button role="tab" data-auth-tab="login" class="${tab === 'login' ? 'is-on' : ''}" aria-selected="${tab === 'login'}">Кіру</button><button role="tab" data-auth-tab="signup" class="${tab === 'signup' ? 'is-on' : ''}" aria-selected="${tab === 'signup'}">Тіркелу</button></div>
          ${tab === 'signup' ? `<div class="role-pick" role="radiogroup" aria-label="Кім ретінде тіркелесіз"><button role="radio" aria-checked="${kind === 'student'}" data-auth-kind="student" class="${kind === 'student' ? 'is-on' : ''}"><b>Оқушымын</b><small>Тапсырма орындаймын</small></button><button role="radio" aria-checked="${kind === 'teacher'}" data-auth-kind="teacher" class="${kind === 'teacher' ? 'is-on' : ''}"><b>Мұғаліммін</b><small>Сыныпты бақылаймын</small></button></div>` : ''}
          ${tab === 'login' ? formLogin() : kind === 'student' ? formStudent() : formTeacher()}
          ${Cloud.mode === 'local' ? `<p class="auth-demo">${Cloud.serverIssue ? Cloud.issueText + ' Әзірге аккаунттар' : 'Аккаунттар'} осы браузерде сақталады.</p>` : ''}
          <button class="auth-guest" data-auth-guest>Тіркелмей жалғастыру</button>
        </div>
      </main></div>`;
    root().querySelector('.auth-form input')?.focus({ preventScroll: true });
  }
  function show({ tab: t, kind: k } = {}) {
    if (t) tab = t; if (k) kind = k;
    root().hidden = false;
    $('#boot')?.remove();
    paint();
  }
  function setErr(form, msg) { const p = form.querySelector('.auth-err'); p.textContent = msg || ''; p.hidden = !msg; }

  document.addEventListener('click', e => {
    if (!root() || root().hidden) return;
    const el = e.target.closest('button'); if (!el) return;
    if (el.dataset.authTab) { tab = el.dataset.authTab; paint(); }
    else if (el.dataset.authKind) { kind = el.dataset.authKind; paint(); }
    else if (el.hasAttribute('data-auth-guest')) { root().hidden = true; enterApp(null); }
  });
  document.addEventListener('input', e => {
    const f = e.target.closest('form[data-auth="student"]'); if (!f) return;
    if (e.target.name === 'login') e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (e.target.name === 'class_code') {
      const note = $('#code-preview'), code = Cloud.normCode(e.target.value);
      clearTimeout(previewTimer);
      if (code.length < 6) { note.textContent = 'Кодты мұғалімнен ал. Кейін де қосуға болады.'; note.className = 'field-note'; return; }
      note.textContent = 'Тексерілуде…';
      previewTimer = setTimeout(async () => {
        try { const p = await Cloud.classPreview(code); note.textContent = p ? `✓ ${p.class_name} · мұғалім ${p.teacher_name}` : 'Мұндай кодпен сынып табылмады.'; note.className = 'field-note ' + (p ? 'is-ok' : 'is-bad'); }
        catch { note.textContent = 'Кодты тексеру мүмкін болмады (желі).'; note.className = 'field-note'; }
      }, 350);
    }
  });
  document.addEventListener('submit', async e => {
    const f = e.target.closest('form[data-auth]'); if (!f) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f)), btn = f.querySelector('button.btn');
    setErr(f, ''); btn.disabled = true; const label = btn.textContent; btn.textContent = 'Күте тұрыңыз…';
    try {
      let user;
      if (f.dataset.auth === 'login') {
        if (!d.identifier || !d.password) throw new Cloud.CloudError('invalid_credentials');
        user = await Cloud.signIn(d.identifier, d.password);
      } else if (f.dataset.auth === 'student') user = await Cloud.signUpStudent(d);
      else user = await Cloud.signUpTeacher(d);
      root().hidden = true; root().innerHTML = '';
      await enterApp(user, { fresh: true });
      if (f.dataset.auth !== 'login') toast(user.role === 'teacher' ? 'Қош келдіңіз! Енді алғашқы сыныпты құрыңыз.' : `Қош келдің, ${firstName(user.full_name)}!`);
    } catch (err) {
      console.warn(err);
      setErr(f, cloudErrorText(err));
      btn.disabled = false; btn.textContent = label;
    }
  });
  return { show };
})();
