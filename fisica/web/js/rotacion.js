/* Unidad 9 y dinámica rotacional: rotor (L = Iω), disco gemelo, anillos, marco 3D, Steiner, rodadura, torque, polea, viga, Hooke */
(() => {
  'use strict';
  const { Sim, C, TAU, clamp, alpha, fmt, text, arrow, arcArrow, circle, rrect, line, axes, setInput } = PH;
  const g = 9.8;

  // ---------------- Rotor: conservación de L ----------------
  const IB = 0.2, MM = 1, L0 = (IB + 2 * MM * 1) * 2;
  function rotor(id, graph) {
    new Sim(id, {
      init(s) { s.st.ang = 0; s.st.tr = []; s.st.drag = false; },
      down(s, x, y) {
        const st = s.st; if (!st.geo) return false;
        const { cx, cy, sc } = st.geo, r = s.p.r;
        const hit = [0, Math.PI].some(o => Math.hypot(cx + Math.cos(st.ang + o) * r * sc - x, cy + Math.sin(st.ang + o) * r * sc - y) < 30);
        st.drag = hit; return hit;
      },
      move(s, x, y, down) {
        if (!down || !s.st.drag) return;
        const { cx, cy, sc } = s.st.geo;
        setInput(s, 'r', clamp(Math.hypot(x - cx, y - cy) / sc, 0.2, 1.2).toFixed(2));
      },
      up(s) { s.st.drag = false; },
      frame(s, ctx, w, h, dt) {
        const st = s.st, r = s.p.r, I = IB + 2 * MM * r * r, om = L0 / I, E = 0.5 * I * om * om;
        st.ang += om * dt;
        const narrow = w < 560, split = graph && !narrow;
        const vw = split ? w * 0.5 : w, vh = graph && narrow ? h * 0.56 : h;
        const cx = vw / 2, cy = vh / 2, sc = Math.min(vw, vh) * 0.4 / 1.25;
        st.geo = { cx, cy, sc };
        // riel y estela
        ctx.save(); ctx.setLineDash([3, 6]); circle(ctx, cx, cy, 1.2 * sc, null, C.line, 1); circle(ctx, cx, cy, 0.2 * sc, null, C.line, 1); ctx.restore();
        if (dt > 0) { st.tr.push(st.ang); if (st.tr.length > 26) st.tr.shift(); }
        st.tr.forEach((a, i) => {
          const k = i / st.tr.length;
          [0, Math.PI].forEach(o => circle(ctx, cx + Math.cos(a + o) * r * sc, cy + Math.sin(a + o) * r * sc, 10 * k, alpha(C.lin, 0.12 * k)));
        });
        const ca = Math.cos(st.ang), sa = Math.sin(st.ang);
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(cx - ca * 1.25 * sc, cy - sa * 1.25 * sc); ctx.lineTo(cx + ca * 1.25 * sc, cy + sa * 1.25 * sc); ctx.stroke(); ctx.restore();
        circle(ctx, cx, cy, 14, C.surface, C.ink, 3);
        const span = Math.min(4.6, 0.32 * om);
        arcArrow(ctx, cx, cy, 30, st.ang + 0.4, st.ang + 0.4 + span, C.rot, 3);
        text(ctx, 'ω', cx + Math.cos(st.ang + 0.4 + span / 2) * 44, cy + Math.sin(st.ang + 0.4 + span / 2) * 44, { col: C.rot, size: 14, weight: 700, align: 'center' });
        [0, Math.PI].forEach(o => {
          const a = st.ang + o, mx = cx + Math.cos(a) * r * sc, my = cy + Math.sin(a) * r * sc;
          const v = om * r, kv = sc * 0.14;
          arrow(ctx, mx, my, mx - Math.sin(a) * v * kv, my + Math.cos(a) * v * kv, C.lin, 2.5);
          circle(ctx, mx, my, 13, C.lin, C.surface, 2.5);
          text(ctx, '1 kg', mx, my, { col: C.surface, size: 8.5, weight: 700, align: 'center' });
        });
        text(ctx, `v = ωr = ${fmt(om * r, 2)} m/s`, 12, vh - 14, { col: C.lin, size: 11 });
        if (!graph) text(ctx, 'arrastrá una masa', vw - 12, 16, { col: C.muted, size: 11, align: 'right' });
        if (graph) {
          const rr = split ? { x: w * 0.5 + 44, y: 20, w: w * 0.5 - 70, h: h - 56 } : { x: 46, y: h * 0.6, w: w - 66, h: h * 0.33 };
          const A = axes(ctx, rr, { x0: 0.2, x1: 1.2, y0: 0, y1: 16, xl: 'r (m)', yl: 'ω (rad/s) · Ec (J)', ticksY: [0, 4, 8, 12, 16], ticksX: [0.2, 0.6, 1.0], dx: 1 });
          const plot = (f, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const q = 0.2 + i / 60; const y = Math.min(16, f(q)); i ? ctx.lineTo(A.X(q), A.Y(y)) : ctx.moveTo(A.X(q), A.Y(y)); } ctx.stroke(); ctx.restore(); };
          const fw = q => L0 / (IB + 2 * q * q), fe = q => L0 * L0 / (2 * (IB + 2 * q * q));
          plot(fw, C.rot); plot(fe, C.en);
          line(ctx, A.X(r), rr.y, A.X(r), rr.y + rr.h, C.line, 1, [3, 3]);
          circle(ctx, A.X(r), A.Y(Math.min(16, om)), 5, C.rot); circle(ctx, A.X(r), A.Y(Math.min(16, E)), 5, C.en);
          text(ctx, 'ω', A.X(0.3) + 6, A.Y(Math.min(15, fw(0.3))) - 2, { col: C.rot, size: 12, weight: 700 });
          text(ctx, 'Ec', A.X(0.42) + 8, A.Y(Math.min(15, fe(0.42))) + 4, { col: C.en, size: 12, weight: 700 });
          text(ctx, `L = ${fmt(L0, 2)} kg·m²/s (constante)`, rr.x + rr.w, rr.y + 2, { col: C.muted, size: 10.5, align: 'right', base: 'top' });
        }
        s.out('I', fmt(I, 3) + ' kg·m²'); s.out('w', fmt(om, 2) + ' rad/s'); s.out('E', fmt(E, 2) + ' J'); s.out('L', fmt(L0, 2) + ' kg·m²/s');
      }
    });
  }
  rotor('s-rotor', false);
  rotor('s-rotor2', true);

  // ---------------- Disco + carrito gemelo ----------------
  function wheel(ctx, x, y, r, ang, col) {
    circle(ctx, x, y, r, C.ink);
    ctx.strokeStyle = C.surface; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const a = ang + i * TAU / 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.stroke(); }
    void col;
  }
  new Sim('s-disco', {
    init(s) { s.st.t = 0; },
    change(s) { s.st.t = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, w0 = s.p.w0, al = s.p.al;
      st.t += dt;
      let th = w0 * st.t + 0.5 * al * st.t * st.t, om = w0 + al * st.t;
      if (st.t > 12 || Math.abs(om) > 6) { st.t = 0; th = 0; om = w0; }
      const narrow = w < 560;
      const topH = h * 0.66;
      const R = Math.min(narrow ? w * 0.28 : w * 0.17, topH * 0.4);
      const cx = narrow ? R + 22 : w * 0.24, cy = topH / 2 + 6;
      circle(ctx, cx, cy, R, alpha(C.rot, 0.12), C.rot, 2.5);
      for (let i = 0; i < 12; i++) { const a = th + i * TAU / 12; line(ctx, cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92, cx + Math.cos(a) * R, cy + Math.sin(a) * R, C.rot, 1.5); }
      line(ctx, cx, cy, cx + Math.cos(th) * R, cy + Math.sin(th) * R, alpha(C.rot, 0.5), 1.5);
      const rs = [0.3, 0.6, 0.9], kv = R * 0.45;
      rs.forEach((q, i) => {
        const a = th + i * 2.1, px = cx + Math.cos(a) * q * R, py = cy + Math.sin(a) * q * R;
        arrow(ctx, px, py, px - Math.sin(a) * om * q * kv, py + Math.cos(a) * om * q * kv, C.lin, 2.2, 7);
        circle(ctx, px, py, 5, C.ink);
      });
      circle(ctx, cx, cy, 4, C.ink);
      if (Math.abs(al) > 0.01) arcArrow(ctx, cx, cy, R + 14, th - 0.6 * Math.sign(al), th + 0.6 * Math.sign(al), C.rot, 2);
      text(ctx, 'α', cx + Math.cos(th) * (R + 26), cy + Math.sin(th) * (R + 26), { col: C.rot, size: 12, weight: 700, align: 'center' });
      // v(r)
      const rr = narrow ? { x: cx + R + 46, y: 26, w: w - cx - R - 62, h: topH - 60 } : { x: w * 0.5, y: 26, w: w * 0.44, h: topH - 60 };
      const A = axes(ctx, rr, { x0: 0, x1: 1, y0: -3, y1: 3, xl: 'r/R', yl: 'v = ωr (R = 1 m)', ticksY: [-3, 0, 3], ticksX: narrow ? [0, 1] : [0, 0.3, 0.6, 0.9], dx: 1 });
      line(ctx, A.X(0), A.Y(0), A.X(1), A.Y(clamp(om, -3, 3) * (Math.abs(om) > 3 ? 3 / Math.abs(om) : 1)), C.rot, 2);
      rs.forEach(q => { const v = om * q; if (Math.abs(v) <= 3) { line(ctx, A.X(q), A.Y(0), A.X(q), A.Y(v), C.lin, 3); circle(ctx, A.X(q), A.Y(v), 4, C.lin); } });
      text(ctx, 'pendiente = ω', rr.x + rr.w - 4, A.Y(clamp(om, -3, 3)) + (om >= 0 ? 14 : -14), { col: C.rot, size: 10, align: 'right' });
      // carrito gemelo
      const ty = h - 30, x0 = 24, x1 = w - 24, span = 12;
      const PX = x => x0 + (x / span) * (x1 - x0);
      line(ctx, 10, ty, w - 10, ty, C.muted, 2);
      const base = Math.floor(th / span) * span;
      for (let i = 0; i <= span; i += 2) { line(ctx, PX(i), ty, PX(i), ty + 5, C.muted, 1); text(ctx, fmt(base + i, 0), PX(i), ty + 14, { col: C.muted, size: 9.5, align: 'center' }); }
      const xm = th - base, cxp = PX(xm), cw = 50;
      rrect(ctx, cxp - cw / 2, ty - 30, cw, 18, 5); ctx.fillStyle = C.lin; ctx.fill();
      wheel(ctx, cxp - 14, ty - 7, 7, xm * (x1 - x0) / span / 7);
      wheel(ctx, cxp + 14, ty - 7, 7, xm * (x1 - x0) / span / 7);
      arrow(ctx, cxp, ty - 40, cxp + om * 22, ty - 40, C.lin, 2.2, 7);
      if (Math.abs(al) > 0.01) arrow(ctx, cxp, ty - 52, cxp + al * 60, ty - 52, C.force, 2, 7);
      text(ctx, 'x (m)', w - 12, ty - 10, { col: C.muted, size: 10, align: 'right' });
      s.out('th', `${fmt(th, 2)} rad ↔ ${fmt(th, 2)} m`); s.out('w', `${fmt(om, 2)} rad/s ↔ m/s`); s.out('al', `${fmt(al, 2)} rad/s² ↔ m/s²`);
    }
  });

  // ---------------- Anillos → integral ----------------
  new Sim('s-anillos', {
    init(s) { s.st.a = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, N = s.p.n;
      st.a += 0.5 * dt;
      const contrib = []; let S = 0;
      for (let i = 1; i <= N; i++) { const c = (i * i - (i - 1) * (i - 1)) / (N * N) * (i / N) ** 2; contrib.push(c); S += c; }
      const narrow = w < 560;
      const R = narrow ? Math.min(w * 0.3, h * 0.22) : Math.min(w * 0.18, h * 0.4);
      const cx = narrow ? w / 2 : w * 0.22, cy = narrow ? R + 16 : h / 2;
      const cmax = Math.max(...contrib);
      for (let i = N; i >= 1; i--) circle(ctx, cx, cy, R * i / N, alpha(C.rot, 0.12 + 0.75 * contrib[i - 1] / cmax), N <= 24 ? C.surface : null, 1);
      circle(ctx, cx, cy, R, null, C.rot, 2);
      line(ctx, cx, cy, cx + Math.cos(st.a) * R, cy + Math.sin(st.a) * R, C.ink, 1.5);
      circle(ctx, cx, cy, 3.5, C.ink);
      const rr = narrow ? { x: 44, y: cy + R + 30, w: w - 60, h: h - cy - R - 58 } : { x: w * 0.46, y: 24, w: w * 0.5, h: h - 56 };
      const A = axes(ctx, rr, { x0: 0, x1: N, y0: 0, y1: 1.05, xl: 'anillo i', yl: 'Σ / MR²', ticksY: [0, 0.5, 1], dy: 1 });
      const bw = rr.w / N;
      contrib.forEach((c, i) => { ctx.fillStyle = alpha(C.rot, 0.75); ctx.fillRect(rr.x + i * bw + bw * 0.12, A.Y(c), bw * 0.76, A.Y(0) - A.Y(c)); });
      let acc = 0; ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(A.X(0), A.Y(0));
      contrib.forEach((c, i) => { acc += c; ctx.lineTo(A.X(i + 1), A.Y(acc)); }); ctx.stroke(); ctx.restore();
      line(ctx, rr.x, A.Y(0.5), rr.x + rr.w, A.Y(0.5), C.en, 1.5, [6, 4]);
      text(ctx, '½MR² exacto', rr.x + rr.w - 4, A.Y(0.5) + 12, { col: C.en, size: 10.5, align: 'right' });
      text(ctx, 'suma acumulada', rr.x + rr.w - 4, A.Y(S) - 10, { col: C.ink, size: 10.5, align: 'right' });
      s.out('s', fmt(S, 4)); s.out('err', '+' + fmt(100 * (S - 0.5) / 0.5, 1) + ' %');
    }
  });

  // ---------------- Marco 3D (Ejemplos 1 y 2) ----------------
  function rotAxis(ax, p, a) {
    const [x, y, z] = p, c = Math.cos(a), s = Math.sin(a);
    if (ax === 'x') return [x, y * c - z * s, y * s + z * c];
    if (ax === 'y') return [x * c + z * s, y, -x * s + z * c];
    return [x * c - y * s, x * s + y * c, z];
  }
  function view(p) {
    const yaw = -0.62, pit = 0.38;
    let [x, y, z] = p;
    [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
    [y, z] = [y * Math.cos(pit) - z * Math.sin(pit), y * Math.sin(pit) + z * Math.cos(pit)];
    return [x, y, z];
  }
  new Sim('s-marco', {
    init(s) { s.st.a = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, { M, m, a, b, w: om, ax } = s.p;
      st.a += om * dt * 0.8;
      const S = Math.min(w, h) * 0.3, cx = w / 2, cy = h * 0.52;
      const P = p => { const v = view(p); return [cx + v[0] * S, cy - v[1] * S, v[2]]; };
      // ejes
      [['x', [1.35, 0, 0]], ['y', [0, 1.35, 0]], ['z', [0, 0, 1.35]]].forEach(([n, e]) => {
        const p0 = P(e.map(v => -v)), p1 = P(e), on = n === ax;
        line(ctx, p0[0], p0[1], p1[0], p1[1], on ? C.rot : C.line, on ? 3 : 1.2, on ? null : [4, 4]);
        text(ctx, n, p1[0] + 8, p1[1] - 6, { col: on ? C.rot : C.muted, size: 13, weight: 700 });
      });
      // arco alrededor del eje
      const ring = []; for (let i = 0; i <= 40; i++) { const t = i / 40 * TAU * 0.8; const q = ax === 'x' ? [1.15, 0.18 * Math.cos(t), 0.18 * Math.sin(t)] : ax === 'y' ? [0.18 * Math.cos(t), 1.15, 0.18 * Math.sin(t)] : [0.18 * Math.cos(t), 0.18 * Math.sin(t), 1.15]; ring.push(P(q)); }
      ctx.save(); ctx.strokeStyle = C.rot; ctx.lineWidth = 2; ctx.beginPath(); ring.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.restore();
      const pts = [[a, 0, 0, M, 'M'], [-a, 0, 0, M, 'M'], [0, b, 0, m, 'm'], [0, -b, 0, m, 'm']];
      // órbitas
      pts.forEach(([x, y, z]) => {
        const onAxis = (ax === 'x' && y === 0 && z === 0) || (ax === 'y' && x === 0 && z === 0);
        if (onAxis) return;
        ctx.save(); ctx.setLineDash([3, 5]); ctx.strokeStyle = alpha(C.lin, 0.4); ctx.lineWidth = 1.2; ctx.beginPath();
        for (let i = 0; i <= 48; i++) { const q = P(rotAxis(ax, [x, y, z], i / 48 * TAU)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.stroke(); ctx.restore();
      });
      const R3 = pts.map(([x, y, z, mass, lb]) => ({ p: P(rotAxis(ax, [x, y, z], st.a)), mass, lb, on: (ax === 'x' && y === 0) || (ax === 'y' && x === 0) }));
      // marco
      const E = [[0, 2], [2, 1], [1, 3], [3, 0], [0, 1], [2, 3]];
      E.forEach(([i, j]) => line(ctx, R3[i].p[0], R3[i].p[1], R3[j].p[0], R3[j].p[1], alpha(C.ink, 0.5), 2));
      R3.slice().sort((u, v) => u.p[2] - v.p[2]).forEach(o => {
        const r = 9 + 5 * Math.cbrt(o.mass);
        const grd = ctx.createRadialGradient(o.p[0] - r * 0.35, o.p[1] - r * 0.35, r * 0.1, o.p[0], o.p[1], r);
        const col = o.lb === 'M' ? C.lin : C.alt;
        grd.addColorStop(0, alpha(col, 0.55)); grd.addColorStop(1, col);
        circle(ctx, o.p[0], o.p[1], r, grd);
        text(ctx, o.lb, o.p[0], o.p[1], { col: C.surface, size: 11, weight: 700, align: 'center' });
        if (o.on) text(ctx, 'r = 0', o.p[0] + r + 4, o.p[1] - r, { col: C.rot, size: 10.5 });
      });
      circle(ctx, cx, cy, 3, C.ink);
      let I, f;
      if (ax === 'y') { I = 2 * M * a * a; f = 'I_y = 2Ma²'; }
      else if (ax === 'x') { I = 2 * m * b * b; f = 'I_x = 2mb²'; }
      else { I = 2 * M * a * a + 2 * m * b * b; f = 'I_z = 2Ma² + 2mb²'; }
      s.out('f', f); s.out('I', fmt(I, 3) + ' kg·m²'); s.out('E', fmt(0.5 * I * om * om, 3) + ' J');
    }
  });

  // ---------------- Steiner ----------------
  new Sim('s-steiner', {
    init(s) { s.st.t = 0; },
    change(s) { s.st.t = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, M = 2, d = s.p.d, rod = s.p.sh === 'rod', tau = 0.5;
      const Icm = rod ? M * 1 / 12 : 0.5 * M * 0.25, I = Icm + M * d * d, al = tau / I;
      st.t += dt; if (st.t > 3.6) st.t = 0;
      const tt = Math.min(st.t, 3), th = 0.5 * al * tt * tt - Math.PI / 2;
      const narrow = w < 560;
      const vw = narrow ? w : w * 0.48, vh = narrow ? h * 0.55 : h;
      const ax = vw / 2, ay = vh / 2, S = Math.min(vw, vh) * 0.46 / 1.3;
      ctx.save(); ctx.setLineDash([2, 6]); circle(ctx, ax, ay, (d + 0.5) * S, null, C.line, 1); ctx.restore();
      const ux = Math.cos(th), uy = Math.sin(th), bx = ax + ux * d * S, by = ay + uy * d * S;
      if (d > 0.001) line(ctx, ax, ay, bx, by, alpha(C.ink, 0.5), 1.5, [4, 4]);
      if (rod) {
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.rot; ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(bx - ux * 0.5 * S, by - uy * 0.5 * S); ctx.lineTo(bx + ux * 0.5 * S, by + uy * 0.5 * S); ctx.stroke(); ctx.restore();
      } else {
        circle(ctx, bx, by, 0.5 * S, alpha(C.rot, 0.28), C.rot, 2.5);
        line(ctx, bx, by, bx + ux * 0.5 * S, by + uy * 0.5 * S, C.rot, 2);
      }
      PH.star(ctx, bx, by, 8, C.alt);
      circle(ctx, ax, ay, 7, C.surface, C.ink, 3);
      text(ctx, 'eje', ax + 10, ay + 14, { col: C.ink, size: 10.5 });
      text(ctx, `d = ${fmt(d, 2)} m`, 12, vh - 14, { col: C.muted, size: 11 });
      text(ctx, `ω = ${fmt(al * tt, 2)} rad/s`, vw - 12, vh - 14, { col: C.rot, size: 11, align: 'right' });
      // gráfico I(d)
      const rr = narrow ? { x: 48, y: vh + 18, w: w - 68, h: h - vh - 46 } : { x: w * 0.55, y: 22, w: w * 0.41, h: h - 54 };
      const A = axes(ctx, rr, { x0: 0, x1: 0.8, y0: 0, y1: 1.6, xl: 'd (m)', yl: 'I (kg·m²)', ticksY: [0, 0.4, 0.8, 1.2, 1.6], ticksX: [0, 0.2, 0.4, 0.6, 0.8], dy: 1, dx: 1 });
      ctx.save(); ctx.strokeStyle = C.rot; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const q = i / 60 * 0.8; i ? ctx.lineTo(A.X(q), A.Y(Icm + M * q * q)) : ctx.moveTo(A.X(q), A.Y(Icm)); }
      ctx.stroke(); ctx.restore();
      line(ctx, rr.x, A.Y(Icm), rr.x + rr.w, A.Y(Icm), C.muted, 1, [4, 4]);
      ctx.fillStyle = alpha(C.muted, 0.5); ctx.fillRect(A.X(d) - 4, A.Y(Icm), 8, A.Y(0) - A.Y(Icm));
      ctx.fillStyle = C.rot; ctx.fillRect(A.X(d) - 4, A.Y(I), 8, A.Y(Icm) - A.Y(I));
      circle(ctx, A.X(d), A.Y(I), 5.5, C.rot, C.surface, 2);
      text(ctx, 'I_cm', A.X(0.02), A.Y(Icm) - 9, { col: C.muted, size: 10.5 });
      text(ctx, 'M·d²', A.X(d) + 9, (A.Y(I) + A.Y(Icm)) / 2, { col: C.rot, size: 10.5 });
      if (rod && Math.abs(d - 0.5) < 0.006) text(ctx, '= ⅓ML² (extremo)', A.X(d) + 9, A.Y(I) - 12, { col: C.ink, size: 10.5 });
      s.out('icm', fmt(Icm, 3) + ' kg·m²'); s.out('md', fmt(M * d * d, 3) + ' kg·m²'); s.out('ip', fmt(I, 3) + ' kg·m²'); s.out('al', fmt(al, 2) + ' rad/s²');
    }
  });

  // ---------------- Carrera de rodadura ----------------
  const RACERS = [
    { n: 'Bloque sin roce', c: 0, k: 'block' },
    { n: 'Esfera maciza', c: 0.4, k: 'sphere' },
    { n: 'Disco', c: 0.5, k: 'disk' },
    { n: 'Esfera hueca', c: 2 / 3, k: 'shell' },
    { n: 'Aro', c: 1, k: 'hoop' }
  ];
  new Sim('s-carrera', {
    init(s) { Object.assign(s.st, { t: -0.7, done: false, hold: 0 }); },
    change(s) { s.reset(); },
    act: { go(s) { s.reset(); s.st.t = 0; } },
    frame(s, ctx, w, h, dt) {
      const st = s.st, th = s.p.th * Math.PI / 180, Lm = 3, n = RACERS.length;
      st.t += dt;
      const times = RACERS.map(o => Math.sqrt(2 * Lm * (1 + o.c) / (g * Math.sin(th))));
      const tmax = Math.max(...times);
      if (st.t > tmax + 2.6) s.reset();
      const H = clamp(h * 0.1, 26, 50), sn = Math.sin(th), cs = Math.cos(th);
      const Lpx = Math.min((w - 40 - n * H * sn) / cs, (h - 30 - n * H * cs) / sn);
      const ox = 20, oy = 14 + n * H * cs;
      ctx.save(); ctx.translate(ox, oy); ctx.rotate(th);
      ctx.fillStyle = C.sunk; ctx.fillRect(0, 0, Lpx, 10);
      const r = H * 0.34, t = Math.max(0, st.t);
      const order = times.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      RACERS.forEach((o, i) => {
        const y = -i * H;
        line(ctx, 0, y, Lpx, y, C.line, 2);
        const a = g * sn / (1 + o.c), sm = Math.min(Lm, 0.5 * a * t * t), sp = sm / Lm * (Lpx - 2 * r - 6) + r + 4;
        const ang = sp / r;
        const x = sp, yc = y - r - 1;
        if (o.k === 'block') { rrect(ctx, x - r, y - 2 * r, 2 * r, 2 * r, 3); ctx.fillStyle = C.lin; ctx.fill(); }
        else {
          if (o.k === 'hoop') circle(ctx, x, yc, r - 2, null, C.rot, 4);
          else if (o.k === 'shell') circle(ctx, x, yc, r, alpha(C.rot, 0.15), C.rot, 3);
          else if (o.k === 'disk') circle(ctx, x, yc, r, alpha(C.rot, 0.45), C.rot, 2);
          else { const gr = ctx.createRadialGradient(x - r * 0.3, yc - r * 0.3, 1, x, yc, r); gr.addColorStop(0, alpha(C.rot, 0.4)); gr.addColorStop(1, C.rot); circle(ctx, x, yc, r, gr); }
          line(ctx, x, yc, x + Math.cos(ang) * r, yc + Math.sin(ang) * r, C.ink, 2);
          circle(ctx, x, yc, 2, C.ink);
        }
        text(ctx, `${o.n} · c = ${o.c === 2 / 3 ? '⅔' : fmt(o.c, o.c === 0 || o.c === 1 ? 0 : 1)}`, Lpx * 0.42, y - H * 0.78, { col: C.muted, size: 10.5 });
        if (t >= times[i]) {
          const rank = order.indexOf(i) + 1;
          text(ctx, `${rank}.º · ${fmt(times[i], 2)} s`, Lpx - 4, y - H * 0.78, { col: rank === 1 ? C.en : C.ink, size: 11, weight: 700, align: 'right' });
        }
      });
      line(ctx, Lpx, 8, Lpx, -n * H, C.force, 2, [4, 3]);
      ctx.restore();
      text(ctx, `t = ${fmt(t, 2)} s`, w - 14, h - 14, { col: C.ink, size: 12, align: 'right' });
      text(ctx, `a = g·senθ / (1 + c)`, w - 14, h - 32, { col: C.muted, size: 11, align: 'right' });
    }
  });

  // ---------------- Torque en una puerta ----------------
  new Sim('s-torque', {
    init(s) { Object.assign(s.st, { b: 0, om: 0, hold: 0, t: 0 }); },
    change(s) { s.reset(); },
    act: { push(s) { s.reset(); } },
    frame(s, ctx, w, h, dt) {
      const st = s.st, { r, phi, F } = s.p, Wd = 0.9, I = 15 * Wd * Wd / 3;
      const tau = r * F * Math.sin(phi * Math.PI / 180), al = tau / I;
      const slow = 0.35;
      if (dt > 0) {
        st.t += dt;
        if (st.b < Math.PI / 2 && tau > 1e-6) { st.om += al * dt * slow; st.b = Math.min(Math.PI / 2, st.b + st.om * dt * slow); }
        else { st.hold += dt; if (st.hold > 1.4) s.reset(); }
      }
      const narrow = w < 560;
      const hx = narrow ? 30 : w * 0.18, hy = h * 0.74, S = Math.min(w - hx - 30, h * 0.66) / Wd;
      line(ctx, 0, hy + 7, hx - 6, hy + 7, C.muted, 6);
      line(ctx, hx + Wd * S + 6, hy + 7, w, hy + 7, C.muted, 6);
      ctx.save(); ctx.setLineDash([3, 5]); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hx, hy, Wd * S, -Math.PI / 2, 0); ctx.stroke(); ctx.restore();
      const dx = Math.cos(-st.b), dy = Math.sin(-st.b);
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = alpha(C.rot, 0.6); ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + dx * Wd * S, hy + dy * Wd * S); ctx.stroke(); ctx.restore();
      circle(ctx, hx, hy, 7, C.surface, C.ink, 3);
      const px = hx + dx * r * S, py = hy + dy * r * S;
      arrow(ctx, hx, hy, px, py, C.ink, 1.8, 8, [5, 4]);
      text(ctx, 'r', (hx + px) / 2 - dy * 14, (hy + py) / 2 + dx * 14 + 4, { col: C.ink, size: 12, weight: 700, align: 'center' });
      const fa = -st.b - phi * Math.PI / 180, fx = Math.cos(fa), fy = Math.sin(fa);
      const kF = S * 0.008;
      const sx = px - fx * F * kF, sy = py - fy * F * kF;
      line(ctx, px - fx * 2000, py - fy * 2000, px + fx * 2000, py + fy * 2000, alpha(C.force, 0.25), 1, [4, 5]);
      arrow(ctx, sx, sy, px, py, C.force, 3.2);
      text(ctx, 'F', sx - fx * 10, sy - fy * 10, { col: C.force, size: 13, weight: 700, align: 'center' });
      const t2 = (hx - px) * fx + (hy - py) * fy, qx = px + fx * t2, qy = py + fy * t2;
      const lev = Math.abs(r * Math.sin(phi * Math.PI / 180));
      if (lev > 0.005) {
        line(ctx, hx, hy, qx, qy, C.rot, 3);
        text(ctx, 'ℓ', (hx + qx) / 2 + 8, (hy + qy) / 2 - 6, { col: C.rot, size: 13, weight: 700 });
        const vx = (hx - qx) / Math.hypot(hx - qx, hy - qy), vy = (hy - qy) / Math.hypot(hx - qx, hy - qy), q = 8;
        ctx.save(); ctx.strokeStyle = C.rot; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(qx + vx * q, qy + vy * q); ctx.lineTo(qx + vx * q + fx * q, qy + vy * q + fy * q); ctx.lineTo(qx + fx * q, qy + fy * q); ctx.stroke(); ctx.restore();
        arcArrow(ctx, hx, hy, 26, -0.2, -1.3, C.rot, 2.2);
      } else text(ctx, 'brazo nulo: la puerta no gira', w / 2, 22, { col: C.force, size: 12.5, align: 'center' });
      text(ctx, 'bisagra', hx, hy + 24, { col: C.muted, size: 10.5, align: 'center' });
      s.out('l', fmt(lev, 3) + ' m'); s.out('tau', fmt(tau, 2) + ' N·m'); s.out('al', fmt(al, 2) + ' rad/s²');
    }
  });

  // ---------------- Polea con masa ----------------
  new Sim('s-polea', {
    init(s) { Object.assign(s.st, { t: 0, hold: 0 }); },
    change(s) { s.reset(); },
    frame(s, ctx, w, h, dt) {
      const st = s.st, m = s.p.m, M = s.p.M, c = s.p.sh === 'ring' ? 1 : 0.5, Rr = 0.2, Hf = 1.6;
      const a = m * g / (m + c * M), T = m * (g - a);
      const tEnd = Math.sqrt(2 * Hf / a);
      if (dt > 0) { if (st.t < tEnd) st.t = Math.min(tEnd, st.t + dt * 0.55); else { st.hold += dt; if (st.hold > 1.2) s.reset(); } }
      const sf = 0.5 * a * st.t * st.t, v = a * st.t, om = v / Rr;
      const narrow = w < 560;
      const cx = narrow ? w * 0.33 : w * 0.3, cy = h * 0.18, R = Math.min(w, h) * 0.11;
      const k = (h * 0.62) / Hf;
      line(ctx, cx - 60, 6, cx + 60, 6, C.muted, 4);
      line(ctx, cx, 6, cx, cy, C.muted, 3);
      const ang = sf / Rr;
      if (c === 1) { circle(ctx, cx, cy, R - 4, null, C.rot, 8); }
      else circle(ctx, cx, cy, R, alpha(C.rot, 0.35), C.rot, 2.5);
      for (let i = 0; i < 4; i++) { const q = ang + i * TAU / 4; line(ctx, cx, cy, cx + Math.cos(q) * (R - 6), cy + Math.sin(q) * (R - 6), alpha(C.ink, 0.6), 1.5); }
      circle(ctx, cx, cy, 5, C.ink);
      if (M > 0) arcArrow(ctx, cx, cy, R + 12, -1.2, -1.2 + Math.min(4, 0.4 + om * 0.1), C.rot, 2.2);
      const ry = cy + R * 0.0, by = cy + 26 + sf * k;
      line(ctx, cx + R, ry, cx + R, by, C.ink, 2);
      const bs = 28 + 10 * Math.cbrt(m);
      rrect(ctx, cx + R - bs / 2, by, bs, bs, 4); ctx.fillStyle = C.lin; ctx.fill();
      text(ctx, `${fmt(m, 1)} kg`, cx + R, by + bs / 2, { col: C.surface, size: 10, weight: 700, align: 'center' });
      arrow(ctx, cx + R + bs / 2 + 10, by + bs / 2, cx + R + bs / 2 + 10, by + bs / 2 + a * 5, C.lin, 2.2, 7);
      line(ctx, cx + R + bs, cy + 26, cx + R + bs + 12, cy + 26, C.muted, 1);
      line(ctx, cx + R + bs, cy + 26 + Hf * k + bs, cx + R + bs + 12, cy + 26 + Hf * k + bs, C.muted, 1);
      // barras de energía
      const Ep = m * g * sf, Et = 0.5 * m * v * v, Er = 0.5 * c * M * v * v, Emax = m * g * Hf;
      const bx0 = narrow ? w * 0.66 : w * 0.62, bW = narrow ? 36 : 54, bTop = 30, bBot = h - 40, bH = bBot - bTop;
      ctx.fillStyle = alpha(C.en, 0.12); ctx.fillRect(bx0, bTop, bW, bH);
      ctx.fillStyle = C.en; ctx.fillRect(bx0, bBot - Ep / Emax * bH, bW, Ep / Emax * bH);
      const b2 = bx0 + bW + (narrow ? 22 : 40);
      ctx.fillStyle = alpha(C.ink, 0.06); ctx.fillRect(b2, bTop, bW, bH);
      ctx.fillStyle = C.lin; ctx.fillRect(b2, bBot - Et / Emax * bH, bW, Et / Emax * bH);
      ctx.fillStyle = C.rot; ctx.fillRect(b2, bBot - (Et + Er) / Emax * bH, bW, Er / Emax * bH);
      text(ctx, 'Ep perdida', bx0 + bW / 2, bBot + 14, { col: C.en, size: 10.5, align: 'center' });
      text(ctx, '= Ec', bx0 + bW + (narrow ? 11 : 20), bBot - Ep / Emax * bH / 2, { col: C.ink, size: 11, align: 'center' });
      text(ctx, 'tras.', b2 + bW / 2, bBot + 14, { col: C.lin, size: 10.5, align: 'center' });
      text(ctx, '+ rot.', b2 + bW / 2, bBot + 27, { col: C.rot, size: 10.5, align: 'center' });
      text(ctx, `${fmt(Ep, 1)} J`, bx0 + bW / 2, bTop - 10, { col: C.en, size: 10.5, align: 'center' });
      text(ctx, `${fmt(Et, 1)} + ${fmt(Er, 1)}`, b2 + bW / 2, bTop - 10, { col: C.ink, size: 10.5, align: 'center' });
      s.out('a', fmt(a, 2) + ' m/s²'); s.out('T', fmt(T, 2) + ' N'); s.out('fr', fmt(100 * c * M / (m + c * M), 0) + ' %');
    }
  });

  // ---------------- Viga en equilibrio ----------------
  const CFG = {
    2: { L: 6, Wb: 90 * g, A: 2, B: 4, x: 5.2 / 6, w: 735, lb: 'albañil' },
    1: { L: 12, Wb: 80, A: 1, B: 11, x: 0.75, w: 300, lb: 'bloque' }
  };
  new Sim('s-viga', {
    init(s) { Object.assign(s.st, { tilt: 0, drag: false }); },
    change(s, k) {
      if (k === 'ex') { const c = CFG[s.p.ex]; setInput(s, 'x', c.x); setInput(s, 'w', c.w); }
    },
    act: { lim(s) { const c = CFG[s.p.ex]; setInput(s, 'x', c.x); setInput(s, 'w', c.w); } },
    wake: false,
    down(s, x, y) {
      const geo = s.st.geo; if (!geo) return false;
      if (Math.abs(x - geo.lx) < 40 && Math.abs(y - geo.ly) < 60) { s.st.drag = true; return true; }
      return false;
    },
    move(s, x, y, down) {
      if (!down || !s.st.drag) return;
      const geo = s.st.geo;
      setInput(s, 'x', clamp((x - geo.x0) / geo.Lpx, 0, 1).toFixed(3));
    },
    up(s) { s.st.drag = false; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, c = CFG[s.p.ex], L = c.L, W = s.p.w, xl = s.p.x * L;
      const RB = (c.Wb * (L / 2 - c.A) + W * (xl - c.A)) / (c.B - c.A), RA = c.Wb + W - RB;
      const tipB = RA < -1e-6, tipA = RB < -1e-6;
      const x0 = 24, Lpx = w - 48, sc = Lpx / L, Hs = Math.min(70, h * 0.24), gy = h * 0.8, by = gy - Hs;
      let target = 0;
      if (tipB) target = Math.asin(Math.min(1, Hs / ((L - c.B) * sc)));
      if (tipA) target = -Math.asin(Math.min(1, Hs / (c.A * sc)));
      st.tilt += (target - st.tilt) * Math.min(1, (dt || 0.016) * 5);
      const piv = tipB || st.tilt > 0.001 ? c.B : c.A;
      const pX = x0 + piv * sc;
      const T = xx => { const dxp = (xx - piv) * sc; return [pX + dxp * Math.cos(st.tilt), by + dxp * Math.sin(st.tilt)]; };
      line(ctx, 0, gy, w, gy, C.muted, 2);
      [c.A, c.B].forEach((xx, i) => {
        const X = x0 + xx * sc;
        ctx.beginPath(); ctx.moveTo(X, by); ctx.lineTo(X - 16, gy); ctx.lineTo(X + 16, gy); ctx.closePath(); ctx.fillStyle = C.sunk; ctx.fill(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.stroke();
        text(ctx, i ? 'B' : 'A', X, gy + 14, { col: C.ink, size: 12, weight: 700, align: 'center' });
      });
      const e0 = T(0), e1 = T(L);
      ctx.save(); ctx.lineCap = 'butt'; ctx.strokeStyle = alpha(C.rot, 0.75); ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(e0[0], e0[1] - 6); ctx.lineTo(e1[0], e1[1] - 6); ctx.stroke(); ctx.restore();
      const kF = Math.min(0.11, (h * 0.36) / Math.max(1, c.Wb + W));
      const cm = T(L / 2);
      arrow(ctx, cm[0], cm[1] - 6, cm[0], cm[1] - 6 + c.Wb * kF, C.force, 2.5);
      text(ctx, `${fmt(c.Wb, 0)} N`, cm[0] + 6, cm[1] + c.Wb * kF * 0.6, { col: C.force, size: 10.5 });
      const lp = T(xl), lx = lp[0], ly = lp[1] - 12;
      st.geo = { x0, Lpx, lx, ly: ly - 20 };
      // carga: persona o bloque
      if (s.p.ex === '2') {
        circle(ctx, lx, ly - 46, 7, C.ink);
        line(ctx, lx, ly - 38, lx, ly - 16, C.ink, 3); line(ctx, lx, ly - 16, lx - 7, ly, C.ink, 3); line(ctx, lx, ly - 16, lx + 7, ly, C.ink, 3);
        line(ctx, lx - 10, ly - 30, lx + 10, ly - 30, C.ink, 3);
      } else { rrect(ctx, lx - 18, ly - 30, 36, 30, 4); ctx.fillStyle = alpha(C.ink, 0.15); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      arrow(ctx, lx, ly, lx, ly + W * kF, C.force, 3);
      text(ctx, `${fmt(W, 0)} N`, lx + 8, ly + W * kF * 0.7, { col: C.force, size: 10.5 });
      const reac = (xx, R) => { if (R <= 0) return; const q = T(xx); arrow(ctx, q[0], q[1] - 12, q[0], q[1] - 12 - R * kF, C.en, 3); text(ctx, `R = ${fmt(R, 0)} N`, q[0] - 8, q[1] - 12 - R * kF * 0.6, { col: C.en, size: 10.5, align: 'right' }); };
      if (!tipA && !tipB) { reac(c.A, RA); reac(c.B, RB); }
      else reac(tipB ? c.B : c.A, c.Wb + W);
      text(ctx, `${c.lb} a ${fmt(xl, 2)} m del extremo izquierdo`, 14, 18, { col: C.muted, size: 11 });
      const tipping = tipA || tipB;
      s.out('ra', tipping ? (tipB ? '0 (se despega)' : '—') : fmt(RA, 0) + ' N');
      s.out('rb', tipping ? (tipA ? '0 (se despega)' : '—') : fmt(RB, 0) + ' N');
      s.out('sf', tipping ? '—' : fmt(RA + RB - c.Wb - W, 0) + ' N');
      s.out('st', tipping ? 'VUELCA' : Math.min(RA, RB) < 25 ? 'al límite' : 'equilibrio');
    }
  });

  // ---------------- Hooke / Young ----------------
  const A_W = Math.PI * 0.002 * 0.002 / 4, Y = 2.07e11, SE = 2.48e8, SR = 4.89e8, LW = 10;
  const strain = sg => sg <= SE ? sg / Y : SE / Y + 0.0045 * Math.pow((sg - SE) / (SR - SE), 1.6);
  new Sim('s-hooke', {
    init(s) { s.st.fall = 0; s.st.osc = 0; },
    change(s) { s.st.fall = 0; },
    frame(s, ctx, w, h, dt) {
      const st = s.st, F = s.p.F, sg = F / A_W, broke = sg >= SR;
      const eps = strain(Math.min(sg, SR)), dL = eps * LW;
      st.osc += dt;
      if (broke) st.fall = Math.min(h, st.fall + dt * 260 + st.fall * dt * 3);
      const narrow = w < 560;
      const wx = narrow ? w * 0.18 : w * 0.16, top = 14;
      line(ctx, wx - 50, top, wx + 50, top, C.muted, 5);
      const vis = h * 0.32 + Math.sqrt(dL / 0.06) * h * 0.22;
      const bot = top + vis;
      if (!broke) line(ctx, wx, top, wx, bot, C.ink, 2);
      else { line(ctx, wx, top, wx, top + vis * 0.55, C.ink, 2); }
      const bs = 22 + Math.sqrt(F) * 0.9, wy = broke ? bot + st.fall : bot;
      rrect(ctx, wx - bs / 2, wy, bs, bs, 4); ctx.fillStyle = C.lin; ctx.fill();
      text(ctx, `${fmt(F, 0)} N`, wx, wy + bs + 12, { col: C.ink, size: 10.5, align: 'center' });
      text(ctx, '(estiramiento exagerado)', wx, h - 12, { col: C.muted, size: 9.5, align: 'center' });
      if (broke) text(ctx, '¡se rompió!', wx + 14, top + vis * 0.55 + 8, { col: C.force, size: 12, weight: 700 });
      const rr = narrow ? { x: wx + 70, y: 24, w: w - wx - 86, h: h - 60 } : { x: w * 0.36, y: 24, w: w * 0.58, h: h - 60 };
      const Ax = axes(ctx, rr, { x0: 0, x1: 60, y0: 0, y1: 5.2, xl: 'ΔL (mm)', yl: 'F/A (10⁸ Pa)', ticksY: [0, 1, 2, 3, 4, 5], ticksX: [0, 20, 40, 60] });
      ctx.fillStyle = alpha(C.en, 0.1); ctx.fillRect(rr.x, Ax.Y(SE / 1e8), Ax.X(SE / Y * LW * 1000) - rr.x, Ax.Y(0) - Ax.Y(SE / 1e8));
      ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const q = i / 120 * SR; const x = strain(q) * LW * 1000; i ? ctx.lineTo(Ax.X(x), Ax.Y(q / 1e8)) : ctx.moveTo(Ax.X(x), Ax.Y(q / 1e8)); }
      ctx.stroke(); ctx.restore();
      line(ctx, rr.x, Ax.Y(SE / 1e8), rr.x + rr.w, Ax.Y(SE / 1e8), C.en, 1, [4, 4]);
      text(ctx, 'límite elástico', rr.x + rr.w - 4, Ax.Y(SE / 1e8) - 9, { col: C.en, size: 10, align: 'right' });
      line(ctx, rr.x, Ax.Y(SR / 1e8), rr.x + rr.w, Ax.Y(SR / 1e8), C.force, 1, [4, 4]);
      text(ctx, 'rotura', rr.x + rr.w - 4, Ax.Y(SR / 1e8) - 9, { col: C.force, size: 10, align: 'right' });
      text(ctx, 'zona elástica: pendiente ∝ Y', Ax.X(14), Ax.Y(1.2), { col: C.en, size: 10 });
      if (!broke) circle(ctx, Ax.X(dL * 1000), Ax.Y(sg / 1e8), 6, C.lin, C.surface, 2);
      s.out('s', fmt(sg / 1e8, 2) + '·10⁸ Pa'); s.out('dl', broke ? '—' : fmt(dL * 1000, 2) + ' mm');
      s.out('z', broke ? 'rotura' : sg <= SE ? 'elástica' : 'plástica');
    }
  });
})();
