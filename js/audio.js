/* Sound for the walks — all generated live with the Web Audio API, no files.
   - music: an original slow-soul groove — walking bass, warm keys,
     finger snaps and a vibraphone that improvises over the chords
   - ambience: lake water + birds, or meadow birds + mountain wind
   - effects: a soft pop for each speech bubble, footsteps while walking
   Browsers only allow sound after a click, so a 🔈/🔊 button turns it on;
   the choice is remembered. */
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  const api = { pop() {}, setWalking() {}, set() {}, speak() {}, surface: "stone" };
  window.SagunAudio = api;
  if (!AC) return;

  let ctx, master, musicBus, ambBus, sfxBus, reverb, noiseBuf;
  let on = false, started = false, scene = "lake";
  const levels = { drums: 1, birds: 1, wind: 0, water: 1 };
  const gains = {};

  /* ---------- toggle button ---------- */
  let wanted = false;
  try {
    wanted = localStorage.getItem("sound") === "on";
  } catch (e) {}
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sound-toggle";
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(btn));
  function paint() {
    btn.textContent = on ? "🔊 sound on" : "🔈 sound off";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
  }
  paint();
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setOn(!on);
  });
  // if they turned sound on last time, start again on their first click or key press
  if (wanted) {
    const kick = () => {
      if (!on) setOn(true);
      window.removeEventListener("pointerdown", kick, true);
      window.removeEventListener("keydown", kick, true);
    };
    window.addEventListener("pointerdown", kick, true);
    window.addEventListener("keydown", kick, true);
  }

  function setOn(v) {
    on = v;
    try {
      localStorage.setItem("sound", v ? "on" : "off");
    } catch (e) {}
    paint();
    if (v) {
      if (!ctx) build();
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
      if (!started) start();
    } else if (ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      if (synth) synth.cancel();
    }
  }

  /* ---------- graph ---------- */
  function build() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    musicBus = gainTo(master, 0.14);
    ambBus = gainTo(master, 0.5);
    sfxBus = gainTo(master, 0.45);
    // a soft hall made from decaying noise
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    reverb.connect(gainTo(musicBus, 0.5));
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  function gainTo(dest, v) {
    const g = ctx.createGain();
    g.gain.value = v;
    g.connect(dest);
    return g;
  }
  function noise() {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    return s;
  }

  /* ---------- instruments ---------- */
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  /* ---------- the tune: an original slow-soul groove ----------
     warm keys on 2 and 4, a walking bass, finger snaps, and a soft
     vibraphone line that improvises over the chords. */
  function bass(t, midi, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = "sine";
    o2.type = "triangle";
    o.frequency.value = hz(midi);
    o2.frequency.value = hz(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const g = ctx.createGain(), g2 = ctx.createGain();
    g2.gain.value = 0.35;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.015);
    g.gain.setTargetAtTime(0.3, t + 0.03, 0.12);
    g.gain.setTargetAtTime(0, t + dur * 0.85, 0.04);
    o.connect(g);
    o2.connect(g2).connect(lp).connect(g);
    g.connect(musicBus);
    [o, o2].forEach((x) => {
      x.start(t);
      x.stop(t + dur + 0.2);
    });
  }
  function keys(t, notes, dur, v) {
    // electric-piano-ish: sine + a bell partial, gentle decay
    notes.forEach((m) => {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
      o.type = "sine";
      o2.type = "sine";
      o.frequency.value = hz(m);
      o2.frequency.value = hz(m) * 3.0;
      g2.gain.setValueAtTime(0.25, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.11 * v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o2.connect(g2).connect(g);
      o.connect(g);
      g.connect(musicBus);
      g.connect(reverb);
      [o, o2].forEach((x) => {
        x.start(t);
        x.stop(t + dur + 0.05);
      });
    });
  }
  function vibes(t, midi, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain(), trem = ctx.createOscillator(), tg = ctx.createGain();
    o.type = "sine";
    o.frequency.value = hz(midi);
    trem.frequency.value = 5.5;
    tg.gain.value = 0.05;
    trem.connect(tg).connect(g.gain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.6, dur * 1.6));
    o.connect(g);
    g.connect(musicBus);
    g.connect(reverb);
    o.start(t);
    trem.start(t);
    o.stop(t + dur * 1.6 + 0.7);
    trem.stop(t + dur * 1.6 + 0.7);
  }
  function snap(t, v) {
    const n = noise(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = "bandpass";
    hp.frequency.value = 2600;
    hp.Q.value = 2;
    g.gain.setValueAtTime(0.5 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    n.connect(hp).connect(g);
    g.connect(musicBus);
    g.connect(reverb);
    n.start(t, Math.random());
    n.stop(t + 0.08);
  }
  function hat(t, v) {
    const n = noise(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    g.gain.setValueAtTime(0.07 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    n.connect(hp).connect(g).connect(musicBus);
    n.start(t, Math.random());
    n.stop(t + 0.05);
  }

  // key of D♭ (MIDI 49); I – vi – ii – V, then I – IV – I – V
  const KEY = 49;
  const PROG = [
    [0, [0, 4, 7, 11]], [9, [0, 3, 7, 10]], [2, [0, 3, 7, 10]], [7, [0, 4, 7, 10]],
    [0, [0, 4, 7, 11]], [5, [0, 4, 7, 11]], [0, [0, 4, 7, 9]], [7, [0, 4, 7, 10]],
  ];
  const PENTA = [0, 2, 4, 7, 9];
  let nextT = 0, step = 0, mel = 7, rest = 0;

  function schedule() {
    if (!on) return;
    const bpm = scene === "mountain" ? 72 : 80;
    const e8 = 60 / bpm / 2;
    while (nextT < ctx.currentTime + 0.4) {
      const t = nextT;
      const bar = Math.floor(step / 8) % PROG.length, inBar = step % 8;
      const [root, ch] = PROG[bar];
      const nextRoot = PROG[(bar + 1) % PROG.length][0];
      const swing = inBar % 2 ? e8 * 0.18 : 0; // lazy swung eighths
      // walking bass in quarters: root, third, fifth, then a step into the next chord
      if (inBar % 2 === 0) {
        const q = inBar / 2;
        const lo = KEY - 24 + root;
        const n = q === 0 ? lo : q === 1 ? lo + ch[1] : q === 2 ? lo + 7 : KEY - 24 + nextRoot + (nextRoot > root ? -1 : 1);
        bass(t, n, e8 * 2);
      }
      // keys on 2 and 4
      if (inBar === 2 || inBar === 6) keys(t, ch.map((c) => KEY - 12 + root + c + (root > 6 ? -12 : 0)), e8 * 1.4, 1);
      // snaps on 2 and 4, a whisper of hi-hat on the off-beats
      const dv = levels.drums;
      if (dv > 0.02) {
        if (inBar === 2 || inBar === 6) snap(t, dv);
        if (inBar % 2) hat(t + swing, dv);
      }
      // vibraphone: chord tones and pentatonic steps, with breathing room
      const phrase = Math.floor(step / 32) % 2; // play 4 bars, mostly rest 4
      if (rest > 0) rest--;
      else if (phrase === 0 || Math.random() < 0.12) {
        if (Math.random() < 0.62) {
          const opts = PENTA.map((p) => p + 12).concat(ch.map((c) => (root + c) % 12 + 12));
          const target = opts[(Math.random() * opts.length) | 0];
          mel = Math.abs(target - mel) > 7 ? mel + Math.sign(target - mel) * 2 : target;
          const len = Math.random() < 0.6 ? 2 : Math.random() < 0.5 ? 1 : 3;
          vibes(t + swing, KEY + mel, e8 * len);
          rest = len - 1;
        }
      }
      step++;
      nextT += e8;
    }
  }

  /* ---------- ambience ---------- */
  function startAmbience() {
    // lake water: low rumbly noise that breathes slowly
    const w = noise(), wl = ctx.createBiquadFilter();
    wl.type = "lowpass";
    wl.frequency.value = 420;
    gains.water = ctx.createGain();
    gains.water.gain.value = 0;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.13;
    lg.gain.value = 0.08;
    lfo.connect(lg).connect(gains.water.gain);
    w.connect(wl).connect(gains.water).connect(ambBus);
    w.start();
    lfo.start();
    // mountain wind: a band of noise that sweeps slowly up and down
    const n = noise(), bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.8;
    bp.frequency.value = 500;
    const sweep = ctx.createOscillator(), sg = ctx.createGain();
    sweep.frequency.value = 0.07;
    sg.gain.value = 260;
    sweep.connect(sg).connect(bp.frequency);
    gains.wind = ctx.createGain();
    gains.wind.gain.value = 0;
    n.connect(bp).connect(gains.wind).connect(ambBus);
    n.start();
    sweep.start();
    applyLevels();
    birdLoop();
  }
  function birdLoop() {
    if (on && levels.birds > 0.05 && Math.random() < 0.8) {
      const t = ctx.currentTime + 0.05;
      const base = 2400 + Math.random() * 1600;
      const n = 2 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        const s = t + i * (0.09 + Math.random() * 0.05);
        o.type = "sine";
        o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), s);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), s + 0.06);
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.05 * levels.birds, s + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0005, s + 0.08);
        o.connect(g).connect(ambBus);
        o.start(s);
        o.stop(s + 0.1);
      }
    }
    setTimeout(birdLoop, 1800 + Math.random() * 4200);
  }
  function applyLevels() {
    if (!ctx || !gains.water) return;
    const now = ctx.currentTime;
    gains.water.gain.setTargetAtTime(0.16 * levels.water, now, 0.8);
    gains.wind.gain.setTargetAtTime(0.22 * levels.wind, now, 0.8);
  }

  function start() {
    started = true;
    nextT = ctx.currentTime + 0.1;
    setInterval(schedule, 100);
    startAmbience();
  }

  /* ---------- her voice: the browser's own text-to-speech ---------- */
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices();
    const pref = ["Veena", "Isha", "Google हिन्दी", "Samantha", "Google UK English Female", "Karen", "Moira", "Tessa"];
    voice =
      pref.map((n) => vs.find((v) => v.name.indexOf(n) === 0)).find(Boolean) ||
      vs.find((v) => /en-IN/i.test(v.lang)) ||
      vs.find((v) => /^en/i.test(v.lang) && /female/i.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang)) ||
      null;
  }
  if (synth) {
    pickVoice();
    synth.addEventListener && synth.addEventListener("voiceschanged", pickVoice);
  }
  // words a default English voice would mangle, spelled the way she'd say them
  const SAY = [
    [/नमस्ते/g, "namaste"], [/你好\s*\(nǐ hǎo\)/g, "nee how"], [/你好/g, "nee how"],
    [/नकुहिने/g, "nakuhine"], [/कुहिने/g, "kuhine"], [/¡Hola!/g, "Hola!"],
    [/C\. elegans/g, "C elegans"], [/Şirince/g, "Shirinjeh"], [/\bPASU\b/g, "pah-soo"],
    [/…/g, ", "], [/\(([^)]*)\)/g, ", $1, "],
    [/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ""],
  ];
  const VOICE = false; // spoken lines are off; flip to true to bring the voice back
  api.speak = function (text, onStart, onEnd) {
    if (!VOICE || !synth) return false;
    synth.cancel();
    if (!on || !text) return false;
    let t = text;
    SAY.forEach(([re, rep]) => (t = t.replace(re, rep)));
    const u = new SpeechSynthesisUtterance(t.trim());
    if (voice) u.voice = voice;
    u.rate = 1.05;
    u.pitch = 1.15;
    u.volume = 1;
    // duck the music while she talks
    u.onstart = () => {
      if (musicBus) musicBus.gain.setTargetAtTime(0.05, ctx.currentTime, 0.15);
      onStart && onStart();
    };
    const done = () => {
      if (musicBus) musicBus.gain.setTargetAtTime(0.14, ctx.currentTime, 0.4);
      onEnd && onEnd();
    };
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
    return true;
  };

  /* ---------- public bits ---------- */
  api.scene = function (name) {
    scene = name;
    if (name === "mountain") Object.assign(levels, { water: 0, wind: 0.2, birds: 1, drums: 1 });
    else Object.assign(levels, { water: 1, wind: 0, birds: 1, drums: 1 });
    applyLevels();
  };
  api.set = function (name, v) {
    if (Math.abs((levels[name] || 0) - v) < 0.02) return;
    levels[name] = v;
    applyLevels();
  };
  api.pop = function () {
    if (!on || !ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(980, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.16);
    o.connect(g).connect(sfxBus);
    o.start(t);
    o.stop(t + 0.18);
  };
  // footsteps: taps on stone, crunches on snow, soft thuds on grass/dirt
  let walking = false, stepTimer = 0, foot = 0;
  function footstep() {
    if (!on || !ctx) return;
    const t = ctx.currentTime;
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    const surf = api.surface;
    f.type = surf === "snow" ? "highpass" : "bandpass";
    f.frequency.value = surf === "snow" ? 1800 : surf === "stone" ? 1300 : 500;
    f.Q.value = surf === "stone" ? 2 : 0.8;
    const len = surf === "snow" ? 0.16 : surf === "stone" ? 0.05 : 0.09;
    const v = (surf === "snow" ? 0.25 : 0.35) * (foot++ % 2 ? 0.85 : 1);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(f).connect(g).connect(sfxBus);
    n.start(t, Math.random());
    n.stop(t + len + 0.02);
  }
  api.setWalking = function (v) {
    if (v === walking) return;
    walking = v;
    clearInterval(stepTimer);
    if (v) {
      footstep();
      stepTimer = setInterval(footstep, 350); // two steps per 0.7 s stride
    }
  };
})();
