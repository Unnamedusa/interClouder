# ⬡ interClouder v4.6 — Complete Social Network

## Install & Run
```bash
npm install
npm start
# → http://localhost:3000
```

## Railway Deploy
Push to GitHub → connect repo in Railway → auto-deploys

### 🏰 Early Server System (NEW v4.6)
- First 15,000 servers created earn "Early Server Owner" 🏰 badge for the creator
- Progress bar in CEO Dashboard shows count/cap
- After cap: only CEO/Admin can grant the tag manually via Tags tab
- Early servers show 🏰 indicator on sidebar icon and server header
- Persisted globally via localStorage counter

### ⭐ Reputation Engine (NEW v4.6)
- Score computed from: XP/10 (max 100) + account age in days (max 60) + msgs/5 (max 80) + badges ×3 + premium (+20) − strikes ×15
- 8 reputation levels: Blacklisted → Untrusted → Neutral → Trusted → Respected → Honored → Legendary → Mythic
- Displayed in: profile modal, member panel, sidebar user bar, CEO panel
- CEO can adjust via +XP / -Strike buttons in Reputation tab
- Formula breakdown shown in CEO → Reputation tab

### 👑 Fancy Admin Panel (REBUILT v4.6)
- **📊 Dashboard**: 4 stat cards (users, servers, messages, XP) + Early Server progress + Top 5 XP leaderboard + quick links
- **👥 Users**: Expandable cards with inline XP setter, role dropdown, badge picker, +50 XP / Strike buttons, reputation bar
- **⭐ Reputation**: Full engine view with formula breakdown, all users sorted by rep, +XP / -Strike controls
- **🏷 Tags**: Early Server Owner/Supporter grant panel with search, badge catalog grid
- **📢 Announcements**: Title + content + splash toggle (kept)
- **🗑 Trash**: Visual recovery cards (improved)
- **💾 Storage**: Usage monitor + cleanup (kept)
- **⌘ Terminal**: CMD console now secondary tab with 16+ commands including /granttag

---

### Previous Features (all intact from v4.5)

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

## Files (1543 lines total)
```
public/index.html       21 lines
public/css/styles.css   48 lines
public/js/data.js       107 lines
public/js/components.js 339 lines
public/js/panels.js     673 lines
public/js/app.js        251 lines
server.js               104 lines
package.json            22 lines
```
