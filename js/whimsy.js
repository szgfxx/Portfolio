/* "That way": sunny Phewa lakeside — boats, ducks, and nonsense. */
(function () {
  const S = window.Scenery;
  const W8 = (window.SAGUN && window.SAGUN.whimsy) || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const todo = (s) => (/^\s*TODO/i.test(String(s)) ? ' class="todo"' : "");

  /* ---------- content ---------- */
  const slot = (n) => document.querySelector(`[data-w="${n}"]`);
  slot("intro").innerHTML = esc(W8.intro || "");
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
  walkEl.style.height = Math.max(1, YAP.length) * 62 + "vh";

  let shown = null, typer = 0, pokeUntil = 0;
  function say(text) {
    if (text === shown) return;
    shown = text;
    clearInterval(typer);
    bubble.classList.remove("is-new");
    void bubble.offsetWidth;
    bubble.classList.add("is-new");
    bubble.classList.toggle("todo", /^\s*TODO/i.test(text));
    if (reduce) {
      bubble.textContent = text;
      return;
    }
    // type it out, like she's actually saying it
    let i = 0;
    bubble.textContent = "";
    typer = setInterval(() => {
      i += 2;
      bubble.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(typer);
    }, 22);
  }
  // which line belongs to the current stretch of the walk
  function lineAt() {
    const top = walkEl.offsetTop, h = walkEl.offsetHeight;
    const p = (window.scrollY + window.innerHeight * 0.6 - top) / h;
    if (p < 0) return -1;
    return Math.min(YAP.length - 1, Math.floor(p * YAP.length));
  }
  function updateYap() {
    if (Date.now() < pokeUntil) return;
    const i = lineAt();
    say(i < 0 ? "psst. scroll and walk with me" : YAP[i].text);
  }

  let fi = -1;
  btn.addEventListener("click", () => {
    fi = (fi + 1) % facts.length;
    pokeUntil = Date.now() + 3500;
    shown = null;
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


  /* ---------- the lakeside walk ----------
     Side-on: shops along the back, a stone pavement in the middle, Phewa in
     front. Scrolling walks Sagun along the pavement. */
  const cvs = document.getElementById("lake-scene");
  const ctx = cvs.getContext("2d");
  let W, H, U, SX, PB, PF, FEET, camX = 0;
  const WORLD = 900; // length of the walk, in U (1 U = 1% of screen height)

  const sxw = (x) => SX + (x - camX) * U; // world → screen

  // shops, trees, lamps, benches and the two bins, placed once
  const SIGNS = ["Momo House", "Trekking Gear", "Lakeside Café", "Pashmina", "Thangka Art", "Books & Maps", "Juice Bar", "Rooftop Pizza", "Singing Bowls", "Boat Rental", "Lassi Corner", "Yak Cheese", "Tibetan Bread", "Fewa Souvenirs"];
  const WALLS = ["#f3e6cf", "#f6d9a8", "#e9c9b3", "#dfe8ee", "#f7f1e6", "#f2c6a0", "#d8e6d0", "#f4d6d6"];
  const TRIM = ["#b8432f", "#2f6fd0", "#2f8a4b", "#c98a2b", "#8a3b6b", "#2a6f86"];
  const shops = [], props = [];
  (function place() {
    const r = S.rng(77);
    let x = -80, k = 0;
    while (x < WORLD + 200) {
      if (r() < 0.16) {
        props.push({ kind: "tree", x: x + 7, s: 0.9 + r() * 0.5 });
        x += 14;
        continue;
      }
      const w = 18 + r() * 12;
      shops.push({
        x, w,
        h: 17 + r() * 14,
        floors: 2 + ((r() * 2) | 0),
        wall: WALLS[(r() * WALLS.length) | 0],
        trim: TRIM[(r() * TRIM.length) | 0],
        awning: TRIM[(r() * TRIM.length) | 0],
        sign: SIGNS[k++ % SIGNS.length],
        roof: r() < 0.5 ? "flat" : "tin",
        goods: r() < 0.55,
      });
      x += w + 1 + r() * 3;
    }
    for (let lx = 20; lx < WORLD + 200; lx += 46) props.push({ kind: "lamp", x: lx });
    [70, 250, 470].forEach((bx) => props.push({ kind: "bench", x: bx }));
    // bins: positioned on resize so she passes one during each "bin" line
    YAP.forEach((y, i) => y.bin && props.push({ kind: "bin", x: 0, line: i }));
    props.sort((a, b) => a.x - b.x);
  })();

  function shop(o, t) {
    const x = sxw(o.x), w = o.w * U, h = o.h * U, base = PB;
    if (x > W || x + w < 0) return;
    const top = base - h;
    // walls
    ctx.fillStyle = o.wall;
    ctx.fillRect(x, top, w, h);
    ctx.fillStyle = "rgba(0,0,0,.06)";
    ctx.fillRect(x + w * 0.86, top, w * 0.14, h);
    // roof
    if (o.roof === "tin") {
      ctx.fillStyle = o.trim;
      ctx.beginPath();
      ctx.moveTo(x - U * 1.2, top + U * 0.4);
      ctx.lineTo(x + w * 0.5, top - U * 4);
      ctx.lineTo(x + w + U * 1.2, top + U * 0.4);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.fillRect(x - U * 0.4, top - U * 1.2, w + U * 0.8, U * 1.4);
      // rooftop water tank, very Pokhara
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(x + w * 0.65, top - U * 4, U * 3, U * 2.9);
    }
    // upper-floor windows + balcony
    const shopH = U * 8.5;
    const fh = (h - shopH) / (o.floors - 1 || 1);
    for (let f = 0; f < o.floors - 1; f++) {
      const fy = top + f * fh;
      const n = Math.max(2, Math.round(o.w / 8));
      for (let i = 0; i < n; i++) {
        const wx = x + (w / n) * (i + 0.5) - U * 1.4;
        ctx.fillStyle = "#3a4250";
        ctx.fillRect(wx, fy + fh * 0.25, U * 2.8, fh * 0.45);
        ctx.fillStyle = o.trim;
        ctx.fillRect(wx - U * 0.3, fy + fh * 0.22, U * 3.4, U * 0.5);
      }
      ctx.fillStyle = "rgba(60,40,30,.55)";
      ctx.fillRect(x + U, fy + fh * 0.82, w - U * 2, U * 0.4);
    }
    // shopfront
    const sy0 = base - shopH;
    ctx.fillStyle = "#2c2420";
    ctx.fillRect(x + U * 1.5, sy0 + U * 3.2, w - U * 3, shopH - U * 3.2);
    ctx.fillStyle = "#f6d68a";
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x + U * 1.5, sy0 + U * 3.2, w - U * 3, shopH - U * 3.2);
    ctx.globalAlpha = 1;
    if (o.goods) {
      // hanging pashminas / bags
      const cols = ["#d4302b", "#2f6fd0", "#f2c230", "#2f9a4b", "#e56aa0", "#7a4bc2"];
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cols[(i + Math.round(o.x)) % cols.length];
        ctx.fillRect(x + U * 2.2 + i * (w - U * 4.4) / 6, sy0 + U * 3.6, (w - U * 4.4) / 6 - U * 0.4, U * (2.4 + (i % 3) * 0.7));
      }
    }
    // striped awning
    const aw = w + U * 1.2, ax = x - U * 0.6, ay = sy0 + U * 2.4;
    const stripes = Math.max(4, Math.round(o.w / 2.5));
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 ? "#fff8ea" : o.awning;
      ctx.beginPath();
      const x0 = ax + (aw / stripes) * i, x1 = ax + (aw / stripes) * (i + 1);
      ctx.moveTo(x0 + U * 0.6, ay - U * 1.2);
      ctx.lineTo(x1 + U * 0.6, ay - U * 1.2);
      ctx.lineTo(x1, ay + U * 1.2);
      ctx.quadraticCurveTo((x0 + x1) / 2, ay + U * 2, x0, ay + U * 1.2);
      ctx.fill();
    }
    // sign board
    ctx.font = `700 ${Math.max(9, U * 1.6)}px Mukta, sans-serif`;
    const tw = Math.min(ctx.measureText(o.sign).width + U * 2, w - U);
    ctx.fillStyle = o.trim;
    ctx.fillRect(x + (w - tw) / 2, sy0 - U * 1.8, tw, U * 2.6);
    ctx.fillStyle = "#fff8ea";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.sign, x + w / 2, sy0 - U * 0.5, w - U * 2);
    ctx.textAlign = "start";
  }

  function prop(o, t) {
    const x = sxw(o.x);
    if (x < -U * 20 || x > W + U * 20) return;
    const base = PB + U * 1.6; // props stand at the back edge of the pavement
    switch (o.kind) {
      case "tree": {
        const s = o.s * U;
        ctx.fillStyle = "#5a3d27";
        ctx.fillRect(x - s * 0.8, base - s * 16, s * 1.6, s * 16);
        ctx.fillStyle = "#cfc4b0"; // chautari ring
        ctx.fillRect(x - s * 4, base - s * 1.6, s * 8, s * 1.6);
        const blobs = [[0, -24, 8], [-6, -19, 6.5], [6.5, -19.5, 6.5], [-3, -28, 6], [4, -27, 6]];
        blobs.forEach((b, i) => {
          ctx.fillStyle = i % 2 ? "#3f7a3c" : "#2f6531";
          ctx.beginPath();
          ctx.arc(x + b[0] * s, base + b[1] * s, b[2] * s, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
      case "lamp": {
        ctx.fillStyle = "#2e3a3e";
        ctx.fillRect(x - U * 0.3, base - U * 15, U * 0.6, U * 15);
        ctx.fillRect(x - U * 0.9, base - U * 0.8, U * 1.8, U * 0.8);
        ctx.beginPath();
        ctx.moveTo(x - U * 1.3, base - U * 15);
        ctx.lineTo(x + U * 1.3, base - U * 15);
        ctx.lineTo(x + U * 0.8, base - U * 17);
        ctx.lineTo(x - U * 0.8, base - U * 17);
        ctx.fill();
        ctx.fillStyle = "#ffe9a8";
        ctx.fillRect(x - U * 0.7, base - U * 16.7, U * 1.4, U * 1.5);
        break;
      }
      case "bench": {
        ctx.fillStyle = "#7a4f2c";
        ctx.fillRect(x - U * 5, base - U * 3, U * 10, U * 0.8);
        ctx.fillRect(x - U * 5, base - U * 5.4, U * 10, U * 0.7);
        ctx.fillRect(x - U * 5, base - U * 4.3, U * 10, U * 0.7);
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(x - U * 4.4, base - U * 5.4, U * 0.6, U * 5.4);
        ctx.fillRect(x + U * 3.8, base - U * 5.4, U * 0.6, U * 5.4);
        break;
      }
      case "bin": {
        ctx.save();
        ctx.translate(x, base);
        ctx.scale(1.45, 1.45);
        ctx.translate(-x, -base);
        // the classic pair: green for कुहिने (organic), blue for नकुहिने (everything else)
        ctx.fillStyle = "#3b3b3b";
        ctx.fillRect(x - U * 0.35, base - U * 7, U * 0.7, U * 7);
        const bin = (bx, col, dark, label) => {
          const bw = U * 3.4, bh = U * 4.6, by = base - U * 7.6;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(bx - bw / 2, by);
          ctx.lineTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw * 0.42, by + bh);
          ctx.lineTo(bx - bw * 0.42, by + bh);
          ctx.fill();
          ctx.fillStyle = dark;
          ctx.fillRect(bx - bw * 0.56, by - U * 0.8, bw * 1.12, U * 0.9);
          ctx.fillRect(bx + bw * 0.12, by - U * 0.3, bw * 0.24, U * 0.25);
          ctx.fillStyle = "#fff";
          ctx.font = `700 ${Math.max(7, U * 0.95)}px Mukta, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, bx, by + bh * 0.5, bw * 0.85);
          ctx.textAlign = "start";
        };
        bin(x - U * 1.85, "#2f8a3e", "#1f5f2a", "कुहिने");
        bin(x + U * 1.85, "#2f6fd0", "#1f4c94", "नकुहिने");
        ctx.restore();
        break;
      }
    }
  }

  function pavement() {
    // back curb
    ctx.fillStyle = "#9b9488";
    ctx.fillRect(0, PB, W, U * 1.6);
    ctx.fillStyle = "#b5ae9f";
    ctx.fillRect(0, PB, W, U * 0.5);
    // stone pavers in rows that get taller toward us
    const rows = [[PB + U * 1.6, 2.6], [0, 3.1], [0, 3.6], [0, 4.2]];
    let y = PB + U * 1.6;
    const avail = PF - y;
    const tot = rows.reduce((a, r) => a + r[1], 0);
    rows.forEach((row, ri) => {
      const rh = (avail * row[1]) / tot;
      ctx.fillStyle = "#5f5a52"; // grout
      ctx.fillRect(0, y, W, rh);
      const sw = 7 + ri * 1.2; // stone width in U
      const k0 = Math.floor((camX - SX / U) / sw) - 1;
      const k1 = Math.ceil((camX + (W - SX) / U) / sw) + 1;
      for (let k = k0; k <= k1; k++) {
        const hsh = S.hash(k * 7.7 + ri * 31);
        const off = ri % 2 ? sw * 0.5 : 0;
        const x0 = sxw(k * sw + off) + U * 0.25;
        const w = sw * U - U * 0.5;
        const tone = 0.82 + hsh * 0.3;
        const c = [150 * tone, 143 * tone, 130 * tone];
        ctx.fillStyle = S.rgb(c);
        const j = U * 0.3;
        ctx.beginPath();
        ctx.moveTo(x0 + j * hsh, y + U * 0.25);
        ctx.lineTo(x0 + w - j * (1 - hsh), y + U * 0.25 + j * 0.5);
        ctx.lineTo(x0 + w, y + rh - U * 0.25);
        ctx.lineTo(x0, y + rh - U * 0.25 - j * hsh);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(x0 + j, y + U * 0.3, w - j * 2, U * 0.35);
      }
      y += rh;
    });
    // lake wall with a low stone parapet and little bollards
    ctx.fillStyle = "#857e72";
    ctx.fillRect(0, PF, W, U * 1.4);
    ctx.fillStyle = "#a59e90";
    ctx.fillRect(0, PF, W, U * 0.5);
    const bs = 16;
    const b0 = Math.floor((camX - SX / U) / bs) - 1;
    for (let k = b0; k < b0 + W / (bs * U) + 3; k++) {
      const bx = sxw(k * bs);
      ctx.fillStyle = "#77706a";
      ctx.fillRect(bx - U * 0.9, PF - U * 1.4, U * 1.8, U * 2.2);
      ctx.fillStyle = "#958d82";
      ctx.fillRect(bx - U * 1.1, PF - U * 1.8, U * 2.2, U * 0.6);
    }
    ctx.fillStyle = "#6c665d";
    ctx.fillRect(0, PF + U * 1.4, W, U * 2.6);
    // stone courses in the wall
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.lineWidth = 1;
    for (let k = b0 * 4; k < b0 * 4 + W / (4 * U) + 12; k++) {
      const bx = sxw(k * 4 + (k % 2) * 2);
      ctx.beginPath();
      ctx.moveTo(bx, PF + U * 1.4);
      ctx.lineTo(bx, PF + U * 4);
      ctx.stroke();
    }
  }

  function lake(t) {
    const top = PF + U * 4;
    const g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, "#4f9fbf");
    g.addColorStop(1, "#22698a");
    ctx.fillStyle = g;
    ctx.fillRect(0, top, W, H - top);
    // wall's reflection
    ctx.fillStyle = "rgba(40,50,50,.25)";
    ctx.fillRect(0, top, W, U * 1.6);
    // ripples drift a bit faster than the pavement (closer to us)
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < 70; i++) {
      const v = S.hash(i * 3.3);
      const y = top + U * 2 + v * (H - top);
      const span = W + 200;
      const x = (((S.hash(i) * span - camX * U * 1.15 + Math.sin(t * 0.7 + i) * 10) % span) + span) % span - 100;
      ctx.globalAlpha = 0.12 + 0.25 * Math.abs(Math.sin(t * 0.8 + i));
      ctx.lineWidth = 1 + v * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 + v * 40, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // doongas tied along the wall, plus a few out on the water
    const s = Math.max(0.6, U / 7);
    for (let i = 0; i < 9; i++) {
      const wx = 30 + i * 70 + S.hash(i) * 30;
      const bx = SX + (wx - camX * 1.15) * U;
      if (bx < -120 || bx > W + 120) continue;
      S.boat(ctx, bx, top + U * (3 + S.hash(i * 5) * 3), s * 1.1, boatColors[i % 5], t);
    }
    for (let i = 0; i < 3; i++) {
      const span = W + 200;
      const bx = (((S.hash(i * 9) * span - camX * U * 1.15 + t * (10 + i * 4)) % span) + span) % span - 100;
      S.boat(ctx, bx, top + U * (12 + i * 5), s * (1.2 + i * 0.25), boatColors[(i + 2) % 5], t, true);
    }
    for (let i = 0; i < 4; i++) {
      const span = W + 100;
      const dx = (((S.hash(i * 31) * span - camX * U * 1.15 + t * (12 + i * 4)) % span) + span) % span - 50;
      duck(dx + i * 26, top + U * (9 + i * 1.2), s * 0.9, t, 1);
    }
  }

  function frame(ms) {
    const t = reduce ? 2 : ms / 1000;
    tick(ms);

    S.sky(ctx, 0, 0, W, PB, [
      [0, "#3f9ad6"],
      [0.5, "#8fd0ee"],
      [1, "#e2f3f6"],
    ]);
    S.sun(ctx, W * 0.85, H * 0.1, Math.min(W, H) * 0.035, "#fffbe6", "rgba(255,245,200,.6)");
    S.clouds(ctx, W, H * 0.1, t * 2, 21, 7, "rgba(255,255,255,.85)", Math.min(1.3, W / 800) + 0.3);
    const mw = Math.max(W * 1.2, H * 1.2);
    S.himalaya(ctx, (W - mw) / 2 - camX * U * 0.03, mw, H * 0.44, H * 0.24, { haze: "rgba(220,240,246,.9)", base: "#a8c4d8" });
    S.hills(ctx, W, H * 0.45, H * 0.05, "#5d9a74", 3.3 + camX * 0.002, PB, "#79b48a");
    // paragliders off Sarangkot
    const pcol = ["#e34b3c", "#f2c230", "#3d7ad6"];
    for (let i = 0; i < 3; i++) {
      const px = ((S.hash(i * 3) * W + t * (6 + i * 2) - camX * U * 0.1) % (W + 80) + W + 80) % (W + 80) - 40;
      S.paraglider(ctx, px, H * (0.18 + i * 0.05) + Math.sin(t * 0.5 + i) * 6, 0.7 + i * 0.15, pcol[i]);
    }

    for (let i = 0; i < shops.length; i++) shop(shops[i], t);
    // prayer flags strung between rooftops
    for (let i = 0; i < shops.length - 1; i += 3) {
      const a = shops[i], b = shops[i + 2];
      if (!b) break;
      const x1 = sxw(a.x + a.w * 0.5), x2 = sxw(b.x + b.w * 0.5);
      if (x2 < 0 || x1 > W) continue;
      S.flags(ctx, x1, PB - a.h * U, x2, PB - b.h * U, U * 3, t, Math.max(8, U * 1.3));
    }
    pavement();
    for (let i = 0; i < props.length; i++) prop(props[i], t);
    lake(t);

    if (!reduce) requestAnimationFrame(frame);
  }

  /* ---------- scroll → walk ---------- */
  let target = 0, cur = 0, lastMs = 0, walking = false;
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
    cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
    if (Math.abs(target - cur) < 0.0001) cur = target;
    camX = cur * WORLD;
    const moving = Math.abs(cur - prev) > 0.00004;
    if (walkerFig && moving !== walking) {
      walking = moving;
      walkerFig.classList.toggle("is-walking", moving);
      walker.classList.toggle("is-walking", moving);
    }
  }

  function placeBins() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    props.forEach((o) => {
      if (o.kind !== "bin") return;
      const at = walkEl.offsetTop - window.innerHeight * 0.6 + ((o.line + 0.45) / YAP.length) * walkEl.offsetHeight;
      o.x = (S.clamp(at / max, 0, 1)) * WORLD + 5; // just ahead of her at that moment
    });
  }

  function resize() {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    U = Math.min(H, W * 1.6) / 100;
    SX = W < 760 ? W * 0.22 : W * 0.14;
    PB = H * 0.64;
    PF = H * 0.8;
    FEET = H * 0.745;
    if (walker) {
      const fh = S.clamp(H * 0.2, 104, 190);
      const fw = (fh * 200) / 360;
      walker.style.width = fw + "px";
      walker.style.height = fh + "px";
      walker.style.left = SX - fw / 2 + "px";
      walker.style.top = FEET - (344 / 360) * fh + "px";
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
      if (reduce) frame(0);
    },
    { passive: true }
  );
  resize();
  cur = target;
  updateYap();
  window.addEventListener("load", () => {
    placeBins();
    updateYap();
  });
  requestAnimationFrame(frame);
})();
