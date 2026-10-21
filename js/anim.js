'use strict';
/*
 * MathQuest · анимациялық түсіндірме («Көр» қадамы).
 * Әр тақырыптың сахнасы data/anim/<бөлім>.js файлында:
 *   Anim.scene('percent-03', (g, k, L) => [ ['Субтитр', () => { ...анимация... }], ... ]);
 * g — сахна (SVG элементтері мен уақыт сызығы), k — дайын көрнекі құралдар, L — тақырып деректері.
 */
const Anim = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 800, H = 450;
  const SCENES = {};
  const loaded = {};
  const VERSION = 1;

  function load(moduleId) {
    if (!loaded[moduleId]) loaded[moduleId] = new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = `data/anim/${moduleId}.js?v=${VERSION}`;
      s.onload = ok;
      s.onerror = () => { delete loaded[moduleId]; s.remove(); fail(new Error('load ' + moduleId)); };
      document.head.append(s);
    });
    return loaded[moduleId];
  }

  /* ---------------- Уақыт ---------------- */
  const ease = {
    out: p => 1 - Math.pow(1 - p, 3),
    inout: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
    lin: p => p,
    back: p => { const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  };
  class Clock {
    constructor() { this.t = 0; this.speed = 1; this.playing = false; this.tasks = []; this.tweens = []; this.last = null; this.raf = 0; this.onTick = null; }
    start() { if (!this.raf) this.raf = requestAnimationFrame(this.loop); }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; this.last = null; }
    reset() { this.t = 0; this.tasks = []; this.tweens = []; }
    loop = ts => {
      if (this.last == null) this.last = ts;
      const dt = Math.min(80, ts - this.last) * this.speed; this.last = ts;
      if (this.playing) { this.t += dt; this.step(); this.onTick?.(this.t); }
      this.raf = requestAnimationFrame(this.loop);
    };
    step() {
      if (this.tasks.length) {
        const due = this.tasks.filter(x => x.t <= this.t);
        if (due.length) { this.tasks = this.tasks.filter(x => x.t > this.t); due.sort((a, b) => a.t - b.t).forEach(x => { try { x.fn(); } catch (e) { console.warn(e); } }); }
      }
      if (this.tweens.length) {
        this.tweens = this.tweens.filter(tw => {
          if (this.t < tw.t0) return true;
          if (!tw.started) { tw.started = true; try { tw.init?.(); } catch (e) { console.warn(e); } }
          const p = tw.d <= 0 ? 1 : Math.min(1, (this.t - tw.t0) / tw.d);
          try { tw.fn((tw.ease || ease.out)(p), p); } catch (e) { console.warn(e); return false; }
          return p < 1;
        });
      }
    }
  }

  /* ---------------- Мәтін белгілеуі ----------------
     **алтын**  __сия (бөлім түсі)__  ~~қызыл, сызылған~~  ^^жасыл^^  [[қызыл]] */
  const MARK = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\^\^[^^]+\^\^|\[\[[^\]]+\]\]|\^\{[^}]+\}|_\{[^}]+\})/;
  function markup(el, str) {
    el.textContent = '';
    String(str).split(MARK).filter(s => s !== '').forEach(part => {
      const ts = document.createElementNS(NS, 'tspan');
      let cls = '';
      if (/^\*\*.*\*\*$/.test(part)) { cls = 't-gold'; part = part.slice(2, -2); }
      else if (/^__.*__$/.test(part)) { cls = 't-mod'; part = part.slice(2, -2); }
      else if (/^~~.*~~$/.test(part)) { cls = 't-strike'; part = part.slice(2, -2); }
      else if (/^\^\^.*\^\^$/.test(part)) { cls = 't-ok'; part = part.slice(2, -2); }
      else if (/^\[\[.*\]\]$/.test(part)) { cls = 't-red'; part = part.slice(2, -2); }
      else if (/^\^\{.*\}$/.test(part)) { ts.setAttribute('baseline-shift', 'super'); ts.setAttribute('font-size', '62%'); part = part.slice(2, -1); }
      else if (/^_\{.*\}$/.test(part)) { ts.setAttribute('baseline-shift', 'sub'); ts.setAttribute('font-size', '62%'); part = part.slice(2, -1); }
      if (cls) ts.setAttribute('class', cls);
      ts.textContent = part;
      el.append(ts);
    });
  }

  /* ---------------- Сахна (g) ---------------- */
  function makeStage(svg, clock) {
    const g = { c: 0, base: 0, instant: false, parDepth: 0, parEnd: 0, W, H, maxEnd: 0 };
    const root = svg.querySelector('.an-root');
    let cur = root;

    function schedule(d, fn, init, e) {
      const t0 = g.base + g.c;
      if (g.instant) { init?.(); fn(1, 1); }
      else clock.tweens.push({ t0, d, fn, init, ease: e });
      advance(d);
    }
    function at(fn) { if (g.instant) fn(); else clock.tasks.push({ t: g.base + g.c, fn }); }
    function advance(d) {
      const end = g.c + d;
      g.maxEnd = Math.max(g.maxEnd, end);
      if (g.parDepth) g.parEnd = Math.max(g.parEnd, end); else g.c = end;
    }
    g.wait = ms => { if (!g.parDepth) { g.c += ms; g.maxEnd = Math.max(g.maxEnd, g.c); } return g; };
    g.par = fn => {
      const c0 = g.c, outer = g.parEnd;
      g.parDepth++; g.parEnd = c0;
      try { fn(); } finally { g.parDepth--; }
      const end = g.parEnd;
      if (g.parDepth) g.parEnd = Math.max(outer, end); else { g.c = end; g.parEnd = 0; }
      g.c = g.parDepth ? c0 : end;
      return g;
    };
    g.stagger = (items, gap, fn) => { g.par(() => { const c0 = g.c; items.forEach((it, i) => { g.c = c0 + i * gap; fn(it, i); }); g.c = c0; }); return g; };
    g.call = fn => { at(fn); return g; };
    g.anim = (d, fn, e) => { schedule(d, p => fn(p), null, e && ease[e]); return g; };

    class E {
      constructor(node, shape) {
        this.node = node; this.shape = shape || node;
        this.st = { tx: 0, ty: 0, sc: 1, op: 1, rot: 0 }; this.ox = 0; this.oy = 0;
      }
      apply() {
        const s = this.st;
        this.node.setAttribute('transform', `translate(${s.tx} ${s.ty}) translate(${this.ox} ${this.oy}) rotate(${s.rot}) scale(${s.sc}) translate(${-this.ox} ${-this.oy})`);
        this.node.setAttribute('opacity', Math.max(0, Math.min(1, s.op)));
        return this;
      }
      origin(x, y) { this.ox = x; this.oy = y; return this.apply(); }
      in(d = 380) {
        const s = this.st; s.op = 0; s.sc = .86; this.apply();
        schedule(d, p => { s.op = p; s.sc = .86 + .14 * p; this.apply(); }, null, ease.back);
        return this;
      }
      fade(d = 380) { const s = this.st; s.op = 0; this.apply(); schedule(d, p => { s.op = p; this.apply(); }); return this; }
      out(d = 300) { let a; schedule(d, p => { this.st.op = a * (1 - p); this.apply(); }, () => { a = this.st.op; }); return this; }
      to(props, d = 600, e = 'inout') {
        const from = {};
        schedule(d, p => {
          for (const k in props) {
            const v = from[k] + (props[k] - from[k]) * p;
            if (k in this.st) this.st[k] = v; else this.shape.setAttribute(k, v);
          }
          this.apply();
        }, () => { for (const k in props) from[k] = k in this.st ? this.st[k] : parseFloat(this.shape.getAttribute(k)) || 0; }, ease[e]);
        return this;
      }
      move(dx, dy, d = 600, e = 'inout') { let fx, fy; schedule(d, p => { this.st.tx = fx + dx * p; this.st.ty = fy + dy * p; this.apply(); }, () => { fx = this.st.tx; fy = this.st.ty; }, ease[e]); return this; }
      draw(d = 700) {
        const sh = this.shape; let len = 0;
        const init = () => { len = sh.getTotalLength ? sh.getTotalLength() : 300; sh.style.strokeDasharray = len; sh.style.strokeDashoffset = len; this.st.op = 1; this.apply(); };
        if (!g.instant) { this.st.op = 0; this.apply(); }
        schedule(d, p => { sh.style.strokeDashoffset = len * (1 - p); if (p === 1) { sh.style.strokeDasharray = ''; sh.style.strokeDashoffset = ''; } }, init, ease.inout);
        return this;
      }
      pulse(d = 520, k = .18) { schedule(d, p => { this.st.sc = 1 + k * Math.sin(Math.PI * p); this.apply(); }, null, ease.lin); return this; }
      shake(d = 420) { let x0; schedule(d, p => { this.st.tx = x0 + Math.sin(p * Math.PI * 6) * 6 * (1 - p); this.apply(); }, () => { x0 = this.st.tx; }, ease.lin); return this; }
      cls(c) { at(() => setCls(this.shape, c)); return this; }
      text(str) { at(() => markup(this.shape, str)); return this; }
      swap(str, d = 420) {
        let done = false;
        schedule(d, p => { if (p >= .5 && !done) { done = true; markup(this.shape, str); } this.st.op = p < .5 ? 1 - p * 2 : (p - .5) * 2; this.apply(); }, null, ease.lin);
        return this;
      }
      count(a, b, d = 900, fmt = v => fmtNum(Math.round(v))) { schedule(d, p => { this.shape.textContent = fmt(a + (b - a) * p); }, null, ease.out); return this; }
      attr(k, v) { at(() => this.shape.setAttribute(k, v)); return this; }
      remove() { at(() => this.node.remove()); return this; }
    }
    g.E = E;

    function setCls(el, c) {
      const keep = (el.getAttribute('class') || '').split(' ').filter(x => x && !/^(f|s|t)-/.test(x));
      el.setAttribute('class', [...keep, ...String(c || '').split(' ').filter(Boolean)].join(' '));
    }
    function paint(o, defFill, defStroke) {
      const c = [];
      const f = o.fill ?? defFill, s = o.stroke ?? defStroke;
      if (f) c.push('f-' + f); if (s) c.push('s-' + s);
      if (o.cls) c.push(o.cls);
      return c.join(' ');
    }
    function mk(tag, attrs, o = {}, parent) {
      const node = document.createElementNS(NS, 'g');
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
      node.append(el);
      (parent?.node || o.parent?.node || cur).append(node);
      const e = new E(node, el);
      if (o.dash) el.setAttribute('stroke-dasharray', o.dash);
      if (o.sw != null) el.setAttribute('stroke-width', o.sw);
      if (o.op != null) el.setAttribute('fill-opacity', o.op);
      e.apply();
      if (o.hide) { e.st.op = 0; e.apply(); }
      else if (o.draw) e.draw(o.d ?? 700);
      else if (o.fade) e.fade(o.d ?? 380);
      else if (!o.now) e.in(o.d ?? 380);
      return e;
    }
    g.text = (x, y, str, o = {}) => {
      const col = { gold: 'goldt', on: 'deep', mod: 'modt' }[o.color] || o.color || 'text';
      const e = mk('text', { x, y, class: [o.math ? 'an-math' : 'an-sans', paint({ ...o, fill: col }, col, null)].join(' '), 'text-anchor': o.anchor === 'start' ? 'start' : o.anchor === 'end' ? 'end' : 'middle', 'font-size': o.size || 26, 'font-weight': o.weight || (o.bold ? 650 : null), 'dominant-baseline': 'middle', 'font-style': o.italic ? 'italic' : null }, o);
      markup(e.shape, str);
      e.origin(x, y);
      return e;
    };
    g.rect = (x, y, w, h, o = {}) => mk('rect', { x, y, width: w, height: h, rx: o.rx ?? 8, class: paint(o, 'soft', o.stroke === undefined ? null : undefined) }, o).origin(x + w / 2, y + h / 2);
    g.circle = (cx, cy, r, o = {}) => mk('circle', { cx, cy, r, class: paint(o, 'mod', null) }, o).origin(cx, cy);
    g.line = (x1, y1, x2, y2, o = {}) => mk('line', { x1, y1, x2, y2, class: paint(o, null, o.stroke || 'ink'), 'stroke-width': o.sw ?? 3, 'stroke-linecap': 'round' }, o).origin((x1 + x2) / 2, (y1 + y2) / 2);
    g.path = (d, o = {}) => mk('path', { d, class: paint(o, o.fill || 'none', o.stroke ?? 'ink'), 'stroke-width': o.sw ?? 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, o);
    g.poly = (pts, o = {}) => {
      const e = mk('polygon', { points: pts.map(p => p.join(',')).join(' '), class: paint(o, o.fill || 'soft', o.stroke ?? 'ink'), 'stroke-width': o.sw ?? 3, 'stroke-linejoin': 'round' }, o);
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      return e.origin(cx, cy);
    };
    g.arrow = (x1, y1, x2, y2, o = {}) => {
      const a = Math.atan2(y2 - y1, x2 - x1), h = o.head ?? 12;
      const p1 = [x2 - h * Math.cos(a - .45), y2 - h * Math.sin(a - .45)], p2 = [x2 - h * Math.cos(a + .45), y2 - h * Math.sin(a + .45)];
      return g.path(`M${x1} ${y1} L${x2} ${y2} M${p1[0]} ${p1[1]} L${x2} ${y2} L${p2[0]} ${p2[1]}`, { draw: true, ...o });
    };
    g.curve = (x1, y1, x2, y2, bend = -60, o = {}) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend;
      const a = Math.atan2(y2 - my, x2 - mx), h = o.head ?? 11;
      const p1 = [x2 - h * Math.cos(a - .45), y2 - h * Math.sin(a - .45)], p2 = [x2 - h * Math.cos(a + .45), y2 - h * Math.sin(a + .45)];
      return g.path(`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}` + (o.noHead ? '' : ` M${p1[0]} ${p1[1]} L${x2} ${y2} L${p2[0]} ${p2[1]}`), { draw: true, ...o });
    };
    g.group = (o = {}) => {
      const node = document.createElementNS(NS, 'g');
      (o.parent?.node || cur).append(node);
      const e = new E(node, node); e.apply();
      if (o.hide) { e.st.op = 0; e.apply(); }
      return e;
    };
    // Топ ішіне элемент қосу: g.into(grp, () => { g.text(...) })
    g.into = (grp, fn) => { const prev = cur; cur = grp.node; try { fn(); } finally { cur = prev; } return grp; };
    g.clear = () => { root.textContent = ''; };
    // Сахнадағы барлық элементті біртіндеп өшіру
    g.wipe = (d = 350) => {
      let nodes = [];
      schedule(d, p => nodes.forEach(n => n.setAttribute('opacity', n._op0 * (1 - p))), () => { nodes = [...root.children]; nodes.forEach(n => { n._op0 = +(n.getAttribute('opacity') ?? 1); }); });
      at(() => nodes.forEach(n => n.remove()));
      return g;
    };
    return g;
  }

  const fmtNum = v => {
    if (typeof v !== 'number' || !isFinite(v)) return String(v);
    const neg = v < 0; v = Math.abs(v);
    let s = Number.isInteger(v) ? String(v) : String(+v.toFixed(3));
    let [i, f] = s.split('.');
    if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + i + (f ? ',' + f : '');
  };

  /* ---------------- Дайын құралдар (k) ---------------- */
  function makeKit(g) {
    const k = { fmt: fmtNum };

    // Тақта: жолдарды бірінен соң бірі жазу
    k.board = (x, y, o = {}) => {
      const lh = o.lh || 48; let n = 0;
      const b = {
        lines: [],
        line(str, lo = {}) { const e = g.text(x, y + n * lh, str, { anchor: o.anchor || 'start', size: o.size || 28, math: o.math ?? true, ...lo }); n++; b.lines.push(e); return e; },
        skip(m = 1) { n += m; return b; },
        get y() { return y + n * lh; }
      };
      return b;
    };

    // Сан түзуі
    k.numberLine = (x1, x2, y, min, max, o = {}) => {
      const step = o.step || 1, every = o.labelEvery || 1;
      const X = v => x1 + (v - min) / (max - min) * (x2 - x1);
      const nl = { X, y };
      g.arrow(x1 - 14, y, x2 + 22, y, { stroke: 'muted', sw: 2.5, d: 500 });
      g.par(() => {
        let i = 0;
        for (let v = min; v <= max + 1e-9; v += step, i++) {
          const vv = Math.round(v * 1000) / 1000;
          g.line(X(vv), y - 8, X(vv), y + 8, { stroke: 'muted', sw: 2, fade: true, d: 250 });
          if (i % every === 0 && !o.noLabels) g.text(X(vv), y + 30, (o.fmt || fmtNum)(vv), { size: o.size || 20, color: vv === 0 ? 'text' : 'muted', fade: true, d: 250 });
        }
      });
      nl.point = (v, po = {}) => { const c = g.circle(X(v), y, po.r || 9, { fill: po.fill || 'ink', ...po }); if (po.label != null) g.text(X(v), y - 30, po.label, { size: po.size || 22, bold: true, color: po.color || po.fill || 'ink' }); return c; };
      nl.jump = (a, b, jo = {}) => {
        const h = jo.h ?? 50, up = jo.down ? 1 : -1;
        const c = g.curve(X(a), y - 4 * -up, X(b), y - 4 * -up, up * h * 2, { stroke: jo.stroke || 'gold', sw: 3, ...jo });
        if (jo.label != null) g.text((X(a) + X(b)) / 2, y + up * (h + 18), jo.label, { size: jo.size || 20, bold: true, color: jo.color || jo.stroke || 'gold' });
        return c;
      };
      nl.seg = (a, b, so = {}) => g.line(X(a), y, X(b), y, { stroke: so.stroke || 'mod', sw: so.sw || 9, draw: true, ...so });
      return nl;
    };

    // Тор (мысалы 10×10 = 100%)
    k.grid = (x, y, cols, rows, size, o = {}) => {
      const gap = o.gap ?? 3, cells = [];
      g.par(() => {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
          cells.push(g.rect(x + c * (size + gap), y + r * (size + gap), size, size, { rx: o.rx ?? 3, fill: o.fill || 'cell', fade: true, d: 300 }));
      });
      return {
        cells,
        fill(from, to, cls = 'mod', d = 900) {
          const list = cells.slice(from, to);
          g.stagger(list, Math.max(4, d / Math.max(1, list.length)), c => c.cls('f-' + cls).pulse(180, .25));
          return this;
        }
      };
    };

    // Көлденең бөліктер жолағы (бөлшек, пайыз)
    k.parts = (x, y, w, h, n, o = {}) => {
      const pw = w / n, cells = [];
      g.par(() => { for (let i = 0; i < n; i++) cells.push(g.rect(x + i * pw, y, pw, h, { rx: 0, fill: o.fill || 'cell', stroke: 'line', sw: 2, fade: true, d: 300 })); });
      g.rect(x, y, w, h, { rx: 0, fill: 'none', stroke: 'ink', sw: 2.5, fade: true, d: 300 });
      return { cells, fill(from, to, cls = 'mod') { g.stagger(cells.slice(from, to), 110, c => c.cls('f-' + cls + ' s-line').pulse(200, .08)); return this; }, x: i => x + i * pw };
    };

    // Пайыз жолағы: 0..max
    k.bar = (x, y, w, h, o = {}) => {
      const max = o.max ?? 100;
      g.rect(x, y, w, h, { rx: h / 2, fill: 'cell', stroke: 'line', sw: 2, fade: true });
      if (o.ticks) g.par(() => o.ticks.forEach(t => { g.line(x + t / max * w, y + h + 4, x + t / max * w, y + h + 12, { stroke: 'muted', sw: 2, fade: true }); g.text(x + t / max * w, y + h + 28, (o.tickFmt || (v => fmtNum(v) + (o.unit ?? '%')))(t), { size: 18, color: 'muted', fade: true }); }));
      return {
        X: v => x + v / max * w,
        fill(from, to, cls = 'mod', label, d = 800) {
          const r = g.rect(x + from / max * w, y, 0.01, h, { rx: 0, fill: cls, now: true });
          r.to({ width: Math.max(0.01, (to - from) / max * w) }, d);
          if (label != null) g.text(x + (from + to) / 2 / max * w, y + h / 2, label, { size: o.size || 20, bold: true, color: o.labelColor || 'on' });
          return r;
        }
      };
    };

    // Бағандық диаграмма
    k.barChart = (x, y, w, h, values, labels = [], o = {}) => {
      const max = o.max ?? Math.max(...values) * 1.15, n = values.length, slot = w / n, bw = Math.min(o.bw || 70, slot * .62);
      g.line(x, y + h, x + w, y + h, { stroke: 'muted', sw: 2, draw: true, d: 350 });
      const bars = [], vals = [];
      g.stagger(values, 140, (v, i) => {
        const bx = x + i * slot + (slot - bw) / 2, bh = v / max * h;
        const r = g.rect(bx, y + h, bw, 0.01, { rx: 5, fill: (o.fills && o.fills[i]) || o.fill || 'mod', now: true });
        r.to({ y: y + h - bh, height: bh }, 650, 'out');
        bars.push(r);
        if (!o.noValues) vals.push(g.text(bx + bw / 2, y + h - bh - 18, (o.valFmt || fmtNum)(v), { size: o.size || 20, bold: true }));
        if (labels[i] != null) g.text(bx + bw / 2, y + h + 24, labels[i], { size: o.lsize || 18, color: 'muted' });
      });
      return { bars, vals, hl(i, cls = 'gold') { bars[i].cls('f-' + cls).pulse(500, .08); return this; } };
    };

    // Дөңгелек диаграмма
    const arc = (cx, cy, r, a0, a1) => {
      if (a1 - a0 >= Math.PI * 2 - 1e-6) return `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      return `M${cx} ${cy} L${p0[0]} ${p0[1]} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1[0]} ${p1[1]} Z`;
    };
    k.arc = arc;
    k.pie = (cx, cy, r, values, o = {}) => {
      const total = values.reduce((a, b) => a + b, 0), fills = o.fills || ['mod', 'gold', 'c3', 'c4', 'ink', 'muted'];
      let a = -Math.PI / 2; const secs = [];
      values.forEach((v, i) => {
        const a0 = a, a1 = a + v / total * Math.PI * 2; a = a1;
        const p = g.path(arc(cx, cy, r, a0, a0 + .0001), { fill: fills[i % fills.length], stroke: 'sheet', sw: 3, now: true });
        g.anim(o.d || 600, q => p.shape.setAttribute('d', arc(cx, cy, r, a0, a0 + (a1 - a0) * q)), 'inout');
        const mid = (a0 + a1) / 2, lr = o.labelR ?? r * .62;
        if (o.labels?.[i] != null) g.text(cx + lr * Math.cos(mid), cy + lr * Math.sin(mid), o.labels[i], { size: o.size || 20, bold: true, color: o.labelColor || 'on' });
        secs.push({ p, mid, a0, a1 });
      });
      return { secs, pop(i, d = 12) { const s = secs[i]; s.p.move(d * Math.cos(s.mid), d * Math.sin(s.mid), 400); return this; } };
    };

    // Сызықтық график
    k.lineChart = (x, y, w, h, values, labels = [], o = {}) => {
      const min = o.min ?? 0, max = o.max ?? Math.max(...values) * 1.15, n = values.length;
      const X = i => x + (n === 1 ? w / 2 : i / (n - 1) * w), Y = v => y + h - (v - min) / (max - min) * h;
      g.line(x - 10, y + h, x + w + 10, y + h, { stroke: 'muted', sw: 2, draw: true, d: 300 });
      g.line(x - 10, y - 10, x - 10, y + h, { stroke: 'muted', sw: 2, draw: true, d: 300 });
      labels.forEach((l, i) => g.text(X(i), y + h + 24, l, { size: 17, color: 'muted', fade: true, d: 200 }));
      const path = g.path(values.map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v)}`).join(' '), { stroke: o.stroke || 'mod', sw: 4, draw: true, d: 900 });
      const pts = [];
      g.stagger(values, 120, (v, i) => { pts.push(g.circle(X(i), Y(v), 7, { fill: o.stroke || 'mod' })); if (!o.noValues) g.text(X(i), Y(v) - 22, (o.valFmt || fmtNum)(v), { size: 19, bold: true }); });
      return { X, Y, path, pts };
    };

    // Сан чиптері
    k.chips = (cx, y, values, o = {}) => {
      const w = o.w || 66, h = o.h || 58, gap = o.gap ?? 16, n = values.length, x0 = cx - (n * w + (n - 1) * gap) / 2;
      const items = [];
      g.stagger(values, o.stagger ?? 110, (v, i) => {
        const x = x0 + i * (w + gap);
        const grp = g.group();
        g.into(grp, () => { g.rect(x, y, w, h, { rx: 12, fill: o.fill || 'sheet', stroke: o.stroke || 'line', sw: 2.5, now: true }); g.text(x + w / 2, y + h / 2 + 1, String(v), { size: o.size || 26, math: true, bold: true, now: true }); });
        grp.origin(x + w / 2, y + h / 2).in(320);
        items.push({ grp, x: x + w / 2, rect: grp.node.querySelector('rect'), v });
      });
      return {
        items, cx: i => x0 + i * (w + gap) + w / 2, top: y, bottom: y + h,
        hl(i, cls = 'gold') { const it = items[i]; g.call(() => it.rect.setAttribute('class', `f-${cls}soft s-${cls}`)); it.grp.pulse(400, .12); return this; },
        mark(i, cls = 'red') { const it = items[i]; g.call(() => it.rect.setAttribute('class', `f-${cls === 'red' ? 'rsoft' : cls + 'soft'} s-${cls}`)); it.grp.shake(); return this; },
        diff(i, j, label, d = {}) { const a = this.cx(i), b = this.cx(j); g.curve(a, y - 6, b, y - 6, -50, { stroke: d.stroke || 'gold', sw: 2.5 }); g.text((a + b) / 2, y - 46, label, { size: 19, bold: true, color: d.stroke || 'gold' }); return this; }
      };
    };

    // Координаталық жазықтық
    k.plane = (x, y, size, min, max, o = {}) => {
      const s = size / (max - min), X = v => x + (v - min) * s, Y = v => y + size - (v - min) * s;
      g.par(() => {
        for (let v = min; v <= max; v++) {
          g.line(X(v), y, X(v), y + size, { stroke: 'line', sw: 1.2, fade: true, d: 200 });
          g.line(x, Y(v), x + size, Y(v), { stroke: 'line', sw: 1.2, fade: true, d: 200 });
          if (v !== 0 && (!o.every || v % o.every === 0)) { g.text(X(v), Y(0) + 17, String(v).replace('-', '−'), { size: 14, color: 'muted', fade: true, d: 200 }); g.text(X(0) - 13, Y(v), String(v).replace('-', '−'), { size: 14, color: 'muted', fade: true, d: 200 }); }
        }
      });
      g.arrow(x - 6, Y(0), x + size + 16, Y(0), { stroke: 'text', sw: 2.4, d: 350 });
      g.arrow(X(0), y + size + 6, X(0), y - 16, { stroke: 'text', sw: 2.4, d: 350 });
      g.text(x + size + 14, Y(0) + 20, 'x', { size: 18, math: true, italic: true });
      g.text(X(0) + 16, y - 12, 'y', { size: 18, math: true, italic: true });
      return {
        X, Y,
        pt(a, b, po = {}) { const c = g.circle(X(a), Y(b), po.r || 8, { fill: po.fill || 'red' }); if (po.label) g.text(X(a) + (po.dx ?? 14), Y(b) - (po.dy ?? 18), po.label, { size: 18, bold: true, anchor: 'start', color: po.fill || 'red' }); return c; },
        guide(a, b, stroke = 'gold') { g.par(() => { g.line(X(a), Y(0), X(a), Y(b), { stroke, sw: 2.2, dash: '6 6', draw: true }); g.line(X(0), Y(b), X(a), Y(b), { stroke, sw: 2.2, dash: '6 6', draw: true }); }); return this; },
        seg(a, b, c, d, so = {}) { return g.line(X(a), Y(b), X(c), Y(d), { stroke: so.stroke || 'mod', sw: so.sw || 3.5, draw: true }); }
      };
    };

    // Өлшем сызығы
    k.dim = (x1, y1, x2, y2, label, o = {}) => {
      const off = o.off ?? 22, a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * off, ny = Math.cos(a) * off;
      g.line(x1 + nx, y1 + ny, x2 + nx, y2 + ny, { stroke: o.stroke || 'gold', sw: 2, draw: true, d: 350 });
      return g.text((x1 + x2) / 2 + nx * (o.lk ?? 1.9), (y1 + y2) / 2 + ny * (o.lk ?? 1.9), label, { size: o.size || 22, bold: true, color: o.color || o.stroke || 'gold', math: true });
    };

    // Изометриялық қорап
    k.box = (x, y, a, b, c, o = {}) => {
      const dx = b * .55, dy = -b * .38;
      const P = { A: [x, y], B: [x + a, y], C: [x + a, y - c], D: [x, y - c] };
      const Q = Object.fromEntries(Object.entries(P).map(([n, p]) => [n, [p[0] + dx, p[1] + dy]]));
      const faces = [];
      g.par(() => {
        faces.push(g.poly([P.A, P.B, P.C, P.D], { fill: o.front || 'modsoft', stroke: 'ink', sw: 2.5 }));
        faces.push(g.poly([P.B, Q.B, Q.C, P.C], { fill: o.side || 'cell', stroke: 'ink', sw: 2.5 }));
        faces.push(g.poly([P.D, P.C, Q.C, Q.D], { fill: o.top || 'soft', stroke: 'ink', sw: 2.5 }));
        if (o.hidden !== false) { g.line(...P.A, ...Q.A, { stroke: 'muted', sw: 1.6, dash: '5 6', fade: true }); g.line(...Q.A, ...Q.B, { stroke: 'muted', sw: 1.6, dash: '5 6', fade: true }); g.line(...Q.A, ...Q.D, { stroke: 'muted', sw: 1.6, dash: '5 6', fade: true }); }
      });
      return { P, Q, faces, dx, dy };
    };

    // Ыдыс (су, ерітінді)
    k.tank = (x, y, w, h, o = {}) => {
      const liquid = g.rect(x + 4, y + h - 4, w - 8, 0.01, { rx: 4, fill: o.fill || 'mod', op: o.op ?? .75, now: true });
      const glass = g.path(`M${x} ${y} L${x} ${y + h - 10} Q${x} ${y + h} ${x + 10} ${y + h} L${x + w - 10} ${y + h} Q${x + w} ${y + h} ${x + w} ${y + h - 10} L${x + w} ${y}`, { stroke: 'ink', sw: 3.5, fill: 'none', draw: true, d: 500 });
      if (o.ticks) g.par(() => { for (let i = 1; i < o.ticks; i++) g.line(x + w - 14, y + h - i * h / o.ticks, x + w, y + h - i * h / o.ticks, { stroke: 'muted', sw: 1.5, fade: true }); });
      const t = {
        liquid, glass,
        level(p, d = 900) { const lh = Math.max(0.01, (h - 8) * p); liquid.to({ y: y + h - 4 - lh, height: lh }, d); return t; },
        top: p => y + h - 4 - (h - 8) * p
      };
      if (o.level) t.level(o.level, o.d ?? 700);
      return t;
    };

    // Эйлер–Венн
    k.venn = (cx, cy, r, n = 2, o = {}) => {
      const fills = o.fills || ['mod', 'gold', 'c3'];
      const C = n === 2 ? [[cx - r * .55, cy], [cx + r * .55, cy]] : [[cx - r * .5, cy - r * .32], [cx + r * .5, cy - r * .32], [cx, cy + r * .5]];
      const circles = [];
      g.par(() => C.forEach((c, i) => circles.push(g.circle(c[0], c[1], r, { fill: fills[i], op: .22, cls: 's-' + fills[i], sw: 3 }))));
      circles.forEach(c => c.shape.setAttribute('stroke-width', 3));
      if (o.labels) g.par(() => o.labels.forEach((l, i) => {
        const [lx, ly] = n === 2 ? [C[i][0] + (i ? r * .45 : -r * .45), cy - r - 22] : [[C[0][0] - r * .7, C[0][1] - r * .85], [C[1][0] + r * .7, C[1][1] - r * .85], [C[2][0], C[2][1] + r + 22]][i];
        g.text(lx, ly, l, { size: 21, bold: true, color: fills[i] === 'gold' ? 'goldt' : fills[i] });
      }));
      return { C, circles };
    };

    // Кесте
    k.table = (x, y, colW, rowH, rows, o = {}) => {
      const cells = [], bgs = [];
      const totalW = colW.reduce((a, b) => a + b, 0);
      g.par(() => rows.forEach((row, r) => {
        let cx = x;
        bgs[r] = []; cells[r] = [];
        row.forEach((v, c) => {
          bgs[r][c] = g.rect(cx, y + r * rowH, colW[c], rowH, { rx: 0, fill: r === 0 && o.head !== false ? 'inksoft' : 'sheet', stroke: 'line', sw: 1.5, fade: true, d: 250 });
          cells[r][c] = g.text(cx + colW[c] / 2, y + r * rowH + rowH / 2 + 1, v, { size: o.size || 20, bold: r === 0 && o.head !== false, math: o.math, fade: true, d: 250 });
          cx += colW[c];
        });
      }));
      return { cells, bgs, w: totalW, hl(r, c, cls = 'gold') { bgs[r][c].cls(`f-${cls}soft s-line`); cells[r][c].pulse(350, .12); return this; } };
    };

    // Сағат
    k.clock = (cx, cy, r, hh = 3, mm = 0) => {
      g.circle(cx, cy, r, { fill: 'sheet', cls: 's-ink', sw: 4 }).shape.setAttribute('stroke-width', 4);
      g.par(() => { for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.text(cx + r * .78 * Math.cos(a), cy + r * .78 * Math.sin(a), String(i), { size: r * .17, color: 'muted', fade: true, d: 200 }); } });
      const hand = (len, sw, cls) => { const e = g.line(cx, cy, cx, cy - len, { stroke: cls, sw, fade: true }); e.origin(cx, cy); return e; };
      const H_ = hand(r * .5, 7, 'ink'), M_ = hand(r * .74, 4.5, 'gold');
      g.circle(cx, cy, 7, { fill: 'ink' });
      const set = (h, m, d) => { const ma = m * 6, ha = (h % 12) * 30 + m * .5; if (d) g.par(() => { H_.to({ rot: ha }, d); M_.to({ rot: ma }, d); }); else { H_.st.rot = ha; M_.st.rot = ma; H_.apply(); M_.apply(); } };
      set(hh, mm);
      return { set: (h, m, d = 1200) => set(h, m, d) };
    };

    // Иконкалар (қарапайым векторлық суреттер)
    const ICON = {
      car: (c = 'mod') => [['path', { d: 'M-34 6 L-30 -8 Q-27 -16 -18 -17 L14 -17 Q22 -17 27 -8 L34 -2 L36 8 L-34 8 Z' }, c], ['circle', { cx: -19, cy: 9, r: 8 }, 'text'], ['circle', { cx: 21, cy: 9, r: 8 }, 'text'], ['rect', { x: -20, y: -13, width: 14, height: 8, rx: 2 }, 'sheet'], ['rect', { x: -2, y: -13, width: 16, height: 8, rx: 2 }, 'sheet']],
      bus: (c = 'gold') => [['rect', { x: -40, y: -24, width: 80, height: 34, rx: 7 }, c], ['rect', { x: -33, y: -18, width: 14, height: 11, rx: 2 }, 'sheet'], ['rect', { x: -14, y: -18, width: 14, height: 11, rx: 2 }, 'sheet'], ['rect', { x: 5, y: -18, width: 14, height: 11, rx: 2 }, 'sheet'], ['rect', { x: 24, y: -18, width: 10, height: 11, rx: 2 }, 'sheet'], ['circle', { cx: -24, cy: 11, r: 7 }, 'text'], ['circle', { cx: 24, cy: 11, r: 7 }, 'text']],
      train: (c = 'mod') => [['rect', { x: -46, y: -26, width: 92, height: 34, rx: 6 }, c], ['path', { d: 'M46 -26 Q60 -26 62 8 L46 8 Z' }, c], ['rect', { x: -38, y: -19, width: 16, height: 12, rx: 2 }, 'sheet'], ['rect', { x: -16, y: -19, width: 16, height: 12, rx: 2 }, 'sheet'], ['rect', { x: 6, y: -19, width: 16, height: 12, rx: 2 }, 'sheet'], ['circle', { cx: -30, cy: 11, r: 6 }, 'text'], ['circle', { cx: 0, cy: 11, r: 6 }, 'text'], ['circle', { cx: 30, cy: 11, r: 6 }, 'text']],
      boat: (c = 'mod') => [['path', { d: 'M-36 -4 L36 -4 L26 12 L-26 12 Z' }, c], ['path', { d: 'M-2 -6 L-2 -40 L24 -10 Z' }, 'sheet'], ['line', { x1: -2, y1: -42, x2: -2, y2: -4 }, null, 'text']],
      walker: (c = 'c3') => [['circle', { cx: 0, cy: -30, r: 8 }, c], ['path', { d: 'M0 -21 L0 2 M0 2 L-9 20 M0 2 L9 20 M0 -14 L-11 -2 M0 -14 L11 -4' }, null, c, 5]],
      bike: (c = 'c4') => [['circle', { cx: -18, cy: 8, r: 12 }, 'none', c, 3.5], ['circle', { cx: 18, cy: 8, r: 12 }, 'none', c, 3.5], ['path', { d: 'M-18 8 L-4 -10 L12 -10 L18 8 M-4 -10 L2 8 L-18 8 M12 -10 L10 -18' }, null, c, 3.5], ['circle', { cx: -2, cy: -30, r: 7 }, c], ['path', { d: 'M-2 -23 L2 -10 L-6 -14' }, null, c, 4]],
      person: (c = 'mod') => [['circle', { cx: 0, cy: -22, r: 11 }, c], ['path', { d: 'M-18 18 Q-18 -8 0 -8 Q18 -8 18 18 Z' }, c]],
      house: (c = 'gold') => [['path', { d: 'M-30 -4 L0 -30 L30 -4 Z' }, 'red'], ['rect', { x: -24, y: -4, width: 48, height: 32, rx: 2 }, c], ['rect', { x: -6, y: 8, width: 12, height: 20, rx: 1 }, 'sheet']],
      flag: (c = 'red') => [['line', { x1: 0, y1: 22, x2: 0, y2: -26 }, null, 'text', 3.5], ['path', { d: 'M0 -26 L26 -18 L0 -10 Z' }, c]],
      coin: (c = 'gold') => [['circle', { cx: 0, cy: 0, r: 26 }, c], ['circle', { cx: 0, cy: 0, r: 19 }, 'none', 'goldt', 2]],
      ball: (c = 'mod') => [['circle', { cx: 0, cy: 0, r: 17 }, c], ['circle', { cx: -6, cy: -6, r: 5 }, 'white', null, 0, .55]],
      tap: (c = 'muted') => [['path', { d: 'M-30 -10 L6 -10 L6 4 L-30 4 Z' }, c], ['path', { d: 'M0 4 L0 16 L12 16 L12 4' }, c]],
      pipe: (c = 'muted') => [['rect', { x: -34, y: -8, width: 68, height: 16, rx: 3 }, c]],
      bag: (c = 'c4') => [['path', { d: 'M-24 -10 L24 -10 L28 28 L-28 28 Z' }, c], ['path', { d: 'M-10 -10 Q-10 -28 0 -28 Q10 -28 10 -10' }, 'none', 'text', 3]],
      tree: (c = 'ok') => [['rect', { x: -4, y: 4, width: 8, height: 20 }, 'gold'], ['circle', { cx: 0, cy: -10, r: 20 }, c]],
      bulb: (c = 'gold') => [['circle', { cx: 0, cy: -8, r: 18 }, c], ['rect', { x: -8, y: 9, width: 16, height: 12, rx: 3 }, 'muted']],
      drop: (c = 'c3') => [['path', { d: 'M0 -24 Q18 0 14 10 Q8 22 0 22 Q-8 22 -14 10 Q-18 0 0 -24 Z' }, c]],
      fire: (c = 'red') => [['path', { d: 'M0 -26 Q20 -4 12 12 Q6 24 0 24 Q-12 24 -14 10 Q-16 -6 0 -26 Z' }, c], ['path', { d: 'M0 -2 Q8 8 4 16 Q0 20 -4 16 Q-8 8 0 -2 Z' }, 'gold']],
      fuel: (c = 'red') => [['rect', { x: -18, y: -24, width: 30, height: 46, rx: 4 }, c], ['rect', { x: -12, y: -18, width: 18, height: 12, rx: 2 }, 'sheet'], ['path', { d: 'M12 -14 L20 -6 L20 14' }, 'none', 'text', 3]]
    };
    k.icon = (name, x, y, o = {}) => {
      const grp = g.group({ hide: true });
      const sc = o.scale || 1;
      (ICON[name] || ICON.ball)(o.color).forEach(([tag, attrs, fill, stroke, sw, fop]) => {
        const el = document.createElementNS(NS, tag);
        for (const a in attrs) el.setAttribute(a, attrs[a]);
        el.setAttribute('class', [fill === 'none' || fill == null ? 'f-none' : 'f-' + fill, stroke ? 's-' + stroke : ''].join(' '));
        if (sw) el.setAttribute('stroke-width', sw);
        if (stroke && !sw) el.setAttribute('stroke-width', 3);
        if (stroke) el.setAttribute('stroke-linecap', 'round');
        if (fop != null) el.setAttribute('fill-opacity', fop);
        grp.node.append(el);
      });
      // ішкі тасымалдау: x, y және масштаб
      const inner = document.createElementNS(NS, 'g');
      while (grp.node.firstChild) inner.append(grp.node.firstChild);
      inner.setAttribute('transform', `translate(${x} ${y}) scale(${sc})${o.flip ? ' scale(-1 1)' : ''}`);
      grp.node.append(inner);
      grp.origin(x, y);
      grp.st.op = 1; grp.apply();
      if (!o.hide) grp.in(o.d ?? 380); else { grp.st.op = 0; grp.apply(); }
      return grp;
    };

    // Ойын сүйегі
    k.die = (x, y, n, s = 56, o = {}) => {
      const grp = g.group({ hide: true });
      const pip = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
      g.into(grp, () => {
        g.rect(x - s / 2, y - s / 2, s, s, { rx: s * .18, fill: o.fill || 'sheet', stroke: 'ink', sw: 2.5, now: true });
        (pip[n] || []).forEach(([a, b]) => g.circle(x + a * s * .27, y + b * s * .27, s * .085, { fill: o.pips || 'ink', now: true }));
      });
      grp.origin(x, y); grp.st.op = 1; grp.apply();
      if (!o.hide) grp.in(o.d ?? 340); else { grp.st.op = 0; grp.apply(); }
      return grp;
    };

    // Карточка
    k.card = (x, y, label, o = {}) => {
      const w = o.w || 56, h = o.h || 76, grp = g.group({ hide: true });
      g.into(grp, () => { g.rect(x - w / 2, y - h / 2, w, h, { rx: 8, fill: o.fill || 'sheet', stroke: o.stroke || 'ink', sw: 2.5, now: true }); g.text(x, y + 1, String(label), { size: o.size || 28, math: true, bold: true, color: o.color || 'text', now: true }); });
      grp.origin(x, y); grp.st.op = 1; grp.apply();
      if (!o.hide) grp.in(o.d ?? 340); else { grp.st.op = 0; grp.apply(); }
      return grp;
    };

    // Белгі (қысқа жазу фоны бар)
    k.tag = (x, y, str, o = {}) => {
      const grp = g.group({ hide: true }), w = o.w || Math.max(60, String(str).replace(/[*_~^[\]]/g, '').length * (o.size || 20) * .58 + 26), h = (o.size || 20) + 18;
      g.into(grp, () => { g.rect(x - w / 2, y - h / 2, w, h, { rx: h / 2, fill: o.fill || 'goldsoft', stroke: o.stroke || 'gold', sw: 2, now: true }); g.text(x, y + 1, str, { size: o.size || 20, bold: true, color: o.color || 'text', math: o.math, now: true }); });
      grp.origin(x, y); grp.st.op = 1; grp.apply();
      if (!o.hide) grp.in(o.d ?? 340); else { grp.st.op = 0; grp.apply(); }
      return grp;
    };

    // Белгішелер: ✓ және ✗
    k.check = (x, y, s = 1) => g.path(`M${x - 14 * s} ${y} L${x - 4 * s} ${y + 11 * s} L${x + 16 * s} ${y - 12 * s}`, { stroke: 'ok', sw: 5, draw: true, d: 350 });
    k.cross = (x, y, s = 1) => g.path(`M${x - 12 * s} ${y - 12 * s} L${x + 12 * s} ${y + 12 * s} M${x + 12 * s} ${y - 12 * s} L${x - 12 * s} ${y + 12 * s}`, { stroke: 'red', sw: 5, draw: true, d: 350 });

    // Сызық үстінен сызып тастау
    k.strike = (x1, y, x2) => g.line(x1, y, x2, y, { stroke: 'red', sw: 4, draw: true, d: 300 });

    // Тақырып жолы (сахнаның жоғарғы жағы)
    k.title = (str, o = {}) => g.text(o.x ?? 400, o.y ?? 42, str, { size: o.size || 24, bold: true, color: o.color || 'text', ...o });

    // Жауап белгісі
    k.answer = (x, y, str, o = {}) => {
      const grp = k.tag(x, y, str, { fill: 'oksoft', stroke: 'ok', size: o.size || 26, math: true, ...o });
      grp.pulse(500, .1);
      return grp;
    };
    return k;
  }

  /* ---------------- Ойнатқыш ---------------- */
  let P = null; // ағымдағы ойнатқыш

  const ICONS = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM19 5.5v13L9.5 12z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM5 5.5v13L14.5 12z" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg>'
  };

  function html(lessonTitle) {
    return `<div class="anim" tabindex="-1">
      <div class="anim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${lessonTitle ? lessonTitle.replace(/"/g, '') + ' — ' : ''}анимациялық түсіндірме"><g class="an-root"></g></svg>
        <button class="anim-cover" data-anim="play" hidden aria-label="Ойнату"><span>${ICONS.play}</span></button></div>
      <div class="anim-cap"><p aria-live="polite"></p></div>
      <div class="anim-bar">
        <button class="anim-btn" data-anim="prev" aria-label="Алдыңғы қадам">${ICONS.prev}</button>
        <button class="anim-btn anim-main" data-anim="toggle" aria-label="Ойнату / кідірту">${ICONS.pause}</button>
        <button class="anim-btn" data-anim="next" aria-label="Келесі қадам">${ICONS.next}</button>
        <div class="anim-dots" role="tablist"></div>
        <button class="anim-btn anim-speed" data-anim="speed" aria-label="Жылдамдық">1×</button>
      </div></div>`;
  }

  function beatLength(say, animEnd) {
    const plain = String(say || '').replace(/[*_~^[\]]/g, '');
    return Math.max(animEnd + 900, 1500 + plain.length * 62);
  }

  function createPlayer(rootEl, lesson, mod) {
    rootEl.innerHTML = html(lesson.title);
    const box = rootEl.querySelector('.anim'), svg = box.querySelector('svg'), cap = box.querySelector('.anim-cap p');
    const dots = box.querySelector('.anim-dots'), main = box.querySelector('.anim-main'), cover = box.querySelector('.anim-cover');
    box.style.setProperty('--mod', mod?.color || 'var(--ink)');
    const clock = new Clock();
    const p = { id: lesson.id, beat: 0, beats: [], ended: false, rootEl, clock, end: 0 };
    let g, k;

    function build() {
      svg.querySelector('.an-root').textContent = '';
      clock.reset();
      g = makeStage(svg, clock); k = makeKit(g);
      try { p.beats = SCENES[lesson.id](g, k, lesson) || []; } catch (e) { console.warn(e); p.beats = []; }
    }
    function runBeat(i, instant) {
      const b = p.beats[i]; if (!b) return 0;
      const [say, fn] = Array.isArray(b) ? b : [b.say, b.do];
      g.instant = instant; g.c = 0; g.maxEnd = 0; g.base = instant ? 0 : clock.t;
      try { fn?.(); } catch (e) { console.warn('anim', lesson.id, i, e); }
      if (!instant) { setCap(say); return beatLength(say, Math.max(g.c, g.maxEnd)); }
      return 0;
    }
    function setCap(s) { markupHTML(cap, s); cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in'); }
    function paintDots() {
      dots.innerHTML = p.beats.map((_, i) => `<button role="tab" data-anim-beat="${i}" class="${i === p.beat ? 'is-on' : i < p.beat ? 'is-past' : ''}" aria-label="${i + 1}-қадам"></button>`).join('');
    }
    function seek(i, play = true) {
      i = Math.max(0, Math.min(p.beats.length - 1, i));
      build();
      for (let j = 0; j < i; j++) runBeat(j, true);
      p.beat = i; p.ended = false; cover.hidden = true;
      const len = runBeat(i, false);
      p.end = clock.t + len;
      paintDots();
      setPlaying(play);
    }
    function setPlaying(v) {
      clock.playing = v;
      main.innerHTML = v ? ICONS.pause : ICONS.play;
      main.setAttribute('aria-label', v ? 'Кідірту' : 'Ойнату');
      box.classList.toggle('is-paused', !v);
    }
    clock.onTick = t => {
      if (t >= p.end && clock.playing) {
        if (p.beat < p.beats.length - 1) {
          p.beat++;
          const len = runBeat(p.beat, false); p.end = clock.t + len; paintDots();
        } else { p.ended = true; setPlaying(false); cover.hidden = false; cover.innerHTML = `<span>${ICONS.replay}</span><b>Қайта көру</b>`; }
      }
    };
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-anim],[data-anim-beat]'); if (!b) return;
      if (b.dataset.animBeat != null) return seek(+b.dataset.animBeat, true);
      const a = b.dataset.anim;
      if (a === 'toggle' || a === 'play') { if (p.ended) seek(0, true); else { setPlaying(!clock.playing); cover.hidden = true; } }
      if (a === 'prev') seek(p.beat - 1, true);
      if (a === 'next') { if (p.beat < p.beats.length - 1) seek(p.beat + 1, true); }
      if (a === 'speed') { const sp = [1, 1.5, .75]; clock.speed = sp[(sp.indexOf(clock.speed) + 1) % sp.length]; b.textContent = String(clock.speed).replace('.', ',') + '×'; }
    });
    box.addEventListener('keydown', e => { if (e.key === ' ' && e.target === box) { e.preventDefault(); main.click(); } if (e.key === 'ArrowRight' && e.target === box) seek(p.beat + 1); if (e.key === 'ArrowLeft' && e.target === box) seek(p.beat - 1); });
    clock.start();
    p.seek = seek; p.destroy = () => { clock.stop(); clock.playing = false; };
    // Тексеру үшін: i-қадамның соңғы күйі
    p.still = i => { build(); for (let j = 0; j <= i; j++) runBeat(j, true); p.beat = i; const b = p.beats[i]; setCap(Array.isArray(b) ? b[0] : b?.say); paintDots(); setPlaying(false); cover.hidden = true; };
    p.setPlaying = setPlaying;
    return p;
  }

  function markupHTML(el, str) {
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    el.innerHTML = String(str || '').split(MARK).filter(s => s !== '').map(part => {
      if (/^\*\*.*\*\*$/.test(part)) return `<b class="c-gold">${esc(part.slice(2, -2))}</b>`;
      if (/^__.*__$/.test(part)) return `<b class="c-mod">${esc(part.slice(2, -2))}</b>`;
      if (/^~~.*~~$/.test(part)) return `<s class="c-red">${esc(part.slice(2, -2))}</s>`;
      if (/^\^\^.*\^\^$/.test(part)) return `<b class="c-ok">${esc(part.slice(2, -2))}</b>`;
      if (/^\[\[.*\]\]$/.test(part)) return `<b class="c-red">${esc(part.slice(2, -2))}</b>`;
      if (/^\^\{.*\}$/.test(part)) return `<sup>${esc(part.slice(2, -1))}</sup>`;
      if (/^_\{.*\}$/.test(part)) return `<sub>${esc(part.slice(2, -1))}</sub>`;
      return esc(part);
    }).join('');
  }

  async function mount(rootEl, lesson, mod, opts = {}) {
    if (P && P.rootEl !== rootEl) { P.destroy(); }
    const resume = P && P.id === lesson.id ? P.beat : 0;
    rootEl.innerHTML = '<div class="anim anim-loading"><div class="anim-stage"><span class="anim-spin"></span></div></div>';
    try { await load(lesson.moduleId || lesson.id.split('-')[0]); } catch {
      rootEl.innerHTML = '<div class="anim anim-empty"><p>Анимация жүктелмеді. Интернетті тексеріп, бетті жаңартыңыз.</p></div>'; return null;
    }
    if (!document.contains(rootEl)) return null;
    if (!SCENES[lesson.id]) { rootEl.innerHTML = '<div class="anim anim-empty"><p>Бұл тақырыптың анимациясы әзірленуде.</p></div>'; return null; }
    if (P) P.destroy();
    P = createPlayer(rootEl, lesson, mod);
    P.seek(opts.beat ?? resume, opts.autoplay !== false);
    return P;
  }
  function stop() { if (P) { P.destroy(); P = null; } }
  function pause() { P?.setPlaying(false); }

  return {
    scene(id, fn) { SCENES[id] = fn; },
    has: id => !!SCENES[id],
    ids: () => Object.keys(SCENES),
    load, mount, stop, pause,
    get current() { return P; },
    _test: { makeStage, makeKit, Clock, SCENES }
  };
})();
