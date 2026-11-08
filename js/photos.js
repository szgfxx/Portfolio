/* Photo album: builds the polaroid wall from window.SAGUN.album. */
(function () {
  const ALBUM = ((window.SAGUN && window.SAGUN.album) || []).filter((p) => p && p.src);
  const grid = document.querySelector(".album__grid");
  const filters = document.querySelector(".album__filters");
  const empty = document.querySelector(".album__empty");
  const box = document.querySelector(".lightbox");

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const meta = (p) => [p.when, p.where].filter(Boolean).join(" · ");
  const tilt = (i) => [-2.4, 1.6, -1, 2.2, -1.8, 0.8][i % 6] + "deg";

  if (!ALBUM.length) {
    empty.hidden = false;
    return;
  }

  // ---- the wall ----
  grid.innerHTML = ALBUM.map(
    (p, i) => `
    <li class="snap" style="--r:${tilt(i)}${p.focus ? `;--focus:${esc(p.focus)}` : ""}" data-tag="${esc((p.tag || "").toLowerCase())}">
      <button type="button" class="snap__btn" data-i="${i}" aria-label="Open photo: ${esc(p.title)}">
        <img src="${esc(p.src)}" alt="${esc(p.alt || p.title)}" loading="lazy" decoding="async" />
      </button>
      <h3>${esc(p.title)}</h3>
      ${p.caption ? `<p class="snap__caption">${esc(p.caption)}</p>` : ""}
      ${meta(p) ? `<p class="snap__meta">${esc(meta(p))}</p>` : ""}
    </li>`
  ).join("");

  // ---- filter chips (only when there are 2+ tags) ----
  const tags = [...new Set(ALBUM.map((p) => p.tag).filter(Boolean))];
  let current = "";
  if (tags.length > 1) {
    filters.hidden = false;
    filters.innerHTML = [["", "everything"], ...tags.map((t) => [t.toLowerCase(), t])]
      .map(([v, label]) => `<button type="button" class="chip" data-tag="${esc(v)}" aria-pressed="${v === ""}">${esc(label)}</button>`)
      .join("");
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      current = b.dataset.tag;
      filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
      grid.querySelectorAll(".snap").forEach((li) => (li.hidden = !!current && li.dataset.tag !== current));
    });
  }

  // ---- lightbox ----
  const img = box.querySelector(".lightbox__img");
  let at = 0, opener = null;
  const visible = () => [...grid.querySelectorAll(".snap:not([hidden]) .snap__btn")].map((b) => +b.dataset.i);

  function show(i) {
    at = i;
    const p = ALBUM[i];
    img.src = p.src;
    img.alt = p.alt || p.title || "";
    box.querySelector(".lightbox__title").textContent = p.title || "";
    box.querySelector(".lightbox__caption").textContent = p.caption || "";
    box.querySelector(".lightbox__meta").textContent = meta(p);
    const many = visible().length > 1;
    box.querySelectorAll(".lightbox__nav").forEach((n) => (n.hidden = !many));
  }
  function open(i, from) {
    opener = from;
    show(i);
    box.hidden = false;
    document.body.classList.add("is-locked");
    box.querySelector(".lightbox__close").focus();
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove("is-locked");
    if (opener) opener.focus();
  }
  function step(d) {
    const v = visible();
    const k = v.indexOf(at);
    show(v[(k + d + v.length) % v.length]);
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".snap__btn");
    if (b) open(+b.dataset.i, b);
  });
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__nav--prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox__nav--next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => e.target === box && close());
  window.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // swipe on phones
  let sx = null;
  box.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
})();
