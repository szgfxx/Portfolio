/* Hello page: misty dawn over Phewa lake, Machhapuchhre behind short hills,
   a fork in the trail through tall low-poly grass. */
(function () {
  const S = window.Scenery;
  const cvs = document.getElementById("hello-scene");
  const ctx = cvs.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR;
  let blades = [], leftPts = [], rightPts = [], pathW0 = 0, bushes = [], specks = [];
  const PL1 = 26, PR1 = 40; // trail widths where they meet the shore / the stairs

  // tree scale: never taller than the width allows (keeps phones uncluttered)
  const TH = () => Math.min(H, W * 0.9);
  const bankY = (x) => {
    const u = x / W;
    return H * (0.86 - 0.02 * Math.sin(u * 3) - 0.22 * S.smooth(0.62, 1.05, u));
  };

  function curve(p0, p1, p2, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      out.push([
        (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0],
        (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1],
      ]);
    }
    return out;
  }

  // distance from (x,y) to a path polyline, normalised by its local half-width
  function pathHit(pts, w0, w1, x, y) {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const t = S.clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
      const d = Math.hypot(x - (a[0] + dx * t), y - (a[1] + dy * t));
      const hw = S.lerp(w0, w1, (i + t) / (pts.length - 1)) / 2;
      best = Math.min(best, d / hw);
    }
    return best;
  }

  function layout() {
    const jy = bankY(W * 0.14);
    pathW0 = Math.max(84, W * 0.13);
    leftPts = curve([W * 0.5, H * 1.02], [W * 0.38, H * 0.9], [W * 0.15, jy - 2], 18);
    rightPts = curve([W * 0.5, H * 1.02], [W * 0.62, H * 0.93], [W * 0.68, bankY(W * 0.68) + 6], 18);

    // tall grass blades, sorted back-to-front
    const r = S.rng(7);
    blades = [];
    const n = Math.min(1100, Math.round((W * H) / 1150));
    for (let i = 0; i < n; i++) {
      const x = r() * (W + 40) - 20;
      const top = bankY(x);
      const y = top + 2 + Math.pow(r(), 0.8) * (H + 20 - top);
      if (pathHit(leftPts, pathW0, PL1, x, y) < 1.15) continue;
      if (pathHit(rightPts, pathW0, PR1, x, y) < 1.15) continue;
      if (x > W * 0.66 && y < top + H * 0.035) continue; // keep the stone stairs clear
      const depth = S.clamp((y - top) / (H - top + 1), 0, 1);
      const h = (H * 0.016 + H * 0.075 * Math.pow(depth, 1.3)) * (0.7 + r() * 0.6);
      blades.push({ x, y, h, w: h * (0.1 + r() * 0.06), lean: (r() - 0.5) * h * 0.35, tone: (r() * 4) | 0, ph: r() * 6.28, depth });
    }
    blades.sort((a, b) => a.y - b.y);

    // dirt texture on the trails: specks, pebbles and darker ruts
    specks = [];
    for (let i = 0; i < 520; i++) {
      const x = W * 0.08 + r() * W * 0.65;
      const y = H * 0.7 + r() * H * 0.32;
      const inL = pathHit(leftPts, pathW0, PL1, x, y) < 0.85;
      const inR = pathHit(rightPts, pathW0, PR1, x, y) < 0.85;
      if (!inL && !inR) continue;
      const depth = S.clamp((y - H * 0.75) / (H * 0.25), 0.15, 1);
      const k = r();
      specks.push({ x, y, s: (0.8 + r() * 2.4) * (0.5 + depth), c: k < 0.45 ? "#6b4f34" : k < 0.8 ? "#b8936a" : "#8c8578", stone: k >= 0.8 });
    }

    // faceted bushes along the shore
    bushes = [];
    for (let i = 0; i < 7; i++) {
      const x = W * (0.03 + r() * 0.6);
      if (Math.abs(x - W * 0.5) < W * 0.08) continue;
      bushes.push({ x, s: H * (0.025 + r() * 0.03), seed: r() * 100 });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layout();
  }

  /* ---------- faceted (low-poly) blob: light from the upper left ---------- */
  function facetBlob(cx, cy, rx, ry, seed, dark, light, n) {
    n = n || 9;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 0.82 + S.hash(seed + i * 1.7) * 0.3;
      // flatter underside, like a mushroom canopy
      const yy = Math.sin(a) > 0 ? Math.sin(a) * 0.55 : Math.sin(a);
      pts.push([cx + Math.cos(a) * rx * k, cy + yy * ry * k]);
    }
    const c = [cx - rx * 0.12, cy - ry * 0.18];
    const D = S.hex(dark), L = S.hex(light);
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const mid = Math.atan2((a[1] + b[1]) / 2 - cy, (a[0] + b[0]) / 2 - cx);
      const lit = 0.5 + 0.5 * Math.cos(mid - -2.3);
      ctx.fillStyle = S.rgb(S.mix(D, L, lit * 0.9 + S.hash(seed + i) * 0.1));
      ctx.beginPath();
      ctx.moveTo(c[0], c[1]);
      ctx.lineTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.closePath();
      ctx.fill();
    }
    return pts;
  }

  // low-poly rhododendron: dark trunk, layered faceted canopy, red blossoms
  function rhodoTree(x, y, h, seed, t) {
    const sway = reduce ? 0 : Math.sin(t * 0.6 + seed) * h * 0.008;
    ctx.fillStyle = "#3a2820";
    ctx.beginPath();
    ctx.moveTo(x - h * 0.04, y);
    ctx.lineTo(x - h * 0.022 + sway, y - h * 0.5);
    ctx.lineTo(x + h * 0.022 + sway, y - h * 0.5);
    ctx.lineTo(x + h * 0.04, y);
    ctx.fill();
    ctx.strokeStyle = "#3a2820";
    ctx.lineWidth = h * 0.018;
    ctx.beginPath();
    ctx.moveTo(x + sway, y - h * 0.42);
    ctx.lineTo(x - h * 0.14 + sway, y - h * 0.56);
    ctx.moveTo(x + sway, y - h * 0.45);
    ctx.lineTo(x + h * 0.15 + sway, y - h * 0.6);
    ctx.stroke();
    facetBlob(x + sway, y - h * 0.6, h * 0.34, h * 0.17, seed, "#16301e", "#3c6340", 10);
    facetBlob(x - h * 0.04 + sway, y - h * 0.74, h * 0.24, h * 0.13, seed + 9, "#1b3a24", "#46704a", 9);
    // blossoms: little tilted squares
    for (let i = 0; i < 46; i++) {
      const a = S.hash(seed * 3 + i) * Math.PI * 2;
      const rr = Math.sqrt(S.hash(seed * 7 + i));
      const bx = x + sway + Math.cos(a) * rr * h * 0.34;
      const by = y - h * 0.66 + Math.sin(a) * rr * h * 0.16 - (S.hash(i + seed) > 0.6 ? h * 0.06 : 0);
      const s = h * (0.006 + S.hash(i * 5 + seed) * 0.005);
      ctx.fillStyle = ["#b3192d", "#d42a3a", "#8f1424"][i % 3];
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(S.hash(i * 11 + seed) * 1.5);
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.restore();
    }
  }

  // one arching leaf: a faceted strip, lit on top, shaded underneath
  function frond(x0, y0, ang, len, width, droop, light, dark, t, seed, feathery) {
    const n = 9;
    const sway = reduce ? 0 : Math.sin(t * 0.9 + seed) * 0.07;
    const pts = [];
    let x = x0, y = y0;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const a = ang + (droop + sway) * u * u;
      pts.push([x, y, a, u]);
      x += Math.cos(a) * (len / n);
      y += Math.sin(a) * (len / n);
    }
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[i + 1];
      const w0 = width * Math.sin(Math.PI * Math.max(0.08, p[3])) * (feathery && i % 2 ? 0.55 : 1);
      const w1 = width * Math.sin(Math.PI * Math.min(0.97, q[3])) * (feathery && i % 2 ? 1 : 0.55);
      const nx0 = -Math.sin(p[2]), ny0 = Math.cos(p[2]);
      const nx1 = -Math.sin(q[2]), ny1 = Math.cos(q[2]);
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - nx0 * w0, p[1] - ny0 * w0);
      ctx.lineTo(q[0] - nx1 * w1, q[1] - ny1 * w1); ctx.lineTo(q[0], q[1]); ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + nx0 * w0, p[1] + ny0 * w0);
      ctx.lineTo(q[0] + nx1 * w1, q[1] + ny1 * w1); ctx.lineTo(q[0], q[1]); ctx.fill();
    }
  }

  // palm: curved ringed trunk with a crown of feathery fronds
  function palm(x, y, h, seed, t) {
    const lean = (S.hash(seed) - 0.5) * h * 0.35;
    const tx = x + lean, ty = y - h;
    for (let i = 0; i < 12; i++) {
      const u0 = i / 12, u1 = (i + 1) / 12;
      const px0 = x + lean * u0 * u0, py0 = y - h * u0;
      const px1 = x + lean * u1 * u1, py1 = y - h * u1;
      const w0 = h * (0.045 - u0 * 0.018), w1 = h * (0.045 - u1 * 0.018);
      ctx.fillStyle = i % 2 ? "#6a5238" : "#5a4430";
      ctx.beginPath();
      ctx.moveTo(px0 - w0, py0); ctx.lineTo(px1 - w1, py1); ctx.lineTo(px1 + w1, py1); ctx.lineTo(px0 + w0, py0); ctx.fill();
    }
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI + 0.3 + (i / (n - 1)) * (Math.PI - 0.6);
      const droop = (Math.cos(a) >= 0 ? 1 : -1) * (0.9 + S.hash(seed + i) * 0.5);
      frond(tx, ty, a, h * (0.38 + S.hash(seed + i * 3) * 0.1), h * 0.05, droop, "#4f8f3c", "#2b5a28", t, seed + i, true);
    }
    ctx.fillStyle = "#4a3a22";
    ctx.beginPath();
    ctx.arc(tx, ty + h * 0.015, h * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  // banana plant: thick pale stem, a few huge broad leaves
  function banana(x, y, h, seed, t) {
    ctx.fillStyle = "#7d8a42";
    ctx.beginPath();
    ctx.moveTo(x - h * 0.05, y); ctx.lineTo(x - h * 0.035, y - h * 0.45);
    ctx.lineTo(x + h * 0.035, y - h * 0.45); ctx.lineTo(x + h * 0.05, y); ctx.fill();
    ctx.fillStyle = "#5f6c32";
    ctx.fillRect(x, y - h * 0.45, h * 0.035, h * 0.45);
    const angs = [-2.75, -2.2, -1.75, -1.35, -0.9, -0.4];
    angs.forEach((a, i) => {
      const droop = (Math.cos(a) >= 0 ? 1 : -1) * (0.6 + S.hash(seed + i) * 0.5);
      frond(x, y - h * 0.44, a, h * (0.42 + S.hash(seed + i * 2) * 0.12), h * 0.085, droop, i % 2 ? "#5aa344" : "#4c9439", "#2c6527", t, seed + i, false);
    });
  }

  // low-poly conifer: stacked tiers, each split into a lit and a shaded half
  function conifer(x, y, h, t) {
    const sway = reduce ? 0 : Math.sin(t * 0.5 + x) * h * 0.006;
    ctx.fillStyle = "#33241b";
    ctx.fillRect(x - h * 0.025, y - h * 0.22, h * 0.05, h * 0.22);
    for (let i = 0; i < 4; i++) {
      const base = y - h * (0.16 + i * 0.19);
      const tip = base - h * 0.34;
      const hw = h * (0.27 - i * 0.05);
      const tx = x + sway * (i + 1);
      ctx.fillStyle = "#2f5a3a";
      ctx.beginPath();
      ctx.moveTo(x - hw, base); ctx.lineTo(tx, tip); ctx.lineTo(x, base + h * 0.02); ctx.fill();
      ctx.fillStyle = "#1c3a26";
      ctx.beginPath();
      ctx.moveTo(x, base + h * 0.02); ctx.lineTo(tx, tip); ctx.lineTo(x + hw, base); ctx.fill();
    }
  }

  // broadleaf tree: tall trunk, rounded faceted crown
  function broadleaf(x, y, h, seed, t) {
    ctx.fillStyle = "#4a3626";
    ctx.beginPath();
    ctx.moveTo(x - h * 0.035, y); ctx.lineTo(x - h * 0.02, y - h * 0.62);
    ctx.lineTo(x + h * 0.02, y - h * 0.62); ctx.lineTo(x + h * 0.035, y); ctx.fill();
    facetBlob(x, y - h * 0.72, h * 0.3, h * 0.2, seed, "#1d4a2a", "#4c8a4a", 10);
    facetBlob(x + h * 0.12, y - h * 0.82, h * 0.18, h * 0.12, seed + 5, "#22552f", "#5a9a52", 8);
    facetBlob(x - h * 0.14, y - h * 0.8, h * 0.17, h * 0.11, seed + 8, "#1f4e2c", "#549450", 8);
  }

  /* ---------- linge ping (bamboo swing) ---------- */
  // a long bamboo along a quadratic curve: tapers toward the tip, with nodes
  function bamboo(x1, y1, qx, qy, x2, y2, w) {
    const n = 24;
    const pt = (u) => [
      (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * qx + u * u * x2,
      (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * qy + u * u * y2,
    ];
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(pt(i / n));
    ctx.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const ww = w * (1 - u * 0.55);
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      ctx.strokeStyle = "#a88c52";
      ctx.lineWidth = ww;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.strokeStyle = "#d8c28c";
      ctx.lineWidth = ww * 0.28;
      ctx.beginPath();
      ctx.moveTo(a[0] - nx * ww * 0.22, a[1] - ny * ww * 0.22);
      ctx.lineTo(b[0] - nx * ww * 0.22, b[1] - ny * ww * 0.22);
      ctx.stroke();
      if (i % 3 === 2) {
        ctx.strokeStyle = "#6e5a32";
        ctx.lineWidth = Math.max(1, ww * 0.18);
        ctx.beginPath();
        ctx.moveTo(b[0] - nx * ww * 0.55, b[1] - ny * ww * 0.55);
        ctx.lineTo(b[0] + nx * ww * 0.55, b[1] + ny * ww * 0.55);
        ctx.stroke();
      }
    }
    return pt;
  }

  function lingePing(t) {
    // far left, tall: the frames reach well up into the sky
    const gy = bankY(W * 0.1) + H * 0.07;
    const h = Math.min(TH() * 0.78, gy - H * 0.08);
    const cx = Math.max(W * 0.09, h * 0.18);
    const top = gy - h;
    const span = h * 0.2;    // half-distance between the two frames
    const leg = h * 0.12;    // how far each frame's feet splay
    const bw = Math.max(5, h * 0.034);
    const lx = cx - span, rx = cx + span;
    const bow = h * 0.05;    // how much the long poles flex

    // back poles of each frame
    ctx.globalAlpha = 0.85;
    bamboo(lx + leg * 0.7, gy - h * 0.02, lx + leg * 0.3 + bow, gy - h * 0.55, lx - h * 0.05, top - h * 0.1, bw * 0.85);
    bamboo(rx - leg * 0.7, gy - h * 0.02, rx - leg * 0.3 - bow, gy - h * 0.55, rx + h * 0.05, top - h * 0.1, bw * 0.85);
    ctx.globalAlpha = 1;

    // wooden log resting in the two crossings
    const lw = bw * 1.7;
    const x0 = lx - h * 0.07, x1 = rx + h * 0.07;
    const lg = ctx.createLinearGradient(0, top - lw / 2, 0, top + lw / 2);
    lg.addColorStop(0, "#8a5d3a");
    lg.addColorStop(0.45, "#6e4428");
    lg.addColorStop(1, "#4a2c18");
    ctx.fillStyle = lg;
    ctx.fillRect(x0, top - lw / 2, x1 - x0, lw);
    // bark grain
    ctx.strokeStyle = "rgba(40,22,10,.55)";
    ctx.lineWidth = Math.max(1, lw * 0.06);
    for (let i = 0; i < 9; i++) {
      const y = top - lw * 0.35 + (i % 4) * lw * 0.22;
      const a = x0 + S.hash(i * 3.1) * (x1 - x0) * 0.8;
      ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(a + (x1 - x0) * (0.12 + S.hash(i) * 0.15), y + lw * 0.04); ctx.stroke();
    }
    // cut ends with growth rings
    [x0, x1].forEach((x) => {
      ctx.fillStyle = "#c79a64";
      ctx.beginPath(); ctx.ellipse(x, top, lw * 0.28, lw * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#8c6236";
      ctx.lineWidth = Math.max(0.8, lw * 0.05);
      ctx.beginPath(); ctx.ellipse(x, top, lw * 0.17, lw * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, top, lw * 0.07, lw * 0.13, 0, 0, Math.PI * 2); ctx.stroke();
    });
    // hay laid over the log, a few strands drooping in front
    const strands = Math.round((x1 - x0) / 2.2);
    for (let i = 0; i < strands; i++) {
      const u = S.hash(i * 1.37);
      if (u < 0.08 || u > 0.92) continue;
      const x = S.lerp(x0, x1, u);
      const len = lw * (0.6 + S.hash(i * 2.9) * 0.9);
      const lean = (S.hash(i * 5.3) - 0.5) * lw * 1.2;
      const droop = S.hash(i * 7.7) > 0.7;
      ctx.strokeStyle = ["#e2c278", "#cfa955", "#b8913f", "#efd48e"][i % 4];
      ctx.lineWidth = Math.max(0.8, lw * 0.07);
      ctx.beginPath();
      ctx.moveTo(x, top - lw * 0.45);
      if (droop) ctx.quadraticCurveTo(x + lean, top - lw * 0.7, x + lean * 1.4, top + len * 0.9);
      else ctx.quadraticCurveTo(x + lean * 0.5, top - lw * 0.5 - len * 0.6, x + lean, top - lw * 0.4 - len * 0.2);
      ctx.stroke();
    }
    // marigold garland
    for (let i = 0; i <= 22; i++) {
      const u = i / 22;
      const x = S.lerp(lx + h * 0.02, rx - h * 0.02, u);
      const y = top + lw * 0.6 + bw * 0.4 + Math.sin(u * Math.PI * 3) ** 2 * h * 0.035;
      ctx.fillStyle = i % 3 ? "#f29a1d" : "#f6c433";
      ctx.beginPath();
      ctx.arc(x, y, bw * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // long ropes and a small seat, swinging slowly
    const ang = reduce ? 0 : Math.sin(t * 0.9) * 0.14;
    const ropeLen = h * 0.86;
    const pivot = top + lw * 0.45;
    const sx = cx + Math.sin(ang) * ropeLen;
    const sy = pivot + Math.cos(ang) * ropeLen;
    const rs = h * 0.045;
    ctx.strokeStyle = "#6b4e2e";
    ctx.lineWidth = Math.max(1.5, bw * 0.32);
    ctx.beginPath();
    ctx.moveTo(cx - rs * 1.5, pivot); ctx.lineTo(sx - rs, sy);
    ctx.moveTo(cx + rs * 1.5, pivot); ctx.lineTo(sx + rs, sy);
    ctx.stroke();
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    ctx.fillStyle = "#7a5230";
    ctx.fillRect(-rs * 1.4, -bw * 0.4, rs * 2.8, bw * 0.9);
    ctx.fillStyle = "#9c6d40";
    ctx.fillRect(-rs * 1.4, -bw * 0.4, rs * 2.8, bw * 0.3);
    ctx.restore();

    // front poles, bowing outward, tips running past the crossing
    bamboo(lx - leg, gy, lx - leg * 0.35 - bow, gy - h * 0.5, lx + h * 0.06, top - h * 0.12, bw);
    bamboo(rx + leg, gy, rx + leg * 0.35 + bow, gy - h * 0.5, rx - h * 0.06, top - h * 0.12, bw);

    // rope lashings where the poles cross
    ctx.strokeStyle = "#5a3f22";
    ctx.lineWidth = Math.max(1.5, bw * 0.3);
    [lx, rx].forEach((x) => {
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(x - bw, top + k * bw * 0.6);
        ctx.lineTo(x + bw, top + k * bw * 0.6 + bw * 0.3);
        ctx.stroke();
      }
    });
  }

  /* ---------- sky, mountains, short hills ---------- */
  function backdrop(t, waterY) {
    S.sky(ctx, 0, 0, W, waterY, [
      [0, "#3a4670"],
      [0.35, "#7484ad"],
      [0.72, "#d9b2b6"],
      [1, "#efd6c4"],
    ]);
    S.sun(ctx, W * 0.16, waterY - H * 0.16, Math.min(W, H) * 0.026, "#fff1d8", "rgba(255,210,180,.45)");
    S.clouds(ctx, W, H * 0.2, t, 3, 6, "rgba(240,225,232,.4)", Math.min(1.2, W / 900) + 0.3);
    const mw = Math.max(W * 0.98, H * 1.1);
    const mBase = waterY - H * 0.07;
    S.himalaya(ctx, (W - mw) / 2, mw, mBase, H * 0.3, {
      glow: "rgba(255,150,160,.6)",
      haze: "rgba(222,206,218,.95)",
      base: "#b3b0c8",
      shade: "rgba(105,110,170,.45)",
    });
    // fog veil over the foot of the range
    const fv = ctx.createLinearGradient(0, mBase - H * 0.16, 0, mBase + 2);
    fv.addColorStop(0, "rgba(232,222,230,0)");
    fv.addColorStop(1, "rgba(232,222,230,.85)");
    ctx.fillStyle = fv;
    ctx.fillRect(0, mBase - H * 0.16, W, H * 0.16 + 2);
    // short faceted hills overlapping the base of the mountains
    S.humps(ctx, -W * 0.05, W * 1.05, waterY - H * 0.035, H * 0.075, 11, "#8a98ad", "#6c7a93", 11, waterY + 2);
    S.humps(ctx, -W * 0.05, W * 1.05, waterY + 1, H * 0.05, 23, "#5f7a6c", "#445e52", 13, waterY + 2);
  }

  function lake(t, waterY) {
    const g = ctx.createLinearGradient(0, waterY, 0, H);
    g.addColorStop(0, "#c9b6c2");
    g.addColorStop(0.25, "#7d95b4");
    g.addColorStop(1, "#2c4a68");
    ctx.fillStyle = g;
    ctx.fillRect(0, waterY, W, H - waterY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, waterY, W, H - waterY);
    ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.translate(0, waterY * 2);
    ctx.scale(1, -1);
    backdrop(t, waterY);
    ctx.restore();

    ctx.save();
    for (let i = 0; i < 60; i++) {
      const u = S.hash(i * 2.3);
      const v = S.hash(i * 7.1);
      const y = waterY + 4 + v * v * (H - waterY);
      const len = (10 + S.hash(i) * 40) * (0.4 + v);
      const x = (u * W + (reduce ? 0 : Math.sin(t * 0.6 + i) * 10)) % W;
      ctx.globalAlpha = 0.1 + 0.15 * Math.abs(Math.sin(t * 0.9 + i));
      ctx.strokeStyle = i % 4 ? "#ffffff" : "#ffd2b0";
      ctx.lineWidth = 1 + v;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
    ctx.restore();

    const s = Math.max(0.6, Math.min(W, H) / 700);
    S.taalBarahi(ctx, W * 0.3, waterY + H * 0.05, s);
    const colors = ["#c2412d", "#2f6fd0", "#e3a12a", "#2f9a4b", "#8a3b6b"];
    for (let i = 0; i < 5; i++) {
      const dir = i % 2 ? 1 : -1;
      const span = W + 120;
      const x = ((S.hash(i * 9) * span + dir * t * (5 + i * 2)) % span + span) % span - 60;
      const depth = 0.3 + S.hash(i * 4) * 0.7;
      S.boat(ctx, x, waterY + H * (0.04 + depth * 0.16), s * (0.4 + depth * 0.45), colors[i], t);
    }
  }

  /* ---------- drifting fog ---------- */
  function fogBand(y, h, a) {
    const g = ctx.createLinearGradient(0, y - h, 0, y + h);
    g.addColorStop(0, "rgba(228,226,234,0)");
    g.addColorStop(0.5, `rgba(228,226,234,${a})`);
    g.addColorStop(1, "rgba(228,226,234,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y - h, W, h * 2);
  }
  function wisps(t, y0, y1, n, seed, alpha, size) {
    for (let i = 0; i < n; i++) {
      const span = W + size * 2;
      const x = ((S.hash(seed + i) * span + t * (4 + S.hash(seed + i * 3) * 6)) % span) - size;
      const y = S.lerp(y0, y1, S.hash(seed + i * 7));
      const rx = size * (0.6 + S.hash(seed + i * 2) * 0.8);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, `rgba(236,234,240,${alpha})`);
      g.addColorStop(1, "rgba(236,234,240,0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.32);
      ctx.translate(-x, -y);
      ctx.beginPath();
      ctx.arc(x, y, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function trail(pts, w0, w1, color) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    for (let i = 0; i < pts.length - 1; i++) {
      ctx.lineWidth = S.lerp(w0, w1, i / (pts.length - 1));
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.stroke();
    }
  }

  const BLADE_DARK = ["#3c5226", "#465c2a", "#34481f", "#4d6330"].map(S.hex);
  const BLADE_LIGHT = ["#8aa24e", "#9bb05a", "#7a9444", "#a6b866"].map(S.hex);

  function grass(t) {
    // batch by tone: one path for the lower (dark) halves, one for the lit tips
    for (let tone = 0; tone < 4; tone++) {
      const lower = new Path2D();
      const upper = new Path2D();
      for (const b of blades) {
        if (b.tone !== tone) continue;
        const sway = reduce ? 0 : Math.sin(t * 1.3 + b.x * 0.012 + b.ph * 0.3) * b.h * 0.12;
        const tx = b.x + b.lean + sway;
        const ty = b.y - b.h;
        const mx = b.x + (b.lean + sway) * 0.45;
        const my = b.y - b.h * 0.45;
        lower.moveTo(b.x - b.w / 2, b.y);
        lower.lineTo(mx - b.w * 0.3, my);
        lower.lineTo(mx + b.w * 0.3, my);
        lower.lineTo(b.x + b.w / 2, b.y);
        lower.closePath();
        upper.moveTo(mx - b.w * 0.3, my);
        upper.lineTo(tx, ty);
        upper.lineTo(mx + b.w * 0.3, my);
        upper.closePath();
      }
      ctx.fillStyle = S.rgb(BLADE_DARK[tone]);
      ctx.fill(lower);
      ctx.fillStyle = S.rgb(BLADE_LIGHT[tone]);
      ctx.fill(upper);
    }
  }

  function foreground(t) {
    // far mixed forest behind the bank on the right: broadleaf + conifers
    for (let i = 0; i < 9; i++) {
      const x = W * (0.69 + i * 0.042);
      const h = TH() * (0.22 + S.hash(i) * 0.12);
      if (i % 3 === 1) broadleaf(x, bankY(x) + 8, h * 1.1, i * 7 + 3, t);
      else conifer(x, bankY(x) + 8, h, t);
    }
    // ground under the grass
    const g = ctx.createLinearGradient(0, H * 0.62, 0, H);
    g.addColorStop(0, "#56703a");
    g.addColorStop(1, "#2e421f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, bankY(x));
    ctx.lineTo(W, H);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= W * 0.62; x += 8) ctx.lineTo(x, bankY(x) - 1 + Math.sin(x * 0.05 + t * 1.5));
    ctx.stroke();

    // jetty + tied boat
    const jy = bankY(W * 0.14);
    ctx.fillStyle = "#6e4a2c";
    ctx.fillRect(W * 0.02, jy - 6, W * 0.13, 6);
    ctx.fillStyle = "#4a2f1b";
    for (let i = 0; i < 4; i++) ctx.fillRect(W * (0.03 + i * 0.035), jy - 2, 4, 14);
    S.boat(ctx, W * 0.07, jy + 10, Math.max(0.7, W / 1300), "#c2412d", t, false);

    // the fork
    trail(leftPts, pathW0 * 1.08, PL1 + 6, "#6e5236");
    trail(rightPts, pathW0 * 1.08, PR1 + 6, "#6e5236");
    trail(leftPts, pathW0, PL1, "#93704b");
    trail(rightPts, pathW0, PR1, "#93704b");
    trail(leftPts, pathW0 * 0.6, PL1 * 0.5, "#a98559");
    trail(rightPts, pathW0 * 0.6, PR1 * 0.5, "#a98559");
    specks.forEach((d) => {
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.s * (d.stone ? 1.6 : 1), d.s * (d.stone ? 0.9 : 0.6), 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // rough stone stairs into the forest
    for (let i = 9; i >= 0; i--) {
      const u = i / 10;
      const x = W * (0.68 + u * 0.3);
      const y = bankY(x) + 4;
      const w = Math.max(18, W * 0.05) * (1 - u * 0.55);
      const h = w * 0.3;
      for (let k = 0; k < 3; k++) {
        const sx = x - w / 2 + (k * w) / 3 + S.hash(i * 3 + k) * w * 0.04;
        const sw = w / 3 - w * 0.03;
        ctx.fillStyle = ["#6f695e", "#7c7468", "#655f55"][(i + k) % 3];
        ctx.fillRect(sx, y - h * 0.25, sw, h * (0.9 + S.hash(i + k * 7) * 0.2));
        ctx.fillStyle = ["#a0998b", "#aca393", "#958e80"][(i + k) % 3];
        ctx.fillRect(sx, y - h * 0.55 - S.hash(i * 5 + k) * h * 0.1, sw, h * 0.34);
      }
    }

    // juniper bushes along the shore
    bushes.forEach((b) => facetBlob(b.x, bankY(b.x) + b.s * 0.3, b.s * 1.4, b.s * 0.8, b.seed, "#1f4426", "#559048", 8));

    // mixed hillside: conifers, broadleaf trees and rhododendrons
    const trees = [
      [0.75, 0.28, "conifer"], [0.84, 0.3, "rhodo"], [0.93, 0.42, "broad"], [0.71, 0.22, "rhodo"],
      [0.89, 0.34, "conifer"], [0.99, 0.32, "rhodo"], [0.8, 0.36, "broad"],
    ];
    trees.forEach((tr, i) => {
      const x = W * tr[0];
      const y = bankY(x) + H * 0.04;
      const h = TH() * tr[1];
      if (tr[2] === "palm") palm(x, y, h, i * 17 + 5, t);
      else if (tr[2] === "banana") banana(x, y, h, i * 11 + 2, t);
      else if (tr[2] === "conifer") conifer(x, y, h, t);
      else if (tr[2] === "broad") broadleaf(x, y, h, i * 19 + 4, t);
      else rhodoTree(x, y, h, i * 13 + 1, t);
    });
    // linge ping: the big Dashain bamboo swing, straddling the left trail
    lingePing(t);

    // low fog creeping over the bank, then the tall grass in front of it all
    wisps(t, bankY(W * 0.3) - H * 0.02, bankY(W * 0.3) + H * 0.03, 5, 40, 0.3, W * 0.22);
    grass(t);
  }

  function frame(ms) {
    const t = reduce ? 4 : ms / 1000;
    const waterY = H * 0.6;
    backdrop(t, waterY);
    // overall haze so the range sits back in the fog
    ctx.fillStyle = "rgba(226,222,232,.22)";
    ctx.fillRect(0, 0, W, waterY);
    lake(t, waterY);
    // mist lying on the water
    fogBand(waterY + H * 0.01, H * 0.06, 0.55);
    wisps(t, waterY - H * 0.04, waterY + H * 0.12, 7, 10, 0.35, W * 0.28);
    S.flags(ctx, -10, 2, W + 10, 8, Math.min(H * 0.04, 34), t, Math.max(12, Math.min(20, W / 64)), 0.95);
    foreground(t);
    if (!reduce) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reduce) frame(0);
  });
  requestAnimationFrame(frame);

  /* ---------- choosing a path ---------- */
  function go(which, href) {
    if (document.body.classList.contains("go-this") || document.body.classList.contains("go-that")) return;
    document.body.classList.add("go-" + which);
    setTimeout(() => (window.location.href = href), reduce ? 0 : 950);
  }
  document.querySelectorAll("[data-go]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      go(a.dataset.go, a.getAttribute("href"));
    });
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go("this", "this-way.html");
    if (e.key === "ArrowLeft") go("that", "that-way.html");
  });
  window.addEventListener("pageshow", () => document.body.classList.remove("go-this", "go-that"));
})();
