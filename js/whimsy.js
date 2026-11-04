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
  slot("hobbies").innerHTML = (W8.hobbies || [])
    .map(
      (h, i) => `
    <figure class="polaroid" tabindex="0" style="--r:${[-4, 3, -2, 5, -3, 2][i % 6]}deg">
      <div class="polaroid__pic" aria-hidden="true">${esc(h.emoji || "✨")}</div>
      <h3${todo(h.title)}>${esc(h.title)}</h3>
      <p${todo(h.caption)}>${esc(h.caption)}</p>
    </figure>`
    )
    .join("");
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
  slot("obsessions").innerHTML = (W8.obsessions || [])
    .map(
      (w, i) =>
        `<div class="boat" style="--c:${boatColors[i % 5]};--d:${(i * 0.37) % 2}s"><span class="boat__word${/^\s*TODO/i.test(w) ? " todo" : ""}">${esc(w)}</span></div>`
    )
    .join("");

  // animate stat bars when visible
  const io = new IntersectionObserver((es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll("[data-v]").forEach((b) => (b.style.width = b.dataset.v + "%"));
      io.unobserve(e.target);
    })
  );
  io.observe(slot("stats"));

  /* ---------- poke Sagun ---------- */
  const btn = document.querySelector(".w-sagun");
  const bubble = document.querySelector(".w-bubble");
  const facts = W8.funFacts && W8.funFacts.length ? W8.funFacts : ["hi :)"];
  let fi = -1;
  btn.addEventListener("click", () => {
    fi = (fi + 1) % facts.length;
    bubble.textContent = facts[fi];
    btn.classList.remove("is-poked");
    void btn.offsetWidth;
    btn.classList.add("is-poked");
  });

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

  /* ---------- the lake ---------- */
  const cvs = document.getElementById("lake-scene");
  const ctx = cvs.getContext("2d");
  let W, H, scroll = 0;

  function resize() {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function duck(x, y, s, t, dir) {
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 2 + x) * 1.5);
    ctx.scale(dir * s, s);
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
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(11.5, -9.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame(ms) {
    const t = reduce ? 2 : ms / 1000;
    const p = scroll;
    const waterY = H * (0.42 - Math.min(p, 1) * 0.12);

    S.sky(ctx, 0, 0, W, waterY, [
      [0, "#3f9ad6"],
      [0.6, "#8fd0ee"],
      [1, "#d8f0f5"],
    ]);
    S.sun(ctx, W * 0.85, H * 0.12, Math.min(W, H) * 0.035, "#fffbe6", "rgba(255,245,200,.6)");
    S.clouds(ctx, W, H * 0.12, t * 2, 21, 7, "rgba(255,255,255,.85)", Math.min(1.3, W / 800) + 0.3);
    const mw = Math.max(W * 1.1, H * 1.1);
    S.himalaya(ctx, (W - mw) / 2, mw, waterY - H * 0.07, H * 0.24, { haze: "rgba(210,235,245,.9)", base: "#a8c4d8" });
    S.hills(ctx, W, waterY - H * 0.035, H * 0.04, "#5d9a74", 3.3, waterY + 2, "#79b48a");
    S.hills(ctx, W, waterY, H * 0.03, "#3f7e5a", 6.1, waterY + 2);

    // water
    const g = ctx.createLinearGradient(0, waterY, 0, H);
    g.addColorStop(0, "#7cc6dc");
    g.addColorStop(1, "#2b7fa0");
    ctx.fillStyle = g;
    ctx.fillRect(0, waterY, W, H - waterY);
    ctx.save();
    for (let i = 0; i < 90; i++) {
      const v = S.hash(i * 3.3);
      const y = waterY + 6 + v * v * (H - waterY);
      const x = (S.hash(i) * W + Math.sin(t * 0.7 + i) * 14) % W;
      ctx.globalAlpha = 0.15 + 0.3 * Math.abs(Math.sin(t + i));
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1 + v * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 + v * 40, y);
      ctx.stroke();
    }
    ctx.restore();

    const s = Math.max(0.7, Math.min(W, H) / 650);
    S.taalBarahi(ctx, W * 0.72, waterY + H * 0.045, s * 0.9);
    for (let i = 0; i < 7; i++) {
      const dir = i % 2 ? 1 : -1;
      const span = W + 160;
      const depth = S.hash(i * 4.4);
      const x = ((S.hash(i * 9) * span + dir * t * (8 + i * 3)) % span + span) % span - 80;
      S.boat(ctx, x, waterY + H * (0.06 + depth * 0.5), s * (0.5 + depth * 0.9), boatColors[i % 5], t);
    }
    for (let i = 0; i < 4; i++) {
      const span = W + 100;
      const x = ((S.hash(i * 31) * span + t * (12 + i * 4)) % span) - 50;
      duck(x + i * 26, waterY + H * (0.2 + i * 0.012), s * 0.9, t, 1);
    }
    S.flags(ctx, -10, H * 0.04, W + 10, H * 0.08, H * 0.05, t, Math.max(12, Math.min(20, W / 60)));

    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduce) frame(0);
  });
  window.addEventListener(
    "scroll",
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll = max > 0 ? window.scrollY / max : 0;
      if (reduce) frame(0);
    },
    { passive: true }
  );
  resize();
  requestAnimationFrame(frame);
})();
