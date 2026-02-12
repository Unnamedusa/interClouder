# ⬡ interClouder v5.0 — Complete Social Network

## Install & Run
```bash
npm install
npm start
# → http://localhost:3000
```

## What's New in v5.0

### 🔐 CloudKids Age Verification
- Quiz gate BEFORE login — 5+ questions about adult life knowledge
- Questions: finances, contracts, taxes, insurance (safe topics)
- 90-second timer, 80% correct to pass
- Failed? +2 penalty questions each attempt (up to 12)
- Profanity filter: blur or black-block mode in CloudKids settings

### 📎 File Attachments with Security
- Image/video/audio/doc/pdf attachments in chat
- **Blocked**: .exe .bat .reg .vbs .dll .lnk .scr + 30 more dangerous types
- **Warned**: .zip .rar .7z (allowed but flagged)
- **Smart scan**: Double extensions (image.jpg.exe), suspicious keywords (trojan, rat, keylog, exploit)
- File size limits by premium tier (50MB → 100MB → 500MB)

### 🖼 Spoiler Attachments
- Mark any file as spoiler before sending
- Blur mode (blurred image, click to reveal) or Block mode (black box)
- Configurable in Settings → CloudKids/Spoiler mode

### ⌨ Keyboard Shortcuts
- Shift+↑ — Edit last message
- Delete — Delete last message
- Escape — Close any modal
- Ctrl+K — Quick search
- Ctrl+, — Open settings
- Alt+↑/↓ — Navigate channels
- Ctrl+Shift+M/D — Toggle mute/deafen

### 🚫 Block & Ignore Users
- **Block**: Messages shown as "🚫 Blocked user" — click to reveal
- **Ignore**: User completely hidden from chat and member panel
- Unblock/Unignore in Settings → Privacy → Blocked/Ignored lists

### 🔐 Account Management
- Delete account with password confirmation
- Profile censoring by Mod+ (blurs profile, adds strike, lowers rep)

### 🎁 Gift Airbound
- CEO/Admin can gift any Airbound tier to users
- Gift recipient gets "🎁 Airbound Gift" badge
- Gift button in CEO Panel → Users tab

### 🛒 Boost Shop
- 3 boost tiers: Server ($3.99), Super ($6.99), Mega ($11.99)
- Airbound Elite: 15% discount, Omega: 30% discount
- Custom role icons for Booster+ rank

### 📢 Anti-Spam Detection
- Auto-detect message flooding (5+ msgs in 10s)
- Duplicate message detection
- Warning notifications to users

### ⏳ Loading Screen
- Animated cube logo with progress bar
- Status messages while loading resources

### 🏰 Early Server System
- First 15,000 servers earn Early Server Owner badge
- Progress bar in CEO Dashboard
- Manual grant after cap via Tags tab

### ⭐ Reputation Engine
- Score = XP/10 + days + msgs/5 + badges×3 + premium(+20) − strikes×15
- 8 levels: Blacklisted → Untrusted → Neutral → Trusted → Respected → Honored → Legendary → Mythic

### 👑 Visual Admin Panel (8 tabs)
- Dashboard, Users, Reputation, Tags, Announcements, Trash, Storage, Terminal

---

## All Previous Features (intact)
- Server creation (Template/Temporary, 4-step wizard)
- Real payment flow (3-step card validation)
- 7 roles with perk inheritance
- Moderation (6 tabs: strikes, kick/ban, slowmode, privileges, auto-mod, server)
- Plugins & AI bots with persistent toggles
- Voice channels (mute/deafen/volume)
- Custom gradients, animated profiles, badges
- 4 themes, accessibility settings
- Session persistence via localStorage

## Files (1525 lines)
```
public/js/data.js        236 lines — Data, roles, badges, security, CloudKids
public/js/components.js  375 lines — Atoms, AgeGate, Login, ServerCreator, Payment
public/js/panels.js      562 lines — Chat, Profile, Mod, CEO, Plugins, Voice, Settings
public/js/app.js         352 lines — Core app logic, state, routing
public/css/styles.css     62 lines — Themes, layout, spoiler/CloudKids CSS
public/index.html         54 lines — Entry point with loading screen
server.js                104 lines — Express backend
```
