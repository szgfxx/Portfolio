/* =====================================================================
   ALL SITE CONTENT LIVES HERE.
   Edit this one file to update the portfolio — no build step needed.

   Anything marked TODO is a placeholder waiting for real info
   (from LinkedIn / recent updates).
   ===================================================================== */

window.SAGUN = {
  name: "Sagun Bhandari",
  firstName: "Sagun",

  headline: "Biochemistry & Mathematics @ Pitzer College · research where biology meets computation",

  // leave "" to hide
  location: "Claremont, CA · from Nepal",

  links: {
    linkedin: "https://www.linkedin.com/in/sagunbhandari/",
    github: "",
    email: "sbhandar@students.pitzer.edu",
    resume: "assets/Sagun-Bhandari-Resume.pdf",
  },

  /* ---------------- "THIS WAY" — the professional trail ---------------- */

  about: [
    "I’m a Biochemistry & Mathematics student (minor in Economics) at Pitzer College. My work sits where biology meets computation: I’ve imaged neurons in C. elegans, and now I model hybrid biological–artificial neural networks in Python.",
    "Before Claremont I did public-health research in Nepal with Incubate Nepal, on tuberculosis treatment and areca-nut toxicology. I love teaching, I speak six languages, and I go looking for problems that need both a pipette and a proof.",
  ],

  experience: [
    {
      role: "Math-Physics Research Assistant",
      org: "Dept. of Natural Sciences, Pitzer College",
      when: "Aug 2026 — Present",
      where: "Claremont, CA",
      points: [
        "Investigate context-dependent learning and prediction in Hybrid Adaptive Networks that integrate biological and artificial neural systems, under a DARPA-funded MURI program.",
        "Build Python simulation pipelines (NumPy, SciPy) to model hybrid neural networks, implement Bayesian belief updates, and test predictive performance against theoretical bounds across network topologies and spectral regimes.",
      ],
    },
    {
      role: "Molecular Biology Research Assistant",
      org: "Dept. of Molecular Biology, Pomona College & Pitzer College",
      when: "May 2025 — Jul 2026",
      where: "Claremont, CA",
      points: [
        "Quantified ACR signaling in C. elegans neurons across 5+ transgenic lines using 3D imaging, microscopy and statistical analysis of behavioral assays.",
        "Designed and validated experimental constructs, analyzing PCR and electrophoresis data to ensure high-fidelity genetic transformations.",
        "Co-authored a 2025 paper on nicotinic acetylcholine receptors and SAX-7 in cell migration (PMID 41205974).",
      ],
    },
    {
      role: "Fellow & Course Assistant",
      org: "Nesin Mathematics Village",
      when: "Aug 2026",
      where: "Şirince, Turkey",
      points: [
        "Selected for an intensive mathematics fellowship; TA for an advanced Introduction to Morse Theory course, leading problem-solving sessions.",
        "Completed upper-undergraduate and graduate-level coursework in Computational Algebraic Geometry, Game Theory, and Probability & Statistics.",
      ],
    },
    {
      role: "Peer Mentor & Student Researcher",
      org: "Incubate Nepal",
      when: "Aug 2023 — 2024",
      where: "Nepal",
      points: [
        "END TB (DOTS Nepal): led epidemiological data collection and statistical modeling alongside Harvard scholars to evaluate tuberculosis treatment in remote Nepal.",
        "SUPARI: mentored students in organizing data and literature reviews on carcinogenic compounds in areca nuts.",
        "Tutored secondary-school students in physics, chemistry, biology and math.",
      ],
    },
  ],

  projects: [
    {
      name: "SAX-7 & cell migration paper",
      blurb: "Co-author of “Nicotinic acetylcholine receptors function with adhesion molecule SAX-7 to reverse cell orientation during migration” (2025).",
      tags: ["C. elegans", "neurobiology", "publication"],
      link: "https://pubmed.ncbi.nlm.nih.gov/41205974/",
    },
    {
      name: "Hybrid Adaptive Networks",
      blurb: "Simulating networks that mix biological and artificial neurons, and how well they predict with Bayesian belief updates. DARPA MURI.",
      tags: ["Python", "NumPy", "SciPy", "ML"],
      link: "",
    },
    {
      name: "END TB · DOTS Nepal",
      blurb: "Epidemiological data collection and statistical modeling to evaluate tuberculosis treatment initiatives in remote Nepal.",
      tags: ["epidemiology", "statistics", "public health"],
      link: "",
    },
    {
      name: "CENEU Medical Spanish",
      blurb: "Studied community health infrastructure in Mexico, shadowed physicians, and built medical Spanish for cross-cultural care.",
      tags: ["global health", "Spanish"],
      link: "",
    },
  ],

  skills: [
    { group: "Technical", items: ["Python", "NumPy", "SciPy", "pandas", "LLM APIs", "R (ggplot2)", "C++"] },
    { group: "Laboratory", items: ["PCR", "Electrophoresis", "Microscopy (Leica Thunder)", "3D imaging", "Cloning", "Molecular biology"] },
    { group: "Languages", items: ["Nepali", "English", "Urdu/Hindi", "Korean", "Spanish", "Mandarin (elementary)"] },
  ],

  leadership: [
    "Diversity Committee Student Representative, Pitzer Student Senate",
    "Social Committee Co-Head, Pasifika Asian Student Union (PASU)",
    "Trip Facilitator, People of Color Outside",
    "Treasurer, Womxn of Color Collective",
    "Junior Year Representative, Pitzer International Students Association",
    "Taught debate and public speaking to 150+ first-generation, low-income students (Public Debate Program)",
    "Course Assistant for Linear Algebra · General Math Tutor",
    "Conference Assistant & Residence Life Office Assistant",
  ],

  honors: [
    "Flora Sanborn Pitzer Scholarship (2026)",
    "Bronze Medalist, Nepal Chemistry Olympiad (2023)",
    "Semifinalist, National Mathematics Olympiad (2022, 2023)",
    "Principal’s Merit Award (2018–2022)",
  ],

  education: [
    {
      school: "Pitzer College",
      degree: "B.A. Biochemistry & Mathematics, Minor in Economics",
      when: "Aug 2024 — May 2028",
      notes: "Coursework: Real Analysis, Machine Learning, Differential Equations, Discrete Mathematics, Linear Algebra, Numerical Methods, Statistics, Biochemistry, Cell Biology, Organic Chemistry.",
    },
  ],

  /* ---------------- "THAT WAY" — the whimsical lakeside ---------------- */

  whimsy: {
    intro:
      "You took the scenic route. Good choice. This is where the non-serious stuff lives.",

    // Click Sagun on the lakeside page to cycle through these
    funFacts: [
      "I speak Nepali, English, Urdu/Hindi, Korean, Spanish and a little Mandarin.",
      "I won a bronze medal at the Nepal Chemistry Olympiad.",
      "I TA’d Morse theory in a math village in the Turkish hills.",
      "I have spent a LOT of hours staring at tiny worms (C. elegans) under a microscope.",
      "TODO fun fact — the weirder the better",
    ],

    // What Sagun says while walking the lakeside — one bubble per stretch of
    // scrolling, in this order. { bin: true } lines pop up as she passes a
    // trash can. Add, remove or reorder freely.
    yap: [
      "hiii. ok walk with me, just keep scrolling →",
      "so this is Lakeside, Pokhara. shops on that side, Phewa on this side. best walk in the world, no notes.",
      "serious me is up a mountain somewhere. this is the unserious one. hi.",
      "fun fact: I speak Nepali, English, Urdu/Hindi, Korean, Spanish and a little Mandarin. my brain is a group chat.",
      { bin: true, text: "ooh a bin! green is कुहिने (compost), blue is नकुहिने (everything else). keep Phewa clean pls 🌊" },
      "I got a bronze medal at the Nepal Chemistry Olympiad. I will be bringing this up forever.",
      "this August I TA’d Morse theory in a tiny math village in Şirince, Turkey. math in the hills = elite.",
      "I have spent SO many hours staring at tiny worms (C. elegans) under a microscope. we’re close now.",
      "stuff currently living in my head: Morse theory, Bayesian updates, and momos. (not in that order.)",
      "TODO a hobby you love, and why",
      { bin: true, text: "another bin!! ok I’m not obsessed with bins. Pokhara just deserves a clean lake." },
      "TODO another hobby",
      "TODO a weird fun fact about you",
      "anyway. I’ve been yapping this whole walk and now I’m hungry. momo time? 🥟",
    ],

    // Silly character stats (0–100). Rename/re-score freely.
    stats: [
      { label: "Chaos", value: 72 },
      { label: "Snack radar", value: 95 },
      { label: "Sleep schedule", value: 12 },
      { label: "Main character energy", value: 88 },
    ],
  },
};
