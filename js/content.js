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

  /* The climb, chapter by chapter. Each chapter's lines pop up in Sagun's
     speech bubble as you scroll, and its card shows on the side for exactly
     as long as she's talking about it. Edit freely; the climb stretches to fit. */
  climb: [
    {
      id: "about", nav: "About",
      lines: [
        "Hi, I’m Sagun, and I want us to climb this together. Let’s go!",
        "I go by she/they, and I’m from Pokhara, Nepal. That big lake down there is basically my backyard 🏞️",
        "I’m currently a junior at Pitzer College, in Claremont, California…",
        "…and I’m double majoring in Mathematics and Biochemistry.",
      ],
      card: {
        kicker: "about.txt", title: "About me", ne: "मेरो बारेमा",
        rows: [
          { h: "Sagun Bhandari", sub: "she/they · from Pokhara, Nepal" },
          { h: "Pitzer College", when: "2024 — 2028", sub: "B.A. Mathematics & Biochemistry · Minor in Economics · Claremont, CA" },
        ],
      },
    },
    {
      id: "coursework", nav: "Coursework",
      lines: [
        "As a double major, I’ve taken a LOT of classes in both areas.",
        "A few: Real Analysis, Biochemistry, Differential Equations, Linear Algebra, Organic Chemistry and Numerical Methods.",
        "I’ve also taught myself some applied math, like Nonlinear Dynamics, Networks, Morse Theory and Topology…",
        "…plus Genetics and Biostatistics, and more. I just like learning things 🤓",
      ],
      card: {
        kicker: "coursework.md", title: "Coursework", ne: "पाठ्यक्रम",
        chips: [
          { label: "Taken", items: ["Real Analysis", "Biochemistry", "Differential Equations", "Linear Algebra", "Organic Chemistry", "Numerical Methods", "Machine Learning", "Statistics", "Cell Biology"] },
          { label: "Self-taught", items: ["Nonlinear Dynamics", "Networks", "Intro to Morse Theory", "Topology", "Genetics", "Biostatistics"] },
        ],
      },
    },
    {
      id: "research", nav: "Research",
      lines: [
        "I also have a few research positions on campus.",
        "Right now I’m working on a math-physics project with Prof. Marzen, all about chaotic systems.",
        "And until recently, I was in Prof. Kato’s molecular biology lab, doing lots of PCR, microscopy and other wet-lab experiments.",
      ],
      card: {
        kicker: "research.log", title: "Research", ne: "अनुसन्धान",
        rows: [
          {
            h: "Math-Physics Research Assistant", sub: "Prof. Marzen · Pitzer College", when: "Aug 2026 — Present",
            points: ["Chaotic systems and prediction in adaptive networks (DARPA MURI).", "Python simulations with NumPy & SciPy."],
          },
          {
            h: "Molecular Biology Research Assistant", sub: "Prof. Kato · Pomona & Pitzer College", when: "May 2025 — Jul 2026",
            points: ["PCR, cloning, electrophoresis, 3D microscopy in C. elegans.", "Co-authored a 2025 paper on cell migration."],
            link: { href: "https://pubmed.ncbi.nlm.nih.gov/41205974/", text: "read the paper →" },
          },
        ],
      },
    },
    {
      id: "campus", nav: "Campus",
      lines: [
        "On campus, I’m on the executive boards of a bunch of affinity groups and clubs…",
        "…the Pitzer International Students Association, the Womxn of Color Collective, PASU, People of Color Outside, and more.",
        "I host events and bonding activities with my friends that bring the community together. I love that part so much 💛",
      ],
      card: {
        kicker: "campus.txt", title: "Campus life", ne: "क्याम्पस",
        list: [
          "Junior Year Representative · Pitzer International Students Association",
          "Treasurer · Womxn of Color Collective",
          "Social Committee Co-Head · Pasifika Asian Student Union (PASU)",
          "Trip Facilitator · People of Color Outside",
          "Diversity Committee · Pitzer Student Senate",
        ],
      },
    },
    {
      id: "work", nav: "Work",
      lines: [
        "I also hold a few on-campus jobs.",
        "I’m an office assistant at the Residence Life & Housing Office, and at the Wellness Center.",
        "And I’m a TA for Linear Algebra and a general math tutor. I love helping students, especially with math!",
      ],
      card: {
        kicker: "jobs.csv", title: "On-campus jobs", ne: "काम",
        list: [
          "Teaching Assistant · Linear Algebra",
          "General Math Tutor",
          "Office Assistant · Residence Life & Housing",
          "Office Assistant · Wellness Center",
        ],
      },
    },
    {
      id: "nepal", nav: "Nepal",
      lines: [
        "Beyond these campus sidequests, I’m also a mentor at a non-profit back in Nepal…",
        "…guiding students from underprivileged backgrounds through applying to higher education around the world 🌏",
      ],
      card: {
        kicker: "mentoring.txt", title: "Mentoring in Nepal", ne: "नेपाल",
        rows: [{ h: "Higher-Education Mentor", sub: "Non-profit · Nepal", points: ["Guiding students from underprivileged backgrounds through university applications worldwide."] }],
      },
    },
    {
      id: "summers", nav: "Summers",
      lines: [
        "Summer is when I like to explore the most.",
        "I did CENEU’s program in Mexico: studying community health, shadowing physicians, and learning medical Spanish.",
        "I spent a summer in Şirince, Turkey, doing math and TA’ing Morse Theory, a topology class.",
        "Another summer, I taught public speaking to middle school students.",
        "And the summer before college, I was a researcher and peer mentor with Incubate Nepal, working on tuberculosis data and mentoring students researching areca nut.",
      ],
      card: {
        kicker: "summers.log", title: "Summers", ne: "गर्मी",
        rows: [
          { h: "CENEU · Medical Spanish & Global Health", sub: "Mexico", points: ["Community health infrastructure, physician shadowing, medical Spanish."] },
          { h: "Fellow & Course Assistant", sub: "Nesin Mathematics Village · Şirince, Turkey", when: "Aug 2026", points: ["TA for Intro to Morse Theory; graduate-level algebraic geometry, game theory, probability."] },
          { h: "Public Speaking Instructor", sub: "Public Debate Program", points: ["Taught debate and public speaking to 150+ first-gen students."] },
          { h: "Researcher & Peer Mentor", sub: "Incubate Nepal", when: "2023 — 2024", points: ["END TB: data collection and statistical modeling with Harvard scholars.", "SUPARI: mentored students reviewing research on areca nut."] },
        ],
      },
    },
    {
      id: "skills", nav: "Skills",
      lines: [
        "Besides all that, I love meeting new people, going to new places, and learning new languages.",
        "It’s getting cold… good thing I packed some skills 🧣",
        "I love building on my skills and putting them into something meaningful. Almost there!",
      ],
      card: {
        kicker: "skills.ini", title: "Skills", ne: "सीपहरू",
        chips: [
          { label: "Technical", items: ["Python", "NumPy", "SciPy", "pandas", "R (ggplot2)", "C++", "LLM APIs"] },
          { label: "Lab", items: ["PCR", "Electrophoresis", "Microscopy", "3D imaging", "Cloning"] },
          { label: "Languages", items: ["Nepali", "English", "Hindi/Urdu", "Korean", "Spanish", "Mandarin (elementary)"] },
        ],
      },
    },
  ],


  education: [
    {
      school: "Pitzer College",
      degree: "B.A. Biochemistry & Mathematics, Minor in Economics",
      when: "Aug 2024 — May 2028",
      notes: "Real Analysis, Machine Learning, Linear Algebra, Biochemistry.",
    },
  ],

  /* ---------------- PHOTO ALBUM (photos.html) ---------------- */
  //
  // HOW TO ADD A PHOTO
  //   1. Put the image file in assets/album/  (jpg / png / webp; under ~1 MB
  //      each keeps the page fast; phone photos can be shrunk first).
  //   2. Add a line below. Only `src` and `title` are required:
  //
  //      { src: "assets/album/turkey-morse.jpg",
  //        title: "Morse theory summer",
  //        caption: "TA'ing topology in Istanbul, and a lot of çay.",
  //        when: "Summer 2025", where: "Istanbul, Turkey",
  //        tag: "travel" },
  //
  //   `tag` groups photos into the filter buttons at the top of the page
  //   (any word works: "research", "campus", "Nepal", "travel", "fun"…).
  //   Photos show in the order you list them. On the wall each photo is
  //   cropped to a 4:5 polaroid (the full photo shows when clicked); if a
  //   face gets cut off, add  focus: "50% 20%"  (left-right, top-bottom).
  album: [
  ],

  /* ---------------- "THAT WAY" — the whimsical lakeside ---------------- */

  whimsy: {
    intro:
      "This is the parallel sagunverse. The fun one. Grab a matcha and stroll with me around this beautiful Lakeside in Pokhara, my hometown. If you were here for a serious talk, please go the other way.",

    // Click Sagun on the lakeside page to cycle through these
    funFacts: [
      "I can say hi in 7 languages.",
      "my hair changes every now and then.",
      "the Duolingo owl and I are very close.",
      "I was given 3 names at birth.",
      "I celebrate my birthday for two days every year. Ask me why >U<",
    ],

    // What Sagun says while walking the lakeside — one bubble per stretch of
    // scrolling, in this order. { bin: true } lines pop up as she passes a
    // trash can, and the { momo: true } line is said outside her momo
    // restaurant. Add, remove or reorder freely.
    //
    // PHOTOS: put image files in assets/photos/ and add them to any line, e.g.
    //   { text: "I’m always taking pictures…", photos: ["assets/photos/sunset.jpg"] }
    // or with captions:
    //   photos: [{ src: "assets/photos/friends.jpg", caption: "lakeside crew" }]
    // They pop up as polaroids beside her while she says that line.
    yap: [
      "I love walking around Lakeside.",
      "great view, great food, a LOT of fun. There is a lot to do here. that’s Phewa lake on the left 🌊",
      "ok, fun facts about me. I love walking barefoot… just not here. (hi, feet creeps 👀)",
      { bin: true, text: "I love being out in nature, and climbing trees 🌳" },
      "I’m always taking pictures. sunsets, friends, everything 📸",
      "I can say hi in 7 languages, and hold a conversation in 5.",
      "Hello! नमस्ते 🙏 你好 (nǐ hǎo)! ¡Hola! …you get the idea.",
      "I love being out and about: camping, hiking, trekking. you’ve seen the mountain page 🏔️",
      "I also experiment with my hair every now and then. green tips today, who knows tomorrow.",
      "I love my jobs.",
      "I’ve spent SOOOO many hours staring at tiny worms (C. elegans) under a microscope. I find them kinda cute.",
      { bin: true, text: "I care about green spaces, and I care about identities." },
      "I like doing math, and I’m always up for helping anyone during my tutoring hours.",
      "Hmm, controversial, but I’m a big fan of Discord and Duolingo. the owl and I are close 🦉",
      "And I used to be a Discord mod. But for a good cause, trust me.",
      "I’m mostly an introvert, but I also feel the need to talk about a lot of things…",
      "Hit me up anytime, for any conversation.",
      { momo: true, text: "Ah… I’m tired. I’m gonna have some momo now. Thanks for walking with me 🥟 Bye!" },
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
