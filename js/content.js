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
    "Biochemistry & Mathematics student at Pitzer College, working where biology meets computation: from imaging neurons in C. elegans to modeling hybrid neural networks in Python.",
  ],

  experience: [
    {
      role: "Math-Physics Research Assistant",
      org: "Pitzer College",
      when: "Aug 2026 — Present",
      where: "",
      points: ["Modeling hybrid biological–artificial neural networks in Python (DARPA MURI)."],
    },
    {
      role: "Molecular Biology Research Assistant",
      org: "Pomona & Pitzer College",
      when: "May 2025 — Jul 2026",
      where: "",
      points: ["Imaged and quantified neuron signaling in C. elegans; co-authored a 2025 paper."],
    },
    {
      role: "Fellow & Course Assistant",
      org: "Nesin Mathematics Village, Turkey",
      when: "Aug 2026",
      where: "",
      points: ["TA for an advanced Morse Theory course."],
    },
    {
      role: "Peer Mentor & Student Researcher",
      org: "Incubate Nepal",
      when: "2023 — 2024",
      where: "",
      points: ["Tuberculosis and areca-nut public-health research in Nepal."],
    },
  ],

  projects: [
    {
      name: "SAX-7 & cell migration",
      blurb: "Co-authored paper, 2025.",
      tags: ["C. elegans", "publication"],
      link: "https://pubmed.ncbi.nlm.nih.gov/41205974/",
    },
    {
      name: "Hybrid Adaptive Networks",
      blurb: "Simulating mixed biological–artificial neural networks.",
      tags: ["Python", "ML"],
      link: "",
    },
    {
      name: "END TB · Nepal",
      blurb: "Epidemiology and statistics for TB treatment in remote Nepal.",
      tags: ["public health"],
      link: "",
    },
    {
      name: "CENEU Medical Spanish",
      blurb: "Community health and clinical shadowing in Mexico.",
      tags: ["global health"],
      link: "",
    },
  ],

  skills: [
    { group: "Technical", items: ["Python", "NumPy", "SciPy", "pandas", "R", "C++"] },
    { group: "Lab", items: ["PCR", "Microscopy", "3D imaging", "Cloning"] },
    { group: "Languages", items: ["Nepali", "English", "Hindi/Urdu", "Korean", "Spanish", "Mandarin"] },
  ],

  leadership: [
    "Pitzer Student Senate, Diversity Committee",
    "Co-Head, Pasifika Asian Student Union",
    "Treasurer, Womxn of Color Collective",
    "Debate coach for 150+ first-gen students",
    "Linear Algebra Course Assistant",
  ],

  honors: [
    "Flora Sanborn Pitzer Scholarship (2026)",
    "Bronze, Nepal Chemistry Olympiad (2023)",
    "Semifinalist, National Math Olympiad",
  ],

  // What Sagun says while hiking ahead of you, one line per stretch of the climb
  climbTalk: {
    top: "", // the intro already says it
    about: "So, hi! I’m Sagun. Biochem and math at Pitzer, and I love a good trail.",
    experience: "These are the labs I’ve worked in. Lots of Python, lots of tiny worms.",
    projects: "Base camp! Perfect time to show you some projects.",
    skills: "It’s getting cold… good thing I packed some skills 🧣",
    leadership: "I love bringing people together. Even up here.",
    education: "Pitzer College, class of 2028. We’re almost at the top!",
    summit: "Phew, that was quite a walk. Thank you for coming along! 🙏",
  },

  education: [
    {
      school: "Pitzer College",
      degree: "B.A. Biochemistry & Mathematics, Minor in Economics",
      when: "Aug 2024 — May 2028",
      notes: "Real Analysis, Machine Learning, Linear Algebra, Biochemistry.",
    },
  ],

  /* ---------------- "THAT WAY" — the whimsical lakeside ---------------- */

  whimsy: {
    intro:
      "This is the fun stuff. If you were here for a serious talk, please go the other way.",

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
    // trash can, and the { momo: true } line is said outside her momo
    // restaurant. Add, remove or reorder freely.
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
      { momo: true, text: "Ah… I’m tired. I’m gonna have some momo now. Thanks for walking with me 🥟" },
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
