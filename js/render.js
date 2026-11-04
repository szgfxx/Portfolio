/* Fills [data-fill] slots on the professional page from window.SAGUN. */
(function () {
  const C = window.SAGUN;
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const isTodo = (s) => /^\s*TODO/i.test(String(s || ""));
  const todoCls = (s) => (isTodo(s) ? ' class="todo"' : "");

  function links() {
    const L = C.links || {};
    const out = [];
    if (L.email) out.push(`<a class="pill" href="mailto:${esc(L.email)}">✉ Email</a>`);
    if (L.linkedin) out.push(`<a class="pill" href="${esc(L.linkedin)}" target="_blank" rel="noopener">in · LinkedIn</a>`);
    if (L.github) out.push(`<a class="pill" href="${esc(L.github)}" target="_blank" rel="noopener">⌥ GitHub</a>`);
    if (L.resume) out.push(`<a class="pill pill--solid" href="${esc(L.resume)}" target="_blank" rel="noopener">↓ Résumé</a>`);
    return out.join("");
  }

  const fills = {
    name: () => esc(C.name),
    headline: () => `<span${todoCls(C.headline)}>${esc(C.headline)}</span>`,
    location: () => (C.location ? `⌖ ${esc(C.location)}` : ""),
    links,
    about: () => (C.about || []).map((p) => `<p${todoCls(p)}>${esc(p)}</p>`).join(""),
    experience: () =>
      (C.experience || [])
        .map(
          (x, i) => `
      <article class="lokta lokta--${i % 2 ? "right" : "left"} lokta--job reveal">
        <div class="dhaka-strip"></div>
        <p class="job__when">${esc(x.when)}${x.where ? " · " + esc(x.where) : ""}</p>
        <h3>${esc(x.role)}</h3>
        <p class="job__org">${esc(x.org)}</p>
        <ul>${(x.points || []).map((p) => `<li${todoCls(p)}>${esc(p)}</li>`).join("")}</ul>
      </article>`
        )
        .join(""),
    projects: () =>
      (C.projects || [])
        .map(
          (p) => `
      <article class="stone reveal">
        <h3>${esc(p.name)}</h3>
        <p${todoCls(p.blurb)}>${esc(p.blurb)}</p>
        <p class="stone__tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</p>
        ${p.link ? `<a class="stone__link" href="${esc(p.link)}" target="_blank" rel="noopener">view →</a>` : ""}
      </article>`
        )
        .join(""),
    skills: () =>
      (C.skills || [])
        .map(
          (g) => `
      <div class="skillgroup">
        <h3>${esc(g.group)}</h3>
        <p class="chips">${(g.items || []).map((s) => `<span>${esc(s)}</span>`).join("")}</p>
      </div>`
        )
        .join(""),
    leadership: () => {
      const L = C.leadership || [], Hn = C.honors || [];
      return (
        (L.length ? `<ul>${L.map((x) => `<li${todoCls(x)}>${esc(x)}</li>`).join("")}</ul>` : "") +
        (Hn.length ? `<h3 class="honors__title">Honors</h3><ul>${Hn.map((x) => `<li${todoCls(x)}>${esc(x)}</li>`).join("")}</ul>` : "")
      );
    },
    education: () =>
      (C.education || [])
        .map(
          (e) => `
      <div class="edu">
        <p class="job__when">${esc(e.when)}</p>
        <h3>${esc(e.school)}</h3>
        <p class="job__org">${esc(e.degree)}</p>
        ${e.notes ? `<p>${esc(e.notes)}</p>` : ""}
      </div>`
        )
        .join(""),
  };

  document.querySelectorAll("[data-fill]").forEach((el) => {
    const f = fills[el.dataset.fill];
    if (f) el.innerHTML = f();
  });

  // reveal-on-scroll
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -12% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();
