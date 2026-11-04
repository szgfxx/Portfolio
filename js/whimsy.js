/* "That way": sunny Phewa lakeside — boats, ducks, and nonsense. */
(function () {
  const S = window.Scenery;
  const W8 = (window.SAGUN && window.SAGUN.whimsy) || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const todo = (s) => (/^\s*TODO/i.test(String(s)) ? ' class="todo"' : "");

  /* ---------- content ---------- */
  const slot = (n) => document.querySelector(`[data-w="${n}"]`);
  const YAP = (W8.yap || []).map((y) => (typeof y === "string" ? { text: y } : y));
  slot("yap").innerHTML = YAP.map((y) => `<li>${esc(y.text)}</li>`).join("");
  slot("stats").innerHTML = (W8.stats || [])
    .map(
      (s) => `
    <div class="stat">
      <div class="stat__row"><span>${esc(s.label)}</span><span>${Number(s.value) | 0}</span></div>
      <div class="stat__bar"><span data-v="${S.clamp(Number(s.value) || 0, 0, 100)}"></span></div>
    </div>`
    )
    .join("");
  const boatColors = ["#c2412d", "#2f6fd0", "#e3a12a", "#2f9a4b", "#8a3b6b"];

  // animate stat bars when visible
  const io = new IntersectionObserver((es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll("[data-v]").forEach((b) => (b.style.width = b.dataset.v + "%"));
      io.unobserve(e.target);
    })
  );
  io.observe(slot("stats"));

  /* ---------- Sagun yaps as you walk ---------- */
  const btn = document.querySelector(".w-sagun");
  const bubble = document.querySelector(".w-bubble");
  const walkEl = document.querySelector(".w-walk");
  const facts = W8.funFacts && W8.funFacts.length ? W8.funFacts : ["hi :)"];
  walkEl.style.height = Math.max(1, YAP.length) * 55 + "vh";

  let shown = null, typer = 0, pokeUntil = 0;
  function say(text) {
    if (text === shown) return;
    shown = text;
    clearInterval(typer);
    bubble.classList.remove("is-new");
    void bubble.offsetWidth;
    bubble.classList.add("is-new");
    bubble.classList.toggle("todo", /^\s*TODO/i.test(text));
    bubble.textContent = text;
    window.SagunAudio.pop();
    talk(text);
  }
  // she says it out loud (when sound is on) and her mouth moves while she does
  let talkT = 0;
  function talk(text) {
    clearTimeout(talkT);
    const stop = () => btn.classList.remove("is-talking");
    const voiced = window.SagunAudio.speak(text, () => btn.classList.add("is-talking"), stop);
    if (!voiced) {
      // silent mode: still mouth the words for a moment
      btn.classList.add("is-talking");
      talkT = setTimeout(stop, Math.min(4000, 400 + text.length * 45));
    }
  }

  // which line belongs to the current stretch of the walk
  function lineAt() {
    const top = walkEl.offsetTop, h = walkEl.offsetHeight;
    const p = (window.scrollY + window.innerHeight * 0.6 - top) / h;
    if (p < 0) return -1;
    return Math.min(YAP.length, Math.floor(p * YAP.length));
  }
  const meter = document.querySelector(".momo-meter");
  const meterFill = document.querySelector(".momo-meter__fill");
  const meterLabel = document.querySelector(".momo-meter__label");
  function updateMeter() {
    const top = walkEl.offsetTop, h = walkEl.offsetHeight;
    const p = S.clamp((window.scrollY + window.innerHeight * 0.6 - top) / h, 0, 1);
    const done = p >= 1;
    const lvl = done ? 1 : 1 - p * 0.95; // she gets hungrier with every step
    meterFill.style.width = lvl * 100 + "%";
    meterFill.style.setProperty("--fill", lvl > 0.5 ? "#2f9a4b" : lvl > 0.25 ? "#e3a12a" : "#c2412d");
    meterLabel.textContent = done ? "🥟 momo meter: full!" : lvl < 0.2 ? "🥟 momo meter: HUNGRY" : "🥟 momo meter";
    if (done !== meter.classList.contains("is-full")) meter.classList.toggle("is-full", done);
  }
  function updateYap() {
    updateMeter();
    const i = lineAt();
    // quiet before the walk starts, gone once she's walked off to the momo stall
    btn.classList.toggle("is-away", i >= YAP.length);
    if (Date.now() < pokeUntil) return;
    btn.classList.toggle("is-quiet", i < 0);
    if (i >= 0 && i < YAP.length) say(YAP[i].text);
  }

  let fi = -1;
  btn.addEventListener("click", () => {
    fi = (fi + 1) % facts.length;
    pokeUntil = Date.now() + 3500;
    shown = null;
    btn.classList.remove("is-quiet");
    say(facts[fi]);
    btn.classList.remove("is-poked");
    void btn.offsetWidth;
    btn.classList.add("is-poked");
    setTimeout(updateYap, 3600);
  });
  window.addEventListener("scroll", updateYap, { passive: true });

  /* ---------- momo ---------- */
  const momoBtn = document.querySelector(".momo");
  const nEl = document.getElementById("momo-n");
  const msgEl = document.getElementById("momo-msg");
  const MSGS = { 1: "one momo. a good start.", 5: "a respectable plate.", 10: "a full plate! (they come in tens)", 20: "jhol momo next?", 50: "ok you have a problem.", 100: "legend. honorary Pokhareli." };
  let n = 0;
  try {
    n = parseInt(localStorage.getItem("momos") || "0", 10) || 0;
  } catch (e) {}
  nEl.textContent = n;
  momoBtn.addEventListener("click", (e) => {
    n++;
    nEl.textContent = n;
    if (MSGS[n]) msgEl.textContent = MSGS[n];
    try {
      localStorage.setItem("momos", String(n));
    } catch (err) {}
    if (reduce) return;
    const r = momoBtn.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const c = document.createElement("span");
      c.className = "crumb";
      c.textContent = i ? "✨" : "🥟";
      c.style.left = r.left + r.width / 2 - 13 + "px";
      c.style.top = r.top + r.height / 2 - 13 + "px";
      c.style.setProperty("--dx", (Math.random() - 0.5) * 220 + "px");
      c.style.setProperty("--dy", -60 - Math.random() * 140 + "px");
      c.style.setProperty("--rot", (Math.random() - 0.5) * 720 + "deg");
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 950);
    }
  });



  /* ---------- the lakeside walk, front view ----------
     We look back along the stone promenade: Phewa on the left, shops on the
     right, Sagun walking toward us. Scrolling walks her (and us) forward, so
     the lakeside slides away behind her. Units are metres-ish; y is up. */
  window.SagunAudio.scene("lake");
  window.SagunAudio.surface = "stone";
  const cvs = document.getElementById("lake-scene");
  const ctx = cvs.getContext("2d");
  const EYE = 1.6, LEN = 150;
  const WALL_X = -2.7, SHOP_X = 3.1, SAGUN_X = 0.3;
  let W, H, F, HOR, DS, camZ = 0;

  // world → screen; returns [x, y, scale, depth]
  function P(x, y, z) {
    const dz = Math.max(z - camZ, 0.3);
    const s = F / dz;
    return [W / 2 + x * s, HOR + (EYE - y) * s, s, dz];
  }
  const HAZE = S.hex("#dcecf2");
  const fog = (dz) => 1 - Math.exp(-dz / 55);
  const tint = (hex, dz) => S.rgb(S.mix(S.hex(hex), HAZE, fog(dz) * 0.85));

  /* ---- what's along the promenade ---- */
  const SIGNS = ["Momo House", "Trekking Gear", "Lakeside Café", "Pashmina", "Thangka Art", "Books & Maps", "Juice Bar", "Rooftop Pizza", "Singing Bowls", "Boat Rental", "Lassi Corner", "Yak Cheese", "Tibetan Bread", "Fewa Souvenirs"];
  const WALLS = ["#f3e6cf", "#f6d9a8", "#e9c9b3", "#dfe8ee", "#f7f1e6", "#f2c6a0", "#d8e6d0", "#f4d6d6"];
  const TRIM = ["#b8432f", "#2f6fd0", "#2f8a4b", "#c98a2b", "#8a3b6b", "#2a6f86"];
  const GOODS = ["#d4302b", "#2f6fd0", "#f2c230", "#2f9a4b", "#e56aa0", "#7a4bc2"];
  const things = []; // shops + props, drawn far → near
  const boats = [];
  (function place() {
    const r = S.rng(77);
    let z = -LEN - 20, k = 0;
    while (z < 110) {
      const w = 3.6 + r() * 2.6;
      things.push({
        kind: "shop", z0: z, z1: z + w, h: 4 + r() * 3.5,
        wall: WALLS[(r() * WALLS.length) | 0], trim: TRIM[(r() * TRIM.length) | 0],
        awning: TRIM[(r() * TRIM.length) | 0], sign: SIGNS[k++ % SIGNS.length], seed: r() * 100,
      });
      z += w + (r() < 0.25 ? 0.6 : 0.05);
    }
    for (let z = -LEN - 20; z < 110; z += 7) things.push({ kind: "lamp", z, x: WALL_X + 0.35 });
    for (let z = -LEN - 12; z < 110; z += 17 + r() * 8) things.push({ kind: "tree", z, x: WALL_X + 0.9, s: 0.9 + r() * 0.4 });
    for (let z = -LEN - 18; z < 110; z += 26) things.push({ kind: "flags", z });
    // two bins, moved into place by placeBins() so she passes each during its line
    YAP.forEach((y, i) => y.bin && things.push({ kind: "bin", z: 0, x: WALL_X + 0.55, line: i }));
    // moored doongas along the wall, plus a few out on the water
    for (let z = -LEN - 20; z < 110; z += 4 + r() * 3) boats.push({ x: WALL_X - 1.3 - r() * 0.6, z, c: r(), rower: false, drift: 0 });
    for (let i = 0; i < 22; i++) boats.push({ x: -8 - r() * 45, z: -LEN + r() * (LEN + 120), c: r(), rower: true, drift: 0.2 + r() * 0.5 });
  })();
  const zOf = (o) => (o.kind === "shop" ? o.z1 : o.z);

  /* ---- painters ---- */
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

  function shop(o) {
    if (o.z1 < camZ + 0.4 || o.z0 > camZ + 160) return;
    const z0 = Math.max(o.z0, camZ + 0.4), z1 = o.z1, X = SHOP_X;
    const dz = (z0 + z1) / 2 - camZ;
    const f = (x, y, z) => P(x, y, z);
    // facade
    quad(f(X, 0, z0), f(X, o.h, z0), f(X, o.h, z1), f(X, 0, z1), tint(o.wall, dz));
    // roof parapet
    quad(f(X, o.h, z0), f(X - 0.25, o.h + 0.25, z0), f(X - 0.25, o.h + 0.25, z1), f(X, o.h, z1), tint(o.trim, dz));
    const near = f(X, 0, z1)[2]; // px per metre at the far edge
    if (near < 2) return;
    // upper-floor windows
    for (let y = 3.2; y + 1.3 < o.h; y += 1.6) {
      for (let wz = o.z0 + 0.6; wz + 0.9 < o.z1 - 0.3; wz += 1.5) {
        if (wz < camZ + 0.4) continue;
        quad(f(X, y, wz), f(X, y + 1, wz), f(X, y + 1, wz + 0.8), f(X, y, wz + 0.8), tint("#3a4250", dz));
        quad(f(X, y + 1, wz - 0.1), f(X - 0.08, y + 1.12, wz - 0.1), f(X - 0.08, y + 1.12, wz + 0.9), f(X, y + 1, wz + 0.9), tint(o.trim, dz));
      }
    }
    // open shopfront, lit inside
    const s0 = Math.max(o.z0 + 0.25, camZ + 0.4), s1 = o.z1 - 0.25;
    if (s1 > s0) {
      quad(f(X, 0.05, s0), f(X, 2.3, s0), f(X, 2.3, s1), f(X, 0.05, s1), tint("#6b5a44", dz));
      // pashminas and bags hanging in the doorway
      const n = Math.max(3, Math.round((s1 - s0) / 0.45));
      for (let i = 0; i < n; i++) {
        const a = S.lerp(s0, s1, i / n) + 0.04, b = S.lerp(s0, s1, (i + 1) / n) - 0.04;
        const len = 0.8 + S.hash(o.seed + i) * 0.7;
        quad(f(X - 0.02, 2.2, a), f(X - 0.02, 2.2, b), f(X - 0.02, 2.2 - len, b), f(X - 0.02, 2.2 - len, a), tint(GOODS[(i + (o.seed | 0)) % 6], dz));
      }
    }
    // striped awning sloping out over the pavement
    const st = Math.max(4, Math.round((o.z1 - o.z0) / 0.5));
    for (let i = 0; i < st; i++) {
      const a = S.lerp(o.z0, o.z1, i / st), b = S.lerp(o.z0, o.z1, (i + 1) / st);
      if (b < camZ + 0.4) continue;
      const aa = Math.max(a, camZ + 0.4);
      quad(f(X, 2.85, aa), f(X, 2.85, b), f(X - 1.1, 2.45, b), f(X - 1.1, 2.45, aa), tint(i % 2 ? "#fff8ea" : o.awning, dz));
    }
    // blade sign facing us, so it reads straight on
    const sz = o.z0 + 0.15;
    if (sz > camZ + 0.6) {
      const big = o.special;
      const a = P(X - (big ? 2.9 : 1.5), big ? 3.9 : 3.55, sz), b = P(X - 0.05, 3.0, sz);
      if (big) {
        ctx.fillStyle = tint("#e3a526", sz - camZ);
        ctx.fillRect(a[0] - 0.06 * a[2], a[1] - 0.06 * a[2], b[0] - a[0] + 0.12 * a[2], b[1] - a[1] + 0.12 * a[2]);
      }
      ctx.fillStyle = tint(big ? "#b3202a" : o.trim, sz - camZ);
      ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      const fs = (big ? 0.26 : 0.2) * a[2];
      if (fs >= 6) {
        ctx.font = `700 ${fs}px Mukta, sans-serif`;
        ctx.fillStyle = "#fff8ea";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(o.sign, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (b[0] - a[0]) * 0.92);
        ctx.textAlign = "start";
      }
    }
  }

  function prop(o, t) {
    const dz = o.z - camZ;
    if (dz < (o.kind === "tree" ? 4 : o.kind === "lamp" ? 3 : 2.2) || dz > 150) return;
    const [x, y, s] = P(o.x || 0, 0, o.z);
    if (x < -s * 3 || x > W + s * 3) return;
    switch (o.kind) {
      case "lamp": {
        ctx.fillStyle = tint("#2e3a3e", dz);
        ctx.fillRect(x - 0.05 * s, y - 3.3 * s, 0.1 * s, 3.3 * s);
        ctx.fillRect(x - 0.13 * s, y - 0.15 * s, 0.26 * s, 0.15 * s);
        ctx.fillRect(x - 0.17 * s, y - 3.55 * s, 0.34 * s, 0.25 * s);
        ctx.fillStyle = tint("#ffe9a8", dz);
        ctx.fillRect(x - 0.11 * s, y - 3.5 * s, 0.22 * s, 0.18 * s);
        break;
      }
      case "tree": {
        const k = o.s * s;
        ctx.fillStyle = tint("#cfc4b0", dz); // chautari ring
        ctx.fillRect(x - 0.9 * k, y - 0.45 * k, 1.8 * k, 0.45 * k);
        ctx.fillStyle = tint("#5a3d27", dz);
        ctx.fillRect(x - 0.15 * k, y - 3.4 * k, 0.3 * k, 3 * k);
        [[0, -4.4, 1.6], [-1.1, -3.7, 1.2], [1.1, -3.8, 1.2], [-0.5, -5.2, 1.1], [0.7, -5, 1.1]].forEach((b, i) => {
          ctx.fillStyle = tint(i % 2 ? "#3f7a3c" : "#2f6531", dz);
          ctx.beginPath();
          ctx.arc(x + b[0] * k, y + b[1] * k, b[2] * k, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
      case "bin": {
        // the classic pair: green कुहिने (compost), blue नकुहिने (everything else)
        ctx.fillStyle = tint("#3b3b3b", dz);
        ctx.fillRect(x - 0.04 * s, y - 1.25 * s, 0.08 * s, 1.25 * s);
        const one = (bx, col, dark, label) => {
          const bw = 0.42 * s, bh = 0.62 * s, by = y - 1.32 * s;
          ctx.fillStyle = tint(col, dz);
          ctx.beginPath();
          ctx.moveTo(bx - bw / 2, by);
          ctx.lineTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw * 0.42, by + bh);
          ctx.lineTo(bx - bw * 0.42, by + bh);
          ctx.fill();
          ctx.fillStyle = tint(dark, dz);
          ctx.fillRect(bx - bw * 0.56, by - 0.1 * s, bw * 1.12, 0.11 * s);
          const fs = 0.12 * s;
          if (fs >= 6) {
            ctx.fillStyle = "#fff";
            ctx.font = `700 ${fs}px Mukta, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, bx, by + bh * 0.5, bw * 0.9);
            ctx.textAlign = "start";
          }
        };
        one(x - 0.23 * s, "#2f8a3e", "#1f5f2a", "कुहिने");
        one(x + 0.23 * s, "#2f6fd0", "#1f4c94", "नकुहिने");
        break;
      }
      case "flags": {
        // prayer flags strung from a rooftop across to a lamp post
        const a = P(SHOP_X, 6, o.z), b = P(WALL_X + 0.35, 3.4, o.z + 3);
        if (a[3] < 5) break;
        S.flags(ctx, a[0], a[1], b[0], b[1], 0.5 * b[2], t, Math.max(3, 0.28 * b[2]), 1 - fog(dz) * 0.8);
        break;
      }
    }
  }

  function duck(x, y, s, t) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 2 + x) * s);
    ctx.scale(s, s);
    ctx.fillStyle = "#fff8ea";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10, -8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2a630";
    ctx.beginPath();
    ctx.moveTo(15, -8);
    ctx.lineTo(21, -6.5);
    ctx.lineTo(15, -5.5);
    ctx.fill();
    ctx.restore();
  }

  function lake(t) {
    // water fills everything left of the wall, out to the far shore
    const far = P(WALL_X, 0, camZ + 400), near = P(WALL_X, 0, camZ + 0.35);
    const wg = ctx.createLinearGradient(0, HOR, 0, H);
    wg.addColorStop(0, "#9fd0e0");
    wg.addColorStop(0.25, "#5fa9c6");
    wg.addColorStop(1, "#2a7395");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(-10, HOR);
    ctx.lineTo(far[0], HOR);
    ctx.lineTo(near[0], near[1]);
    ctx.lineTo(-10, H + 10);
    ctx.closePath();
    ctx.fill();
    // Machhapuchhre's reflection, shimmering
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.18;
    ctx.translate(0, HOR * 2);
    ctx.scale(1, -1);
    const mw = Math.max(W * 1.3, H * 1.2);
    S.himalaya(ctx, W * 0.28 - mw / 2, mw, HOR - H * 0.04, H * 0.24, { haze: "rgba(220,240,246,.9)", base: "#a8c4d8" });
    ctx.restore();
    // ripples, endlessly tiled so they're always there
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < 140; i++) {
      const rz = camZ + 1 + ((((S.hash(i * 1.7) * 90 - camZ) % 90) + 90) % 90);
      const rx = WALL_X - 0.6 - S.hash(i * 3.3) * 60;
      const [x, y, s] = P(rx + Math.sin(t * 0.6 + i) * 0.3, 0, rz);
      if (x > W / 2) continue;
      ctx.globalAlpha = (0.15 + 0.25 * Math.abs(Math.sin(t * 0.8 + i))) * (1 - fog(rz - camZ));
      ctx.lineWidth = Math.max(1, 0.03 * s);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (0.6 + S.hash(i) * 1.4) * s, y);
      ctx.stroke();
    }
    ctx.restore();
    // boats far → near
    const cols = ["#c2412d", "#2f6fd0", "#e3a12a", "#2f9a4b", "#8a3b6b"];
    boats
      .map((b) => ({ b, z: b.z + Math.sin(t * 0.05 * b.drift + b.c * 9) * 6 * b.drift }))
      .filter((o) => o.z - camZ > 0.8)
      .sort((a, b) => b.z - a.z)
      .forEach(({ b, z }) => {
        const [x, y, s] = P(b.x, 0, z);
        if (x < -100 || x > W / 2 + 60) return;
        ctx.globalAlpha = 1 - fog(z - camZ) * 0.8;
        S.boat(ctx, x, y, s * 0.05, cols[(b.c * 5) | 0], t, b.rower);
      });
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const dz = 6 + i * 4 + ((t * 0.3 + i * 3) % 4);
      const [x, y, s] = P(WALL_X - 3 - i * 1.3 + Math.sin(t * 0.2 + i), 0, camZ + dz);
      duck(x, y, s * 0.012, t);
    }
  }

  function promenade() {
    // stone pavement between the lake wall and the shops
    const a = P(WALL_X, 0, camZ + 0.35), b = P(SHOP_X, 0, camZ + 0.35);
    const c = P(SHOP_X, 0, camZ + 400), d = P(WALL_X, 0, camZ + 400);
    const pg = ctx.createLinearGradient(0, HOR, 0, H);
    pg.addColorStop(0, "#c9c1b2");
    pg.addColorStop(0.3, "#a59c8c");
    pg.addColorStop(1, "#8f8676");
    quad(a, b, c, d, pg);
    // flagstones: staggered rows, only where they're big enough to see
    const z0 = Math.floor(camZ) + 1;
    ctx.save();
    for (let k = z0 + 40; k >= z0; k--) {
      const dz = k - camZ;
      const pa = P(0, 0, k), pb = P(0, 0, k + 1);
      if (pa[1] - pb[1] < 1.2) continue;
      const off = (k % 2) * 0.45;
      for (let x = WALL_X + 0.15 + off - 0.9; x < SHOP_X; x += 0.9) {
        const x0 = Math.max(x, WALL_X + 0.15), x1 = Math.min(x + 0.9, SHOP_X);
        if (x1 - x0 < 0.1) continue;
        const v = S.hash(k * 13.1 + Math.round(x * 10));
        const c0 = 150 + v * 40;
        const col = S.mix([c0, c0 - 6, c0 - 16], HAZE, fog(dz) * 0.8);
        quad(P(x0 + 0.03, 0, k + 0.04), P(x1 - 0.03, 0, k + 0.04), P(x1 - 0.03, 0, k + 0.96), P(x0 + 0.03, 0, k + 0.96), S.rgb(col));
      }
    }
    ctx.restore();
    // low stone wall along the lake edge, seen from the inside
    const w0 = P(WALL_X, 0.5, camZ + 0.35), w1 = P(WALL_X, 0.5, camZ + 400);
    const w2 = P(WALL_X, 0, camZ + 400), w3 = P(WALL_X, 0, camZ + 0.35);
    quad(w0, w1, w2, w3, "#857e72");
    const cap0 = P(WALL_X + 0.2, 0.5, camZ + 0.35), cap1 = P(WALL_X + 0.2, 0.5, camZ + 400);
    quad(w0, w1, cap1, cap0, "#a8a091");
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let z = Math.ceil(camZ) + 1; z < camZ + 40; z += 1.2) {
      const p0 = P(WALL_X, 0.5, z), p1 = P(WALL_X, 0, z);
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
    }
    ctx.stroke();
  }

  function frame(ms) {
    const t = reduce ? 2 : ms / 1000;
    tick(ms);

    // sky, mountains across the lake, Sarangkot hills
    S.sky(ctx, 0, 0, W, HOR + 2, [
      [0, "#3f9ad6"],
      [0.6, "#8fd0ee"],
      [1, "#e2f3f6"],
    ]);
    S.sun(ctx, W * 0.82, H * 0.1, Math.min(W, H) * 0.03, "#fffbe6", "rgba(255,245,200,.6)");
    S.clouds(ctx, W, H * 0.11, t * 2, 21, 7, "rgba(255,255,255,.85)", Math.min(1.3, W / 800) + 0.3);
    const mw = Math.max(W * 1.3, H * 1.2);
    S.himalaya(ctx, W * 0.28 - mw / 2, mw, HOR - H * 0.04, H * 0.24, { haze: "rgba(220,240,246,.9)", base: "#a8c4d8" });
    S.hills(ctx, W, HOR - H * 0.012, H * 0.03, "#5d9a74", 3.3, HOR + 2, "#79b48a");
    const pcol = ["#e34b3c", "#f2c230", "#3d7ad6"];
    for (let i = 0; i < 3; i++) {
      const px = ((S.hash(i * 3) * W + t * (6 + i * 2)) % (W + 80)) - 40;
      S.paraglider(ctx, px, H * (0.16 + i * 0.05) + Math.sin(t * 0.5 + i) * 6, 0.7 + i * 0.15, pcol[i]);
    }
    // ground beyond the shops (rarely seen) then lake, promenade, buildings
    ctx.fillStyle = "#8f8676";
    ctx.fillRect(0, HOR, W, H - HOR);
    lake(t);
    promenade();
    things
      .filter((o) => zOf(o) > camZ + 0.4)
      .sort((a, b) => zOf(b) - zOf(a))
      .forEach((o) => (o.kind === "shop" ? shop(o) : prop(o, t)));

    if (!reduce) requestAnimationFrame(frame);
  }

  /* ---------- scroll → walk ---------- */
  let target = 0, cur = 0, lastMs = 0, walking = false, binTick = 0;
  const walker = document.querySelector(".w-sagun");
  const walkerFig = walker && walker.querySelector(".w-sagun__fig");
  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? S.clamp(window.scrollY / max, 0, 1) : 0;
  }
  function tick(ms) {
    const dt = Math.min(0.25, Math.max(0, (ms - lastMs) / 1000));
    lastMs = ms;
    const prev = cur;
    cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 4));
    if (Math.abs(target - cur) < 0.00005) cur = target;
    camZ = -cur * LEN;
    if (++binTick % 30 === 0) placeBins(); // page height can shift as fonts load
    const moving = Math.abs(cur - prev) > 0.00003;
    if (walkerFig && moving !== walking) {
      walking = moving;
      walkerFig.classList.toggle("is-walking", moving);
      window.SagunAudio.setWalking(moving);
    }
  }

  function placeBins() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    // the shop beside her when she says the momo line becomes her restaurant
    const mi = YAP.findIndex((y) => y.momo);
    things.forEach((o) => o.kind === "shop" && o.special && ((o.sign = o.orig), (o.special = false)));
    if (mi >= 0) {
      const at = walkEl.offsetTop - window.innerHeight * 0.6 + ((mi + 0.5) / YAP.length) * walkEl.offsetHeight;
      const zEnd = -S.clamp(at / max, 0, 1) * LEN + DS + 5;
      const shop = things.find((o) => o.kind === "shop" && o.z0 <= zEnd && o.z1 >= zEnd);
      if (shop) {
        shop.orig = shop.sign;
        shop.sign = "Sagun’s Momo Restaurant";
        shop.special = true;
      }
    }
    things.forEach((o) => {
      if (o.kind !== "bin") return;
      const at = walkEl.offsetTop - window.innerHeight * 0.6 + ((o.line + 0.1) / YAP.length) * walkEl.offsetHeight;
      o.z = -S.clamp(at / max, 0, 1) * LEN + DS + 0.8; // beside her as she starts the line, then behind her
    });
  }

  function resize() {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    F = Math.min(H * 0.9, W * 1.25);
    HOR = H * 0.47;
    DS = W < 700 ? 5.2 : 5.6; // how far ahead of us she walks
    if (walker) {
      const s = F / DS;
      const fh = 1.62 * s * (360 / 344);
      const fw = (fh * 200) / 360;
      const feetY = HOR + EYE * s;
      walker.style.width = fw + "px";
      walker.style.height = fh + "px";
      walker.style.left = W / 2 + SAGUN_X * s - fw / 2 + "px";
      walker.style.top = feetY - (344 / 360) * fh + "px";
    }
    readScroll();
    placeBins();
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduce) frame(0);
  });
  window.addEventListener(
    "scroll",
    () => {
      readScroll();
      if (reduce) {
        frame(0);
        clearTimeout(stopT);
        stopT = setTimeout(() => {
          walking = false;
          walkerFig && walkerFig.classList.remove("is-walking");
        }, 350);
      }
    },
    { passive: true }
  );
  let stopT = 0;
  resize();
  cur = target;
  updateYap();
  window.addEventListener("load", () => {
    placeBins();
    updateYap();
  });
  requestAnimationFrame(frame);
})();
