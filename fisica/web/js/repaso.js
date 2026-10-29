/* Repaso: MRUV, circular, plano inclinado, trabajo, energía mecánica */
(() => {
  'use strict';
  const { Sim, C, TAU, alpha, fmt, text, arrow, arcArrow, circle, rrect, line, axes } = PH;
  const g = 9.8;

  function niceStep(range, n = 5) {
    const raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
  }
  function ticks(a, b, n = 5) {
    const st = niceStep(b - a, n), out = [];
    for (let v = Math.ceil(a / st) * st; v <= b + 1e-9; v += st) out.push(+v.toFixed(6));
    return out;
  }

  // auto con ruedas que giran (ω = v/r)
  function car(ctx, x, y, wpx, ang, col) {
    const hpx = wpx * 0.36, r = wpx * 0.14;
    ctx.save();
    rrect(ctx, x - wpx / 2, y - hpx - r * 0.9, wpx, hpx, 6); ctx.fillStyle = col; ctx.fill();
    rrect(ctx, x - wpx * 0.22, y - hpx * 1.55 - r * 0.9, wpx * 0.48, hpx * 0.62, 5); ctx.fillStyle = alpha(col, 0.55); ctx.fill();
    [-0.3, 0.3].forEach(k => {
      const cx = x + k * wpx, cy = y - r;
      circle(ctx, cx, cy, r, C.ink);
      ctx.strokeStyle = C.surface; ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        const a = ang + i * TAU / 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8); ctx.stroke();
      }
    });
    ctx.restore();
  }

  // ---------------- MRUV ----------------
  new Sim('s-mruv', {
    init(s) { s.st.t = 0; },
    change(s) { s.st.t = 0; },
    frame(s, ctx, w, h, dt) {
      const { v0, a } = s.p, T = 8;
      s.st.t += dt; if (s.st.t > T + 1.2) s.st.t = 0;
      const t = Math.min(s.st.t, T);
      const X = t => v0 * t + 0.5 * a * t * t, V = t => v0 + a * t;
      let xmin = 0, xmax = 0, vmin = 0, vmax = 0;
      for (let i = 0; i <= 80; i++) { const tt = i * T / 80; xmin = Math.min(xmin, X(tt)); xmax = Math.max(xmax, X(tt)); vmin = Math.min(vmin, V(tt)); vmax = Math.max(vmax, V(tt)); }
      if (xmax - xmin < 10) { const c = (xmax + xmin) / 2; xmin = c - 5; xmax = c + 5; }
      if (vmax - vmin < 4) { vmax = Math.max(vmax, 2); vmin = Math.min(vmin, -2); }
      const narrow = w < 560;
      // pista
      const tx0 = 30, tx1 = w - 30, ty = narrow ? h * 0.2 : h * 0.3;
      const PX = x => tx0 + (x - xmin) / (xmax - xmin) * (tx1 - tx0);
      line(ctx, tx0 - 10, ty, tx1 + 10, ty, C.muted, 2);
      ticks(xmin, xmax, narrow ? 4 : 8).forEach(v => { line(ctx, PX(v), ty, PX(v), ty + 6, C.muted, 1); text(ctx, fmt(v, 0) + ' m', PX(v), ty + 16, { col: C.muted, size: 10, align: 'center' }); });
      const xc = X(t), cx = PX(xc), cw = narrow ? 44 : 58;
      car(ctx, cx, ty, cw, (cx - PX(0)) / (cw * 0.14), C.lin);
      const vv = V(t), kv = (tx1 - tx0) / (xmax - xmin) * 0.9;
      arrow(ctx, cx, ty - cw * 0.85, cx + vv * kv, ty - cw * 0.85, C.lin, 2.5);
      if (Math.abs(vv) > 0.05) text(ctx, 'v', cx + vv * kv + (vv > 0 ? 6 : -12), ty - cw * 0.85, { col: C.lin, size: 12, weight: 700 });
      arrow(ctx, cx, ty - cw * 1.12, cx + a * kv * 2, ty - cw * 1.12, C.force, 2);
      if (Math.abs(a) > 0.05) text(ctx, 'a', cx + a * kv * 2 + (a > 0 ? 6 : -12), ty - cw * 1.12, { col: C.force, size: 12, weight: 700 });

      // gráficos
      let r1, r2;
      const top = narrow ? h * 0.33 : h * 0.47, bottom = h - 26;
      if (narrow) {
        const ph = (bottom - top - 30) / 2;
        r1 = { x: 44, y: top, w: w - 60, h: ph };
        r2 = { x: 44, y: top + ph + 30, w: w - 60, h: ph };
      } else {
        const pw = (w - 120) / 2;
        r1 = { x: 50, y: top, w: pw, h: bottom - top };
        r2 = { x: 50 + pw + 50, y: top, w: pw, h: bottom - top };
      }
      const A1 = axes(ctx, r1, { x0: 0, x1: T, y0: xmin, y1: xmax, xl: 't (s)', yl: 'x (m)', ticksY: ticks(xmin, xmax, 4), ticksX: [0, 2, 4, 6, 8] });
      ctx.save(); ctx.strokeStyle = alpha(C.lin, 0.25); ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const tt = i * T / 100; i ? ctx.lineTo(A1.X(tt), A1.Y(X(tt))) : ctx.moveTo(A1.X(tt), A1.Y(X(tt))); }
      ctx.stroke(); ctx.strokeStyle = C.lin; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const tt = i * t / 100; i ? ctx.lineTo(A1.X(tt), A1.Y(X(tt))) : ctx.moveTo(A1.X(tt), A1.Y(X(tt))); }
      ctx.stroke();
      // tangente
      const dtT = 1.4, ta = Math.max(0, t - dtT), tb = Math.min(T, t + dtT);
      ctx.beginPath(); ctx.rect(r1.x, r1.y, r1.w, r1.h); ctx.clip();
      line(ctx, A1.X(ta), A1.Y(xc + vv * (ta - t)), A1.X(tb), A1.Y(xc + vv * (tb - t)), C.rot, 2);
      ctx.restore();
      circle(ctx, A1.X(t), A1.Y(xc), 4.5, C.lin);
      text(ctx, 'pendiente = v', A1.X(tb) - 4, A1.Y(xc + vv * (tb - t)) - 10, { col: C.rot, size: 10, align: 'right' });

      const A2 = axes(ctx, r2, { x0: 0, x1: T, y0: vmin, y1: vmax, xl: 't (s)', yl: 'v (m/s)', ticksY: ticks(vmin, vmax, 4), ticksX: [0, 2, 4, 6, 8] });
      ctx.save(); ctx.fillStyle = alpha(C.lin, 0.14); ctx.beginPath(); ctx.moveTo(A2.X(0), A2.Y(0));
      for (let i = 0; i <= 50; i++) { const tt = i * t / 50; ctx.lineTo(A2.X(tt), A2.Y(V(tt))); }
      ctx.lineTo(A2.X(t), A2.Y(0)); ctx.closePath(); ctx.fill();
      line(ctx, A2.X(0), A2.Y(V(0)), A2.X(T), A2.Y(V(T)), alpha(C.lin, 0.3), 2);
      line(ctx, A2.X(0), A2.Y(V(0)), A2.X(t), A2.Y(vv), C.lin, 2.5);
      ctx.restore();
      circle(ctx, A2.X(t), A2.Y(vv), 4.5, C.lin);
      text(ctx, 'área = Δx', A2.X(t * 0.5), A2.Y(vv * 0.35), { col: C.lin, size: 10, align: 'center' });

      s.out('t', fmt(t, 1) + ' s'); s.out('x', fmt(xc, 1) + ' m'); s.out('v', fmt(vv, 2) + ' m/s');
    }
  });

  // ---------------- Circular ----------------
  new Sim('s-circ', {
    init(s) { Object.assign(s.st, { th: -0.6, w: s.p.w, cut: false }); },
    change(s, k) { if (k === 'w') s.st.w = s.p.w; },
    act: {
      cut(s) {
        const st = s.st; if (st.cut) return;
        st.cut = true; st.tc = 0; st.th0 = st.th; st.w0 = st.w;
      }
    },
    frame(s, ctx, w, h, dt) {
      const st = s.st, R = s.p.R, narrow = w < 560;
      const cx = narrow ? w / 2 : w * 0.38, cy = narrow ? h * 0.44 : h / 2;
      const sc = Math.min(narrow ? h * 0.36 : h * 0.4, narrow ? w * 0.4 : w * 0.3) / 2;
      if (!st.cut) {
        st.w += s.p.al * dt;
        if (Math.abs(st.w) > 5) st.w = Math.sign(st.w) * 5;
        st.th += st.w * dt;
      } else st.tc += dt;

      const wv = st.cut ? st.w0 : st.w, th = st.cut ? st.th0 : st.th;
      const v = Math.abs(wv) * R, ac = wv * wv * R, at = s.p.al * R;
      // trayectoria
      ctx.save(); ctx.setLineDash([5, 6]); circle(ctx, cx, cy, R * sc, null, C.line, 1.5); ctx.restore();
      line(ctx, cx - 8, cy, cx + 8, cy, C.muted, 1); line(ctx, cx, cy - 8, cx, cy + 8, C.muted, 1);
      const ux = Math.cos(th), uy = Math.sin(th);
      const px0 = cx + ux * R * sc, py0 = cy + uy * R * sc;
      const tdir = Math.sign(wv) || 1, tx = -uy * tdir, ty = ux * tdir;
      const kv = sc * 0.42, ka = sc * 0.2;
      let px = px0, py = py0;
      if (st.cut) {
        px = px0 + tx * v * sc * st.tc; py = py0 + ty * v * sc * st.tc;
        line(ctx, px0 - tx * 2000, py0 - ty * 2000, px0 + tx * 2000, py0 + ty * 2000, alpha(C.rot, 0.35), 1.5, [3, 5]);
        text(ctx, 'sigue por la tangente', px0 + tx * 30 + 8, py0 + ty * 30 - 14, { col: C.rot, size: 11 });
        if (st.tc > 3 || px < -40 || px > w + 40 || py < -40 || py > h + 40) { st.cut = false; }
      } else {
        line(ctx, cx, cy, px0, py0, C.muted, 1.5);
        arcArrow(ctx, cx, cy, 26, th - 1.1 * tdir, th - 0.15 * tdir, C.rot, 2);
        text(ctx, 'ω', cx + Math.cos(th - 0.6 * tdir) * 40, cy + Math.sin(th - 0.6 * tdir) * 40, { col: C.rot, size: 13, weight: 700, align: 'center' });
      }
      circle(ctx, cx, cy, 4, C.ink);
      // vectores
      arrow(ctx, px, py, px + tx * v * kv, py + ty * v * kv, C.lin, 3);
      text(ctx, 'v', px + tx * v * kv + tx * 12, py + ty * v * kv + ty * 12, { col: C.lin, size: 13, weight: 700, align: 'center' });
      if (!st.cut) {
        const La = Math.min(ac * ka, R * sc * 0.9);
        arrow(ctx, px, py, px - ux * La, py - uy * La, C.force, 3);
        text(ctx, 'a_c', px - ux * La * 0.55 + uy * 14, py - uy * La * 0.55 - ux * 14, { col: C.force, size: 12, weight: 700, align: 'center' });
        if (Math.abs(at) > 0.01) {
          const atx = -uy * at * ka * 2.5, aty = ux * at * ka * 2.5;
          arrow(ctx, px, py, px + atx, py + aty, C.rot, 2.5);
          text(ctx, 'a_t', px + atx * 1.25, py + aty * 1.25 - 10, { col: C.rot, size: 12, weight: 700, align: 'center' });
          arrow(ctx, px, py, px - ux * La + atx, py - uy * La + aty, C.ink, 1.5, 8, [4, 4]);
        }
      }
      circle(ctx, px, py, 9, C.ink);
      // leyenda
      const lx = narrow ? 16 : w * 0.72, ly = narrow ? h - 64 : h * 0.3;
      [['v  tangente a la trayectoria', C.lin], ['a_c  hacia el centro', C.force], ['a_t  cambia la rapidez', C.rot]].forEach(([tt, col], i) => {
        line(ctx, lx, ly + i * 20, lx + 18, ly + i * 20, col, 3);
        text(ctx, tt, lx + 26, ly + i * 20, { col: C.muted, size: 11.5 });
      });
      if (!narrow) {
        text(ctx, `R = ${fmt(R, 1)} m`, lx, ly + 76, { col: C.ink, size: 12 });
        text(ctx, `ω = ${fmt(wv, 2)} rad/s`, lx, ly + 96, { col: C.rot, size: 12 });
      }
      s.out('v', fmt(v, 2) + ' m/s'); s.out('ac', fmt(ac, 2) + ' m/s²');
      s.out('T', fmt(TAU / Math.max(1e-3, Math.abs(wv)), 2) + ' s'); s.out('rpm', fmt(Math.abs(wv) * 60 / TAU, 1));
    }
  });

  // ---------------- Plano inclinado ----------------
  new Sim('s-plano', {
    init(s) { Object.assign(s.st, { d: 3.6, v: 0, wait: 0 }); },
    change(s) { s.st.d = 3.6; s.st.v = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, th = s.p.th * Math.PI / 180, mu = s.p.mu, muk = 0.75 * mu, m = s.p.m;
      const Lm = 4, sn = Math.sin(th), cs = Math.cos(th);
      const slides = Math.tan(th) > mu + 1e-9;
      const a = slides ? g * (sn - muk * cs) : 0;
      if (slides) {
        if (st.wait > 0) { st.wait -= dt; if (st.wait <= 0) { st.d = 3.6; st.v = 0; } }
        else { st.v += a * dt; st.d -= st.v * dt; if (st.d < 0.35) { st.d = 0.35; st.wait = 0.9; } }
      }
      // geometría
      const x0 = w * 0.1, yb = h * 0.88;
      const Lpx = Math.min((w * 0.62) / Math.max(cs, 0.01), (h * 0.7) / Math.max(sn, 0.01));
      const sc = Lpx / Lm;
      const ux = cs, uy = -sn, nx = -sn, ny = -cs;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0 + Lpx * cs, yb - Lpx * sn); ctx.lineTo(x0 + Lpx * cs, yb); ctx.closePath();
      ctx.fillStyle = C.sunk; ctx.fill(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      line(ctx, 0, yb, w, yb, C.muted, 1.5);
      if (th > 0.02) {
        arcArrow(ctx, x0, yb, 46, 0, -th, C.muted, 1.5);
        text(ctx, `θ = ${s.p.th}°`, x0 + 54, yb - 14, { col: C.ink, size: 12 });
      }
      // bloque
      const bw = 56, bh = 36;
      const bx = x0 + ux * st.d * sc + nx * bh / 2, by = yb + uy * st.d * sc + ny * bh / 2;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-th);
      rrect(ctx, -bw / 2, -bh / 2, bw, bh, 5); ctx.fillStyle = alpha(C.lin, 0.18); ctx.fill(); ctx.strokeStyle = C.lin; ctx.lineWidth = 2; ctx.stroke();
      text(ctx, `${fmt(m, 1)} kg`, 0, 0, { col: C.ink, size: 11, align: 'center' });
      ctx.restore();
      // DCL
      const P = m * g, kP = 80 / P;
      const fr = slides ? muk * P * cs : P * sn;
      arrow(ctx, bx, by, bx, by + P * kP, C.force, 3);
      text(ctx, 'P', bx + 8, by + P * kP, { col: C.force, size: 13, weight: 700 });
      arrow(ctx, bx, by, bx - ux * P * sn * kP, by - uy * P * sn * kP, alpha(C.force, 0.55), 2, 8, [4, 4]);
      arrow(ctx, bx, by, bx - nx * P * cs * kP, by - ny * P * cs * kP, alpha(C.force, 0.55), 2, 8, [4, 4]);
      arrow(ctx, bx, by, bx + nx * P * cs * kP, by + ny * P * cs * kP, C.en, 3);
      text(ctx, 'N', bx + nx * P * cs * kP - 14, by + ny * P * cs * kP, { col: C.en, size: 13, weight: 700 });
      if (fr > 0.01) {
        const fx = bx + ux * bw * 0.5, fy = by + uy * bw * 0.5;
        arrow(ctx, fx, fy, fx + ux * fr * kP, fy + uy * fr * kP, C.rot, 3);
        text(ctx, slides ? 'f_k' : 'f_s', fx + ux * fr * kP + 6, fy + uy * fr * kP - 12, { col: C.rot, size: 12, weight: 700 });
      }
      if (slides && a > 0) arrow(ctx, bx - nx * 40, by - ny * 40, bx - nx * 40 - ux * a * 7, by - ny * 40 - uy * a * 7, C.lin, 2.5);
      const stx = w - 16;
      text(ctx, slides ? 'DESLIZA: tan θ > μs' : 'EN REPOSO: tan θ ≤ μs', stx, 24, { col: slides ? C.force : C.en, size: 12, weight: 700, align: 'right' });
      text(ctx, `tan θ = ${fmt(Math.tan(th), 2)}   μs = ${fmt(mu, 2)}`, stx, 44, { col: C.muted, size: 11.5, align: 'right' });
      s.out('pp', fmt(P * sn, 1) + ' N'); s.out('n', fmt(P * cs, 1) + ' N');
      s.out('f', fmt(fr, 1) + ' N' + (slides ? ' (k)' : ' (s)')); s.out('a', fmt(a, 2) + ' m/s²');
    }
  });

  // ---------------- Trabajo ----------------
  new Sim('s-trabajo', {
    init(s) { s.st.x = 0; s.st.wait = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, th = s.p.th * Math.PI / 180, F = s.p.F, D = 5;
      if (st.wait > 0) { st.wait -= dt; if (st.wait <= 0) st.x = 0; }
      else { st.x += 1.1 * dt; if (st.x >= D) { st.x = D; st.wait = 1.2; } }
      const gy = h * 0.72, x0 = 40, sc = (w - 120) / D;
      line(ctx, 0, gy, w, gy, C.muted, 2);
      for (let i = 0; i <= D; i++) { line(ctx, x0 + i * sc, gy, x0 + i * sc, gy + 6, C.muted, 1); text(ctx, i + ' m', x0 + i * sc, gy + 16, { col: C.muted, size: 10, align: 'center' }); }
      const bx = x0 + st.x * sc, bs = Math.min(54, h * 0.22);
      rrect(ctx, bx - bs / 2, gy - bs, bs, bs, 5); ctx.fillStyle = alpha(C.ink, 0.1); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      const cx = bx, cy = gy - bs / 2, kF = Math.min(1.6, h * 0.006);
      const fx = Math.cos(th) * F * kF, fy = -Math.sin(th) * F * kF;
      arrow(ctx, cx, cy, cx + fx, cy + fy, C.ink, 3);
      text(ctx, 'F', cx + fx + 8 * Math.sign(fx || 1), cy + fy - 6, { col: C.ink, size: 13, weight: 700 });
      const pos = Math.cos(th) > 0.005, zero = Math.abs(Math.cos(th)) <= 0.005;
      const colW = zero ? C.muted : pos ? C.en : C.force;
      arrow(ctx, cx, cy, cx + fx, cy, colW, 3, 9, [5, 4]);
      line(ctx, cx + fx, cy, cx + fx, cy + fy, C.muted, 1, [2, 3]);
      if (th > 0.03) arcArrow(ctx, cx, cy, 24, 0, -th, C.muted, 1.5);
      arrow(ctx, x0, gy + 32, bx, gy + 32, C.lin, 2);
      text(ctx, 'Δx', (x0 + bx) / 2, gy + 44, { col: C.lin, size: 11, align: 'center' });
      // barra de trabajo
      const W = F * st.x * Math.cos(th), Wmax = 80 * D;
      const bx0 = w * 0.5, bwid = w * 0.45, by0 = 22;
      line(ctx, bx0, by0 - 8, bx0, by0 + 22, C.muted, 1.5);
      ctx.fillStyle = colW; const len = W / Wmax * bwid * 0.5;
      ctx.fillRect(len >= 0 ? bx0 : bx0 + len, by0, Math.abs(len), 14);
      text(ctx, `W = ${fmt(W, 0)} J`, bx0 + (len >= 0 ? len + 8 : len - 8), by0 + 7, { col: colW, size: 12, weight: 700, align: len >= 0 ? 'left' : 'right' });
      text(ctx, zero ? 'W = 0 (F ⊥ Δx)' : pos ? 'trabajo positivo' : 'trabajo negativo', 16, by0 + 7, { col: colW, size: 12 });
      s.out('fx', fmt(F * Math.cos(th), 1) + ' N'); s.out('dx', fmt(st.x, 2) + ' m'); s.out('W', fmt(W, 1) + ' J');
    }
  });

  // ---------------- Pista en U con energía ----------------
  new Sim('s-skate', {
    init(s) {
      const c = 0.168, h = s.p.h;
      Object.assign(s.st, { c, x: -Math.sqrt(h / c), vs: 0, Q: 0, E0: 50 * g * h });
    },
    change(s, k) { if (k === 'h') s.reset(); },
    frame(s, ctx, w, h, dt) {
      const st = s.st, c = st.c, mu = s.p.mu, m = 50, n = 12;
      for (let i = 0; i < n && dt > 0; i++) {
        const d = dt / n, yp = 2 * c * st.x, phi = Math.atan(yp);
        const kap = 2 * c / Math.pow(1 + yp * yp, 1.5);
        const Nm = Math.max(0, g * Math.cos(phi) + st.vs * st.vs * kap);
        let a = -g * Math.sin(phi);
        const fr = mu * Nm;
        if (Math.abs(st.vs) > 1e-3) a -= Math.sign(st.vs) * fr;
        else if (Math.abs(a) <= fr) a = 0;
        st.vs += a * d;
        const ds = st.vs * d;
        st.x += ds * Math.cos(phi);
        st.Q += m * fr * Math.abs(ds);
      }
      const narrow = w < 560, barW = narrow ? 100 : 150;
      const X = 5, H = 4.2, tw = w - barW - 40;
      const sc = Math.min(tw / (2 * X), (h - 50) / (H + 0.4));
      const ox = 20 + tw / 2, oy = h - 26;
      const PX = x => ox + x * sc, PY = y => oy - y * sc;
      // suelo y pista
      ctx.beginPath(); ctx.moveTo(PX(-X), PY(c * X * X));
      for (let i = 0; i <= 80; i++) { const x = -X + 2 * X * i / 80; ctx.lineTo(PX(x), PY(c * x * x)); }
      ctx.lineTo(PX(X), oy + 20); ctx.lineTo(PX(-X), oy + 20); ctx.closePath();
      ctx.fillStyle = C.sunk; ctx.fill();
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const x = -X + 2 * X * i / 80; i ? ctx.lineTo(PX(x), PY(c * x * x)) : ctx.moveTo(PX(x), PY(c * x * x)); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
      [0, 1, 2, 3, 4].forEach(y => { line(ctx, PX(-X) - 6, PY(y), PX(-X) + 2, PY(y), C.muted, 1); text(ctx, y + ' m', PX(-X) - 9, PY(y), { col: C.muted, size: 10, align: 'right' }); });
      line(ctx, PX(-X), PY(s.p.h), PX(X), PY(s.p.h), alpha(C.en, 0.6), 1.2, [5, 5]);
      text(ctx, 'altura inicial', PX(X) - 4, PY(s.p.h) - 9, { col: C.en, size: 10, align: 'right' });
      const y = c * st.x * st.x, phi = Math.atan(2 * c * st.x);
      const nx = -Math.sin(phi), ny = Math.cos(phi);
      const bx = PX(st.x) + nx * 10, by = PY(y) - ny * 10;
      line(ctx, bx, PY(0), bx, by, alpha(C.en, 0.5), 1.5, [3, 3]);
      circle(ctx, bx, by, 10, C.lin);
      const kv = sc * 0.18;
      arrow(ctx, bx, by, bx + Math.cos(phi) * st.vs * kv, by - Math.sin(phi) * st.vs * kv, C.lin, 2.5);
      // barras
      const Ec = 0.5 * m * st.vs * st.vs, Ep = m * g * y, E0 = st.E0;
      const bx0 = w - barW + 4, bW = (barW - 30) / 3, bTop = 24, bBot = h - 30, bH = bBot - bTop;
      const Emax = 50 * g * 4;
      [[Ec, C.lin, 'Ec'], [Ep, C.en, 'Ep'], [st.Q, C.force, 'Q']].forEach(([E, col, lb], i) => {
        const x = bx0 + i * (bW + 6), hh = E / Emax * bH;
        ctx.fillStyle = alpha(col, 0.15); ctx.fillRect(x, bTop, bW, bH);
        ctx.fillStyle = col; ctx.fillRect(x, bBot - hh, bW, hh);
        text(ctx, lb, x + bW / 2, bBot + 12, { col, size: 11, weight: 700, align: 'center' });
      });
      line(ctx, bx0 - 4, bBot - E0 / Emax * bH, w - 8, bBot - E0 / Emax * bH, C.ink, 1.2, [4, 3]);
      text(ctx, 'E₀', bx0 - 8, bBot - E0 / Emax * bH, { col: C.ink, size: 10, align: 'right' });
      s.out('ec', fmt(Ec, 0) + ' J'); s.out('ep', fmt(Ep, 0) + ' J'); s.out('q', fmt(st.Q, 0) + ' J'); s.out('tot', fmt(Ec + Ep + st.Q, 0) + ' J');
    }
  });
})();
