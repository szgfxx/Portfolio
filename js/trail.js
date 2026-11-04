/* "This way": a first-person climb up Annapurna I.
   Scrolling walks the viewer forward: a short dandelion meadow by Phewa,
   the foothills, Annapurna Base Camp, the high camps on the snow, and
   finally the 8,091 m summit above a sea of clouds. */
(function () {
  const S = window.Scenery;
  const cvs = document.getElementById("trail-scene");
  const ctx = cvs.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- world ---------- */
  const SEG = 0.5; // depth of one ground slice
  const VIEW = 130; // slices drawn ahead
  const TOTAL = 200; // summit z
  const EYE = 1.7;
  const HW = 1.15; // trail half-width
  const ALT0 = 822, ALT1 = 8091;
  const SNOW_ALT = 4300;

  // terrain height along the route (integrated slope)
  const GSTEP = 0.1;
  const gTab = new Float32Array(Math.ceil((TOTAL + VIEW * SEG + 20) / GSTEP) + 2);
  const slopeAt = (z) =>
    0.08 * S.smooth(1, 5, z) + // a short meadow, then up
    0.08 * S.smooth(22, 38, z) +
    0.22 * S.smooth(78, 96, z) + // steep snow
    0.14 * S.smooth(118, 134, z) -
    0.34 * S.smooth(186, 199, z) - // summit ridge flattens out
    0.5 * S.smooth(200.5, 204, z) + // and falls away beyond the top
    (0.04 * Math.sin(z * 0.35) + 0.025 * Math.sin(z * 0.9 + 1)) * S.smooth(3, 18, z) * (1 - S.smooth(185, 198, z));
  (function () {
    let h = 0;
    for (let i = 0; i < gTab.length; i++) {
      gTab[i] = h;
      h += slopeAt(i * GSTEP) * GSTEP;
    }
  })();
  const g = (z) => {
    if (z <= 0) return 0;
    const f = z / GSTEP, i = Math.min(Math.floor(f), gTab.length - 2);
    return S.lerp(gTab[i], gTab[i + 1], f - i);
  };
  const TOP = g(TOTAL);
  const altOf = (z) => ALT0 + (ALT1 - ALT0) * S.clamp(g(z) / TOP, 0, 1);
  const zAtAlt = (alt) => {
    let z = 0;
    while (z < TOTAL && altOf(z) < alt) z += 0.25;
    return z;
  };
  // height of the ground off to the side of the trail: valley walls in the
  // foothills, a knife-edge ridge falling away near the summit
  const lat = (z, off) => {
    const a = Math.abs(off);
    const d = Math.max(0, a - HW * 1.6);
    if (d === 0) return 0;
    const valley = S.smooth(5, 30, z) * (1 - S.smooth(135, 165, z));
    const ridge = S.smooth(150, 178, z);
    const bumps = 0.35 * Math.sin(off * 0.35 + z * 0.08) + 0.2 * Math.sin(off * 0.9 - z * 0.13);
    return (valley * 0.11 + (1 - valley - ridge) * 0.025 - ridge * 0.22) * Math.pow(d, 1.25) + bumps * S.smooth(2, 9, a) * (0.2 + valley * 0.8);
  };
  const SF = new Float32Array(20), SN = new Float32Array(20);
  const OFFS = [-60, -36, -24, -17, -12, -8.5, -6, -4, -2.6, -1.85, 1.85, 2.6, 4, 6, 8.5, 12, 17, 24, 36, 60];

  // the trail winds side to side as it climbs
  const bend = (z) => 3.2 * Math.sin(z * 0.045) + 1.6 * Math.sin(z * 0.12 + 1.3);

  /* ---------- palette ---------- */
  const hx = S.hex;
  const C = {
    meadow: hx("#86b44f"),
    meadow2: hx("#80ae4b"),
    dry: hx("#a8a35e"),
    rock: hx("#8d867a"),
    snow: hx("#eef3fa"),
    snow2: hx("#e7eef8"),
    dirt: hx("#9a7a52"),
    dirt2: hx("#8a6c47"),
    scree: hx("#7b766d"),
    track: hx("#cfdbea"),
  };

  function groundColor(alt, k) {
    const a = S.smooth(900, 2200, alt); // meadow → dry grass
    const b = S.smooth(3000, 3900, alt); // → rock / moraine
    const c = S.smooth(SNOW_ALT - 250, SNOW_ALT + 250, alt + (S.hash(k * 0.37) - 0.5) * 400); // → snow
    let col = S.mix(k % 2 ? C.meadow : C.meadow2, C.dry, a);
    col = S.mix(col, C.rock, b);
    return S.mix(col, k % 2 ? C.snow : C.snow2, c);
  }
  function trailColor(alt, k) {
    const b = S.smooth(2600, 3600, alt);
    const c = S.smooth(SNOW_ALT - 100, SNOW_ALT + 300, alt);
    return S.mix(S.mix(k % 2 ? C.dirt : C.dirt2, C.scree, b), C.track, c);
  }

  /* ---------- things along the route ---------- */
  const NK = Math.ceil((TOTAL + VIEW * SEG + 10) / SEG);
  const sprites = Array.from({ length: NK }, () => []);
  const patches = Array.from({ length: NK }, () => []);
  const add = (z, o) => {
    const k = Math.round(z / SEG);
    if (k >= 0 && k < NK) sprites[k].push(Object.assign({ z }, o));
  };
  (function place() {
    const r = S.rng(8091);
    const side = () => (r() < 0.5 ? -1 : 1);
    for (let k = 1; k < NK; k++) {
      const z = k * SEG;
      const alt = altOf(z);
      const meadow = 1 - S.smooth(840, 960, alt);
      const grassy = 1 - S.smooth(3400, 4100, alt);
      const snowy = S.smooth(SNOW_ALT, SNOW_ALT + 300, alt);
      // dandelions, little yellow weed flowers and seed puffs in the meadow
      for (let i = 0; i < 9 * meadow; i++) {
        add(z + r() * SEG, { kind: r() < 0.2 ? "puff" : "flower", off: side() * (HW + 0.15 + r() * 7), s: 0.7 + r() * 0.6, c: r() });
      }
      for (let i = 0; i < 6 * grassy; i++) {
        add(z + r() * SEG, { kind: "tuft", off: side() * (HW + 0.05 + r() * 8), s: 0.6 + r() * 0.8, c: r() });
      }
      if (alt > 1500 && alt < 3500 && r() < 0.35) add(z, { kind: "bush", off: side() * (HW + 1.2 + r() * 6), s: 0.7 + r() * 0.8 });
      if (alt > 1800 && r() < 0.22) add(z, { kind: "boulder", off: side() * (HW + 0.6 + r() * 7), s: 0.35 + r() * 0.9, c: r() });
      if (snowy > 0.5 && r() < 0.08) add(z, { kind: "serac", off: side() * (5 + r() * 8), s: 1 + r() * 2, c: r() });
      // boot prints in the snow
      if (snowy > 0.3 && k % 2 === 0) add(z, { kind: "print", off: k % 4 ? 0.18 : -0.18, s: 1 });
      // snow patches on the moraine, lush clumps in the meadow
      if (r() < 0.5) {
        const o1 = side() * (HW + 0.4 + r() * 6);
        const w = 0.8 + r() * 3;
        patches[k].push({ o1: Math.min(o1, o1 + w), o2: Math.max(o1, o1 + w) });
      }
    }
    add(3, { kind: "sign", off: HW + 0.6, text: "Annapurna I ↑  8,091 m" });
    // a chiya stall at the trailhead
    add(5, { kind: "tea", off: -(HW + 2.6), s: 1 });
    // doko baskets for rubbish along the trail, but not in the last quarter
    [[14, 1], [62, -1], [118, 1]].forEach(([z, side]) => add(z, { kind: "doko", off: side * (HW + 0.45), s: 1 }));
    const camps = [
      [4130, "Annapurna Base Camp · 4,130 m"],
      [5100, "Camp I · 5,100 m"],
      [5600, "Camp II · 5,600 m"],
      [6400, "Camp III · 6,400 m"],
      [7200, "Camp IV · 7,200 m"],
    ];
    const cols = ["#f28c28", "#f2c230", "#d64541", "#2f6fd0"];
    camps.forEach(([alt, text], i) => {
      const z = zAtAlt(alt);
      add(z, { kind: "sign", off: -(HW + 0.6), text });
      for (let j = 0; j < 3 + (i === 0 ? 3 : 0); j++) {
        add(z + 0.6 + j * 0.9, { kind: "tent", off: (j % 2 ? 1 : -1) * (HW + 1.6 + j * 0.7), s: 1, col: cols[(i + j) % 4] });
      }
    });
    add(4.5, { kind: "flagline", off: 0, s: 1 });
    for (let z = 60; z < TOTAL - 4; z += 9 + (z % 7)) add(z, { kind: "cairn", off: (z % 2 ? 1 : -1) * (HW + 0.5), s: 1 });
    add(TOTAL, { kind: "summit", off: 0, s: 1 });
  })();

  /* ---------- camera ---------- */
  let W, H, DPR, F, HORc;
  let camZ = 0, camX = 0, camY = EYE;
  function proj(z) {
    const dz = Math.max(z - camZ, 0.25);
    const s = F / dz;
    return [W / 2 + (bend(z) - camX) * s, HORc - (g(z) - camY) * s, s, dz];
  }
  const fogAt = (dz) => 1 - Math.exp(-dz / 26);
  let haze = hx("#dbe8f2");

  /* ---------- Annapurna I ---------- */
  const MASSIF = [
    [0, 0], [0.06, 0.18], [0.12, 0.24], [0.19, 0.4], [0.25, 0.44], [0.31, 0.6],
    [0.37, 0.7], [0.42, 0.84], [0.46, 0.93], [0.5, 1.0], [0.535, 0.95], [0.565, 0.98],
    [0.6, 0.9], [0.66, 0.82], [0.72, 0.68], [0.78, 0.62], [0.85, 0.44], [0.92, 0.3], [1, 0],
  ];
  function annapurna(cx, baseY, h, alpha) {
    const w = h * 1.9, x0 = cx - w / 2;
    const P = MASSIF.map((p) => [x0 + p[0] * w, baseY - p[1] * h]);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x0, baseY + 2);
    P.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(x0 + w, baseY + 2);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, baseY - h, 0, baseY);
    gr.addColorStop(0, "#f7f6f2");
    gr.addColorStop(0.6, "#e9edf3");
    gr.addColorStop(1, "#b9c6d8");
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.clip();
    // the great south face: dark rock buttresses under the snow
    ctx.fillStyle = "rgba(92,96,110,.32)";
    [[0.36, 0.62, 0.3], [0.44, 0.78, 0.36], [0.52, 0.86, 0.42], [0.6, 0.76, 0.5], [0.68, 0.62, 0.57]].forEach(([u, top, foot]) => {
      ctx.beginPath();
      ctx.moveTo(x0 + u * w, baseY - top * h);
      ctx.lineTo(x0 + (u + 0.025) * w, baseY - (top - 0.12) * h);
      ctx.lineTo(x0 + (foot + 0.07) * w, baseY - 0.05 * h);
      ctx.lineTo(x0 + foot * w, baseY - 0.05 * h);
      ctx.closePath();
      ctx.fill();
    });
    // shaded right-hand faces
    ctx.fillStyle = "rgba(110,128,170,.45)";
    for (let i = 1; i < P.length - 1; i++) {
      if (P[i][1] < P[i - 1][1] && P[i][1] <= P[i + 1][1]) {
        let j = i + 1;
        while (j < P.length - 1 && P[j + 1][1] >= P[j][1]) j++;
        ctx.beginPath();
        ctx.moveTo(P[i][0], P[i][1]);
        for (let k = i + 1; k <= j; k++) ctx.lineTo(P[k][0], P[k][1]);
        ctx.lineTo(S.lerp(P[i][0], P[j][0], 0.5), baseY);
        ctx.lineTo(S.lerp(P[i][0], P[j][0], 0.1), baseY);
        ctx.fill();
      }
    }
    const hz = ctx.createLinearGradient(0, baseY - h * 0.4, 0, baseY);
    hz.addColorStop(0, "rgba(255,255,255,0)");
    hz.addColorStop(1, S.rgb(haze, 0.9));
    ctx.fillStyle = hz;
    ctx.fillRect(x0, baseY - h * 0.4, w, h * 0.4 + 4);
    ctx.restore();
    // plume of blown snow off the summit
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    const sp = P[9];
    const pg = ctx.createLinearGradient(sp[0], 0, sp[0] + h * 0.6, 0);
    pg.addColorStop(0, "rgba(255,255,255,.9)");
    pg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(sp[0], sp[1] + 2);
    ctx.quadraticCurveTo(sp[0] + h * 0.3, sp[1] - h * 0.05, sp[0] + h * 0.6, sp[1] + h * 0.02);
    ctx.quadraticCurveTo(sp[0] + h * 0.3, sp[1] + h * 0.06, sp[0], sp[1] + h * 0.06);
    ctx.fill();
    ctx.restore();
  }

  /* ---------- background ---------- */
  function background(t, p, farY) {
    const a = S.smooth(0, 1, g(camZ) / TOP);
    const top = S.mix(hx("#5a9fda"), hx("#123a80"), a);
    const mid = S.mix(hx("#9fd0ee"), hx("#5f93d0"), a);
    haze = S.mix(hx("#e3eff3"), hx("#cfdff0"), a);
    S.sky(ctx, 0, 0, W, H, [
      [0, S.rgb(top)],
      [0.5, S.rgb(mid)],
      [0.85, S.rgb(haze)],
      [1, S.rgb(haze)],
    ]);
    S.sun(ctx, W * 0.8, H * 0.12, Math.min(W, H) * 0.03, "#fffbe8", "rgba(255,246,210,.5)");
    S.clouds(ctx, W, H * 0.12, t * 3, 7, 6, `rgba(255,255,255,${0.8 - a * 0.4})`, Math.min(1.2, W / 900) + 0.3);

    // the rest of the range off to the sides (Machhapuchhre peeks in on the right)
    const near = S.smooth(0, 0.8, p);
    const mw = Math.max(W * 1.6, H * 1.8) * (1 + near * 0.5);
    // on steep ground the far slope can sit way above the screen; keep the backdrop sane
    const baseY = S.clamp(farY + H * 0.02, H * 0.18, H);
    S.himalaya(ctx, W * 0.75 - mw * 0.5 - camX * 2, mw, baseY, H * (0.16 + near * 0.12), {
      haze: S.rgb(haze, 0.95),
      base: "#b9c7d8",
    });
    // Annapurna I, straight ahead, growing as we approach, gone once we're on it
    const fade = 1 - S.smooth(0.62, 0.78, p);
    const mh = Math.min(baseY - H * 0.06, H * (0.5 + near * 0.3));
    if (fade > 0.01 && mh > H * 0.05) annapurna(W / 2 - camX * 3, baseY, mh, fade);

    // a sea of cloud forming below as we climb
    if (a > 0.35) {
      ctx.save();
      ctx.globalAlpha = 0.85 * S.smooth(0.35, 0.8, a);
      S.clouds(ctx, W, baseY - H * 0.01, t * 1.2, 41, 10, "#ffffff", Math.min(1.6, W / 700) + 0.5);
      // the cloud sea fills everything below, so a ridge can drop away into it
      const cg = ctx.createLinearGradient(0, baseY, 0, H);
      cg.addColorStop(0, "#f7fafd");
      cg.addColorStop(1, S.rgb(haze));
      ctx.fillStyle = cg;
      ctx.fillRect(0, baseY - H * 0.005, W, H);
      ctx.restore();
    }
  }

  /* ---------- sprites ---------- */
  function drawSprite(o, t) {
    const [cx, by0, u, dz] = proj(o.z);
    const x = cx + o.off * u;
    const by = by0 - lat(o.z, o.off) * u;
    if (dz < 0.35 || x < -u * 3 - 100 || x > W + u * 3 + 100) return;
    const fog = fogAt(dz);
    if (fog > 0.97) return;
    ctx.globalAlpha = 1 - S.smooth(0.45, 0.97, fog);
    const sway = reduce ? 0 : Math.sin(t * 1.7 + o.z * 3 + o.off) * 0.08;
    switch (o.kind) {
      case "flower": {
        const len = 0.11 * o.s * u;
        if (len < 1.2) break;
        const fx = x + sway * len, fy = by - len;
        ctx.strokeStyle = "#4f7f2c";
        ctx.lineWidth = Math.max(1, 0.008 * u);
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        const pr = 0.02 * o.s * u;
        ctx.fillStyle = o.c > 0.4 ? "#f6c623" : "#ffdd4d";
        ctx.beginPath();
        if (pr > 2) {
          for (let i = 0; i < 8; i++) {
            const an = (i / 8) * Math.PI * 2;
            ctx.moveTo(fx + Math.cos(an) * pr * 1.5, fy + Math.sin(an) * pr * 0.55);
            ctx.arc(fx + Math.cos(an) * pr, fy + Math.sin(an) * pr * 0.55, pr * 0.55, 0, Math.PI * 2);
          }
        } else ctx.arc(fx, fy, Math.max(0.8, pr * 1.4), 0, Math.PI * 2);
        ctx.fill();
        if (pr > 2) {
          ctx.fillStyle = "#e0920f";
          ctx.beginPath();
          ctx.arc(fx, fy, pr * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "puff": {
        const len = 0.16 * o.s * u;
        if (len < 1.2) break;
        const fx = x + sway * len, fy = by - len;
        ctx.strokeStyle = "#5c8a34";
        ctx.lineWidth = Math.max(1, 0.007 * u);
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        const pr = 0.04 * o.s * u;
        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.beginPath();
        ctx.arc(fx, fy, pr, 0, Math.PI * 2);
        ctx.fill();
        if (pr > 4) {
          ctx.strokeStyle = "rgba(255,255,255,.95)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 16; i++) {
            const an = (i / 16) * Math.PI * 2;
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(an) * pr * 1.15, fy + Math.sin(an) * pr * 1.15);
          }
          ctx.stroke();
        }
        break;
      }
      case "tuft": {
        const len = 0.14 * o.s * u;
        if (len < 1.5) break;
        const dry = S.smooth(1500, 3600, altOf(o.z));
        ctx.strokeStyle = S.rgb(S.mix(o.c > 0.5 ? hx("#4f7d2e") : hx("#6f9f3c"), hx("#b5a866"), dry));
        ctx.lineWidth = Math.max(1, 0.012 * u);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const an = (i / 4 - 0.5) * 0.9 + sway;
          ctx.moveTo(x + (i - 2) * 0.012 * u, by);
          ctx.quadraticCurveTo(x + Math.sin(an) * len * 0.3, by - len * 0.6, x + Math.sin(an) * len, by - len * (0.8 + 0.2 * Math.cos(i)));
        }
        ctx.stroke();
        break;
      }
      case "bush": {
        const r = 0.35 * o.s * u;
        if (r < 1) break;
        ctx.fillStyle = "#2f5a2e";
        ctx.beginPath();
        ctx.arc(x - r * 0.6, by - r * 0.5, r * 0.7, 0, Math.PI * 2);
        ctx.arc(x + r * 0.55, by - r * 0.55, r * 0.72, 0, Math.PI * 2);
        ctx.arc(x, by - r * 0.95, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        if (r > 6) {
          ctx.fillStyle = "#d4283a";
          for (let i = 0; i < 8; i++) {
            const an = S.hash(o.z * 7 + i) * Math.PI;
            ctx.beginPath();
            ctx.arc(x + Math.cos(an) * r, by - r * 0.6 - Math.sin(an) * r * 0.7, r * 0.13, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case "boulder": {
        const r = 0.5 * o.s * u;
        if (r < 1) break;
        const snow = S.smooth(SNOW_ALT - 100, SNOW_ALT + 300, altOf(o.z));
        const tip = by - r * (0.9 + o.c * 0.2);
        ctx.fillStyle = "#5f5a52";
        ctx.beginPath();
        ctx.moveTo(x - r, by);
        ctx.lineTo(x - r * 0.8, by - r * 0.6);
        ctx.lineTo(x - r * 0.15, tip);
        ctx.lineTo(x + r * 0.7, by - r * 0.6);
        ctx.lineTo(x + r, by);
        ctx.fill();
        ctx.fillStyle = "#9d968a";
        ctx.beginPath();
        ctx.moveTo(x - r * 0.8, by - r * 0.6);
        ctx.lineTo(x - r * 0.15, tip);
        ctx.lineTo(x + r * 0.1, by - r * 0.3);
        ctx.lineTo(x - r * 0.6, by - r * 0.15);
        ctx.fill();
        if (snow > 0.2) {
          ctx.fillStyle = S.rgb(C.snow, snow);
          ctx.beginPath();
          ctx.moveTo(x - r * 0.82, by - r * 0.58);
          ctx.lineTo(x - r * 0.15, tip - r * 0.04);
          ctx.lineTo(x + r * 0.72, by - r * 0.58);
          ctx.quadraticCurveTo(x, by - r * 0.55, x - r * 0.82, by - r * 0.58);
          ctx.fill();
        }
        break;
      }
      case "serac": {
        const r = 0.6 * o.s * u;
        if (r < 1) break;
        ctx.fillStyle = "#cfe0f2";
        ctx.beginPath();
        ctx.moveTo(x - r, by);
        ctx.lineTo(x - r * 0.7, by - r * 1.3);
        ctx.lineTo(x + r * (0.1 + o.c * 0.3), by - r * 1.6);
        ctx.lineTo(x + r * 0.9, by - r * 1.1);
        ctx.lineTo(x + r, by);
        ctx.fill();
        ctx.fillStyle = "#9fbedf";
        ctx.beginPath();
        ctx.moveTo(x + r * (0.1 + o.c * 0.3), by - r * 1.6);
        ctx.lineTo(x + r * 0.9, by - r * 1.1);
        ctx.lineTo(x + r, by);
        ctx.lineTo(x + r * 0.2, by);
        ctx.fill();
        break;
      }
      case "print": {
        const r = 0.05 * u;
        if (r < 0.8) break;
        ctx.fillStyle = "rgba(120,150,190,.45)";
        ctx.beginPath();
        ctx.ellipse(x, by, r * 0.8, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "cairn": {
        const r = 0.18 * u;
        if (r < 1) break;
        let yy = by;
        [1, 0.8, 0.62, 0.45].forEach((k, i) => {
          ctx.fillStyle = i % 2 ? "#7c766c" : "#625d55";
          ctx.beginPath();
          ctx.ellipse(x, yy - r * k * 0.3, r * k, r * k * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
          yy -= r * k * 0.55;
        });
        break;
      }
      case "flagline": {
        const ph = 2.4 * u;
        if (ph < 3) break;
        const lx = cx - (HW + 0.9) * u, rx = cx + (HW + 0.9) * u;
        ctx.strokeStyle = "#4a3324";
        ctx.lineWidth = Math.max(1, 0.06 * u);
        ctx.beginPath();
        ctx.moveTo(lx, by);
        ctx.lineTo(lx, by - ph);
        ctx.moveTo(rx, by);
        ctx.lineTo(rx, by - ph);
        ctx.stroke();
        S.flags(ctx, lx, by - ph, rx, by - ph, 0.5 * u, t, Math.max(2, 0.22 * u));
        break;
      }
      case "rope": {
        const ph = 0.9 * u;
        if (ph < 2) break;
        ctx.strokeStyle = "#3b3b3b";
        ctx.lineWidth = Math.max(1, 0.04 * u);
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(x, by - ph);
        ctx.stroke();
        // the rope runs on to the next anchor up the slope
        const [nx, ny, ns, ndz] = proj(o.z + 2.5);
        if (ndz > 0.3) {
          ctx.strokeStyle = "#d64541";
          ctx.lineWidth = Math.max(1, 0.025 * u);
          const ex = nx + o.off * ns, ey = ny - (0.81 + lat(o.z + 2.5, o.off)) * ns;
          ctx.beginPath();
          ctx.moveTo(x, by - ph * 0.9);
          ctx.quadraticCurveTo((x + ex) / 2, (by - ph * 0.9 + ey) / 2 + ph * 0.25, ex, ey);
          ctx.stroke();
        }
        break;
      }
      case "tent": {
        const w = 0.75 * u, h = 0.5 * u;
        if (w < 2) break;
        ctx.fillStyle = o.col;
        ctx.beginPath();
        ctx.moveTo(x - w, by);
        ctx.quadraticCurveTo(x - w * 0.9, by - h * 1.2, x, by - h * 1.25);
        ctx.quadraticCurveTo(x + w * 0.9, by - h * 1.2, x + w, by);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath();
        ctx.moveTo(x, by - h * 1.25);
        ctx.quadraticCurveTo(x + w * 0.9, by - h * 1.2, x + w, by);
        ctx.lineTo(x, by);
        ctx.fill();
        ctx.fillStyle = "#3a2a20";
        ctx.beginPath();
        ctx.moveTo(x - w * 0.25, by);
        ctx.lineTo(x - w * 0.05, by - h * 0.7);
        ctx.lineTo(x + w * 0.15, by);
        ctx.fill();
        break;
      }
      case "sign": {
        const ph = 1.3 * u;
        if (ph < 8) break;
        ctx.fillStyle = "#5a3b22";
        ctx.fillRect(x - 0.03 * u, by - ph, 0.06 * u, ph);
        const fs = 0.13 * u;
        if (fs >= 6) {
          ctx.font = `600 ${fs}px Mukta, sans-serif`;
          const tw = ctx.measureText(o.text).width + fs * 1.2;
          const left = o.off < 0 ? x - tw + 0.05 * u : x - 0.05 * u;
          ctx.fillStyle = "#8a5a32";
          ctx.fillRect(left, by - ph, tw, fs * 1.7);
          ctx.fillStyle = "#fff3dc";
          ctx.textBaseline = "middle";
          ctx.fillText(o.text, left + fs * 0.6, by - ph + fs * 0.88);
        }
        break;
      }
      case "doko": {
        // conical bamboo doko used as a bin, with a little "फोहोर" tag
        const h = 0.75 * u, wt = 0.42 * u, wb = 0.2 * u;
        if (h < 3) break;
        ctx.fillStyle = "#a9793f";
        ctx.beginPath();
        ctx.moveTo(x - wt, by - h);
        ctx.lineTo(x + wt, by - h);
        ctx.lineTo(x + wb, by);
        ctx.lineTo(x - wb, by);
        ctx.fill();
        ctx.fillStyle = "#c79a5a";
        ctx.beginPath();
        ctx.ellipse(x, by - h, wt, wt * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3a2a1a";
        ctx.beginPath();
        ctx.ellipse(x, by - h, wt * 0.85, wt * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        if (h > 14) {
          // the weave
          ctx.strokeStyle = "rgba(70,45,20,.55)";
          ctx.lineWidth = Math.max(1, 0.02 * u);
          ctx.beginPath();
          for (let i = 1; i < 6; i++) {
            const yy = by - h + (h * i) / 6, w = S.lerp(wt, wb, i / 6);
            ctx.moveTo(x - w, yy);
            ctx.lineTo(x + w, yy);
          }
          for (let i = -3; i <= 3; i++) {
            ctx.moveTo(x + (wt * i) / 3.5, by - h);
            ctx.lineTo(x + (wb * i) / 3.5, by);
          }
          ctx.stroke();
          ctx.fillStyle = "#2f8a3e";
          ctx.fillRect(x - 0.17 * u, by - h * 0.62, 0.34 * u, 0.14 * u);
          const fs = 0.09 * u;
          if (fs >= 6) {
            ctx.fillStyle = "#fff";
            ctx.font = `700 ${fs}px Mukta, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("फोहोर", x, by - h * 0.62 + 0.07 * u);
            ctx.textAlign = "start";
          }
        }
        break;
      }
      case "tea": {
        // a little chiya pasal: tin roof, counter, kettle, bench
        const w = 1.6 * u, h = 2.1 * u;
        if (w < 4) break;
        ctx.fillStyle = "#c9b48a";
        ctx.fillRect(x - w / 2, by - h, w, h);
        ctx.fillStyle = "#7f5a3a";
        ctx.fillRect(x - w / 2 + 0.12 * u, by - h + 0.55 * u, w - 0.24 * u, 0.75 * u);
        ctx.fillStyle = "#3a2a20";
        ctx.fillRect(x - w / 2 + 0.2 * u, by - h + 0.62 * u, w - 0.4 * u, 0.55 * u);
        ctx.fillStyle = "#8b3a2a";
        ctx.beginPath();
        ctx.moveTo(x - w / 2 - 0.25 * u, by - h + 0.05 * u);
        ctx.lineTo(x, by - h - 0.45 * u);
        ctx.lineTo(x + w / 2 + 0.25 * u, by - h + 0.05 * u);
        ctx.fill();
        ctx.fillStyle = "#a9a39a";
        ctx.fillRect(x - w / 2 - 0.25 * u, by - h, w + 0.5 * u, 0.1 * u);
        // counter + kettle + glasses
        ctx.fillStyle = "#6b4a2e";
        ctx.fillRect(x - w / 2 - 0.05 * u, by - h + 1.3 * u, w + 0.1 * u, 0.15 * u);
        ctx.fillStyle = "#9aa3a8";
        ctx.beginPath();
        ctx.ellipse(x - 0.35 * u, by - h + 1.18 * u, 0.16 * u, 0.13 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e9d7b0";
        [0.05, 0.25, 0.45].forEach((dx) => ctx.fillRect(x + dx * u, by - h + 1.12 * u, 0.09 * u, 0.18 * u));
        // steam
        if (!reduce && w > 30) {
          ctx.strokeStyle = "rgba(255,255,255,.7)";
          ctx.lineWidth = Math.max(1, 0.03 * u);
          ctx.beginPath();
          for (let i = 0; i < 2; i++) {
            const k = (t * 0.6 + i * 0.5) % 1;
            const sx2 = x - 0.35 * u + Math.sin(k * 6 + i) * 0.05 * u, sy2 = by - h + 1.0 * u - k * 0.5 * u;
            ctx.moveTo(sx2, sy2);
            ctx.lineTo(sx2 + 0.04 * u, sy2 - 0.12 * u);
          }
          ctx.stroke();
        }
        // sign
        ctx.fillStyle = "#c4281c";
        ctx.fillRect(x - w / 2 + 0.1 * u, by - h + 0.12 * u, w - 0.2 * u, 0.36 * u);
        const fs = 0.24 * u;
        if (fs >= 7) {
          ctx.fillStyle = "#fff3dc";
          ctx.font = `700 ${fs}px Mukta, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("चिया पसल", x, by - h + 0.31 * u, w - 0.3 * u);
          ctx.textAlign = "start";
        }
        // bench out front
        ctx.fillStyle = "#6b4a2e";
        ctx.fillRect(x + w / 2 + 0.15 * u, by - 0.45 * u, 1.0 * u, 0.1 * u);
        ctx.fillRect(x + w / 2 + 0.22 * u, by - 0.45 * u, 0.08 * u, 0.45 * u);
        ctx.fillRect(x + w / 2 + 1.0 * u, by - 0.45 * u, 0.08 * u, 0.45 * u);
        break;
      }
      case "summit": {
        const ph = 3 * u;
        if (ph < 3) break;
        ctx.strokeStyle = "#4a3324";
        ctx.lineWidth = Math.max(1.5, 0.08 * u);
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(x, by - ph);
        ctx.stroke();
        const fs = Math.max(2, 0.25 * u);
        S.flags(ctx, x, by - ph, x - 4 * u, by, 0.3 * u, t, fs);
        S.flags(ctx, x, by - ph, x + 4 * u, by, 0.3 * u, t, fs);
        S.flags(ctx, x, by - ph * 0.8, x - 1.6 * u, by, 0.2 * u, t, fs);
        S.flags(ctx, x, by - ph * 0.8, x + 1.6 * u, by, 0.2 * u, t, fs);
        break;
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- ground slices, far to near, sprites interleaved ---------- */
  function drawGround(t, k0, kMax) {
    for (let k = kMax; k >= k0; k--) {
      const zf = k * SEG, zn = Math.max((k - 1) * SEG, camZ + 0.25);
      const pf = proj(zf), pn = proj(zn);
      const yf = pf[1], yn = Math.min(pn[1], H + 2);
      if (yn > yf - 0.5 && yf - 12 * pf[2] < H) {
        const alt = altOf(zf);
        const fog = fogAt(pf[3]);
        // build the slice outline; skip it entirely if it sits above the screen
        let lowest = -Infinity;
        for (let i = 0; i < OFFS.length; i++) {
          const o = OFFS[i];
          SF[i] = yf - lat(zf, o) * pf[2] - 0.5;
          SN[i] = Math.min(yn, pn[1]) - lat(zn, o) * pn[2] + 0.5;
          if (SN[i] > lowest) lowest = SN[i];
        }
        if (lowest < 0) {
          const L0 = sprites[k];
          for (let i = 0; i < L0.length; i++) drawSprite(L0[i], t);
          continue;
        }
        ctx.fillStyle = S.rgb(S.mix(groundColor(alt, k), haze, fog));
        ctx.beginPath();
        for (let i = 0; i < OFFS.length; i++) {
          const px = pf[0] + OFFS[i] * pf[2];
          i ? ctx.lineTo(px, SF[i]) : ctx.moveTo(px, SF[i]);
        }
        for (let i = OFFS.length - 1; i >= 0; i--) ctx.lineTo(pn[0] + OFFS[i] * pn[2], SN[i]);
        ctx.closePath();
        ctx.fill();
        const pl = patches[k];
        for (let i = 0; i < pl.length; i++) {
          const pa = pl[i];
          const pc = alt > 3200 ? C.snow : S.mix(groundColor(alt, k + 1), hx("#55803a"), alt < 3000 ? 0.4 : 0.15);
          ctx.fillStyle = S.rgb(S.mix(pc, haze, fog));
          ctx.beginPath();
          ctx.moveTo(pf[0] + pa.o1 * pf[2], yf - lat(zf, pa.o1) * pf[2] - 0.5);
          ctx.lineTo(pf[0] + pa.o2 * pf[2], yf - lat(zf, pa.o2) * pf[2] - 0.5);
          ctx.lineTo(pn[0] + pa.o2 * pn[2], pn[1] - lat(zn, pa.o2) * pn[2] + 0.5);
          ctx.lineTo(pn[0] + pa.o1 * pn[2], pn[1] - lat(zn, pa.o1) * pn[2] + 0.5);
          ctx.fill();
        }
        // the trail
        const tc = S.mix(trailColor(alt, k), haze, fog);
        ctx.fillStyle = S.rgb(tc);
        ctx.beginPath();
        ctx.moveTo(pf[0] - HW * pf[2], yf - 0.5);
        ctx.lineTo(pf[0] + HW * pf[2], yf - 0.5);
        ctx.lineTo(pn[0] + HW * pn[2], yn + 0.5);
        ctx.lineTo(pn[0] - HW * pn[2], yn + 0.5);
        ctx.fill();
        // stones set into the path below the snow
        if (alt < SNOW_ALT && pf[2] > 25) {
          ctx.fillStyle = S.rgb(S.mix(S.mix(tc, hx("#5c564c"), 0.35), haze, fog));
          const ms = (pn[2] + pf[2]) / 2, mx = (pn[0] + pf[0]) / 2, my = (yf + yn) / 2;
          for (let i = 0; i < 3; i++) {
            const o = (S.hash(k * 3.1 + i) - 0.5) * HW * 1.7;
            const rr = 0.09 * ms;
            ctx.beginPath();
            ctx.ellipse(mx + o * ms, my, rr, rr * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      const L = sprites[k];
      for (let i = 0; i < L.length; i++) drawSprite(L[i], t);
    }
  }

  /* ---------- summit panorama ---------- */
  function summitView(t) {
    S.sky(ctx, 0, 0, W, H, [
      [0, "#0e2e6e"],
      [0.45, "#3f74c0"],
      [0.75, "#bcd4ee"],
      [1, "#eef4fb"],
    ]);
    S.sun(ctx, W * 0.78, H * 0.18, Math.min(W, H) * 0.03, "#fffdf2", "rgba(255,250,225,.6)");
    const mw = Math.max(W * 1.1, H * 1.1);
    // the rest of the Himalaya poking through the clouds, far below
    S.himalaya(ctx, (W - mw) / 2, mw, H * 0.64, H * 0.13, { haze: "rgba(240,246,252,.95)", base: "#c9d6e6" });
    ctx.fillStyle = "#f4f7fb";
    ctx.fillRect(0, H * 0.63, W, H);
    S.clouds(ctx, W, H * 0.63, t * 1.5, 41, 12, "#ffffff", Math.min(1.8, W / 600) + 0.5);
    S.clouds(ctx, W, H * 0.72, t * 2.2, 55, 12, "#f1f5fb", Math.min(1.8, W / 600) + 0.6);
    // summit snow underfoot
    ctx.fillStyle = "#e9eff8";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.86);
    ctx.quadraticCurveTo(W * 0.3, H * 0.78, W * 0.5, H * 0.79);
    ctx.quadraticCurveTo(W * 0.75, H * 0.8, W, H * 0.88);
    ctx.lineTo(W, H);
    ctx.fill();
    ctx.fillStyle = "#cfdbea";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.93);
    ctx.quadraticCurveTo(W * 0.5, H * 0.87, W, H * 0.94);
    ctx.lineTo(W, H);
    ctx.fill();
    // flags fanned from the summit pole
    const px = W * 0.5, py = H * 0.79;
    ctx.strokeStyle = "#4a3324";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - H * 0.3);
    ctx.stroke();
    const fs = Math.max(12, Math.min(24, W / 55));
    S.flags(ctx, px, py - H * 0.3, -W * 0.05, H * 0.84, H * 0.06, t, fs);
    S.flags(ctx, px, py - H * 0.3, W * 1.05, H * 0.86, H * 0.06, t, fs);
    S.flags(ctx, px, py - H * 0.24, W * 0.12, H * 0.98, H * 0.03, t, fs);
    S.flags(ctx, px, py - H * 0.24, W * 0.88, H * 0.98, H * 0.03, t, fs);
  }

  function snowfall(t, k) {
    if (k <= 0.01 || reduce) return;
    ctx.fillStyle = "rgba(255,255,255,.85)";
    const n = Math.round(110 * k * Math.min(1.5, W / 900 + 0.5));
    for (let i = 0; i < n; i++) {
      const sp = 30 + S.hash(i * 3.1) * 60;
      const x = ((S.hash(i) * W + Math.sin(t * 0.7 + i) * 20 - t * 25) % W + W) % W;
      const y = (S.hash(i * 7.3) * H + t * sp) % H;
      ctx.beginPath();
      ctx.arc(x, y, 1 + S.hash(i * 1.7) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
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
    F = Math.min(H * 0.9, W * 1.2);
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

    const p = S.clamp(cur / 0.9, 0, 1);
    camZ = p * (TOTAL - 9);
    const step = reduce ? 0 : Math.sin(camZ * Math.PI * 1.6) * 0.03; // footstep bob
    camY = g(camZ) + EYE + step;
    camX = (bend(camZ + 1) + bend(camZ + 7)) / 2;
    HORc = H * 0.5 + slopeAt(camZ + 5) * F * 0.2; // look up a little on steep ground

    const reveal = S.smooth(0.9, 0.97, cur);
    if (reveal < 0.999) {
      const k0 = Math.floor(camZ / SEG) + 1;
      const kMax = Math.min(k0 + VIEW, NK - 1);
      let farY = H;
      for (let k = kMax; k >= k0; k -= 3) farY = Math.min(farY, proj(k * SEG)[1]); // where the trail meets the sky
      background(t, p, farY);
      drawGround(t, k0, kMax);
      const a = altOf(camZ);
      snowfall(t, S.smooth(SNOW_ALT, SNOW_ALT + 800, a) * (1 - S.smooth(7600, 8000, a) * 0.5));
    }
    if (reveal > 0.001) {
      ctx.save();
      ctx.globalAlpha = reveal;
      summitView(t);
      ctx.restore();
    }

    placeHiker(t, reveal);

    const alt = Math.round(cur >= 0.9 ? ALT1 : altOf(camZ));
    if (alt !== lastAlt) {
      lastAlt = alt;
      const pr = (alt - ALT0) / (ALT1 - ALT0);
      altEl.textContent = alt.toLocaleString();
      fillEl.style.height = pr * 100 + "%";
      dotEl.style.bottom = pr * 100 + "%";
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Sagun hiking ahead of us ---------- */
  const hiker = document.querySelector(".hiker");
  const hikerFig = hiker && hiker.querySelector(".hiker__fig");
  const bubble = hiker && hiker.querySelector(".hiker__bubble");
  const TALK = (window.SAGUN && window.SAGUN.climbTalk) || {};
  const AHEAD = 5.5; // metres ahead on the trail
  let hikerWalking = false, lastCur = 0, said = null;
  function placeHiker(t, reveal) {
    if (!hiker) return;
    let x, feet, s;
    if (reveal < 0.5) {
      const pp = proj(camZ + AHEAD);
      s = pp[2];
      x = pp[0] + 0.2 * s;
      feet = Math.max(pp[1], H * 0.6); // stay in the lower part of the screen, even on steep snow
    } else {
      // at the top she stops beside the summit pole and takes in the view
      s = H * 0.3 / 1.65;
      x = W * 0.3;
      feet = H * 0.9;
    }
    const fh = 1.65 * s * (360 / 344), fw = (fh * 200) / 360;
    hiker.style.width = fw + "px";
    hiker.style.height = fh + "px";
    hiker.style.transform = `translate(${x - fw / 2}px, ${feet - (344 / 360) * fh}px)`;
    const moving = Math.abs(cur - lastCur) > 0.00003 && reveal < 0.5;
    lastCur = cur;
    if (moving !== hikerWalking) {
      hikerWalking = moving;
      hikerFig.classList.toggle("is-walking", moving);
    }
  }
  function sayFor(id) {
    const text = TALK[id] || "";
    if (text === said) return;
    said = text;
    bubble.textContent = text;
    bubble.classList.remove("is-new");
    void bubble.offsetWidth;
    bubble.classList.add("is-new");
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
    if (bubble) sayFor(id || "top");
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
