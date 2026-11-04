/* "This way": a pseudo-3D climb up curving stone stairs through a mossy
   forest. Scroll position drives the camera; the last stretch opens up
   onto the Sarangkot view over Phewa lake and Machhapuchhre. */
(function () {
  const S = window.Scenery;
  const cvs = document.getElementById("trail-scene");
  const ctx = cvs.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- world ---------- */
  const R = 0.42; // rise per step
  const HW = 1.1; // half-width of the trail
  const EYE = 1.8;
  const TOTAL = 150; // last stair
  const ALT0 = 822; // Phewa lakeside (m)
  const ALT1 = 1592; // Sarangkot (m)

  let W, H, DPR, F, HOR, VIEW;
  let camX = 0, camY = EYE, camZ = 0;

  const bend = (z) => 2.6 * Math.sin(z * 0.045) + 1.2 * Math.sin(z * 0.12 + 1.3);
  const forestness = (z) => 1 - S.smooth(TOTAL - 34, TOTAL - 6, z);
  const stairTop = (k) => Math.max(0, Math.min(k, TOTAL)) * R;
  const gY = (z) => (Math.min(Math.max(z, 0.5), TOTAL + 0.5) - 0.5) * R;
  const rise = (d, z) => d * 0.2 * (0.2 + 0.8 * forestness(z));

  /* ---------- palette ---------- */
  const C = {
    fogForest: S.hex("#b7c9bc"),
    rocks: [S.hex("#8a8172"), S.hex("#7a7468"), S.hex("#958a76"), S.hex("#6f6a5f"), S.hex("#847a66")],
    root: S.hex("#4a3424"),
    fogOpen: S.hex("#d9e3e3"),
    dirt: S.hex("#6e5437"),
    litter: S.hex("#4d5a2c"),
    floor: S.hex("#3a4a26"),
    floorFar: S.hex("#2e3e22"),
    grass: S.hex("#7aa04a"),
    grass2: S.hex("#628c3e"),
    tread: S.hex("#8e887b"),
    riser: S.hex("#57534a"),
    moss: S.hex("#5f8a33"),
    trunk: S.hex("#3b2a1e"),
    trunkLit: S.hex("#6a5440"),
    leaf: S.hex("#1f4228"),
    leafLit: S.hex("#3d6b36"),
    pine: S.hex("#1b3a26"),
    fern: S.hex("#4f8a35"),
    rock: S.hex("#7d786d"),
    white: S.hex("#efe9dc"),
    gold: S.hex("#d9a531"),
    bamboo: S.hex("#8a6a3e"),
  };
  let fogC = C.fogForest;
  const fogAt = (dz) => 1 - Math.exp(-dz / 9);
  const col = (c, dz, k) => S.rgb(S.mix(k ? S.mix(c, [0, 0, 0], k) : c, fogC, fogAt(dz)));

  /* ---------- scatter objects along the trail (deterministic) ---------- */
  const objs = [];
  const steps = [];
  (function build() {
    const rnd = S.rng(20251103);
    const mkRock = (u0, u1, zf0, zb0, h) => ({
      u0, u1, zf0, zb0, h,
      tone: 0.82 + rnd() * 0.3,
      hue: (rnd() * C.rocks.length) | 0,
      moss: rnd() < 0.55,
      crack: rnd() < 0.35,
      r: 0.05 + rnd() * 0.07,
      j: [rnd(), rnd(), rnd(), rnd(), rnd(), rnd()],
    });
    for (let k = 0; k < TOTAL + 45; k++) {
      const list = [];
      const f = forestness(k);
      for (const side of [-1, 1]) {
        // sparse: roughly one tree every other step per side, set back from the trail
        const n = rnd() < 0.42 * f ? 1 : 0;
        for (let i = 0; i < n; i++) {
          const d = 1.4 + rnd() * rnd() * 11;
          const gurans = k > TOTAL * 0.5 && k < TOTAL * 0.85 && rnd() < 0.4;
          list.push({
            type: gurans ? "gurans" : rnd() < 0.35 ? "pine" : "broad",
            z: k + rnd(),
            side,
            d,
            h: gurans ? 4 + rnd() * 2 : 10 + rnd() * 8,
            r: gurans ? 0.17 : 0.2 + rnd() * 0.28,
            seed: rnd() * 1000,
            vine: rnd() < 0.7,
          });
        }
        const m = 2 + ((rnd() * 3) | 0);
        for (let i = 0; i < m; i++) {
          const r = rnd();
          list.push({
            type: r < 0.5 ? "fern" : r < 0.75 ? "rock" : "flower",
            z: k + rnd(),
            side,
            d: 0.08 + rnd() * 3.2,
            s: 0.3 + rnd() * 0.5,
            seed: rnd() * 1000,
          });
        }
      }
      objs.push(list);
      // each step is a row of rough, uneven rocks; some stretches are just
      // packed dirt with a stone or two poking through
      const dirt = S.hash(Math.floor(k / 9) * 3.7 + 1) < 0.35;
      const rocks = [];
      if (dirt) {
        const n = rnd() < 0.55 ? 1 : 2;
        for (let i = 0; i < n; i++) {
          const c = -0.75 + rnd() * 1.5;
          const w = 0.12 + rnd() * 0.22;
          const z0 = 0.2 + rnd() * 0.4;
          rocks.push(mkRock(c - w, c + w, z0, z0 + 0.2 + rnd() * 0.2, 0.02 + rnd() * 0.06));
        }
      } else {
        let u = -1.1 - rnd() * 0.06;
        while (u < 0.98) {
          const u1 = Math.min(1.1, u + 0.32 + rnd() * 0.5);
          rocks.push(mkRock(u, u1, rnd() * 0.14, 0.55 + rnd() * 0.42, -0.05 + rnd() * 0.12));
          u = u1 + 0.05 + rnd() * 0.12;
        }
      }
      const pebbles = [];
      for (let i = 0; i < 4; i++) pebbles.push([rnd() * 2 - 1, rnd(), 0.02 + rnd() * 0.04]);
      steps.push({ dirt, rocks, pebbles });
    }
    [4, 22, 44, 70, 96, 122, 147].forEach((k) => objs[k].push({ type: "flags", z: k + 0.5, k }));
    objs[30].push({ type: "chorten", z: 30.5, side: 1, d: 1.4 });
    objs[84].push({ type: "chorten", z: 84.5, side: -1, d: 1.6 });
    objs[58].push({ type: "chautari", z: 58.5, side: -1, d: 2.2 });
    objs[112].push({ type: "chautari", z: 112.5, side: 1, d: 2.4 });
    objs.forEach((l) => l.sort((a, b) => b.z - a.z));
  })();

  /* ---------- projection ---------- */
  function P(x, y, z) {
    const dz = Math.max(z - camZ, 0.12);
    const s = F / dz;
    return [W / 2 + (x - camX) * s, HOR - (y - camY) * s, s];
  }
  function quad(a, b, c, d, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.lineTo(d[0], d[1]);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- background: forest mist, or sky + mountains near the top ---------- */
  function background(t) {
    const open = 1 - forestness(camZ + 20);
    S.sky(ctx, 0, 0, W, H, [
      [0, "#5f86b0"],
      [0.45, "#bcd3df"],
      [1, S.rgb(fogC)],
    ]);
    if (open > 0.01) {
      const sy = P(bend(TOTAL + 8), stairTop(TOTAL), TOTAL + 8)[1];
      const mw = Math.max(W * 1.2, H * 1.3);
      ctx.save();
      ctx.globalAlpha = open;
      S.himalaya(ctx, W / 2 - mw / 2 - (camX - bend(TOTAL)) * 20, mw, sy + H * 0.02, H * 0.3, {
        glow: "rgba(255,190,140,.5)",
        haze: S.rgb(fogC, 0.95),
      });
      ctx.restore();
    }
    const fb = 1 - open;
    if (fb > 0.01) {
      ctx.save();
      ctx.globalAlpha = fb;
      // pale sky glimpsed through the canopy, melting into fog
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#8fb0c8");
      g.addColorStop(0.16, "#c4d4d8");
      g.addColorStop(0.32, S.rgb(fogC));
      g.addColorStop(1, S.rgb(fogC));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      S.clouds(ctx, W, H * 0.1, t * 1.5 + camZ * 2, 9, 6, "rgba(255,255,255,.75)", Math.min(1.2, W / 900) + 0.3);
      // soft fog banks drifting across
      for (let i = 0; i < 3; i++) {
        const y = HOR - H * (0.05 + i * 0.09);
        const fg = ctx.createLinearGradient(0, y - H * 0.08, 0, y + H * 0.08);
        fg.addColorStop(0, "rgba(255,255,255,0)");
        fg.addColorStop(0.5, `rgba(235,242,238,${0.35 - i * 0.08})`);
        fg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = fg;
        ctx.fillRect(0, y - H * 0.08, W, H * 0.16);
      }
      // ghostly far trunks, sparse
      for (let layer = 0; layer < 3; layer++) {
        const a = 0.1 + layer * 0.07;
        ctx.fillStyle = S.rgb(S.mix(fogC, [30, 55, 38], a + 0.1), 0.45);
        for (let i = 0; i < 8; i++) {
          const u = S.hash(i * 13 + layer * 101);
          const x = ((u * W * 1.6 - camX * (12 + layer * 14) - camZ * (layer + 1) * 3) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * 0.3;
          const w = (3 + S.hash(i + layer) * 10) * (layer + 1);
          ctx.fillRect(x, 0, w, HOR + H * 0.12);
        }
      }
      ctx.restore();
    }
  }

  /* ---------- one slice of trail: ground banks + stair ---------- */
  function slice(k) {
    const zf = Math.max(k, camZ + 0.12);
    const zb = k + 1;
    if (zb <= camZ + 0.12) return;
    const dz = (zf + zb) / 2 - camZ;
    const cf = bend(zf);
    const cb = bend(zb);
    const fo = forestness(k);
    const top = stairTop(k);
    const tone = (i) => 0.9 + 0.2 * S.hash(k * 3.1 + i);

    const strips = [
      [0, 0.5, S.mix(C.grass2, C.dirt, fo)],
      [0.5, 3, S.mix(C.grass, C.litter, fo)],
      [3, 8, S.mix(C.grass2, C.floor, fo)],
      [8, 30, S.mix(C.grass2, C.floorFar, fo)],
    ];
    for (const side of [-1, 1]) {
      for (let i = 0; i < strips.length; i++) {
        const [d0, d1, base] = strips[i];
        const y0f = i === 0 ? top : gY(zf) + rise(d0, zf);
        const y0b = i === 0 ? top : gY(zb) + rise(d0, zb);
        const a = P(cf + side * (HW + d0), y0f, zf);
        const b = P(cf + side * (HW + d1), gY(zf) + rise(d1, zf), zf);
        const c = P(cb + side * (HW + d1), gY(zb) + rise(d1, zb), zb);
        const d = P(cb + side * (HW + d0), y0b, zb);
        const tn = tone(i + side * 7);
        quad(a, b, c, d, col([base[0] * tn, base[1] * tn, base[2] * tn], dz));
      }
    }

    if (k >= 1 && k <= TOTAL) {
      const st = steps[k];
      const bot = stairTop(k - 1);
      const front = k >= camZ + 0.12;
      // earth face where the bank meets each step
      if (front) {
        for (const side of [-1, 1]) {
          const a = P(cf + side * HW, bot, k);
          const b = P(cf + side * HW, top, k);
          const c = P(cf + side * (HW + 0.5), gY(k) + rise(0.5, k), k);
          const d = P(cf + side * (HW + 0.5), bot, k);
          quad(a, b, c, d, col(S.mix(C.grass2, C.dirt, fo), dz, 0.25));
        }
        // packed-dirt riser under the rocks
        quad(P(cf - HW, bot, k), P(cf + HW, bot, k), P(cf + HW, top, k), P(cf - HW, top, k), col(C.dirt, dz, 0.3));
      }
      // dirt tread
      quad(P(cf - HW, top, zf), P(cf + HW, top, zf), P(cb + HW, top, zb), P(cb - HW, top, zb), col(C.dirt, dz, st.dirt ? -0.06 : 0.06));

      if (dz < 14) {
        // pebbles
        ctx.fillStyle = col(C.rocks[1], dz, -0.1);
        for (const p of st.pebbles) {
          const z = k + 0.15 + p[1] * 0.8;
          if (z < camZ + 0.3) continue;
          const q = P(bend(z) + p[0] * HW, top, z);
          ctx.beginPath();
          ctx.ellipse(q[0], q[1], p[2] * q[2], p[2] * q[2] * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // a root snaking over the lip of dirt steps
        if (st.dirt && front) {
          ctx.strokeStyle = col(C.root, dz);
          ctx.lineWidth = Math.max(1, P(cf, top, k)[2] * 0.035);
          ctx.beginPath();
          for (let i = 0; i <= 10; i++) {
            const u = -1 + i * 0.2;
            const q = P(cf + u * HW, top - 0.03 - Math.abs(Math.sin(u * 3 + k)) * 0.06, k + 0.02);
            i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
          }
          ctx.stroke();
        }
      }

      // rocks — outermost (relative to the camera) first so nearer ones overlap
      const rocks = st.rocks.slice().sort(
        (a, b) => Math.abs(cf + ((b.u0 + b.u1) / 2) * HW - camX) - Math.abs(cf + ((a.u0 + a.u1) / 2) * HW - camX)
      );
      for (const r of rocks) drawRock(r, k, top, bot, dz);
    } else if (k > TOTAL) {
      // dirt path across the summit meadow
      quad(P(cf - HW * 0.7, top, zf), P(cf + HW * 0.7, top, zf), P(cb + HW * 0.7, top, zb), P(cb - HW * 0.7, top, zb), col(C.dirt, dz, -0.15));
    }
  }

  /* ---------- rough stones ---------- */
  function smoothPath(pts) {
    const n = pts.length;
    ctx.beginPath();
    const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.closePath();
  }

  function drawRock(r, k, top, bot, dz) {
    const z0 = k + r.zf0;
    const z1 = k + r.zb0;
    if (z1 <= camZ + 0.2) return;
    const zc = (z) => Math.max(z, camZ + 0.12);
    const cx = bend(z0);
    const x0 = cx + r.u0 * HW;
    const x1 = cx + r.u1 * HW;
    const yT = top + r.h;
    const c = r.r;
    const j = r.j;
    const base = C.rocks[r.hue].map((v) => v * r.tone);
    // lumpy top outline (clockwise from front-left)
    const T = [
      [x0 + c * 2, yT + j[0] * 0.05, z0],
      [(x0 + x1) / 2, yT + 0.03 + j[1] * 0.04, z0 - 0.02],
      [x1 - c * 2, yT + j[2] * 0.05, z0],
      [x1 + 0.02, yT - 0.03, z0 + c * 2.5],
      [x1 - j[3] * 0.06, yT - 0.05, z1 - c],
      [(x0 + x1) / 2, yT - 0.04, z1 + 0.02],
      [x0 + j[4] * 0.06, yT - 0.05, z1 - c],
      [x0 - 0.02, yT - 0.03, z0 + c * 2.5],
    ].map((p) => P(p[0], p[1], zc(p[2])));

    // front face, dropping to the step below (or into the dirt for embedded stones)
    if (z0 >= camZ + 0.12) {
      const yb = r.zf0 > 0.15 ? top - 0.02 : bot;
      const B = [
        P(x1 + 0.02, yb, z0 + c * 2.5),
        P(x1 - c * 2.5, yb - 0.02, z0 + 0.02),
        P((x0 + x1) / 2, yb - 0.03, z0 + 0.02),
        P(x0 + c * 2.5, yb - 0.02, z0 + 0.02),
        P(x0 - 0.02, yb, z0 + c * 2.5),
      ];
      // angular, chipped face
      const face = [T[7], T[0], T[1], T[2], T[3]].concat(B);
      ctx.beginPath();
      face.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = col(base, dz, 0.34);
      ctx.fill();
      // lit facet on the left, darker chip on the right
      const mx = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      ctx.beginPath();
      [T[7], T[0], mx(T[0], T[1], 0.5 + j[1] * 0.4), mx(B[3], B[2], j[2] * 0.6), B[4]].forEach((p, i) =>
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])
      );
      ctx.closePath();
      ctx.fillStyle = col(base, dz, 0.18);
      ctx.fill();
      ctx.beginPath();
      [T[3], B[0], B[1], mx(T[2], B[1], 0.45 + j[4] * 0.3)].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = col(base, dz, 0.5);
      ctx.fill();
    }
    // top
    smoothPath(T);
    ctx.fillStyle = col(base, dz);
    ctx.fill();
    // worn, lighter front lip
    ctx.strokeStyle = col(base, dz, -0.18);
    ctx.lineWidth = Math.max(0.6, T[1][2] * 0.018);
    ctx.beginPath();
    ctx.moveTo((T[7][0] + T[0][0]) / 2, (T[7][1] + T[0][1]) / 2);
    ctx.quadraticCurveTo(T[0][0], T[0][1], (T[0][0] + T[1][0]) / 2, (T[0][1] + T[1][1]) / 2);
    ctx.quadraticCurveTo(T[1][0], T[1][1], (T[1][0] + T[2][0]) / 2, (T[1][1] + T[2][1]) / 2);
    ctx.quadraticCurveTo(T[2][0], T[2][1], (T[2][0] + T[3][0]) / 2, (T[2][1] + T[3][1]) / 2);
    ctx.stroke();
    // moss on the back of the stone
    if (r.moss && forestness(k) > 0.2) {
      const mid = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      smoothPath([T[6], T[5], T[4], mid(T[4], T[2], 0.45 + j[5] * 0.3), mid(T[6], T[0], 0.4 + j[0] * 0.3)]);
      ctx.fillStyle = col(C.moss, dz, 0.05);
      ctx.fill();
    }
    if (r.crack && dz < 10) {
      ctx.strokeStyle = col(base, dz, 0.5);
      ctx.lineWidth = Math.max(0.5, T[1][2] * 0.01);
      const a = P(S.lerp(x0, x1, 0.3 + j[3] * 0.4), yT + 0.02, zc(z0 + 0.02));
      const b = P(S.lerp(x0, x1, 0.35 + j[2] * 0.3), yT - 0.02, zc(S.lerp(z0, z1, 0.6)));
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo((a[0] + b[0]) / 2 + 3, (a[1] + b[1]) / 2);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }

  /* ---------- objects ---------- */
  function drawTree(o, b, s, dz, t) {
    const top = b[1] - o.h * s;
    const w0 = o.r * 2 * s;
    const w1 = w0 * 0.55;
    const sway = reduce ? 0 : Math.sin(t * 0.7 + o.seed) * 0.08 * s;
    // trunk
    ctx.fillStyle = col(C.trunk, dz);
    ctx.beginPath();
    ctx.moveTo(b[0] - w0 * 0.75, b[1]);
    ctx.quadraticCurveTo(b[0] - w0 * 0.45, b[1] - o.h * s * 0.15, b[0] - w1 / 2 + sway, top);
    ctx.lineTo(b[0] + w1 / 2 + sway, top);
    ctx.quadraticCurveTo(b[0] + w0 * 0.45, b[1] - o.h * s * 0.15, b[0] + w0 * 0.75, b[1]);
    ctx.fill();
    // light side facing the path
    ctx.fillStyle = col(C.trunkLit, dz);
    const lx = -o.side;
    ctx.beginPath();
    ctx.moveTo(b[0] + lx * w0 * 0.1, b[1]);
    ctx.lineTo(b[0] + lx * w0 * 0.42, b[1]);
    ctx.lineTo(b[0] + lx * w1 * 0.4 + sway, top);
    ctx.lineTo(b[0] + lx * w1 * 0.05 + sway, top);
    ctx.fill();
    // climbing vine
    if (o.vine && dz < 20) {
      ctx.strokeStyle = col(C.moss, dz);
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const u = i / 16;
        const y = b[1] - u * o.h * s * 0.75;
        const x = b[0] + Math.sin(u * 14 + o.seed) * w0 * 0.45 + sway * u;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    // foliage
    if (o.type === "pine") {
      ctx.fillStyle = col(C.pine, dz);
      for (let i = 0; i < 6; i++) {
        const y = top + o.h * s * (0.08 + i * 0.1);
        const hw = s * (0.7 + i * 0.35);
        ctx.beginPath();
        ctx.moveTo(b[0] - hw + sway, y);
        ctx.lineTo(b[0] + sway, y - s * 1.6);
        ctx.lineTo(b[0] + hw + sway, y);
        ctx.fill();
      }
    } else {
      const n = o.type === "gurans" ? 6 : 7;
      const spread = o.type === "gurans" ? 1.5 : 2.4;
      const leaf = o.type === "gurans" ? S.mix(C.leaf, [40, 70, 35], 0.3) : C.leaf;
      ctx.fillStyle = col(leaf, dz);
      for (let i = 0; i < n; i++) {
        const cx = b[0] + (S.hash(o.seed + i) - 0.5) * spread * 2 * s + sway;
        const cy = top + (S.hash(o.seed + i * 2.7) - 0.5) * spread * s;
        ctx.beginPath();
        ctx.arc(cx, cy, (0.9 + S.hash(o.seed + i * 5.3)) * s * (spread / 2.2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = col(C.leafLit, dz);
      for (let i = 0; i < 3; i++) {
        const cx = b[0] + (S.hash(o.seed + i * 9) - 0.5) * spread * s + sway;
        const cy = top - spread * 0.4 * s + (S.hash(o.seed + i * 4) - 0.5) * s;
        ctx.beginPath();
        ctx.arc(cx, cy, 0.6 * s * (spread / 2.2), 0, Math.PI * 2);
        ctx.fill();
      }
      if (o.type === "gurans") {
        ctx.fillStyle = col(S.hex("#d8283a"), dz);
        for (let i = 0; i < 22; i++) {
          const cx = b[0] + (S.hash(o.seed + i * 1.9) - 0.5) * spread * 2.4 * s + sway;
          const cy = top + (S.hash(o.seed + i * 3.3) - 0.5) * spread * 1.4 * s;
          ctx.beginPath();
          ctx.arc(cx, cy, 0.16 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // vines dangling from the canopy
    if (o.vine && dz < 18 && o.type !== "pine") {
      const strands = 2 + ((o.seed * 7) % 3 | 0);
      for (let i = 0; i < strands; i++) {
        const sx = b[0] + (S.hash(o.seed + i * 3.3) - 0.5) * 3.6 * s + sway;
        const len = (2.5 + S.hash(o.seed + i * 8.1) * 4) * s;
        const sy = top + 0.4 * s;
        ctx.strokeStyle = col(S.hex("#2f5a2a"), dz);
        ctx.lineWidth = Math.max(0.8, s * 0.035);
        ctx.beginPath();
        const pts = [];
        for (let jj = 0; jj <= 12; jj++) {
          const v = jj / 12;
          const x = sx + Math.sin(v * 4 + o.seed + i) * 0.15 * s + (reduce ? 0 : Math.sin(t * 0.9 + o.seed + i) * 0.25 * s * v);
          const y = sy + v * len;
          pts.push([x, y]);
          jj ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        if (dz < 12) {
          ctx.fillStyle = col(S.hex("#4a8238"), dz);
          for (let jj = 2; jj < pts.length; jj += 2) {
            const dir = jj % 4 ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(pts[jj][0] + dir * 0.09 * s, pts[jj][1], 0.11 * s, 0.05 * s, dir * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  function drawObj(o, t) {
    const dz = o.z - camZ;
    if (dz < 0.3 || dz > VIEW) return;
    const isTree = o.type === "pine" || o.type === "broad" || o.type === "gurans";
    if (!isTree && o.type !== "flags" && o.type !== "chautari" && o.type !== "chorten" && dz > 18) return;

    if (o.type === "flags") {
      const c = bend(o.z);
      const y = stairTop(o.k);
      const l0 = P(c - HW - 0.3, y, o.z), l1 = P(c - HW - 0.3, y + 3.3, o.z);
      const r0 = P(c + HW + 0.3, y, o.z), r1 = P(c + HW + 0.3, y + 3.4, o.z);
      ctx.strokeStyle = col(C.bamboo, dz);
      ctx.lineWidth = Math.max(1, l0[2] * 0.07);
      ctx.beginPath();
      ctx.moveTo(l0[0], l0[1]);
      ctx.lineTo(l1[0], l1[1]);
      ctx.moveTo(r0[0], r0[1]);
      ctx.lineTo(r1[0], r1[1]);
      ctx.stroke();
      S.flags(ctx, l1[0], l1[1], r1[0], r1[1], l1[2] * 0.6, t, l1[2] * 0.3, 1 - fogAt(dz) * 0.75);
      return;
    }

    const x = bend(o.z) + o.side * (HW + o.d);
    const y = gY(o.z) + rise(o.d, o.z);
    const b = P(x, y, o.z);
    const s = b[2];
    if (b[0] < -s * 5 || b[0] > W + s * 5) return;

    if (isTree) return drawTree(o, b, s, dz, t);

    if (o.type === "fern") {
      const sway = reduce ? 0 : Math.sin(t * 1.3 + o.seed) * 0.05 * s;
      ctx.strokeStyle = col(S.mix(C.fern, C.grass, 1 - forestness(o.z)), dz);
      ctx.lineWidth = Math.max(1, s * 0.035);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.42;
        const L = o.s * s * (0.8 + S.hash(o.seed + i) * 0.5);
        ctx.moveTo(b[0], b[1]);
        ctx.quadraticCurveTo(b[0] + Math.cos(a) * L * 0.5, b[1] + Math.sin(a) * L * 0.8, b[0] + Math.cos(a) * L + sway, b[1] + Math.sin(a) * L * 0.55);
      }
      ctx.stroke();
    } else if (o.type === "rock") {
      ctx.fillStyle = col(C.rock, dz, 0.15);
      ctx.beginPath();
      ctx.ellipse(b[0], b[1] - o.s * s * 0.18, o.s * s * 0.5, o.s * s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col(C.moss, dz);
      ctx.beginPath();
      ctx.ellipse(b[0] - o.s * s * 0.1, b[1] - o.s * s * 0.36, o.s * s * 0.3, o.s * s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.type === "flower") {
      ctx.strokeStyle = col(C.fern, dz);
      ctx.lineWidth = Math.max(1, s * 0.02);
      ctx.beginPath();
      ctx.moveTo(b[0], b[1]);
      ctx.lineTo(b[0], b[1] - o.s * s * 0.6);
      ctx.stroke();
      ctx.fillStyle = col(S.hex(["#e0303f", "#f2c230", "#f4efe6", "#b86bd6"][(o.seed | 0) % 4]), dz);
      ctx.beginPath();
      ctx.arc(b[0], b[1] - o.s * s * 0.62, Math.max(1, s * 0.03), 0, Math.PI * 2);
      ctx.fill();
    } else if (o.type === "chorten") {
      const wc = col(C.white, dz);
      ctx.fillStyle = col(C.white, dz, 0.18);
      ctx.fillRect(b[0] - 0.7 * s, b[1] - 0.5 * s, 1.4 * s, 0.5 * s);
      ctx.fillStyle = wc;
      ctx.fillRect(b[0] - 0.55 * s, b[1] - 0.85 * s, 1.1 * s, 0.35 * s);
      ctx.beginPath();
      ctx.arc(b[0], b[1] - 0.85 * s, 0.45 * s, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(b[0] - 0.18 * s, b[1] - 1.5 * s, 0.36 * s, 0.25 * s);
      ctx.fillStyle = col(C.gold, dz);
      ctx.beginPath();
      ctx.moveTo(b[0] - 0.14 * s, b[1] - 1.5 * s);
      ctx.lineTo(b[0], b[1] - 2.3 * s);
      ctx.lineTo(b[0] + 0.14 * s, b[1] - 1.5 * s);
      ctx.fill();
      ctx.fillStyle = col(S.hex("#3d3a5a"), dz);
      ctx.fillRect(b[0] - 0.12 * s, b[1] - 1.42 * s, 0.08 * s, 0.05 * s);
      ctx.fillRect(b[0] + 0.04 * s, b[1] - 1.42 * s, 0.08 * s, 0.05 * s);
    } else if (o.type === "chautari") {
      // two-tier stone resting platform with a big pipal tree
      const st = col(C.tread, dz, 0.1);
      ctx.fillStyle = st;
      ctx.fillRect(b[0] - 1.7 * s, b[1] - 0.55 * s, 3.4 * s, 0.55 * s);
      ctx.fillStyle = col(C.tread, dz);
      ctx.fillRect(b[0] - 1.3 * s, b[1] - 1.0 * s, 2.6 * s, 0.45 * s);
      ctx.strokeStyle = col([60, 56, 48], dz);
      ctx.lineWidth = Math.max(0.5, s * 0.03);
      ctx.beginPath();
      for (let i = -3; i <= 3; i++) {
        ctx.moveTo(b[0] + i * 0.5 * s, b[1]);
        ctx.lineTo(b[0] + i * 0.5 * s, b[1] - 0.55 * s);
      }
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(b[0] + (i * 0.55 + 0.27) * s, b[1] - 0.55 * s);
        ctx.lineTo(b[0] + (i * 0.55 + 0.27) * s, b[1] - 1.0 * s);
      }
      ctx.stroke();
      drawTree(
        { type: "broad", side: o.side, h: 9, r: 0.55, seed: o.z * 11, vine: true },
        [b[0], b[1] - 1.0 * s],
        s,
        dz,
        t
      );
    }
  }

  /* ---------- screen-space foreground: vines, canopy, light, motes ---------- */
  const VINES = 12;
  function overlays(t) {
    const fo = forestness(camZ + 4);
    if (fo > 0.01) {
      // light shafts
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const x = W * (0.15 + i * 0.25) + Math.sin(t * 0.1 + i) * 20 - camX * 6;
        const g = ctx.createLinearGradient(x, 0, x + W * 0.25, H);
        g.addColorStop(0, `rgba(255,236,180,${0.07 * fo})`);
        g.addColorStop(1, "rgba(255,236,180,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + W * 0.06, 0);
        ctx.lineTo(x + W * 0.32, H);
        ctx.lineTo(x + W * 0.18, H);
        ctx.fill();
      }
      ctx.restore();

      // motes / fireflies
      ctx.save();
      for (let i = 0; i < 45; i++) {
        const px = ((S.hash(i) * W + Math.sin(t * 0.3 + i) * 40 - camX * 15) % W + W) % W;
        const py = ((S.hash(i * 3) * H - t * (6 + S.hash(i * 7) * 10) + camZ * 25) % H + H) % H;
        const a = (0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i * 2))) * fo;
        ctx.fillStyle = `rgba(255,240,170,${a})`;
        ctx.beginPath();
        ctx.arc(px, py, 1 + S.hash(i * 9) * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // hanging vines that pass overhead as you climb
      for (let i = 0; i < VINES; i++) {
        const u = (((camZ * 0.22 + i / VINES) % 1) + 1) % 1;
        const a = fo * S.smooth(0, 0.25, u) * (1 - S.smooth(0.8, 1, u));
        if (a < 0.01) continue;
        const side = i % 2 ? 1 : -1;
        const sc = 0.5 + u * 1.6;
        const x0 = W / 2 + side * (W * 0.12 + u * W * 0.5) + (S.hash(i) - 0.5) * W * 0.1;
        const len = H * (0.18 + S.hash(i * 5) * 0.32) * sc;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#16301c";
        ctx.lineWidth = 2.2 * sc;
        ctx.beginPath();
        const pts = [];
        for (let j = 0; j <= 20; j++) {
          const v = j / 20;
          const sw = reduce ? 0 : Math.sin(t * 1.1 + i + v * 2) * 10 * sc * v;
          const x = x0 + Math.sin(v * 5 + i) * 6 * sc + sw;
          const y = -8 + v * len;
          pts.push([x, y]);
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        for (let j = 2; j < pts.length; j += 2) {
          const dir = j % 4 ? 1 : -1;
          ctx.fillStyle = j % 3 ? "#2c5a2c" : "#3f7a34";
          ctx.beginPath();
          ctx.ellipse(pts[j][0] + dir * 5 * sc, pts[j][1], 6 * sc, 2.8 * sc, dir * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // canopy overhead
      ctx.save();
      ctx.globalAlpha = fo;
      const cg = ctx.createLinearGradient(0, 0, 0, H * 0.25);
      cg.addColorStop(0, "rgba(10,24,14,.35)");
      cg.addColorStop(1, "rgba(10,24,14,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H * 0.25);
      // patchy — clumps mostly toward the edges, gaps let the sky through
      for (let i = 0; i < 24; i++) {
        const u = i / 23;
        const edge = Math.abs(u - 0.5) * 2;
        if (S.hash(i * 4.1) > 0.25 + edge * 0.75) continue;
        const x = u * W + Math.sin(t * 0.5 + i) * 4;
        const y = -H * 0.05 + S.hash(i * 2.2) * H * 0.06;
        ctx.fillStyle = i % 3 ? "#0f2617" : "#183a22";
        ctx.beginPath();
        ctx.arc(x, y, H * (0.05 + S.hash(i) * 0.05), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // vignette
    const vg = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.3, W / 2, H * 0.55, Math.max(W, H) * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(5,15,8,${0.45 * fo + 0.1})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------- loop ---------- */
  let target = 0, cur = 0;
  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? S.clamp(window.scrollY / max, 0, 1) : 0;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    F = Math.min(H * 0.95, W * 1.3);
    HOR = H * 0.58;
    VIEW = W < 700 ? 28 : 36;
    readScroll();
  }

  const altEl = document.getElementById("alt-m");
  const fillEl = document.querySelector(".altimeter__fill");
  const dotEl = document.querySelector(".altimeter__dot");
  let lastAlt = -1;

  let lastMs = 0;
  function frame(ms) {
    const t = reduce ? 3 : ms / 1000;
    const dt = Math.min(0.25, Math.max(0, (ms - lastMs) / 1000));
    lastMs = ms;
    cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
    if (Math.abs(target - cur) < 0.0001) cur = target;

    const climb = S.clamp(cur / 0.88, 0, 1);
    camZ = climb * (TOTAL - 5);
    const reveal = S.smooth(0.85, 0.97, cur);
    camY = camZ * R + EYE + (reduce ? 0 : Math.sin(camZ * Math.PI * 2) * 0.035);
    camX = (bend(camZ + 2) + bend(camZ + 6)) / 2;
    fogC = S.mix(C.fogForest, C.fogOpen, 1 - forestness(camZ + 10));

    if (reveal < 0.999) {
      background(t);
      const k0 = Math.max(0, Math.floor(camZ));
      for (let k = Math.min(k0 + VIEW, objs.length - 1); k >= k0; k--) {
        slice(k);
        const L = objs[k];
        for (let i = 0; i < L.length; i++) drawObj(L[i], t);
      }
      overlays(t);
    }
    if (reveal > 0.001) {
      ctx.save();
      ctx.globalAlpha = reveal;
      S.pokharaView(ctx, W, H, t);
      ctx.restore();
    }

    // altimeter
    const pr = S.clamp(cur / 0.97, 0, 1);
    const alt = Math.round(ALT0 + (ALT1 - ALT0) * pr);
    if (alt !== lastAlt) {
      lastAlt = alt;
      altEl.textContent = alt.toLocaleString();
      fillEl.style.height = pr * 100 + "%";
      dotEl.style.bottom = pr * 100 + "%";
    }
    requestAnimationFrame(frame);
  }

  /* ---------- section label + active nav ---------- */
  const sections = Array.from(document.querySelectorAll("[data-alt]"));
  const labelEl = document.getElementById("alt-label");
  const navLinks = Array.from(document.querySelectorAll(".topbar__nav a"));
  function updateSection() {
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top < window.innerHeight * 0.55) current = s;
    labelEl.textContent = current ? current.dataset.alt : "Phewa lakeside";
    const id = current && current.id;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
  }

  window.addEventListener("resize", resize);
  window.addEventListener(
    "scroll",
    () => {
      readScroll();
      updateSection();
    },
    { passive: true }
  );
  // smooth-scroll in-page links (CSS smooth scroll fights the canvas easing)
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", a.getAttribute("href"));
    })
  );

  resize();
  updateSection();
  cur = target;
  requestAnimationFrame(frame);
})();
