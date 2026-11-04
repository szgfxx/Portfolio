/* Shared 2D canvas painters for Pokhara scenery.
   Everything is procedural — no image assets needed. */
(function () {
  const S = {};
  const TAU = Math.PI * 2;

  /* ---------- math / color helpers ---------- */
  S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  S.lerp = (a, b, t) => a + (b - a) * t;
  S.smooth = (e0, e1, x) => {
    const t = S.clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  S.hash = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  S.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  S.hex = (h) => {
    h = h.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  S.mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  S.rgb = (c, a) =>
    a == null
      ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
      : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  S.FLAG_COLORS = ["#2f6fd0", "#f7f3ea", "#d4302b", "#2f9a4b", "#f2c230"];

  /* ---------- sky ---------- */
  S.sky = function (ctx, x, y, w, h, stops) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  };

  S.sun = function (ctx, x, y, r, core, glow) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    g.addColorStop(0, glow);
    g.addColorStop(1, "rgba(255,220,160,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  };

  S.clouds = function (ctx, W, y, t, seed, count, color, scale) {
    const r = S.rng(seed);
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const speed = 4 + r() * 8;
      const cw = (80 + r() * 140) * scale;
      const cx = ((r() * (W + cw * 2) + t * speed) % (W + cw * 2)) - cw;
      const cy = y + (r() - 0.5) * 60 * scale;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const px = cx + (j - 2) * cw * 0.22;
        const pr = cw * (0.16 + 0.1 * Math.sin(j * 1.7 + i));
        ctx.moveTo(px + pr, cy);
        ctx.arc(px, cy - pr * 0.3, pr, 0, TAU);
      }
      ctx.fill();
    }
  };

  /* ---------- Annapurna range, Machhapuchhre front & centre ---------- */
  // [x 0..1, height 0..1]
  // the range tapers down to nothing at both ends
  S.RANGE = [
    [0, 0.0], [0.03, 0.1], [0.06, 0.2], [0.09, 0.3], [0.13, 0.46], [0.18, 0.36], [0.23, 0.58], // Annapurna South
    [0.28, 0.44], [0.32, 0.5], [0.36, 0.36], [0.41, 0.44],
    // Machhapuchhre: concave flanks that taper out into long ridges
    [0.44, 0.5], [0.465, 0.6], [0.482, 0.74], [0.493, 0.88], [0.5, 1.0], [0.509, 0.9], [0.52, 0.82],
    [0.535, 0.68], [0.555, 0.58], [0.58, 0.52], [0.62, 0.5], [0.66, 0.66], // Annapurna III
    [0.7, 0.5], [0.75, 0.6], [0.79, 0.54], [0.83, 0.62], // Annapurna IV / II
    [0.87, 0.44], [0.91, 0.36], [0.94, 0.24], [0.97, 0.11], [1, 0.0],
  ];

  function rangePoints(x0, w, baseY, hgt) {
    const pts = [];
    const R = S.RANGE;
    for (let i = 0; i < R.length; i++) {
      pts.push([x0 + R[i][0] * w, baseY - R[i][1] * hgt, R[i][1]]);
      if (i < R.length - 1) {
        // jagged sub-ridges
        for (let j = 1; j < 3; j++) {
          const u = j / 3;
          const hx = S.lerp(R[i][0], R[i + 1][0], u);
          const hy = S.lerp(R[i][1], R[i + 1][1], u) + (S.hash(i * 7 + j) - 0.5) * 0.06;
          pts.push([x0 + hx * w, baseY - hy * hgt, hy]);
        }
      }
    }
    return pts;
  }

  S.himalaya = function (ctx, x0, w, baseY, hgt, o) {
    o = o || {};
    const snow = o.snow || "#f4f1ec";
    const shade = o.shade || "rgba(110,130,175,0.55)";
    const base = o.base || "#9aa7c2";
    const pts = rangePoints(x0, w, baseY, hgt);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, baseY + 2);
    pts.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(x0 + w, baseY + 2);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, baseY - hgt, 0, baseY);
    g.addColorStop(0, snow);
    g.addColorStop(0.55, snow);
    g.addColorStop(1, base);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();

    // shaded flanks: from each summit down to the next valley
    ctx.fillStyle = shade;
    for (let i = 1; i < pts.length - 1; i++) {
      if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1]) {
        let j = i + 1;
        while (j < pts.length - 1 && pts[j + 1][1] >= pts[j][1]) j++;
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        for (let k = i + 1; k <= j; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        // fold line runs from the valley back down-left so faces meet without stripes
        ctx.lineTo(S.lerp(pts[i][0], pts[j][0], 0.55), baseY);
        ctx.lineTo(S.lerp(pts[i][0], pts[j][0], 0.12), baseY);
        ctx.closePath();
        ctx.fill();
      }
    }
    // haze at the foot
    const hz = ctx.createLinearGradient(0, baseY - hgt * 0.45, 0, baseY);
    hz.addColorStop(0, "rgba(255,255,255,0)");
    hz.addColorStop(1, o.haze || "rgba(200,210,230,0.85)");
    ctx.fillStyle = hz;
    ctx.fillRect(x0, baseY - hgt * 0.45, w, hgt * 0.45 + 4);
    ctx.restore();

    // optional alpenglow tint
    if (o.glow) {
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = o.glow;
      ctx.beginPath();
      ctx.moveTo(x0, baseY);
      pts.forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.lineTo(x0 + w, baseY);
      ctx.fill();
      ctx.restore();
    }
  };

  /* ---------- short, faceted low-poly hills (lit left, shaded right) ---------- */
  S.humps = function (ctx, x0, x1, baseY, maxH, seed, light, dark, count, bottom) {
    const r = S.rng(seed);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        cx: S.lerp(x0, x1, (i + r() * 0.8) / count),
        w: (x1 - x0) * (1.6 + r() * 1.4) / count,
        h: maxH * (0.35 + r() * 0.65),
        jl: r(), jr: r(), sk: (r() - 0.5) * 0.3,
      });
    }
    list.sort((a, b) => b.h - a.h); // tallest at the back
    const L = S.hex(light), D = S.hex(dark);
    list.forEach((m, i) => {
      const t = i / Math.max(1, list.length - 1);
      const px = m.cx + m.sk * m.w, py = baseY - m.h;
      const lft = [m.cx - m.w / 2, baseY];
      const rgt = [m.cx + m.w / 2, baseY];
      const ml = [S.lerp(lft[0], px, 0.55), S.lerp(baseY, py, 0.62 + m.jl * 0.2)];
      const mr = [S.lerp(rgt[0], px, 0.55), S.lerp(baseY, py, 0.6 + m.jr * 0.2)];
      const yb = bottom || baseY + 2;
      ctx.fillStyle = S.rgb(S.mix(L, D, t * 0.25));
      ctx.beginPath();
      ctx.moveTo(lft[0], yb); ctx.lineTo(lft[0], baseY); ctx.lineTo(ml[0], ml[1]); ctx.lineTo(px, py); ctx.lineTo(px, yb);
      ctx.fill();
      ctx.fillStyle = S.rgb(S.mix(D, L, 0.15 - t * 0.1));
      ctx.beginPath();
      ctx.moveTo(px, yb); ctx.lineTo(px, py); ctx.lineTo(mr[0], mr[1]); ctx.lineTo(rgt[0], baseY); ctx.lineTo(rgt[0], yb);
      ctx.fill();
    });
  };

  /* ---------- rolling hills (forested ridges) ---------- */
  S.hillY = function (x, W, baseY, amp, seed) {
    const u = x / W;
    return (
      baseY -
      amp *
        (0.55 +
          0.28 * Math.sin(u * 5.1 + seed) +
          0.17 * Math.sin(u * 11.3 + seed * 2.1) +
          0.05 * Math.sin(u * 47 + seed * 3.3) +
          0.025 * Math.sin(u * 131 + seed))
    );
  };

  S.hills = function (ctx, W, baseY, amp, color, seed, bottom, topColor) {
    ctx.beginPath();
    ctx.moveTo(0, bottom);
    for (let x = 0; x <= W + 6; x += 6) ctx.lineTo(x, S.hillY(x, W, baseY, amp, seed));
    ctx.lineTo(W, bottom);
    ctx.closePath();
    if (topColor) {
      const g = ctx.createLinearGradient(0, baseY - amp, 0, baseY + amp);
      g.addColorStop(0, topColor);
      g.addColorStop(1, color);
      ctx.fillStyle = g;
    } else ctx.fillStyle = color;
    ctx.fill();
  };

  /* ---------- Tal Barahi temple on its island ---------- */
  S.taalBarahi = function (ctx, x, y, s) {
    // island
    ctx.fillStyle = "#2f5a3a";
    ctx.beginPath();
    ctx.ellipse(x, y, 34 * s, 7 * s, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#3d7046";
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(x + i * 9 * s, y - 4 * s - Math.abs(Math.sin(i * 1.3)) * 4 * s, 7 * s, 0, TAU);
      ctx.fill();
    }
    // pagoda
    const px = x + 4 * s;
    ctx.fillStyle = "#f2ede1";
    ctx.fillRect(px - 6 * s, y - 14 * s, 12 * s, 9 * s);
    ctx.fillStyle = "#7a2c1d";
    ctx.beginPath();
    ctx.moveTo(px - 11 * s, y - 13 * s);
    ctx.lineTo(px, y - 20 * s);
    ctx.lineTo(px + 11 * s, y - 13 * s);
    ctx.fill();
    ctx.fillStyle = "#f2ede1";
    ctx.fillRect(px - 4 * s, y - 22 * s, 8 * s, 4 * s);
    ctx.fillStyle = "#7a2c1d";
    ctx.beginPath();
    ctx.moveTo(px - 8 * s, y - 21 * s);
    ctx.lineTo(px, y - 27 * s);
    ctx.lineTo(px + 8 * s, y - 21 * s);
    ctx.fill();
    ctx.fillStyle = "#e8b23a";
    ctx.fillRect(px - 0.8 * s, y - 32 * s, 1.6 * s, 6 * s);
    ctx.beginPath();
    ctx.arc(px, y - 32 * s, 1.6 * s, 0, TAU);
    ctx.fill();
  };

  /* ---------- doonga boat ---------- */
  S.boat = function (ctx, x, y, s, color, t, rower) {
    const bob = Math.sin(t * 1.6 + x * 0.05) * 1.5 * s;
    const tilt = Math.sin(t * 1.2 + x * 0.03) * 0.04;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);
    if (rower !== false) {
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(-2 * s, -12 * s, 4 * s, 8 * s);
      ctx.beginPath();
      ctx.arc(0, -14 * s, 2.6 * s, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#5b3a22";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      const a = Math.sin(t * 2 + x) * 0.5;
      ctx.moveTo(0, -9 * s);
      ctx.lineTo(10 * s * Math.cos(a + 0.6), 4 * s + 3 * s * Math.sin(a));
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-22 * s, -6 * s);
    ctx.quadraticCurveTo(-18 * s, 1 * s, 0, 1.5 * s);
    ctx.quadraticCurveTo(18 * s, 1 * s, 22 * s, -6 * s);
    ctx.lineTo(18 * s, -3 * s);
    ctx.quadraticCurveTo(0, -1.5 * s, -18 * s, -3 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(-16 * s, -3.4 * s, 32 * s, 1 * s);
    ctx.restore();
    // ripple
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + 3 * s + bob * 0.3, 26 * s, 2.2 * s, 0, 0, TAU);
    ctx.stroke();
  };

  /* ---------- paraglider ---------- */
  S.paraglider = function (ctx, x, y, s, color) {
    ctx.strokeStyle = "rgba(40,40,40,.5)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, y - 14 * s);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 12 * s, y - 14 * s);
    ctx.moveTo(x - 4 * s, y - 17 * s);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 4 * s, y - 17 * s);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 14 * s, y - 13 * s);
    ctx.quadraticCurveTo(x, y - 24 * s, x + 14 * s, y - 13 * s);
    ctx.quadraticCurveTo(x, y - 19 * s, x - 14 * s, y - 13 * s);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x, y + 1.5 * s, 1.6 * s, 0, TAU);
    ctx.fill();
  };

  S.birds = function (ctx, x, y, s, t, n) {
    ctx.strokeStyle = "rgba(30,30,40,.55)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < n; i++) {
      const bx = x + i * 14 * s + Math.sin(t + i) * 4;
      const by = y + Math.abs(i - n / 2) * 6 * s + Math.sin(t * 1.3 + i) * 2;
      const f = Math.sin(t * 6 + i) * 3 * s;
      ctx.beginPath();
      ctx.moveTo(bx - 5 * s, by - f);
      ctx.quadraticCurveTo(bx - 2 * s, by - 2 * s, bx, by);
      ctx.quadraticCurveTo(bx + 2 * s, by - 2 * s, bx + 5 * s, by - f);
      ctx.stroke();
    }
  };

  S.houses = function (ctx, x0, x1, y0, y1, seed, s, n) {
    const r = S.rng(seed);
    const walls = ["#f3eadb", "#e9d9c0", "#f6e6a8", "#d9e4ec", "#f2c9b8", "#ffffff"];
    const roofs = ["#b8432f", "#3d6fa8", "#5a8a4a", "#8a3b6b", "#c98a2b", "#6b6b6b"];
    const list = [];
    for (let i = 0; i < n; i++) list.push([S.lerp(x0, x1, r()), S.lerp(y0, y1, r() * r()), r()]);
    list.sort((a, b) => a[1] - b[1]);
    list.forEach((h) => {
      const w = (4 + h[2] * 5) * s;
      const hh = (3 + r() * 5) * s;
      ctx.fillStyle = walls[(r() * walls.length) | 0];
      ctx.fillRect(h[0], h[1] - hh, w, hh);
      ctx.fillStyle = roofs[(r() * roofs.length) | 0];
      ctx.fillRect(h[0] - 0.5 * s, h[1] - hh - 1.4 * s, w + s, 1.6 * s);
    });
  };

  /* ---------- prayer flags on a string ---------- */
  S.flags = function (ctx, x1, y1, x2, y2, sag, t, size, alpha) {
    const n = Math.max(6, Math.floor(Math.hypot(x2 - x1, y2 - y1) / (size * 1.25)));
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(60,50,40,.7)";
    ctx.lineWidth = Math.max(1, size * 0.06);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = S.lerp(x1, x2, u);
      const y = S.lerp(y1, y2, u) + sag * 4 * u * (1 - u);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const x = S.lerp(x1, x2, u);
      const y = S.lerp(y1, y2, u) + sag * 4 * u * (1 - u);
      const fl = Math.sin(t * 3 + i * 0.9) * size * 0.18;
      ctx.fillStyle = S.FLAG_COLORS[i % 5];
      ctx.beginPath();
      ctx.moveTo(x - size * 0.42, y);
      ctx.lineTo(x + size * 0.42, y);
      ctx.lineTo(x + size * 0.42 + fl, y + size * 1.05);
      ctx.lineTo(x - size * 0.42 + fl, y + size * 1.05);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- Phewa lake outline (normalized) ---------- */
  S.phewaPath = function (ctx, W, x0, y0, w, h) {
    const P = (u, v) => [x0 + u * w, y0 + v * h];
    const pts = [
      P(0, 0.55), P(0.12, 0.22), P(0.3, 0.1), P(0.5, 0.18), P(0.68, 0.05),
      P(0.88, 0.2), P(1, 0.5), P(0.86, 0.78), P(0.62, 0.7), P(0.42, 0.95),
      P(0.2, 0.86), P(0.06, 0.8),
    ];
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (i === 0) ctx.moveTo(m[0], m[1]);
      else ctx.quadraticCurveTo(a[0], a[1], m[0], m[1]);
    }
    const a = pts[0];
    const b = pts[1];
    ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    ctx.closePath();
  };

  /* ---------- the full summit view: Sarangkot looking over Pokhara ---------- */
  S.pokharaView = function (ctx, W, H, t) {
    const portrait = H > W;
    S.sky(ctx, 0, 0, W, H * 0.6, [
      [0, "#355089"],
      [0.45, "#8fa3cf"],
      [0.8, "#f5c48e"],
      [1, "#ffe2b0"],
    ]);
    S.sun(ctx, W * 0.82, H * 0.3, Math.min(W, H) * 0.03, "#fff3d6", "rgba(255,226,170,.55)");
    S.clouds(ctx, W, H * 0.12, t, 11, 5, "rgba(255,255,255,.55)", Math.min(1, W / 900) + 0.3);

    const mw = Math.max(W * 1.05, H * 1.2);
    const mx = (W - mw) / 2 + (portrait ? -mw * 0.02 : 0);
    S.himalaya(ctx, mx, mw, H * 0.43, H * (portrait ? 0.2 : 0.27), {
      glow: "rgba(255,170,120,.6)",
      haze: "rgba(220,214,220,.9)",
      base: "#b6b8cc",
    });
    S.hills(ctx, W, H * 0.47, H * 0.06, "#7896a8", 2.2, H, "#91a9b8");
    S.hills(ctx, W, H * 0.53, H * 0.07, "#4c7a63", 5.4, H, "#5f8c6f");
    S.birds(ctx, W * 0.3 + Math.sin(t * 0.1) * 40, H * 0.22, 1, t, 5);

    // valley floor
    const vg = ctx.createLinearGradient(0, H * 0.55, 0, H);
    vg.addColorStop(0, "#86a865");
    vg.addColorStop(1, "#5b8a45");
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, S.hillY(x, W, H * 0.6, H * 0.03, 8.1));
    ctx.lineTo(W, H);
    ctx.fill();
    // terraces
    ctx.strokeStyle = "rgba(255,255,220,.13)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const yy = H * 0.6 + i * H * 0.018;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, yy + Math.sin(x * 0.01 + i) * 4);
      ctx.stroke();
    }

    // Phewa lake
    const lx = portrait ? W * -0.1 : W * 0.04;
    const lw = portrait ? W * 0.95 : W * 0.66;
    const ly = H * 0.6;
    const lh = H * 0.13;
    ctx.save();
    S.phewaPath(ctx, W, lx, ly, lw, lh);
    const lg = ctx.createLinearGradient(0, ly, 0, ly + lh);
    lg.addColorStop(0, "#9cc6d6");
    lg.addColorStop(1, "#3c7f98");
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    for (let i = 0; i < 18; i++) {
      const sx = lx + S.hash(i) * lw;
      const sy = ly + S.hash(i + 40) * lh;
      const len = 8 + S.hash(i + 9) * 20;
      const o = Math.sin(t * 0.8 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(sx + o, sy);
      ctx.lineTo(sx + o + len, sy);
      ctx.stroke();
    }
    ctx.restore();
    S.taalBarahi(ctx, lx + lw * 0.52, ly + lh * 0.5, Math.max(0.5, Math.min(W, H) / 1100));
    for (let i = 0; i < 4; i++) {
      const bx = lx + lw * (0.2 + ((i * 0.21 + t * 0.004 * (i % 2 ? 1 : -1) + 2) % 0.6));
      S.boat(ctx, bx, ly + lh * (0.35 + 0.12 * (i % 3)), 0.35, ["#c2412d", "#2f6fd0", "#e3a12a", "#2f9a4b"][i], t);
    }
    // the city along the lakeside
    S.houses(ctx, lx + lw * 0.78, W * 1.02, H * 0.63, H * 0.8, 77, Math.max(0.7, W / 1400), portrait ? 60 : 140);

    // paragliders (from Sarangkot!)
    const pcol = ["#e34b3c", "#f2c230", "#3d7ad6", "#ff7bb0", "#38b07a"];
    for (let i = 0; i < 5; i++) {
      const px = ((S.hash(i * 3) * W + t * (6 + i * 2)) % (W + 80)) - 40;
      const py = H * (0.3 + S.hash(i * 5) * 0.22) + Math.sin(t * 0.5 + i) * 10;
      S.paraglider(ctx, px, py, 0.8 + S.hash(i) * 0.6, pcol[i]);
    }

    // hilltop we're standing on
    ctx.fillStyle = "#2f5a34";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.86);
    ctx.quadraticCurveTo(W * 0.35, H * 0.8, W * 0.62, H * 0.84);
    ctx.quadraticCurveTo(W * 0.85, H * 0.87, W, H * 0.83);
    ctx.lineTo(W, H);
    ctx.fill();
    ctx.fillStyle = "#3f7342";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.9);
    ctx.quadraticCurveTo(W * 0.5, H * 0.86, W, H * 0.9);
    ctx.lineTo(W, H);
    ctx.fill();
    // flag pole in the corner, string running up out of frame
    ctx.strokeStyle = "#5b4130";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, H * 0.9);
    ctx.lineTo(W * 0.05, H * 0.5);
    ctx.stroke();
    S.flags(ctx, W * 0.05, H * 0.5, W * 0.32, -H * 0.04, H * 0.05, t, Math.max(14, Math.min(26, W / 55)));
    S.flags(ctx, W * 0.05, H * 0.56, -W * 0.05, H * 0.2, H * 0.02, t, Math.max(14, Math.min(26, W / 55)));
  };

  window.Scenery = S;
})();
