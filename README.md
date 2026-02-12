# ⬡ interClouder v4.5 — Complete Social Network

## Install & Run
```bash
npm install
npm start
# → http://localhost:3000
```

## Railway Deploy
Push to GitHub → connect repo in Railway → auto-deploys

---

## ALL FEATURES

### 🔐 Auth & Session
- Login / Register with validation
- 5-Phase Encryption (HoneyTrap → Fractal-Quantum → Neo-Enigma → Reverse-Matrix → Jaw-Breaker)
- Full localStorage persistence (survives page reload)
- 🚪 Logout with confirmation → clears ALL data

### 💬 Chat
- Real-time messaging, emoji reactions (unique per user, toggle like Discord)
- Message tags: IA, MOD, ANNOUNCE, SYSTEM
- XP per message, slowmode indicator, gradient names

### 📋 Server Creation (2 modes, 4-step wizard)
- **Template** (5 presets) or **Temporary** (auto-delete 1h–30d)
- Name, tag (1-6 chars), icon, color, public/private, channels, voice
- Custom roles, server badge (with image), banner, custom theme (name + 2 colors)

### 🛡 Moderation (6 tabs)
- Strikes (8 levels), Kick/Ban, Slowmode per-channel, Privileges with inheritance
- Auto-Mod (8 filters, all persisted), Server edit/delete

### 👑 CEO Panel (5 tabs)
- CMD Console (15+ commands), Users management, Announcements (with splash)
- Trash (14-day recovery), Storage monitor + cleanup

### 👤 Profile Editor
- Edit name, username, avatar, banner, gradient, status
- Custom badges with images, XP bar, premium gates

### ⚙ Settings (7 tabs, ALL persist)
- Appearance (4 themes), Account editor, Gradient (8 presets + custom)
- Privacy (5 toggles), Notifications (4 toggles), Accessibility (motion, compact, font size)
- Premium plans

### 💎 Premium (Real Payment Flow)
- Airbound $1.50 / Elite $4.50 / Omega $8.50
- Card validation → processing → confirmation
- Early Supporter badge (first 10K Elite+ buyers)

### 🎨 Custom Gradients
- 8 presets + custom color pickers + live preview
- Applied to: sidebar, member panel, chat, profile

### 🧩 Plugins & AI Bots (all persisted)
- 8 plugins + 3 AI bots with toggles + GitHub integration

### 🔊 Voice Channels
- Mute/deafen, volume 0-200%, per-user controls

### 🏅 Badges
- 16 built-in + custom with image URL + server badges

### 💾 Data Management
- Storage monitor (KB used, keys, health bar)
- Clean empty data, purge command, clear everything

---

## Files (1357 lines total)
```
public/index.html       21 lines
public/css/styles.css   48 lines
public/js/data.js       98 lines
public/js/components.js 339 lines
public/js/panels.js     485 lines
public/js/app.js        240 lines
server.js               104 lines
package.json            22 lines
```
