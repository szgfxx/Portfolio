/* Sound for the walks — all generated live with the Web Audio API, no files.
   - music: an original folk-style loop — bansuri-like flute over a drone,
     with madal-style drums
   - ambience: lake water + birds, or meadow birds + mountain wind
   - effects: a soft pop for each speech bubble, footsteps while walking
   Browsers only allow sound after a click, so a 🔈/🔊 button turns it on;
   the choice is remembered. */
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  const api = { pop() {}, setWalking() {}, set() {}, surface: "stone" };
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
    }
  }

  /* ---------- graph ---------- */
  function build() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    musicBus = gainTo(master, 0.32);
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

  function flute(t, midi, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator();
    o.type = "triangle";
    o2.type = "sine";
    o.frequency.value = hz(midi);
    o2.frequency.value = hz(midi) * 2;
    // gentle vibrato that blooms after the attack, like a held bansuri note
    const vib = ctx.createOscillator(), vg = ctx.createGain();
    vib.frequency.value = 5.2;
    vg.gain.setValueAtTime(0, t);
    vg.gain.linearRampToValueAtTime(hz(midi) * 0.006, t + Math.min(0.35, dur * 0.6));
    vib.connect(vg).connect(o.frequency);
    vg.connect(o2.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.07);
    g.gain.setTargetAtTime(0.22, t + 0.1, 0.2);
    g.gain.setTargetAtTime(0, t + dur * 0.92, 0.06);
    const g2 = ctx.createGain();
    g2.gain.value = 0.12;
    o.connect(lp);
    o2.connect(g2).connect(lp);
    lp.connect(g);
    g.connect(musicBus);
    g.connect(reverb);
    [o, o2, vib].forEach((x) => {
      x.start(t);
      x.stop(t + dur + 0.5);
    });
  }

  function pluck(t, midi, gain) {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = hz(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 2.6);
    o.connect(g);
    g.connect(musicBus);
    g.connect(reverb);
    o.start(t);
    o.stop(t + 2.7);
  }

  function dhin(t, v) {
    // the madal's deep left-hand stroke
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(62, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g).connect(musicBus);
    o.start(t);
    o.stop(t + 0.4);
  }
  function ta(t, v) {
    // the bright right-hand slap
    const n = noise(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 1.4;
    g.gain.setValueAtTime(0.35 * v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    n.connect(bp).connect(g).connect(musicBus);
    n.start(t, Math.random());
    n.stop(t + 0.09);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.value = 340;
    og.gain.setValueAtTime(0.12 * v, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(og).connect(musicBus);
    o.start(t);
    o.stop(t + 0.1);
  }

  /* ---------- the tune: generative, pentatonic, never quite the same ---------- */
  const ROOT = 62; // D
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19]; // major pentatonic over two octaves
  const MADAL = [1, 0, 2, 2, 1, 2, 0, 2]; // 1 = dhin, 2 = ta, per eighth note
  let nextT = 0, step = 0, idx = 4, noteLeft = 0;

  function schedule() {
    if (!on) return;
    const bpm = scene === "mountain" ? 76 : 88;
    const e8 = 60 / bpm / 2;
    while (nextT < ctx.currentTime + 0.4) {
      const t = nextT;
      const bar = Math.floor(step / 8), inBar = step % 8;
      // drone: root and fifth every bar
      if (inBar === 0) {
        pluck(t, ROOT - 12, 0.16);
        pluck(t, ROOT - 5, 0.09);
        if (bar % 2) pluck(t + e8 * 4, ROOT - 12, 0.1);
      }
      // madal
      const d = MADAL[inBar], dv = levels.drums;
      if (dv > 0.02) {
        if (d === 1) dhin(t, dv);
        else if (d === 2) ta(t, dv * (inBar % 2 ? 0.8 : 1));
      }
      // flute phrase: wander the scale, rest now and then, land home every 4 bars
      if (noteLeft <= 0) {
        const phraseEnd = bar % 4 === 3 && inBar >= 4;
        if (phraseEnd) {
          if (inBar === 4) flute(t, ROOT + 12, e8 * 4);
          noteLeft = 8 - inBar;
          idx = 5;
        } else if (Math.random() < 0.18) {
          noteLeft = 2; // breathe
        } else {
          idx = Math.max(0, Math.min(SCALE.length - 1, idx + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0]));
          const len = Math.random() < 0.55 ? 2 : Math.random() < 0.5 ? 1 : 3;
          flute(t, ROOT + SCALE[idx], e8 * len);
          noteLeft = len;
        }
      }
      noteLeft--;
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
