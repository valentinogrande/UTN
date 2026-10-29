/* Centro de masa: definición arrastrable, explosión, bastón lanzado, figura colgada */
(() => {
  'use strict';
  const { Sim, C, TAU, alpha, fmt, text, arrow, circle, line, grid } = PH;
  const g = 9.8;

  function star(ctx, x, y, r, col) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = C.surface; ctx.lineWidth = 1.5; ctx.stroke();
  }
  PH.star = star;

  // ---------------- Definición: masas arrastrables ----------------
  new Sim('s-cmdrag', {
    still: true,
    init(s) { s.st.P = [[-2.5, 1], [3, 2], [1, -1.8]]; s.st.drag = -1; },
    down(s, x, y) {
      const T = s.st.tf; if (!T) return false;
      let best = -1, bd = 30;
      s.st.P.forEach(([px, py], i) => { const d = Math.hypot(T.X(px) - x, T.Y(py) - y); if (d < bd) { bd = d; best = i; } });
      s.st.drag = best; return best >= 0;
    },
    move(s, x, y, down) {
      if (!down || s.st.drag < 0) return;
      const T = s.st.tf;
      const px = Math.round(T.ix(x) * 10) / 10, py = Math.round(T.iy(y) * 10) / 10;
      s.st.P[s.st.drag] = [Math.max(-T.wx, Math.min(T.wx, px)), Math.max(-T.wy, Math.min(T.wy, py))];
    },
    up(s) { s.st.drag = -1; },
    frame(s, ctx, w, h) {
      const narrow = w < 560, wx = narrow ? 3.5 : 6, wy = narrow ? 4 : 3.5;
      const sc = Math.min((w - 30) / (2 * wx), (h - 30) / (2 * wy)), ox = w / 2, oy = h / 2;
      const T = s.st.tf = { X: x => ox + x * sc, Y: y => oy - y * sc, ix: x => (x - ox) / sc, iy: y => (oy - y) / sc, wx, wy };
      grid(ctx, ox - Math.floor(w / 2 / sc) * sc, oy - Math.floor(h / 2 / sc) * sc, Math.floor(w / sc) * sc, Math.floor(h / sc) * sc, sc);
      line(ctx, 0, oy, w, oy, C.line, 1.5); line(ctx, ox, 0, ox, h, C.line, 1.5);
      text(ctx, 'x (m)', w - 8, oy - 10, { col: C.muted, size: 10, align: 'right' });
      text(ctx, 'y (m)', ox + 6, 10, { col: C.muted, size: 10 });
      const M = [s.p.m1, s.p.m2, s.p.m3], cols = [C.lin, C.rot, C.en], P = s.st.P, Mt = M[0] + M[1] + M[2];
      const xc = (M[0] * P[0][0] + M[1] * P[1][0] + M[2] * P[2][0]) / Mt;
      const yc = (M[0] * P[0][1] + M[1] * P[1][1] + M[2] * P[2][1]) / Mt;
      P.forEach(([x, y]) => line(ctx, T.X(xc), T.Y(yc), T.X(x), T.Y(y), alpha(C.alt, 0.45), 1.2, [4, 4]));
      P.forEach(([x, y], i) => {
        const r = 7 + 3.2 * Math.sqrt(M[i]);
        circle(ctx, T.X(x), T.Y(y), r + (s.st.drag === i ? 4 : 0), alpha(cols[i], 0.2));
        circle(ctx, T.X(x), T.Y(y), r, cols[i]);
        text(ctx, `m${'₁₂₃'[i]}`, T.X(x), T.Y(y), { col: C.surface, size: 10, weight: 700, align: 'center' });
        text(ctx, `(${fmt(x, 1)}; ${fmt(y, 1)})`, T.X(x), T.Y(y) + r + 11, { col: C.muted, size: 10, align: 'center' });
      });
      star(ctx, T.X(xc), T.Y(yc), 12, C.alt);
      text(ctx, 'CM', T.X(xc) + 14, T.Y(yc) - 10, { col: C.alt, size: 12, weight: 700 });
      const term = (k) => P.map((q, i) => `${fmt(M[i], 1)}·(${fmt(q[k], 1)})`).join(' + ');
      s.out('fx', `x_cm = [${term(0)}] / ${fmt(Mt, 1)} = ${fmt(xc, 2)} m`);
      s.out('fy', `y_cm = [${term(1)}] / ${fmt(Mt, 1)} = ${fmt(yc, 2)} m`);
    }
  });

  // ---------------- Explosión ----------------
  const FR = [1, 1.5, 2.5];
  new Sim('s-explosion', {
    init(s) {
      const v0 = 18, a = Math.PI / 3;
      Object.assign(s.st, { t: 0, ph: 'up', body: { x: 1, y: 0, vx: v0 * Math.cos(a), vy: v0 * Math.sin(a) }, frags: null, cmTr: [], wait: 0, flash: 0, sum: [0, 0], landed: false });
    },
    act: { go(s) { s.reset(); } },
    frame(s, ctx, w, h, dt) {
      const st = s.st, b = st.body, M = 5;
      const W = 32, H = 14, sc = Math.min((w - 20) / W, (h - 30) / H);
      const X = x => 10 + x * sc, Y = y => h - 18 - y * sc;
      if (dt > 0) {
        st.t += dt;
        if (st.ph === 'up') {
          b.vy -= g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
          if (b.vy <= 0) {
            st.ph = 'boom'; st.flash = 0.4; st.bp = [b.x, b.y];
            const r = () => { const a = Math.random() * TAU, m = 4 + Math.random() * 4; return [Math.cos(a) * m, Math.sin(a) * m]; };
            const d1 = r(), d2 = r(), d3 = [-(FR[0] * d1[0] + FR[1] * d2[0]) / FR[2], -(FR[0] * d1[1] + FR[1] * d2[1]) / FR[2]];
            st.sum = [FR[0] * d1[0] + FR[1] * d2[0] + FR[2] * d3[0], FR[0] * d1[1] + FR[1] * d2[1] + FR[2] * d3[1]];
            st.frags = [d1, d2, d3].map((d, i) => ({ m: FR[i], x: b.x, y: b.y, vx: b.vx + d[0], vy: b.vy + d[1], rot: Math.random() * TAU, sp: (Math.random() - .5) * 12, tr: [], done: false }));
          }
        } else {
          st.frags.forEach(f => {
            if (f.done) return;
            f.vy -= g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.sp * dt;
            if (f.y <= 0) { f.y = 0; f.done = true; st.landed = true; }
            f.tr.push([f.x, f.y]);
          });
          if (st.frags.every(f => f.done)) { st.wait += dt; if (st.wait > 1.6) s.reset(); }
        }
        if (st.flash > 0) st.flash -= dt;
      }
      // parábola original
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const t = i / 80 * 3.18, x = 1 + 9 * t, y = 15.588 * t - 0.5 * g * t * t; i ? ctx.lineTo(X(x), Y(Math.max(0, y))) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke(); ctx.restore();
      line(ctx, 0, Y(0), w, Y(0), C.ink, 2);
      // CM
      let cx, cy;
      if (st.ph === 'up') { cx = b.x; cy = b.y; }
      else { cx = st.frags.reduce((a, f) => a + f.m * f.x, 0) / M; cy = st.frags.reduce((a, f) => a + f.m * f.y, 0) / M; }
      if (dt > 0) st.cmTr.push([cx, cy]);
      ctx.save(); ctx.strokeStyle = C.alt; ctx.lineWidth = 2.5; ctx.beginPath();
      st.cmTr.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.restore();
      const cols = [C.lin, C.rot, C.en];
      if (st.ph === 'up') circle(ctx, X(b.x), Y(b.y), 9, C.ink);
      else st.frags.forEach((f, i) => {
        ctx.save(); ctx.strokeStyle = alpha(cols[i], 0.45); ctx.lineWidth = 1.5; ctx.beginPath();
        f.tr.forEach(([x, y], j) => j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke();
        ctx.translate(X(f.x), Y(f.y)); ctx.rotate(f.rot);
        const r = 5 + f.m * 2.4; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.6, r * 0.8); ctx.lineTo(-r * 0.4, -r * 0.9); ctx.closePath();
        ctx.fillStyle = cols[i]; ctx.fill(); ctx.restore();
        text(ctx, `${fmt(f.m, 1)} kg`, X(f.x), Y(f.y) - 16, { col: cols[i], size: 10, align: 'center' });
      });
      if (st.flash > 0 && st.bp) circle(ctx, X(st.bp[0]), Y(st.bp[1]), 40 * (1 - st.flash / 0.4) + 6, null, alpha(C.force, st.flash * 2), 4);
      star(ctx, X(cx), Y(cy), 11, C.alt);
      text(ctx, 'CM', X(cx) + 13, Y(cy) - 10, { col: C.alt, size: 11, weight: 700 });
      const msg = st.ph === 'up' ? 'en vuelo, un solo cuerpo' : st.landed ? 'tocó el suelo: aparece la normal' : 'explotó: sólo fuerzas internas';
      s.out('st', msg);
      s.out('sum', st.ph === 'up' ? '—' : `(${fmt(st.sum[0], 2)}; ${fmt(st.sum[1], 2)}) kg·m/s`);
    }
  });

  // ---------------- Bastón lanzado ----------------
  new Sim('s-baton', {
    init(s) { Object.assign(s.st, { t: 0, tr1: [], tr2: [], trc: [], snaps: [], wait: 0, lastSnap: -1 }); },
    change(s, k) { if (k !== 'tr') s.reset(); },
    act: { go(s) { s.reset(); } },
    frame(s, ctx, w, h, dt) {
      const st = s.st, m1 = s.p.m, m2 = 1, Lr = 1.6, om = s.p.w;
      const d1 = Lr * m2 / (m1 + m2), d2 = Lr * m1 / (m1 + m2);
      const W = 22, H = 9, sc = Math.min((w - 20) / W, (h - 24) / H);
      const X = x => 10 + x * sc, Y = y => h - 16 - y * sc;
      const vx = 7.6, vy = 10.6, x0 = 1.8, y0 = 1.4;
      const tLand = (vy + Math.sqrt(vy * vy + 2 * g * (y0 - 0.9))) / g;
      if (dt > 0) {
        if (st.t < tLand) st.t = Math.min(tLand, st.t + dt * 0.8);
        else { st.wait += dt; if (st.wait > 1.4) s.reset(); }
      }
      const t = st.t, cx = x0 + vx * t, cy = y0 + vy * t - 0.5 * g * t * t, ph = 0.4 + om * t;
      const p1 = [cx + d1 * Math.cos(ph), cy + d1 * Math.sin(ph)], p2 = [cx - d2 * Math.cos(ph), cy - d2 * Math.sin(ph)];
      if (dt > 0 && st.t < tLand) {
        st.trc.push([cx, cy]); st.tr1.push(p1); st.tr2.push(p2);
        const k = Math.floor(t / 0.22); if (k !== st.lastSnap) { st.lastSnap = k; st.snaps.push([p1, p2, [cx, cy]]); }
      }
      line(ctx, 0, Y(0), w, Y(0), C.ink, 2);
      // parábola teórica del CM
      ctx.save(); ctx.setLineDash([5, 6]); ctx.strokeStyle = alpha(C.alt, 0.6); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const tt = i / 60 * tLand; const x = x0 + vx * tt, y = y0 + vy * tt - 0.5 * g * tt * tt; i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke(); ctx.restore();
      st.snaps.forEach(([a, b]) => line(ctx, X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), alpha(C.muted, 0.28), 2));
      if (s.p.tr) {
        const pl = (tr, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); tr.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.restore(); };
        pl(st.tr1, alpha(C.lin, 0.55)); pl(st.tr2, alpha(C.rot, 0.55));
      }
      ctx.save(); ctx.strokeStyle = C.alt; ctx.lineWidth = 2.5; ctx.beginPath();
      st.trc.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))); ctx.stroke(); ctx.restore();
      line(ctx, X(p1[0]), Y(p1[1]), X(p2[0]), Y(p2[1]), C.ink, 3.5);
      circle(ctx, X(p1[0]), Y(p1[1]), 6 + 2.5 * Math.sqrt(m1), C.lin);
      circle(ctx, X(p2[0]), Y(p2[1]), 8.5, C.rot);
      star(ctx, X(cx), Y(cy), 9, C.alt);
      arrow(ctx, X(cx), Y(cy), X(cx), Y(cy) + 34, C.force, 2, 7);
      text(ctx, 'M·g', X(cx) + 6, Y(cy) + 30, { col: C.force, size: 10.5 });
      text(ctx, `${fmt(m1, 1)} kg`, 14, 16, { col: C.lin, size: 11 }); text(ctx, '1,0 kg', 84, 16, { col: C.rot, size: 11 });
      text(ctx, '★ CM: parábola', 14, 34, { col: C.alt, size: 11 });
    }
  });

  // ---------------- Colgar la figura ----------------
  function arc(cx, cy, r, a0, a1, n) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
  const SHAPES = {
    L: [[0, 0], [2.2, 0], [2.2, 0.6], [0.6, 0.6], [0.6, 2.2], [0, 2.2]],
    ring: [...arc(0, 0, 1.25, 0.75, TAU - 0.75, 40), ...arc(0, 0, 0.78, TAU - 0.75, 0.75, 40)],
    tri: [[0, 0], [2.6, 0.4], [0.5, 2.1]],
    boom: [[0, 0], [2.4, 0.7], [2.25, 1.05], [0.55, 0.6], [1.0, 2.3], [0.65, 2.4]]
  };
  function inside(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function analyze(poly) {
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    poly.forEach(([x, y]) => { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); });
    let n = 0, sx = 0, sy = 0; const pts = [];
    for (let x = minx; x <= maxx; x += 0.03) for (let y = miny; y <= maxy; y += 0.03) if (inside(poly, x, y)) { pts.push([x, y]); sx += x; sy += y; n++; }
    const cx = sx / n, cy = sy / n;
    let k2 = 0; pts.forEach(([x, y]) => { k2 += (x - cx) ** 2 + (y - cy) ** 2; }); k2 /= n;
    return { c: [cx, cy], k2, mid: [(minx + maxx) / 2, (miny + maxy) / 2] };
  }
  const rot = (th, [x, y]) => [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];

  new Sim('s-colgar', {
    still: true,
    init(s) {
      const poly = SHAPES[s.p.shape];
      Object.assign(s.st, { poly, an: analyze(poly), th: 0, om: 0, piv: null, W: null, lines: [], show: false, tSet: 0, recorded: false });
    },
    change(s, k) { if (k === 'shape') s.reset(); },
    act: {
      clear(s) { s.st.lines = []; },
      reveal(s, b) { s.st.show = !s.st.show; b.textContent = s.st.show ? 'Ocultar CM' : 'Mostrar CM'; }
    },
    wake: false,
    down(s, x, y) {
      const st = s.st, S = st.S; if (!S) return false;
      const T = st.T, b = rot(-st.th, [(x - T[0]) / S, (y - T[1]) / S]);
      if (!inside(st.poly, b[0], b[1])) return false;
      st.piv = b; st.W = [x, y]; st.om = 0; st.tSet = 0; st.recorded = false;
      if (s.paused) s.setPaused(false);
      return false;
    },
    frame(s, ctx, w, h, dt) {
      const st = s.st, an = st.an, S = st.S = Math.min(w, h) * (w < 560 ? 0.2 : 0.17);
      const target = [w / 2, h * 0.16];
      if (st.piv) {
        st.W[0] += (target[0] - st.W[0]) * Math.min(1, dt * 6);
        st.W[1] += (target[1] - st.W[1]) * Math.min(1, dt * 6);
        const kp2 = an.k2 + (an.c[0] - st.piv[0]) ** 2 + (an.c[1] - st.piv[1]) ** 2;
        const n = 6;
        for (let i = 0; i < n && dt > 0; i++) {
          const dd = rot(st.th, [an.c[0] - st.piv[0], an.c[1] - st.piv[1]]);
          st.om += ((14 * dd[0]) / kp2 - 1.8 * st.om) * dt / n;
          st.th += st.om * dt / n;
        }
        st.tSet += dt;
        if (!st.recorded && st.tSet > 1.2 && Math.abs(st.om) < 0.03) {
          st.recorded = true;
          st.lines.push({ p: st.piv.slice(), dir: rot(-st.th, [0, 1]) });
        }
        st.T = [st.W[0] - rot(st.th, st.piv)[0] * S, st.W[1] - rot(st.th, st.piv)[1] * S];
      } else {
        st.T = [w / 2 - an.mid[0] * S, h * 0.55 - an.mid[1] * S];
      }
      const T = st.T, toW = p => { const r = rot(st.th, p); return [T[0] + r[0] * S, T[1] + r[1] * S]; };
      // figura
      ctx.beginPath(); st.poly.forEach((p, i) => { const q = toW(p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath();
      ctx.fillStyle = alpha(C.alt, 0.16); ctx.fill(); ctx.strokeStyle = C.alt; ctx.lineWidth = 2.5; ctx.stroke();
      // verticales registradas (en coordenadas del cuerpo)
      ctx.save(); ctx.clip();
      st.lines.forEach((l, i) => {
        const a = toW([l.p[0] - l.dir[0] * 6, l.p[1] - l.dir[1] * 6]), b = toW([l.p[0] + l.dir[0] * 6, l.p[1] + l.dir[1] * 6]);
        line(ctx, a[0], a[1], b[0], b[1], [C.lin, C.rot, C.en, C.force][i % 4], 2.2, [6, 4]);
      });
      ctx.restore();
      st.lines.forEach((l, i) => {
        const a = toW([l.p[0] - l.dir[0] * 6, l.p[1] - l.dir[1] * 6]), b = toW([l.p[0] + l.dir[0] * 6, l.p[1] + l.dir[1] * 6]);
        line(ctx, a[0], a[1], b[0], b[1], alpha([C.lin, C.rot, C.en, C.force][i % 4], 0.3), 1.2, [6, 4]);
        const q = toW(l.p); circle(ctx, q[0], q[1], 3.5, [C.lin, C.rot, C.en, C.force][i % 4]);
      });
      if (st.piv) {
        line(ctx, st.W[0], st.W[1], st.W[0], h, alpha(C.ink, 0.55), 1.2, [3, 4]);
        line(ctx, st.W[0] - 30, st.W[1] - 12, st.W[0] + 30, st.W[1] - 12, C.muted, 3);
        line(ctx, st.W[0], st.W[1] - 12, st.W[0], st.W[1], C.muted, 2);
        circle(ctx, st.W[0], st.W[1], 5, C.ink);
        text(ctx, 'plomada', st.W[0] + 8, h - 14, { col: C.muted, size: 10.5 });
      } else text(ctx, 'Tocá un punto de la figura para colgarla', w / 2, h * 0.12, { col: C.muted, size: 13, align: 'center', font: 'body' });
      if (st.show) { const q = toW(an.c); star(ctx, q[0], q[1], 11, C.alt); text(ctx, 'CM', q[0] + 13, q[1] - 9, { col: C.alt, size: 11, weight: 700 }); }
      if (st.lines.length) text(ctx, `${st.lines.length} vertical${st.lines.length > 1 ? 'es' : ''} registrada${st.lines.length > 1 ? 's' : ''}`, 14, h - 14, { col: C.muted, size: 10.5 });
    }
  });
})();
