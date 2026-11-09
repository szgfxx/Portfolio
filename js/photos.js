/* Gallery: justified rows of photos.
   Photos come from assets/album-web/album.json, which GitHub builds
   automatically from whatever is in assets/album/ (see tools/build_album.py).
   Entries in window.SAGUN.album (content.js) can add labels to those photos,
   or add extra photos by hand. */
(function () {
  const grid = document.querySelector(".gallery");
  const filters = document.querySelector(".album__filters");
  const empty = document.querySelector(".album__empty");
  const box = document.querySelector(".lightbox");
  const img = box.querySelector(".lightbox__img");

  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const meta = (p) => [p.when, p.where].filter(Boolean).join(" · ");
  let PHOTOS = [];

  // ---- gather: auto-built list + hand-written extras/labels ----
  const manual = ((window.SAGUN && window.SAGUN.album) || []).filter(Boolean);
  fetch("assets/album-web/album.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
    .then((auto) => {
      const byFile = new Map(manual.filter((m) => m.file).map((m) => [m.file, m]));
      const list = (Array.isArray(auto) ? auto : []).map((a) => Object.assign({}, a, byFile.get(a.file) || {}));
      manual
        .filter((m) => m.src && !m.file)
        .forEach((m) => list.push(Object.assign({ full: m.src, thumb: m.src }, m)));
      PHOTOS = list.filter((p) => p.full);
      render();
    });

  // two columns you scroll down (one on phones). Each photo goes into the
  // shorter column, so the order still reads left → right, top → bottom.
  const cols = () => (window.innerWidth < 640 ? 1 : 2);
  let laidOut = 0;
  function render() {
    if (!PHOTOS.length) {
      empty.hidden = false;
      return;
    }
    PHOTOS.forEach((p, i) => {
      const label = p.title || p.caption;
      const li = document.createElement("li");
      li.className = "tile";
      li.dataset.tag = (p.tag || "").toLowerCase();
      li.style.setProperty("--ar", (p.w && p.h ? p.w / p.h : 4 / 3).toFixed(4));
      li.innerHTML = `
        <button type="button" class="tile__btn" data-i="${i}" aria-label="${esc(label || "Open photo")}">
          <img src="${esc(p.thumb || p.full)}" alt="${esc(p.alt || label || "")}" loading="lazy" decoding="async" />
        </button>
        ${label || meta(p) ? `<div class="tile__label">
          ${p.title ? `<h3>${esc(p.title)}</h3>` : ""}
          ${p.caption ? `<p>${esc(p.caption)}</p>` : ""}
          ${meta(p) ? `<p class="tile__meta">${esc(meta(p))}</p>` : ""}
        </div>` : ""}`;
      p.el = li;
      // photos added by hand have no size yet: fix the shape once they load
      if (!p.w) {
        const im = li.querySelector("img");
        im.addEventListener("load", () => {
          p.w = im.naturalWidth;
          p.h = im.naturalHeight;
          li.style.setProperty("--ar", (p.w / p.h).toFixed(4));
          layout(true);
        }, { once: true });
      }
    });
    layout(true);
    buildFilters();
    window.addEventListener("resize", () => layout(false));
  }
  function layout(force) {
    const n = cols();
    if (!force && n === laidOut) return;
    laidOut = n;
    grid.innerHTML = "";
    const colEls = Array.from({ length: n }, () => {
      const c = document.createElement("div");
      c.className = "gallery__col";
      grid.appendChild(c);
      return c;
    });
    const hgt = new Array(n).fill(0);
    PHOTOS.forEach((p) => {
      if (p.el.hidden) return;
      const k = hgt.indexOf(Math.min(...hgt));
      colEls[k].appendChild(p.el);
      hgt[k] += (p.h && p.w ? p.h / p.w : 0.75) + 0.12; // + room for the label
    });
  }

  // ---- category filters (from sub-folders), only when there are 2+ ----
  function buildFilters() {
    const tags = [];
    PHOTOS.forEach((p) => p.tag && !tags.some((t) => t.toLowerCase() === p.tag.toLowerCase()) && tags.push(p.tag));
    if (tags.length < 2) return;
    filters.hidden = false;
    filters.innerHTML = [["", "everything"], ...tags.map((t) => [t.toLowerCase(), t])]
      .map(([v, label]) => `<button type="button" class="chip" data-tag="${esc(v)}" aria-pressed="${v === ""}">${esc(label)}</button>`)
      .join("");
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      const cur = b.dataset.tag;
      filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
      PHOTOS.forEach((p) => (p.el.hidden = !!cur && p.el.dataset.tag !== cur));
      layout(true);
    });
  }

  // ---- full-screen viewer ----
  let at = 0, opener = null;
  const visible = () => PHOTOS.map((p, i) => (p.el.hidden ? -1 : i)).filter((i) => i >= 0);

  function show(i) {
    at = i;
    const p = PHOTOS[i];
    img.classList.add("is-loading");
    img.onload = () => img.classList.remove("is-loading");
    img.src = p.full;
    img.alt = p.alt || p.title || p.caption || "";
    box.querySelector(".lightbox__title").textContent = p.title || "";
    box.querySelector(".lightbox__caption").textContent = p.caption || "";
    box.querySelector(".lightbox__meta").textContent = [meta(p), p.tag].filter(Boolean).join(" · ");
    const v = visible();
    box.querySelectorAll(".lightbox__nav").forEach((n) => (n.hidden = v.length < 2));
    box.querySelector(".lightbox__count").textContent = v.length > 1 ? `${v.indexOf(i) + 1} / ${v.length}` : "";
    // warm up the neighbours so arrowing feels instant
    [1, -1].forEach((d) => {
      const n = v[(v.indexOf(i) + d + v.length) % v.length];
      if (n != null) new Image().src = PHOTOS[n].full;
    });
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
    show(v[(v.indexOf(at) + d + v.length) % v.length]);
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".tile__btn");
    if (b) open(+b.dataset.i, b);
  });
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__nav--prev").addEventListener("click", () => step(-1));
  box.querySelector(".lightbox__nav--next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => (e.target === box || e.target.classList.contains("lightbox__fig")) && close());
  window.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });
  let sx = null;
  box.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  box.addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
})();
