# ⬡ interClouder v3.0

> Secure Social Network Platform — Ready for Railway deployment

## Features

### 🔐 5-Phase Encryption (Hidden from users)
1. **HoneyTrap Shield** — Fake data traps for attackers
2. **Fractal-Quantum Vault** — Fractal + quantum entanglement encryption
3. **Neo-Enigma Rotors** — 8-12 randomized ultra-complex rotors
4. **Inverse-Matrix Cipher** — 4x4 matrix block encryption
5. **Jaw-Breaker Defense** — Counter-intel (collects ONLY: IP, Device ID, Geo — NEVER passwords/financial)

### 🔑 Authentication
- Email/password login & registration
- Google OAuth integration (add your Client ID in `.env`)
- Future-ready for 2FA & phone verification
- Animated secure login flow

### ✨ Airbound Premium (3 tiers)
| Tier | Price | Highlights |
|------|-------|------------|
| Airbound | $1.50/mo | Colored name, banner, 1 boost, 720p |
| Airbound Elite | $4.50/mo | Shimmer gradient name, animated profile, 2 boosts, 1080p60 |
| Airbound Omega | $8.50/mo | Rainbow name, full animations, 4 boosts, 4K, custom themes |

### 🏅 Badge System
- **Staff**: C.E.O, Founder, Chief Mod, Senior Admin, Admin, Senior Mod, Moderator, Trial Mod
- **Community**: Matrial Clouder, Early Clouder, Early Member
- **Technical**: Cloud Architect, API Pioneer, Cipher Master
- **Creative**: Nexus, Catalyst, Harmonic, Vortex, Voyager
- **Boost Evolution** (6 levels): Cloud Seed → Rising Cloud → Storm → Thunder → Vortex → Nebula
- **Purchase Evolution** (9 levels over 6 years): Origin → Forming → Solid → Prismatic → Crystal → Radiant → Quantum → Cosmic → Eternal
- **Custom badges**: Admins can create badges with custom images + colors

### 🎭 Role System
- Original roles: Cloud Master, Storm Chief, Sky Warden, Nebula Elite, Drift Walker, Cloudling
- Custom roles per server
- Gradient roles (up to 6 colors) at Boost Tier 5
- XP-based progression

### 🌐 Other Features
- Auto-translate module (12 languages)
- DM permission system (everyone/friends/nobody + mod bot override)
- 4 themes (3 dark + 1 light) free, custom themes with Omega
- Server boost tiers with XP system
- Moderation panel (reports, auto-mod, mod log, custom badges/roles)
- Brief onboarding tutorial

## 🚀 Deploy to Railway

### 1. Quick Deploy
```bash
# Clone / upload this project to a GitHub repo
# Then in Railway dashboard:
# New Project → Deploy from GitHub repo
```

### 2. Environment Variables
Set in Railway dashboard:
```
PORT=3000
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id  # From console.cloud.google.com
```

### 3. Local Development
```bash
npm install
npm start
# Open http://localhost:3000
```

## 📁 Project Structure
```
interclouder/
├── package.json          # Dependencies & scripts
├── server.js             # Express server
├── railway.json          # Railway deployment config
├── .env.example          # Environment variables template
├── config/               # Future: database, auth configs
├── public/
│   ├── index.html        # Entry point
│   ├── css/
│   │   └── styles.css    # Themes, animations, layouts
│   ├── js/
│   │   ├── app.js        # Main React application
│   │   ├── components/
│   │   │   ├── MatrixCube.js    # Animated logo
│   │   │   ├── UI.js            # Avatar, Badge, XPBar, etc.
│   │   │   ├── Login.js         # Auth screen + Google OAuth
│   │   │   ├── Tutorial.js      # Onboarding walkthrough
│   │   │   ├── ProfileModal.js  # User profiles
│   │   │   ├── PremiumModal.js  # Airbound tiers
│   │   │   ├── Settings.js      # All settings panels
│   │   │   ├── Moderation.js    # Mod tools
│   │   │   └── Chat.js          # Message area
│   │   ├── data/
│   │   │   ├── badges.js   # All badge definitions
│   │   │   ├── roles.js    # Roles, XP, boosts, gradients
│   │   │   ├── premium.js  # Airbound tier definitions
│   │   │   └── mock.js     # Mock users, servers, messages
│   │   └── utils/
│   │       ├── crypto-engine.js  # 5-phase encryption
│   │       └── translate.js      # Auto-translate module
│   └── assets/           # Future: images, icons
└── README.md
```

## 🔧 Production TODO
- [ ] Connect real database (PostgreSQL recommended)
- [ ] Implement real Google OAuth verification
- [ ] Connect Google Translate API
- [ ] Add Stripe for Airbound payments
- [ ] Implement WebSocket for real-time chat
- [ ] Add 2FA (TOTP) support
- [ ] Phone number verification
- [ ] File upload storage (S3/Cloudflare R2)
- [ ] Rate limiting & DDoS protection
- [ ] Real Jaw-Breaker forensics collection

## License
MIT — Built with ☁️ by interClouder
