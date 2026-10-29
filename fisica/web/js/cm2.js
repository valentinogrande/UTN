/* Centro de masa: figuras compuestas y explosión en dos pedazos */
(() => {
  'use strict';
  const { Sim, C, alpha, fmt, text, circle, line, grid, star, setInput } = PH;

  // ---------------- Figuras compuestas ----------------
  const FIGS = {
    L: [{ x: 0, y: 0, w: 2, h: 6 }, { x: 2, y: 0, w: 4, h: 2 }],
    T: [{ x: 0, y: 4, w: 6, h: 2 }, { x: 2, y: 0, w: 2, h: 4 }],
    H: [{ x: 0, y: 0, w: 6, h: 6 }, { x: 3.5, y: 3.5, w: 2, h: 2, hole: true }],
    U: [{ x: 0, y: 0, w: 6, h: 1.5 }, { x: 0, y: 1.5, w: 1.5, h: 4.5 }, { x: 4.5, y: 1.5, w: 1.5, h: 4.5 }]
  };
  new Sim('s-figuras', {
    still: true,
    frame(s, ctx, w, h) {
      const P = FIGS[s.p.fig], cols = [C.lin, C.rot, C.en];
      const sc = Math.min((w - 60) / 7.5, (h - 40) / 7), X0 = (w - 6 * sc) / 2, Y0 = h - 24;
      const X = x => X0 + x * sc, Y = y => Y0 - y * sc;
      grid(ctx, X(-1), Y(6.8), 8 * sc, 7.8 * sc, sc);
      line(ctx, X(-1), Y(0), X(7), Y(0), C.line, 1.5); line(ctx, X(0), Y(-0.6), X(0), Y(6.8), C.line, 1.5);
      for (let i = 0; i <= 6; i += 2) text(ctx, i + '', X(i), Y(0) + 12, { col: C.muted, size: 10, align: 'center' });
      let A = 0, Sx = 0, Sy = 0;
      P.forEach((r, i) => {
        const a = r.w * r.h * (r.hole ? -1 : 1), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        A += a; Sx += a * cx; Sy += a * cy;
        if (r.hole) {
          ctx.fillStyle = C.surface; ctx.fillRect(X(r.x), Y(r.y + r.h), r.w * sc, r.h * sc);
          ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.force; ctx.lineWidth = 2; ctx.strokeRect(X(r.x), Y(r.y + r.h), r.w * sc, r.h * sc); ctx.restore();
        } else {
          ctx.fillStyle = alpha(cols[i], 0.22); ctx.fillRect(X(r.x), Y(r.y + r.h), r.w * sc, r.h * sc);
          ctx.strokeStyle = cols[i]; ctx.lineWidth = 2; ctx.strokeRect(X(r.x), Y(r.y + r.h), r.w * sc, r.h * sc);
        }
      });
      P.forEach((r, i) => {
        const a = r.w * r.h, cx = r.x + r.w / 2, cy = r.y + r.h / 2, col = r.hole ? C.force : cols[i];
        circle(ctx, X(cx), Y(cy), 5, col, C.surface, 1.5);
        text(ctx, `${r.hole ? '−' : ''}A=${fmt(a, a % 1 ? 2 : 0)}`, X(cx) + 8, Y(cy) - 8, { col, size: 11, weight: 700, bg: alpha(C.surface, 0.8) });
        text(ctx, `(${fmt(cx, 2)}; ${fmt(cy, 2)})`, X(cx) + 8, Y(cy) + 8, { col: C.muted, size: 10, bg: alpha(C.surface, 0.8) });
      });
      const xc = Sx / A, yc = Sy / A;
      line(ctx, X(xc), Y(0), X(xc), Y(yc), alpha(C.alt, 0.5), 1, [3, 3]);
      line(ctx, X(0), Y(yc), X(xc), Y(yc), alpha(C.alt, 0.5), 1, [3, 3]);
      star(ctx, X(xc), Y(yc), 13, C.alt);
      text(ctx, 'CM', X(xc) + 15, Y(yc) - 12, { col: C.alt, size: 12, weight: 700 });
      const term = k => P.map((r, i) => { const a = r.w * r.h, c = k ? r.y + r.h / 2 : r.x + r.w / 2; return `${i ? (r.hole ? ' − ' : ' + ') : ''}${fmt(a, a % 1 ? 2 : 0)}·${fmt(c, 2)}`; }).join('');
      const den = P.map((r, i) => `${i ? (r.hole ? ' − ' : ' + ') : ''}${fmt(r.w * r.h, (r.w * r.h) % 1 ? 2 : 0)}`).join('');
      s.out('fx', `x_cm = (${term(0)}) / (${den}) = ${fmt(xc, 2)} cm`);
      s.out('fy', `y_cm = (${term(1)}) / (${den}) = ${fmt(yc, 2)} cm`);
    }
  });

  // ---------------- Explosión en dos pedazos ----------------
  new Sim('s-explo2', {
    init(s) { s.st.t = 0; s.st.hold = 0; },
    change(s) { s.reset(); },
    act: {
      back(s) { setInput(s, 'f', 0.5); setInput(s, 'v1', -10); },
      vert(s) { setInput(s, 'f', 0.5); setInput(s, 'v1', 0); },
      same(s) { setInput(s, 'v1', 10); }
    },
    frame(s, ctx, w, h, dt) {
      const st = s.st, g = 9.8, vx = 10, vy = 19.6, R = 40, f = s.p.f, v1 = s.p.v1;
      const v2 = (vx - f * v1) / (1 - f), x1 = 20 + 2 * v1, x2 = 20 + 2 * v2;
      st.t += dt;
      if (st.t >= 4) { st.t = 4; st.hold += dt; if (st.hold > 2.4) s.reset(); }
      const t = st.t;
      const xmin = Math.min(-4, x1 - 4), xmax = Math.max(46, x2 + 6, x1 + 6), ymax = 23;
      const sc = Math.min((w - 30) / (xmax - xmin), (h - 50) / ymax);
      const X = x => 15 + (x - xmin) * sc, Y = y => h - 26 - y * sc;
      line(ctx, 0, Y(0), w, Y(0), C.ink, 2);
      const step = xmax - xmin > 120 ? 40 : xmax - xmin > 60 ? 20 : 10;
      for (let v = Math.ceil(xmin / step) * step; v <= xmax; v += step) { line(ctx, X(v), Y(0), X(v), Y(0) + 5, C.muted, 1); text(ctx, v + ' m', X(v), Y(0) + 15, { col: C.muted, size: 10, align: 'center' }); }
      ctx.fillStyle = C.muted; ctx.fillRect(X(0) - 10, Y(0) - 8, 20, 8);
      // parábola sin explosión
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = alpha(C.alt, 0.6); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const q = i / 20; const x = vx * q, y = vy * q - 0.5 * g * q * q; i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke(); ctx.restore();
      const path = (x0, y0, vxx, t0, t1, col, dash) => {
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; if (dash) ctx.setLineDash(dash); ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const q = t0 + (t1 - t0) * i / 40; const x = x0 + vxx * q, y = y0 - 0.5 * g * q * q; i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
        ctx.stroke(); ctx.restore();
      };
      const r1 = 5 + 7 * Math.sqrt(f), r2 = 5 + 7 * Math.sqrt(1 - f);
      if (t <= 2) {
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 30; i++) { const q = t * i / 30; i ? ctx.lineTo(X(vx * q), Y(vy * q - 4.9 * q * q)) : ctx.moveTo(X(0), Y(0)); }
        ctx.stroke(); ctx.restore();
        const bx = vx * t, by = vy * t - 4.9 * t * t;
        circle(ctx, X(bx), Y(by), 9, C.ink);
        text(ctx, '¿Dónde va a caer el pedazo naranja?', w / 2, 18, { col: C.muted, size: 12, align: 'center', font: 'body' });
      } else {
        const q = t - 2, y = 19.6 - 4.9 * q * q;
        ctx.save(); ctx.strokeStyle = alpha(C.ink, 0.5); ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 30; i++) { const u = 2 * i / 30; i ? ctx.lineTo(X(vx * u), Y(vy * u - 4.9 * u * u)) : ctx.moveTo(X(0), Y(0)); }
        ctx.stroke(); ctx.restore();
        path(20, 19.6, v1, 0, q, C.lin); path(20, 19.6, v2, 0, q, C.rot);
        if (q < 0.25) circle(ctx, X(20), Y(19.6), 10 + q * 120, null, alpha(C.force, 1 - q * 4), 3);
        const p1 = 20 + v1 * q, p2 = 20 + v2 * q, pc = f * p1 + (1 - f) * p2;
        circle(ctx, X(p1), Y(y), r1, C.lin); circle(ctx, X(p2), Y(y), r2, C.rot);
        star(ctx, X(pc), Y(y), 11, C.alt);
        line(ctx, X(p1), Y(y), X(p2), Y(y), alpha(C.alt, 0.4), 1, [2, 3]);
        if (t >= 4) {
          [[x1, C.lin, 'pedazo 1'], [x2, C.rot, 'pedazo 2'], [R, C.alt, 'CM = R']].forEach(([x, col, lb], i) => {
            line(ctx, X(x), Y(0), X(x), Y(0) - 26 - i * 14, col, 1.5);
            text(ctx, `${lb}: ${fmt(x, 1)} m`, X(x), Y(0) - 32 - i * 14, { col, size: 11, weight: 700, align: 'center', bg: alpha(C.surface, 0.85) });
          });
        }
      }
      s.out('x1', fmt(x1, 1) + ' m'); s.out('x2', fmt(x2, 1) + ' m'); s.out('xc', fmt(R, 1) + ' m'); s.out('v2', fmt(v2, 1) + ' m/s');
    }
  });
})();
