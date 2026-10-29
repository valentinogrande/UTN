/* Unidad 8: impulso, choques 1D, péndulo balístico, choque oblicuo */
(() => {
  'use strict';
  const { Sim, C, TAU, clamp, alpha, fmt, text, arrow, arcArrow, circle, rrect, line, axes } = PH;
  const g = 9.8;

  function setInput(s, k, v) {
    const inp = s.el.querySelector(`input[data-k="${k}"]`);
    if (!inp) return;
    inp.value = v; inp.dispatchEvent(new Event('input'));
  }
  PH.setInput = setInput;

  // ---------------- Impulso ----------------
  new Sim('s-impulso', {
    init(s) { Object.assign(s.st, { ph: 'in', x: 0, tc: 0, wait: 0 }); },
    change(s) { s.reset(); },
    frame(s, ctx, w, h, dt) {
      const st = s.st, Dt = s.p.dt, m = 0.5, v0 = 10, J = 2 * m * v0;
      const Fmax = Math.PI * J / (2 * Dt);
      const narrow = w < 560;
      const ay = narrow ? h * 0.2 : h * 0.24, R = narrow ? 15 : 18;
      const wallX = w - 40, cush = 6 + Dt * (narrow ? 90 : 140);
      const x0 = 40 + R, xHit = wallX - cush - R;
      const vpx = (xHit - x0) / 1.0, Tc = 0.6 + Dt * 9;
      let comp = 0, vNow = v0, Fnow = 0, tReal = 0;
      if (st.ph === 'in') { st.x += vpx * dt; if (st.x >= xHit - x0) { st.x = xHit - x0; st.ph = 'contact'; st.tc = 0; } }
      else if (st.ph === 'contact') {
        st.tc += dt; const tau = Math.min(1, st.tc / Tc);
        comp = Math.sin(Math.PI * tau) * cush * 0.75; vNow = v0 * Math.cos(Math.PI * tau);
        Fnow = Fmax * Math.sin(Math.PI * tau); tReal = tau * Dt;
        if (tau >= 1) { st.ph = 'out'; }
      } else if (st.ph === 'out') { st.x -= vpx * dt; vNow = -v0; tReal = Dt; if (st.x <= 0) { st.ph = 'wait'; st.wait = 0.6; } }
      else { vNow = -v0; tReal = Dt; st.wait -= dt; if (st.wait <= 0) s.reset(); }
      if (st.ph === 'in') tReal = 0;

      // escena
      line(ctx, 20, ay + R + 1, wallX, ay + R + 1, C.line, 1.5);
      ctx.fillStyle = C.muted; ctx.fillRect(wallX, ay - 60, 14, 120);
      const cw = cush - comp;
      rrect(ctx, wallX - cw, ay - 40, cw, 80, 4); ctx.fillStyle = alpha(C.en, 0.35); ctx.fill();
      const bx = x0 + st.x + comp;
      const sq = st.ph === 'contact' ? 1 - 0.18 * Math.sin(Math.PI * Math.min(1, st.tc / Tc)) * (cush > 20 ? 0.6 : 1) : 1;
      ctx.save(); ctx.translate(bx, ay); ctx.scale(sq, 1 / Math.sqrt(sq));
      circle(ctx, 0, 0, R, C.lin); ctx.restore();
      if (Math.abs(vNow) > 0.3) {
        arrow(ctx, bx, ay - R - 14, bx + vNow * 5, ay - R - 14, C.lin, 2.5);
        text(ctx, `v = ${fmt(vNow, 1)} m/s`, bx, ay - R - 30, { col: C.lin, size: 11, align: 'center' });
      }
      if (Fnow > 1) arrow(ctx, bx - R, ay, bx - R - Fnow / 800 * 110, ay, C.force, 3.5);
      text(ctx, Dt < 0.06 ? 'pared dura' : Dt < 0.18 ? 'almohadón' : 'airbag', wallX - cw / 2, ay + 54, { col: C.en, size: 11, align: 'center' });

      // gráfico F(t)
      const r = narrow ? { x: 52, y: h * 0.44, w: w - 70, h: h * 0.46 } : { x: 60, y: h * 0.46, w: w - 90, h: h * 0.44 };
      const A = axes(ctx, r, { x0: 0, x1: 0.32, y0: 0, y1: 820, xl: 't (s)', yl: 'F (N)', ticksY: [0, 200, 400, 600, 800], ticksX: [0, 0.1, 0.2, 0.3], dx: 1 });
      const curve = (D, T1, close) => {
        const Fm = Math.PI * J / (2 * D);
        ctx.beginPath(); ctx.moveTo(A.X(0), A.Y(0));
        for (let i = 0; i <= 60; i++) { const t = i / 60 * T1; ctx.lineTo(A.X(t), A.Y(Fm * Math.sin(Math.PI * t / D))); }
        if (close) { ctx.lineTo(A.X(T1), A.Y(0)); ctx.closePath(); }
      };
      ctx.save(); ctx.setLineDash([4, 4]); curve(0.02, 0.02); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
      if (tReal > 0) { curve(Dt, tReal, true); ctx.fillStyle = alpha(C.lin, 0.25); ctx.fill(); }
      curve(Dt, Dt); ctx.strokeStyle = C.lin; ctx.lineWidth = 2.5; ctx.stroke();
      const Fm = J / Dt;
      line(ctx, A.X(0), A.Y(Fm), A.X(Dt), A.Y(Fm), C.rot, 1.5, [6, 4]);
      text(ctx, 'F media', A.X(Dt) + 6, A.Y(Fm), { col: C.rot, size: 10 });
      text(ctx, `área = J = ${fmt(J * Math.min(1, tReal / Dt), 1)} N·s`, A.X(Math.min(Dt, 0.3)) + 10, A.Y(Math.min(Fmax, 760)) + 4, { col: C.lin, size: 11, weight: 700 });
      s.out('J', fmt(J, 1) + ' N·s'); s.out('F', fmt(Fmax, 0) + ' N'); s.out('Fm', fmt(Fm, 0) + ' N');
    }
  });

  // ---------------- Choques 1D ----------------
  function post(p) {
    const { ma, mb, va, vb, e } = p, M = ma + mb, P = ma * va + mb * vb;
    return { a: (P - mb * e * (va - vb)) / M, b: (P + ma * e * (va - vb)) / M };
  }
  new Sim('s-choque', {
    init(s) {
      Object.assign(s.st, { xa: 2.4, xb: 6.4, va: s.p.va, vb: s.p.vb, hit: false, t: 0, wait: 0 });
    },
    change(s) { s.reset(); },
    act: {
      el(s) { setInput(s, 'e', 1); },
      in(s) { setInput(s, 'e', 0.5); },
      pl(s) { setInput(s, 'e', 0); },
      newton(s) { setInput(s, 'ma', 1.5); setInput(s, 'mb', 1.5); setInput(s, 'va', 2.5); setInput(s, 'vb', 0); setInput(s, 'e', 1); }
    },
    frame(s, ctx, w, h, dt) {
      const st = s.st, p = s.p, ma = p.ma, mb = p.mb;
      const wa = 0.4 + 0.32 * Math.cbrt(ma), wb = 0.4 + 0.32 * Math.cbrt(mb);
      const pv = post(p), approaching = p.va > p.vb;
      if (st.wait > 0) { st.wait -= dt; if (st.wait <= 0) s.reset(); }
      else if (dt > 0) {
        st.t += dt;
        st.xa += st.va * dt; st.xb += st.vb * dt;
        if (!st.hit && (st.xb - wb / 2) - (st.xa + wa / 2) <= 0 && st.va > st.vb) {
          st.hit = true; st.va = pv.a; st.vb = pv.b;
          const ov = (st.xa + wa / 2) - (st.xb - wb / 2); st.xa -= ov / 2; st.xb += ov / 2;
          st.flash = 0.25;
        }
        if (st.xa < -1.5 || st.xb > 11.5 || st.xa > 11.5 || st.xb < -1.5 || st.t > 9) st.wait = 0.9;
      }
      const narrow = w < 560;
      const X0 = 16, X1 = w - 16, sc = (X1 - X0) / 10, PX = x => X0 + x * sc;
      const ty = narrow ? h * 0.3 : h * 0.4;
      // riel
      ctx.fillStyle = C.sunk; ctx.fillRect(X0, ty, X1 - X0, 8);
      for (let i = 0; i <= 10; i++) line(ctx, PX(i), ty + 8, PX(i), ty + 13, C.muted, 1);
      const cart = (x, wd, m, col, v, lb) => {
        const hh = 22 + 9 * Math.cbrt(m), x0 = PX(x - wd / 2), wpx = wd * sc;
        rrect(ctx, x0, ty - hh, wpx, hh, 6); ctx.fillStyle = col; ctx.fill();
        text(ctx, lb, x0 + wpx / 2, ty - hh / 2 - 6, { col: C.surface, size: 12, weight: 700, align: 'center' });
        text(ctx, fmt(m, 1) + ' kg', x0 + wpx / 2, ty - hh / 2 + 9, { col: C.surface, size: 10, align: 'center' });
        if (Math.abs(v) > 0.02) arrow(ctx, x0 + wpx / 2, ty - hh - 14, x0 + wpx / 2 + v * sc * 0.45, ty - hh - 14, col, 2.5);
        text(ctx, fmt(v, 2) + ' m/s', x0 + wpx / 2, ty - hh - 28, { col, size: 10.5, align: 'center' });
      };
      cart(st.xa, wa, ma, C.lin, st.va, 'A');
      cart(st.xb, wb, mb, C.alt, st.vb, 'B');
      if (st.flash > 0) { st.flash -= dt; circle(ctx, PX(st.xa + wa / 2), ty - 22, 26 * (1 - st.flash * 2), null, alpha(C.force, st.flash * 3), 3); }
      const xcm = (ma * st.xa + mb * st.xb) / (ma + mb), cxp = PX(xcm);
      ctx.beginPath(); ctx.moveTo(cxp, ty + 16); ctx.lineTo(cxp - 7, ty + 28); ctx.lineTo(cxp + 7, ty + 28); ctx.closePath(); ctx.fillStyle = C.alt; ctx.fill();
      text(ctx, 'CM', cxp, ty + 38, { col: C.alt, size: 10, weight: 700, align: 'center' });
      if (!approaching) text(ctx, 'Con estas velocidades A nunca alcanza a B: no hay choque', w / 2, 18, { col: C.force, size: 12, align: 'center' });

      // filas de barras
      const P1a = ma * p.va, P1b = mb * p.vb, P2a = ma * pv.a, P2b = mb * pv.b;
      const after = st.hit || !approaching;
      const E1a = 0.5 * ma * p.va ** 2, E1b = 0.5 * mb * p.vb ** 2, E2a = 0.5 * ma * pv.a ** 2, E2b = 0.5 * mb * pv.b ** 2;
      const rowsY = narrow ? h * 0.5 : h * 0.6, rh = narrow ? (h - rowsY - 14) / 4 : (h - rowsY - 14) / 4;
      const lx = narrow ? 92 : 120, rx = w - 20, mid = (lx + rx) / 2;
      const pmax = Math.max(1, Math.abs(P1a) + Math.abs(P1b), Math.abs(P2a) + Math.abs(P2b));
      const pk = (rx - lx) / 2 / pmax * 0.95;
      const emax = Math.max(0.5, E1a + E1b), ek = (rx - lx) / emax * 0.95;
      const rows = [['P antes', 0], ['P después', 1], ['Ec antes', 2], ['Ec después', 3]];
      rows.forEach(([lb, i]) => {
        const y = rowsY + i * rh + rh / 2;
        text(ctx, lb, 16, y, { col: C.muted, size: 11 });
        if (i < 2) line(ctx, mid, y - rh * 0.4, mid, y + rh * 0.4, C.line, 1);
      });
      const pRow = (i, a, b, show) => {
        const y = rowsY + i * rh + rh / 2;
        if (!show) { text(ctx, '…', mid, y, { col: C.muted, size: 12, align: 'center' }); return; }
        arrow(ctx, mid, y - 5, mid + a * pk, y - 5, C.lin, 4, 8);
        arrow(ctx, mid + a * pk, y + 5, mid + (a + b) * pk, y + 5, C.alt, 4, 8);
        const tx = mid + (a + b) * pk;
        line(ctx, tx, y - 12, tx, y + 12, C.ink, 2);
        text(ctx, fmt(a + b, 2), tx + (a + b >= 0 ? 6 : -6), y - 12, { col: C.ink, size: 10.5, align: a + b >= 0 ? 'left' : 'right' });
      };
      pRow(0, P1a, P1b, true); pRow(1, P2a, P2b, after);
      const eRow = (i, a, b, show) => {
        const y = rowsY + i * rh + rh / 2, hh = Math.min(16, rh * 0.5);
        if (!show) { text(ctx, '…', lx, y, { col: C.muted, size: 12 }); return; }
        ctx.fillStyle = C.lin; ctx.fillRect(lx, y - hh / 2, a * ek, hh);
        ctx.fillStyle = C.alt; ctx.fillRect(lx + a * ek, y - hh / 2, b * ek, hh);
        if (i === 3) {
          const lost = (E1a + E1b) - (a + b);
          if (lost > 1e-3) { ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.force; ctx.lineWidth = 1.5; ctx.strokeRect(lx + (a + b) * ek, y - hh / 2, lost * ek, hh); ctx.restore(); text(ctx, 'perdida', lx + (a + b + lost / 2) * ek, y + hh / 2 + 8, { col: C.force, size: 9.5, align: 'center' }); }
        }
        text(ctx, fmt(a + b, 2) + ' J', Math.min(rx - 40, lx + (a + b) * ek + 6), y - hh / 2 - 6, { col: C.ink, size: 10.5 });
      };
      eRow(2, E1a, E1b, true); eRow(3, E2a, E2b, after);

      const loss = (E1a + E1b) - (E2a + E2b);
      s.out('va', approaching ? fmt(pv.a, 2) + ' m/s' : '—'); s.out('vb', approaching ? fmt(pv.b, 2) + ' m/s' : '—');
      s.out('vcm', fmt((P1a + P1b) / (ma + mb), 2) + ' m/s');
      s.out('loss', approaching ? `${fmt(loss, 2)} J (${fmt(100 * loss / Math.max(1e-9, E1a + E1b), 0)} %)` : '—');
    }
  });

  // ---------------- Péndulo balístico ----------------
  new Sim('s-pendulo', {
    init(s) { Object.assign(s.st, { ph: 'idle', bx: 0, th: 0, om: 0, t: 0, idle: 0.6, trail: [] }); },
    change(s) { s.reset(); },
    act: { fire(s) { s.reset(); s.st.idle = 0.05; } },
    frame(s, ctx, w, h, dt) {
      const st = s.st, m = s.p.m / 1000, M = s.p.M, v1 = s.p.v, L = 1.5;
      const v2 = m * v1 / (m + M), hh = v2 * v2 / (2 * g);
      const loop = hh > 2 * L;
      const thMax = loop ? Math.PI : Math.acos(1 - hh / L);
      const narrow = w < 560;
      const px = narrow ? w * 0.6 : w * 0.6, py = 26;
      const Lpx = Math.min(h * (loop ? 0.4 : 0.62), w * 0.38);
      const k = Lpx / L;
      const bw = 64, bh = 44;
      // dinámica
      if (st.ph === 'idle') { st.idle -= dt; if (st.idle <= 0) { st.ph = 'fly'; st.bx = 24; } }
      else if (st.ph === 'fly') {
        st.bx += 900 * dt;
        if (st.bx >= px - bw / 2) { st.ph = 'swing'; st.om = v2 / L; st.th = 0; st.t = 0; }
      } else if (st.ph === 'swing') {
        const n = 8;
        for (let i = 0; i < n; i++) { const d = dt / n; st.om += -(g / L) * Math.sin(st.th) * d; st.th += st.om * d; }
        st.t += dt;
        if (st.t > 7) { s.reset(); st.idle = 0.4; }
      }
      // marco de referencia
      line(ctx, px - 70, py, px + 70, py, C.muted, 3);
      const restY = py + Lpx;
      line(ctx, px - Lpx - 10, restY, px + Lpx + bw, restY, C.line, 1, [4, 4]);
      if (!loop) {
        const yMax = restY - hh * k;
        const hx = px - bw / 2 - 40;
        line(ctx, hx - 10, yMax, px + Math.sin(thMax) * Lpx + bw / 2, yMax, alpha(C.en, 0.8), 1.2, [5, 4]);
        arrow(ctx, hx, restY, hx, yMax, C.en, 1.8, 7);
        text(ctx, `h = ${fmt(hh * 100, 1)} cm`, hx - 8, Math.min(restY - 10, (restY + yMax) / 2), { col: C.en, size: 11, align: 'right' });
      } else text(ctx, 'v₂ alcanza para dar la vuelta completa', px, restY + bh + 16, { col: C.force, size: 11.5, align: 'center' });
      // péndulo
      const th = st.ph === 'swing' ? st.th : 0;
      const ex = px + Math.sin(th) * Lpx, ey = py + Math.cos(th) * Lpx;
      line(ctx, px - 14, py, ex - 14 * Math.cos(th), ey + 14 * Math.sin(th), C.ink, 1.5);
      line(ctx, px + 14, py, ex + 14 * Math.cos(th), ey - 14 * Math.sin(th), C.ink, 1.5);
      if (st.ph === 'swing') { st.trail.push([ex, ey]); if (st.trail.length > 90) st.trail.shift(); }
      ctx.save(); ctx.strokeStyle = alpha(C.lin, 0.35); ctx.lineWidth = 2; ctx.beginPath();
      st.trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y + bh / 2) : ctx.moveTo(x, y + bh / 2)); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(-th);
      rrect(ctx, -bw / 2, 0, bw, bh, 5); ctx.fillStyle = alpha(C.rot, 0.35); ctx.fill(); ctx.strokeStyle = C.rot; ctx.lineWidth = 2; ctx.stroke();
      text(ctx, `M = ${fmt(M, 1)} kg`, 0, bh / 2, { col: C.ink, size: 10.5, align: 'center' });
      if (st.ph === 'swing') { ctx.fillStyle = C.lin; ctx.fillRect(-bw / 2 + 4, bh / 2 - 2, 10, 4); }
      ctx.restore();
      if (st.ph === 'fly' || st.ph === 'idle') {
        const bxx = st.ph === 'fly' ? st.bx : 24;
        ctx.fillStyle = C.lin; rrect(ctx, bxx - 12, restY + bh / 2 - 3, 14, 6, 3); ctx.fill();
        if (st.ph === 'fly') for (let i = 1; i < 6; i++) line(ctx, bxx - 12 - i * 9, restY + bh / 2, bxx - 16 - i * 9, restY + bh / 2, alpha(C.lin, 0.6 - i * 0.1), 1.5);
        text(ctx, `bala ${s.p.m} g → ${v1} m/s`, 16, restY + bh / 2 - 18, { col: C.lin, size: 11 });
      }
      if (st.ph === 'swing' && st.t < 0.5) arrow(ctx, ex + bw / 2 + 6, ey + bh / 2, ex + bw / 2 + 6 + 50, ey + bh / 2, C.lin, 2.5);
      // etapas
      const lab = st.ph === 'swing' ? (st.t < 0.35 ? '2 · justo después del choque: se conservó p' : '2 → 3 · se conserva la energía mecánica') : '1 · antes del choque';
      text(ctx, lab, 16, h - 18, { col: C.muted, size: 11.5 });
      s.out('v2', fmt(v2, 2) + ' m/s'); s.out('h', loop ? '> 2L' : fmt(hh * 100, 1) + ' cm');
      s.out('th', loop ? '360°' : fmt(thMax * 180 / Math.PI, 1) + '°'); s.out('loss', fmt(100 * M / (m + M), 2) + ' %');
    }
  });

  // ---------------- Choque oblicuo (billar) ----------------
  new Sim('s-billar', {
    init(s) { Object.assign(s.st, { ph: 'go', t: 0, A: null, B: null }); },
    change(s) { s.reset(); },
    frame(s, ctx, w, h, dt) {
      const st = s.st, narrow = w < 560;
      const tw = narrow ? w : w * 0.64, R = Math.min(tw, h) * 0.045;
      const thh = narrow ? h * 0.58 : h;
      const by0 = narrow ? thh * 0.5 : h * 0.5, bx0 = tw * 0.52;
      const off = s.p.b * 2 * R, vpx = Math.max(160, tw * 0.45);
      if (!st.A) { st.A = { x: 26 + R, y: by0 - off, vx: vpx, vy: 0 }; st.B = { x: bx0, y: by0, vx: 0, vy: 0 }; st.hit = false; st.trA = []; st.trB = []; }
      const A = st.A, B = st.B;
      if (st.ph === 'go' && dt > 0) {
        st.t += dt;
        [A, B].forEach(o => { o.x += o.vx * dt; o.y += o.vy * dt; });
        if (!st.hit) {
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
          if (d <= 2 * R) {
            const nx = dx / d, ny = dy / d, vn = A.vx * nx + A.vy * ny;
            B.vx = vn * nx; B.vy = vn * ny; A.vx -= vn * nx; A.vy -= vn * ny; st.hit = true; st.hp = [A.x, A.y, B.x, B.y];
          }
        }
        if (st.t % 0.04 < dt) { st.trA.push([A.x, A.y]); st.trB.push([B.x, B.y]); }
        const out = o => o.x < -R || o.x > tw + R || o.y < -R || o.y > thh + R;
        if ((st.hit && (out(A) || Math.hypot(A.vx, A.vy) < 1) && out(B)) || st.t > 6) { st.ph = 'wait'; st.t = 0; }
      } else if (st.ph === 'wait') { st.t += dt; if (st.t > 0.8) s.reset(); }
      // mesa
      ctx.fillStyle = alpha(C.en, 0.08); ctx.fillRect(0, 0, tw, thh);
      line(ctx, 0, by0 - off, bx0, by0 - off, alpha(C.lin, 0.3), 1, [3, 5]);
      const trail = (tr, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([2, 5]); ctx.beginPath(); tr.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); };
      trail(st.trA, alpha(C.lin, 0.5)); trail(st.trB, alpha(C.alt, 0.5));
      if (st.hp) { circle(ctx, st.hp[0], st.hp[1], R, null, alpha(C.lin, 0.3), 1.5); line(ctx, st.hp[0], st.hp[1], st.hp[2], st.hp[3], alpha(C.ink, 0.35), 1, [2, 3]); }
      circle(ctx, B.x, B.y, R, C.alt); text(ctx, 'B', B.x, B.y, { col: C.surface, size: 11, weight: 700, align: 'center' });
      circle(ctx, A.x, A.y, R, C.lin); text(ctx, 'A', A.x, A.y, { col: C.surface, size: 11, weight: 700, align: 'center' });
      // diagrama vectorial
      const phi = Math.asin(clamp(s.p.b, 0, 0.999));
      const ox = narrow ? 40 : tw + 30, oy = narrow ? h * 0.95 : h * 0.62;
      const Lv = narrow ? Math.min(w - 80, (oy - thh - 24) * 2) : w - tw - 60;
      const vB = Math.cos(phi), vA = Math.sin(phi);
      text(ctx, 'p_A1 = p_A2 + p_B2', ox, oy - Lv * 0.5 - 12, { col: C.muted, size: 11 });
      arrow(ctx, ox, oy, ox + Lv, oy, C.ink, 2.5);
      text(ctx, 'p_A1', ox + Lv / 2, oy + 14, { col: C.ink, size: 10.5, align: 'center' });
      // A2: perpendicular a B2, hacia arriba
      const ax2 = ox + Lv * vA * Math.sin(phi), ay2 = oy - Lv * vA * Math.cos(phi);
      if (vA > 0.01) { arrow(ctx, ox, oy, ax2, ay2, C.lin, 2.5); text(ctx, 'p_A2', (ox + ax2) / 2 - 12, (oy + ay2) / 2 - 8, { col: C.lin, size: 10.5, align: 'right' }); }
      arrow(ctx, ax2, ay2, ox + Lv, oy, C.alt, 2.5);
      text(ctx, 'p_B2', (ax2 + ox + Lv) / 2 + 8, (ay2 + oy) / 2 - 8, { col: C.alt, size: 10.5 });
      if (vA > 0.05 && vB > 0.05) {
        const ux = (ox - ax2), uy = (oy - ay2), ul = Math.hypot(ux, uy), vx = (ox + Lv - ax2), vy = (oy - ay2), vl = Math.hypot(vx, vy), q = 9;
        ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(ax2 + ux / ul * q, ay2 + uy / ul * q); ctx.lineTo(ax2 + ux / ul * q + vx / vl * q, ay2 + uy / ul * q + vy / vl * q); ctx.lineTo(ax2 + vx / vl * q, ay2 + vy / vl * q); ctx.stroke(); ctx.restore();
      }
      const aDeg = 90 - phi * 180 / Math.PI, bDeg = phi * 180 / Math.PI;
      s.out('a', vA > 0.01 ? fmt(aDeg, 1) + '°' : 'A queda quieta'); s.out('b', fmt(bDeg, 1) + '°'); s.out('s', vA > 0.01 ? fmt(aDeg + bDeg, 1) + '°' : '—');
    }
  });
})();
