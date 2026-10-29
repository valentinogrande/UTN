/* Núcleo: bucle de animación compartido, colores del tema, controles y utilidades de dibujo */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const C = {};
  const TOK = ['bg', 'surface', 'sunk', 'ink', 'muted', 'line', 'grid', 'lin', 'rot', 'en', 'force', 'alt'];
  const sims = [];

  function readColors() {
    const cs = getComputedStyle(root);
    TOK.forEach(k => { C[k] = cs.getPropertyValue('--' + k).trim(); });
  }
  readColors();
  const redrawAll = () => { readColors(); sims.forEach(s => s.draw()); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawAll);
  new MutationObserver(redrawAll).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // ---------- utilidades ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function alpha(hex, a) {
    if (!hex || hex[0] !== '#') return hex;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  // número con coma decimal y signo menos tipográfico
  function fmt(n, d = 2) {
    if (!isFinite(n)) return '∞';
    const s = Math.abs(n) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : n.toFixed(d);
    return s.replace('-', '−').replace('.', ',');
  }

  const FONT = { mono: '"JetBrains Mono", ui-monospace, monospace', body: '"Atkinson Hyperlegible", system-ui, sans-serif', disp: '"Bricolage Grotesque", system-ui, sans-serif' };

  function text(ctx, s, x, y, o = {}) {
    ctx.save();
    ctx.fillStyle = o.col || C.ink;
    ctx.font = `${o.weight || 500} ${o.size || 12}px ${FONT[o.font || 'mono']}`;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'middle';
    if (o.bg) {
      const m = ctx.measureText(s), pw = 4, hh = (o.size || 12) * .75 + 3;
      const x0 = o.align === 'center' ? x - m.width / 2 : o.align === 'right' ? x - m.width : x;
      ctx.fillStyle = o.bg; ctx.fillRect(x0 - pw, y - hh, m.width + pw * 2, hh * 2);
      ctx.fillStyle = o.col || C.ink;
    }
    ctx.fillText(s, x, y);
    ctx.restore();
  }

  function arrow(ctx, x1, y1, x2, y2, col, lw = 2.5, hs = 9, dash) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    if (L < 0.5) return;
    const ux = dx / L, uy = dy / L, h = Math.min(hs, L * 0.6);
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * h * 0.8, y2 - uy * h * 0.8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * h - uy * h * 0.5, y2 - uy * h + ux * h * 0.5);
    ctx.lineTo(x2 - ux * h + uy * h * 0.5, y2 - uy * h - ux * h * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // arco con flecha (para ω, α, τ)
  function arcArrow(ctx, x, y, r, a0, a1, col, lw = 2.5) {
    if (Math.abs(a1 - a0) < 0.05) return;
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r, a0, a1, a1 < a0); ctx.stroke();
    const dir = a1 > a0 ? 1 : -1;
    const ex = x + r * Math.cos(a1), ey = y + r * Math.sin(a1);
    const tx = -Math.sin(a1) * dir, ty = Math.cos(a1) * dir, h = 9;
    ctx.beginPath();
    ctx.moveTo(ex + tx * h * 0.6, ey + ty * h * 0.6);
    ctx.lineTo(ex - tx * h * 0.5 + Math.cos(a1) * h * 0.55, ey - ty * h * 0.5 + Math.sin(a1) * h * 0.55);
    ctx.lineTo(ex - tx * h * 0.5 - Math.cos(a1) * h * 0.55, ey - ty * h * 0.5 - Math.sin(a1) * h * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function grid(ctx, x0, y0, w, h, step, col) {
    ctx.save(); ctx.strokeStyle = col || C.grid; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0; x <= x0 + w + 0.1; x += step) { ctx.moveTo(Math.round(x) + .5, y0); ctx.lineTo(Math.round(x) + .5, y0 + h); }
    for (let y = y0; y <= y0 + h + 0.1; y += step) { ctx.moveTo(x0, Math.round(y) + .5); ctx.lineTo(x0 + w, Math.round(y) + .5); }
    ctx.stroke(); ctx.restore();
  }

  function circle(ctx, x, y, r, fill, stroke, lw = 2) {
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  function line(ctx, x1, y1, x2, y2, col, lw = 1.5, dash) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }

  // Marco de gráfico: devuelve funciones de escala. r = {x, y, w, h}
  function axes(ctx, r, o) {
    const { x0 = 0, x1 = 1, y0 = 0, y1 = 1, xl = '', yl = '', ticksX, ticksY } = o;
    const X = v => r.x + (v - x0) / (x1 - x0) * r.w;
    const Y = v => r.y + r.h - (v - y0) / (y1 - y0) * r.h;
    ctx.save();
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    (ticksY || []).forEach(v => { line(ctx, r.x, Y(v), r.x + r.w, Y(v), C.grid, 1); text(ctx, fmt(v, o.dy ?? 0), r.x - 6, Y(v), { col: C.muted, size: 10, align: 'right' }); });
    (ticksX || []).forEach(v => { text(ctx, fmt(v, o.dx ?? 0), X(v), r.y + r.h + 11, { col: C.muted, size: 10, align: 'center' }); });
    const zy = y0 < 0 && y1 > 0 ? Y(0) : r.y + r.h;
    line(ctx, r.x, zy, r.x + r.w, zy, C.muted, 1.2);
    line(ctx, r.x, r.y, r.x, r.y + r.h, C.muted, 1.2);
    text(ctx, yl, r.x + 6, r.y + 2, { col: C.muted, size: 11, base: 'top' });
    text(ctx, xl, r.x + r.w, zy - 8, { col: C.muted, size: 11, align: 'right' });
    ctx.restore();
    return { X, Y };
  }

  function bar(ctx, x, yBase, w, hpx, col) { // hpx positivo hacia arriba
    ctx.fillStyle = col;
    ctx.fillRect(x, hpx >= 0 ? yBase - hpx : yBase, w, Math.abs(hpx));
  }

  // ---------- Sim ----------
  class Sim {
    constructor(id, o) {
      this.el = document.getElementById(id);
      if (!this.el) return;
      this.cv = this.el.querySelector('canvas');
      this.ctx = this.cv.getContext('2d');
      this.o = o; this.st = {}; this.p = {}; this.outs = {}; this.t = 0;
      this.visible = false; this.paused = reduce && !o.still; this.w = 0; this.h = 0;
      this.el.querySelectorAll('[data-o]').forEach(e => { this.outs[e.dataset.o] = e; });

      // controles
      this.el.querySelectorAll('input').forEach(inp => {
        const k = inp.dataset.k; if (!k) return;
        const out = inp.parentElement.querySelector('output');
        const read = () => {
          if (inp.type === 'checkbox') this.p[k] = inp.checked;
          else {
            this.p[k] = parseFloat(inp.value);
            if (out) out.textContent = fmt(this.p[k], +(inp.dataset.d ?? 1)) + (inp.dataset.u ? ' ' + inp.dataset.u : '');
          }
        };
        read();
        inp.addEventListener('input', () => { read(); o.change && o.change(this, k); this.draw(); });
      });
      this.el.querySelectorAll('.seg[data-k]').forEach(seg => {
        const k = seg.dataset.k;
        const btns = [...seg.querySelectorAll('button')];
        const cur = btns.find(b => b.getAttribute('aria-pressed') === 'true') || btns[0];
        this.p[k] = cur.dataset.v;
        btns.forEach(b => b.addEventListener('click', () => {
          btns.forEach(x => x.setAttribute('aria-pressed', x === b));
          this.p[k] = b.dataset.v; o.change && o.change(this, k); this.draw();
        }));
      });
      this.el.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.act;
        if (a === 'play') this.setPaused(!this.paused);
        else if (a === 'reset') { this.reset(); }
        else if (o.act && o.act[a]) { o.act[a](this, b); if (this.paused && o.wake !== false) this.setPaused(false); this.draw(); }
      }));
      this.playBtn = this.el.querySelector('[data-act=play]');

      // puntero
      const pos = e => { const r = this.cv.getBoundingClientRect(); return [(e.clientX - r.left) * this.w / r.width, (e.clientY - r.top) * this.h / r.height]; };
      this.cv.addEventListener('pointerdown', e => {
        const [x, y] = pos(e); this.down = true;
        if (o.down && o.down(this, x, y) !== false) { this.cv.setPointerCapture(e.pointerId); }
        this.draw();
      });
      this.cv.addEventListener('pointermove', e => { const [x, y] = pos(e); o.move && o.move(this, x, y, this.down); if (this.down) this.draw(); });
      const up = () => { if (this.down) { this.down = false; o.up && o.up(this); this.draw(); } };
      this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', up);

      // tamaño y visibilidad
      const ar = () => {
        const narrow = this.el.clientWidth < 560;
        const a = parseFloat(narrow && this.el.dataset.aspectM ? this.el.dataset.aspectM : this.el.dataset.aspect || 0.56);
        this.cv.style.aspectRatio = (1 / a).toFixed(4);
      };
      ar();
      new ResizeObserver(() => { ar(); this.resize(); }).observe(this.el);
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.draw(); }, { rootMargin: '80px' }).observe(this.cv);
      this.reset(true);
      this.setPaused(this.paused);
      sims.push(this);
    }
    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = this.cv.clientWidth, h = this.cv.clientHeight;
      if (!w || !h) return;
      this.w = w; this.h = h;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }
    reset(first) { this.t = 0; this.st = {}; this.o.init && this.o.init(this); if (!first) this.draw(); }
    setPaused(v) {
      this.paused = v; this.el.classList.toggle('paused', v);
      if (this.playBtn) this.playBtn.innerHTML = v ? '▶ Reproducir' : '❚❚ Pausa';
    }
    out(k, v) { const e = this.outs[k]; if (e && e._v !== v) { e.textContent = v; e._v = v; } }
    draw() { if (this.w) this.frame(0); }
    frame(dt) {
      const { ctx, w, h } = this;
      ctx.clearRect(0, 0, w, h);
      this.t += dt;
      this.o.frame(this, ctx, w, h, dt);
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.04, (now - last) / 1000); last = now;
    for (const s of sims) if (s.visible && !s.paused && s.w) s.frame(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.PH = { Sim, C, TAU, clamp, lerp, alpha, fmt, text, arrow, arcArrow, grid, circle, rrect, line, axes, bar, FONT, reduce };

  // ---------- navegación ----------
  document.addEventListener('DOMContentLoaded', () => {
    // una vista por unidad: sólo se muestra la sección .view activa
    const views = [...document.querySelectorAll('.view')];
    const groups = [...document.querySelectorAll('.side .grp')];
    const home = document.querySelector('.side a.unit.home');
    const tops = [...document.querySelectorAll('.topbar a')];
    const subLinks = [...document.querySelectorAll('.side .sub a')];
    let current = null;
    function show(id, smooth) {
      const target = document.getElementById(id);
      const view = target ? target.closest('.view') : null;
      if (!view) return false;
      if (view !== current) {
        views.forEach(v => { v.hidden = v !== view; });
        current = view;
        groups.forEach(g => g.classList.toggle('open', g.dataset.view === view.id));
        if (home) home.classList.toggle('on', view.id === 'inicio');
        tops.forEach(a => {
          const on = a.dataset.view === view.id; a.classList.toggle('on', on);
          if (on) a.scrollIntoView({ block: 'nearest', inline: 'center' });
        });
        const g = groups.find(x => x.dataset.view === view.id); if (g) g.scrollIntoView({ block: 'nearest' });
      }
      requestAnimationFrame(() => {
        if (target === view) window.scrollTo({ top: 0 });
        else target.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto' });
      });
      try { history.replaceState(null, '', '#' + id); } catch (e) { /* el visor puede no permitirlo */ }
      return true;
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (id && show(id, true)) e.preventDefault();
    });
    addEventListener('hashchange', () => show(location.hash.slice(1)));
    if (!(location.hash && show(location.hash.slice(1)))) show('inicio');

    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        subLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    document.querySelectorAll('article.topic').forEach(el => io.observe(el));

    const bar = document.querySelector('.progress');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const tb = document.querySelector('.theme-btn');
    if (tb) {
      const label = () => { const t = root.dataset.theme; tb.textContent = t === 'dark' ? 'Tema: oscuro' : t === 'light' ? 'Tema: claro' : 'Tema: sistema'; };
      try { const s = localStorage.getItem('fis-theme'); if (s) root.dataset.theme = s; } catch (e) { /* sin storage */ }
      label();
      tb.addEventListener('click', () => {
        const order = [undefined, 'light', 'dark'];
        const i = order.indexOf(root.dataset.theme);
        const n = order[(i + 1) % 3];
        if (n) root.dataset.theme = n; else delete root.dataset.theme;
        try { n ? localStorage.setItem('fis-theme', n) : localStorage.removeItem('fis-theme'); } catch (e) { /* sin storage */ }
        label();
      });
    }

  });
})();
