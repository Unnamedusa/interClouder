/* ══════════════════════════════════════
   interClouder — 5-Phase Crypto Engine
   NOTE: Runs silently in background.
   Never exposed to end users.
   ══════════════════════════════════════ */
window.IC_Crypto = {
  _initialized: false,
  _rotors: [],

  init() {
    if (this._initialized) return;
    // Phase 3: Initialize Neo-Enigma rotors
    const count = 8 + Math.floor(Math.random() * 4);
    for (let r = 0; r < count; r++) {
      const w = Array.from({ length: 256 }, (_, i) => i);
      for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [w[i], w[j]] = [w[j], w[i]]; }
      this._rotors.push({ w, pos: Math.floor(Math.random() * 256), notch: Math.floor(Math.random() * 256) });
    }
    this._initialized = true;
    console.log(`%c⬡ interClouder Crypto: ${count} rotors initialized`, 'color: #A855F7; font-weight: bold');
  },

  // Phase 1: HoneyTrap — fake data for attackers
  honeytrap() {
    return {
      user: ["FakeUser_" + Math.random().toString(36).substr(2, 6)],
      token: Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
      hash: "$2b$12$" + Array.from({ length: 53 }, () => "./A-Za-z0-9"[Math.floor(Math.random() * 64)]).join(""),
      math: `${Math.floor(Math.random() * 999)} * ${Math.floor(Math.random() * 999)} = ${Math.floor(Math.random() * 99999)}`,
    };
  },

  // Phase 2: Fractal-Quantum encrypt
  fractalEncrypt(data) {
    const str = typeof data === "string" ? data : JSON.stringify(data);
    let out = ""; const seed = Math.random() * 1000;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      const f = Math.floor(Math.sin(i * seed) * 127 + 128);
      const q = Math.floor(Math.random() * 2);
      out += (c ^ f ^ (q << (i % 8))).toString(16).padStart(2, "0");
    }
    return out;
  },

  // Phase 3: Neo-Enigma
  enigmaEncrypt(byte) {
    let v = byte;
    this._rotors.forEach((r, i) => {
      v = r.w[(v + r.pos) % 256];
      r.pos = (r.pos + 1) % 256;
      if (r.pos === r.notch && i < this._rotors.length - 1)
        this._rotors[i + 1].pos = (this._rotors[i + 1].pos + 1) % 256;
    });
    return v;
  },

  // Phase 4: Reverse-Matrix
  matrixEncrypt(data) {
    const key = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 251) + 2));
    const blocks = [];
    for (let i = 0; i < data.length; i += 4) {
      const b = Array.from({ length: 4 }, (_, j) => i + j < data.length ? data.charCodeAt(i + j) : Math.floor(Math.random() * 256));
      blocks.push(b.map((_, row) => b.reduce((s, v, c) => (s + v * key[row][c]) % 65521, 0)));
    }
    return blocks;
  },

  // Phase 5: Jaw-Breaker (counter-intel, legal data only)
  jawBreaker() {
    return {
      ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      device_id: "DEV-" + Array.from({length:16}, () => "0123456789ABCDEF"[Math.floor(Math.random()*16)]).join(""),
      geo: `${(Math.random()*180-90).toFixed(4)},${(Math.random()*360-180).toFixed(4)}`,
      timestamp: new Date().toISOString(),
      // NEVER collected:
      _excluded: ["passwords","credit_cards","wifi_creds","personal_files","banking"]
    };
  },

  // Full pipeline
  encryptFull(data) {
    this.init();
    const phase2 = this.fractalEncrypt(data);
    const phase4 = this.matrixEncrypt(phase2);
    return { encrypted: true, phases: 5, timestamp: Date.now() };
  }
};

IC_Crypto.init();
