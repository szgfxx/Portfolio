/* Sagun, the character.
   renderSagun(el, { pose: "wave" })  → injects an SVG into el.
   Colors are CSS custom properties (see :root in css/base.css):
     --hair, --hair-dark            black hair
     --hair-tips, --hair-tips-dark  olive-green ends
     --bangs, --bangs-dark          black-blue front pieces
     --skin, --skin-shade
     --top, --top-smock             black smocked tube top
     --pants, --pants-dark          olive cargo pants
     --shoe
*/
(function () {
  let uid = 0;
  const GOLD = "#d9b24c";
  const f = (n) => n.toFixed(2);

  /* ---------- tapered limb outline ----------
     pts: [[x, y, radius], ...] along the bone. Returns a smooth closed path
     with rounded ends, so arms and fingers flow instead of looking stuck on. */
  function limb(pts) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const r = pts[i][2];
      L.push([pts[i][0] - dy * r, pts[i][1] + dx * r]);
      R.push([pts[i][0] + dy * r, pts[i][1] - dx * r]);
    }
    const smooth = (arr) => {
      let d = "";
      for (let i = 1; i < arr.length - 1; i++) {
        const m = [(arr[i][0] + arr[i + 1][0]) / 2, (arr[i][1] + arr[i + 1][1]) / 2];
        d += ` Q${f(arr[i][0])} ${f(arr[i][1])} ${f(m[0])} ${f(m[1])}`;
      }
      const e = arr[arr.length - 1];
      return d + ` L${f(e[0])} ${f(e[1])}`;
    };
    const n = pts.length - 1;
    const Rr = R.slice().reverse();
    return (
      `M${f(L[0][0])} ${f(L[0][1])}` + smooth(L) +
      ` A${f(pts[n][2])} ${f(pts[n][2])} 0 0 0 ${f(R[n][0])} ${f(R[n][1])}` + smooth(Rr) +
      ` A${f(pts[0][2])} ${f(pts[0][2])} 0 0 0 ${f(L[0][0])} ${f(L[0][1])} Z`
    );
  }

  // one five-lobed rhododendron floret
  function floret(x, y) {
    let p = "";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      p += `<circle cx="${f(x + Math.cos(a) * 1.5)}" cy="${f(y + Math.sin(a) * 1.5)}" r="1.5" fill="#d02634" stroke="${GOLD}" stroke-width=".35"/>`;
    }
    return p + `<circle cx="${x}" cy="${y}" r=".75" fill="#7e111c"/>`;
  }

  // sequin rhododendron truss: a dome of florets over a fan of long leaves
  function rhodo(x, y, s) {
    const leaf = (deg) =>
      `<path d="M0 0 Q4 -2.4 10 0 Q4 2.4 0 0Z" transform="translate(0 2) rotate(${deg})" fill="#2f9a3e" stroke="${GOLD}" stroke-width=".6" stroke-linejoin="round"/>`;
    const florets = [[-4.2, -0.6], [4.2, -0.6], [0, 0.6], [-2.3, -4.2], [2.3, -4.2], [0, -6.8]];
    return `
    <g transform="translate(${x} ${y}) scale(${s})">
      ${leaf(25)}${leaf(65)}${leaf(115)}${leaf(155)}
      ${florets.map((p) => floret(p[0], p[1])).join("")}
    </g>`;
  }

  function svg(pose) {
    const id = "s" + ++uid;
    let smock = "";
    for (let y = 146; y <= 188; y += 4.2) smock += `M56 ${y.toFixed(1)} q11 1.4 22 0 t22 0 t22 0 t22 0 `;
    const BODICE = "M65.6 143.5 Q100 139 134.4 143.5 C135 156 134.4 170 133.6 182 Q133.2 187.2 129 188.2 Q100 191.6 71 188.2 Q66.8 187.2 66.4 182 C65.6 170 65 156 65.6 143.5Z";

    // arms (bone points with radii)
    const restArm = limb([[69, 139, 5.68], [65, 158, 4.82], [62, 178, 3.96], [61, 194, 3.61], [60, 207, 3.10]]);
    const waveArm = limb([[131, 139, 5.68], [140, 126, 4.82], [150, 112, 3.96], [154, 96, 3.61], [158, 79, 3.10]]);

    // resting hand: relaxed, fingers together, thumb forward
    const parts = (list) => list.map((d) => `<path d="${d}" fill="var(--skin)"/>`).join("");
    const restHand = parts([
      limb([[60, 206, 4.2], [59.5, 213, 4.6], [59, 220, 4]]),
      limb([[58, 221, 1.9], [57.5, 227, 1.6]]),
      limb([[60, 222, 1.9], [60, 228.5, 1.6]]),
      limb([[62, 221, 1.8], [62.5, 226.5, 1.5]]),
      limb([[63, 211, 1.8], [65.5, 215, 1.6], [65.5, 219, 1.4]]),
    ]);

    const restArmG = (cls) => `
  <g transform="translate(5.5 0)"><g class="${cls}">
    <path d="${restArm}" fill="var(--skin)"/>
    <path d="M66.5 150 Q64 164 62.5 178" stroke="var(--skin-shade)" stroke-width="1.1" fill="none" opacity=".55" stroke-linecap="round"/>
    ${restHand}
    <path d="M57.5 220 L57.5 222 M60 221 L60 223 M62 220.5 L62.2 222" stroke="var(--skin-shade)" stroke-width=".8" opacity=".7"/>
  </g></g>`;

    // waving hand: open palm facing out, fingers fanned, thumb to the side
    const waveHand = parts([
      limb([[158.5, 78, 3.8], [160, 71, 5.2], [161, 65, 5]]),
      limb([[156.5, 63, 1.8], [154.5, 57, 1.6], [153.5, 52.5, 1.4]]),
      limb([[159.5, 61.5, 1.9], [159, 54.5, 1.7], [158.8, 49.5, 1.5]]),
      limb([[162.8, 61.5, 1.9], [163.6, 54.5, 1.7], [164, 49.8, 1.5]]),
      limb([[165.6, 63.5, 1.7], [167.6, 58, 1.5], [168.6, 54, 1.3]]),
      limb([[155.5, 70, 1.9], [151.5, 67, 1.7], [148.8, 63.8, 1.5]]),
    ]);

    return `
<svg class="sagun sagun--${pose}" viewBox="0 0 200 360" role="img" aria-label="Illustration of Sagun ${pose === "wave" ? "waving" : pose === "walk" ? "walking" : "standing"}: short black hair with black-blue front pieces and green tips, wearing a cropped black smocked tube top with sequin rhododendrons and baggy cargo pants">
  <defs>
    <linearGradient id="${id}-hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--hair)"/>
      <stop offset=".7" stop-color="var(--hair-dark)"/>
      <stop offset=".88" stop-color="var(--hair-tips-dark)"/>
      <stop offset="1" stop-color="var(--hair-tips)"/>
    </linearGradient>
    <!-- one continuous hair gradient: black crown → black-blue front → green tips -->
    <linearGradient id="${id}-front" gradientUnits="userSpaceOnUse" x1="0" y1="38" x2="0" y2="124">
      <stop offset="0" stop-color="var(--hair)"/>
      <stop offset=".3" stop-color="var(--bangs)"/>
      <stop offset=".8" stop-color="var(--bangs-dark)"/>
      <stop offset="1" stop-color="var(--hair-tips)"/>
    </linearGradient>
    <!-- soft side-lighting for skin: lit from the upper left -->
    <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="var(--skin)"/>
      <stop offset=".7" stop-color="var(--skin)"/>
      <stop offset="1" stop-color="var(--skin-shade)"/>
    </linearGradient>
    <clipPath id="${id}-bodice">
      <path d="${BODICE}"/>
    </clipPath>
  </defs>

  <!-- shadow -->
  <ellipse cx="100" cy="346" rx="54" ry="7" fill="rgba(0,0,0,.25)"/>

  <g class="sagun__body">
  <!-- short hair, back -->
  <path d="M58 84 C48 28 152 28 142 84 C148 98 150 110 146 120 C140 126 132 124 128 120 L72 120
           C68 124 60 126 54 120 C50 110 52 98 58 84Z" fill="url(#${id}-hair)"/>

  <!-- torso, top and pants, narrowed for a slimmer build -->
  <g transform="translate(100 0) scale(0.84 1) translate(-100 0)">
  <!-- body: neck, shoulders and torso as ONE skin shape -->
  <path d="M92 110 L92 120 C92 125 89 128 83 129.5 C75 131 69 133 67 139 C65 146 66 160 67 176
           C68 186 72.6 190 72.6 196 C72.6 201 69.4 204.5 67.4 210 L132.6 210 C130.6 204.5 127.4 201 127.4 196 C127.4 190 132 186 133 176 C134 160 135 146 133 139 C131 133 125 131 117 129.5
           C111 128 108 125 108 120 L108 110 Z" fill="url(#${id}-skin)"/>
  <!-- definition: chin shadow, collarbones, shoulder line, waist -->
  <path d="M93 112 Q100 118 107 112 L107 116 Q100 121 93 116Z" fill="var(--skin-shade)" opacity=".55"/>
  <path d="M84 135 Q91 133 97 136 M103 136 Q109 133 116 135" stroke="var(--skin-shade)" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M100 136 L100 140" stroke="var(--skin-shade)" stroke-width="1" opacity=".5"/>
  <path d="M75 191 Q76.5 196 74.6 203 M125 191 Q123.5 196 125.4 203" stroke="var(--skin-shade)" stroke-width="1.1" fill="none" opacity=".45"/>
  <path d="M99.3 197 q.7 1.6 1.4 0" stroke="var(--skin-shade)" stroke-width="1.1" fill="none" stroke-linecap="round"/>

  <!-- straight, baggy low-waist cargo pants pooling at the ankles; each leg is its own group so it can walk -->
  <g class="sagun__leg sagun__leg--l">
    <path d="M68 206 L101 206 L101 242 L98 334 Q80 338 63 334 C64 290 63.4 252 64.8 230 C65.6 219 66.8 211 68 206Z" fill="var(--pants)"/>
    <path d="M80 216 Q78 270 74 330 M90 222 Q90 280 88 332" stroke="var(--pants-dark)" stroke-width="1.1" fill="none" opacity=".55"/>
    <path d="M65 314 q8 3 16 -1 t16 1 M64 324 q9 3 17 -1 t16 1" stroke="var(--pants-dark)" stroke-width="1.1" fill="none" opacity=".7"/>
    <rect x="64.5" y="248" width="15" height="23" rx="2" fill="var(--pants-dark)" opacity=".55"/>
    <rect x="64" y="246" width="16" height="6" rx="1.5" fill="var(--pants-dark)"/>
    <circle cx="72" cy="250" r=".9" fill="#c9c3a8"/>
    <path d="M70 334 h26 c2 6 0 10 -6 10 h-16 c-6 0 -8 -4 -4 -10Z" fill="var(--shoe)"/>
    <path d="M68 341 h28" stroke="#e9e4d8" stroke-width="2"/>
  </g>
  <g class="sagun__leg sagun__leg--r">
    <path d="M99 206 L132 206 C133.2 211 134.4 219 135.2 230 C136.6 252 136 290 137 334 Q120 338 102 334 L99 242Z" fill="var(--pants)"/>
    <path d="M110 222 Q110 280 112 332 M120 216 Q122 270 126 330" stroke="var(--pants-dark)" stroke-width="1.1" fill="none" opacity=".55"/>
    <path d="M103 314 q8 3 16 -1 t17 1 M103 324 q9 3 17 -1 t16 1" stroke="var(--pants-dark)" stroke-width="1.1" fill="none" opacity=".7"/>
    <rect x="120.5" y="248" width="15" height="23" rx="2" fill="var(--pants-dark)" opacity=".55"/>
    <rect x="120" y="246" width="16" height="6" rx="1.5" fill="var(--pants-dark)"/>
    <circle cx="128" cy="250" r=".9" fill="#c9c3a8"/>
    <path d="M104 334 h26 c4 6 2 10 -4 10 h-16 c-6 0 -8 -4 -6 -10Z" fill="var(--shoe)"/>
    <path d="M104 341 h28" stroke="#e9e4d8" stroke-width="2"/>
  </g>
  <path d="M68.2 204 L131.8 204 L132.8 212 L67.2 212 Z" fill="var(--pants-dark)"/>
  <path d="M79 204 v8 M100 204 v8 M121 204 v8" stroke="var(--pants)" stroke-width="2"/>

  <!-- tube top: straight fit, cropped above the stomach -->
  <path d="${BODICE}" fill="var(--top)"/>
  <g clip-path="url(#${id}-bodice)">
    <path d="${smock}" stroke="var(--top-smock)" stroke-width="1.1" fill="none"/>
  </g>
  <path d="M66 143.6 Q100 139.2 134 143.6" stroke="var(--top-smock)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M70 187.6 Q100 191 130 187.6" stroke="var(--top-smock)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M72 190.2 Q100 193.4 128 190.2" stroke="var(--skin-shade)" stroke-width="1.4" fill="none" opacity=".35" stroke-linecap="round"/>

  </g>
  ${rhodo(85.7, 155, 0.9)}
  ${rhodo(114.3, 155, 0.9)}
  ${rhodo(100.0, 166, 0.9)}
  ${rhodo(86.6, 178, 0.8)}
  ${rhodo(113.4, 178, 0.8)}

  <!-- resting arm + hand (mirrored for the right arm when walking) -->
  ${restArmG("sagun__swing sagun__swing--l")}
  ${pose !== "wave" ? `<g transform="translate(200 0) scale(-1 1)">${restArmG("sagun__swing sagun__swing--r")}</g>` : `
  <!-- waving arm + hand -->
  <g transform="translate(-5.5 0)">
  <g class="sagun__arm-wave">
    <path d="${waveArm}" fill="var(--skin)"/>
    <path d="M136 132 Q143 122 149 113" stroke="var(--skin-shade)" stroke-width="1.1" fill="none" opacity=".5" stroke-linecap="round"/>
    <g class="sagun__hand">
      ${waveHand}
      <path d="M157 68 Q161 70 165 67" stroke="var(--skin-shade)" stroke-width=".9" fill="none" opacity=".7" stroke-linecap="round"/>
    </g>
  </g>
  </g>`}

  <!-- head -->
  <g class="sagun__head">
    <!-- slimmer face, tapering to the chin -->
    <path d="M100 41 C120 41 132 57 132 79 C132 99 119 116 100 118 C81 116 68 99 68 79 C68 57 80 41 100 41Z" fill="var(--skin)"/>

    <!-- face -->
    <g class="sagun__eyes">
      <ellipse cx="87" cy="86" rx="6.2" ry="6" fill="#2a1a14"/>
      <ellipse cx="113" cy="86" rx="6.2" ry="6" fill="#2a1a14"/>
      <circle cx="89.1" cy="84" r="1.9" fill="#fff"/>
      <circle cx="115.1" cy="84" r="1.9" fill="#fff"/>
    </g>
    <!-- thin brows -->
    <path d="M81 74 q7 -4 12.5 -1 M106.5 73 q6 -3 12.5 1" stroke="#2a1410" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- the mole between the eyebrows: tiny, thin, black -->
    <circle cx="100" cy="74" r="0.5" fill="#111"/>
    <ellipse cx="80" cy="98" rx="6" ry="3.6" fill="#e07b72" opacity=".35"/>
    <ellipse cx="120" cy="98" rx="6" ry="3.6" fill="#e07b72" opacity=".35"/>
    <!-- soft, small smile; darker lips -->
    <path d="M93 103 Q100 107 107 103 Q100 105 93 103Z" fill="#5e1420" stroke="#5e1420" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M99 92 q1 3 3 2" stroke="var(--skin-shade)" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- front hair: ONE continuous shape from jaw, over the crown, to jaw -->
    <path d="M58 120 C54 112 55 102 56 90 C58 54 76 39 100 39 C124 39 142 54 144 90
             C145 102 146 112 142 120 C138 124 132 122 130 116 C130 106 130 98 126 88
             C120 76 110 66 98 61 C88 65 79 75 74 88 C70 98 70 106 70 116 C68 122 62 124 58 120Z"
          fill="url(#${id}-front)"/>
    <path d="M94 40 Q95 52 98 61" stroke="var(--bangs-dark)" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M86 50 C72 64 64 84 63 100 C62 108 62 114 63 118 M106 50 C124 60 134 80 136 100 C137 108 138 114 137 118"
          stroke="var(--bangs-dark)" stroke-width="1.5" fill="none" opacity=".6"/>
    <path d="M72 66 C76 58 82 52 88 49 M126 70 C121 61 114 55 106 51" stroke="#fff" stroke-width="2.2" fill="none" opacity=".22" stroke-linecap="round"/>
  </g>
  </g>
</svg>`;
  }

  window.renderSagun = function (el, opts) {
    const pose = (opts && opts.pose) || "wave";
    el.innerHTML = svg(pose);
    return el.firstElementChild;
  };

  /* A walker holds both poses: it waves when idle and walks while the page
     adds .is-walking (the scene scripts do that while the camera moves). */
  window.makeWalker = function (el, idle) {
    el.classList.add("walker");
    el.innerHTML = '<span class="walker__pose walker__pose--wave"></span><span class="walker__pose walker__pose--walk"></span>';
    window.renderSagun(el.children[0], { pose: idle || "wave" });
    window.renderSagun(el.children[1], { pose: "walk" });
    return el;
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-sagun]").forEach(function (el) {
      const pose = el.getAttribute("data-sagun") || "wave";
      if (pose === "walker") window.makeWalker(el, el.getAttribute("data-idle"));
      else window.renderSagun(el, { pose: pose });
    });
  });
})();
