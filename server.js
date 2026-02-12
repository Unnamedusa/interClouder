require('dotenv').config();
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(compression());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com",
        "https://accounts.google.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      frameSrc: ["https://accounts.google.com"],
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// ── API Routes ──

// Health check for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0', uptime: process.uptime() });
});

// Simulated auth endpoints (replace with real DB in production)
const users = new Map();
const sessions = new Map();

app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.has(email)) return res.status(409).json({ error: 'Email already registered' });
  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  const user = { id, email, username, display: username, created: new Date().toISOString(), avatar: username.substring(0, 2).toUpperCase(), badges: ['early_member'], role: 'cloudling', premium: null };
  users.set(email, { ...user, password }); // In production: hash password
  const token = 'sess_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  sessions.set(token, user.id);
  res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const token = 'sess_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  const { password: _, ...safeUser } = user;
  sessions.set(token, user.id);
  res.json({ token, user: safeUser });
});

app.post('/api/auth/google', (req, res) => {
  const { credential, clientId } = req.body;
  // In production: verify Google JWT token
  const mockUser = {
    id: 'g_' + Date.now().toString(36),
    email: 'google_user@gmail.com',
    username: 'GoogleUser',
    display: 'Google User',
    avatar: 'GU',
    badges: ['early_member'],
    role: 'cloudling',
    premium: null,
    googleLinked: true
  };
  const token = 'sess_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  res.json({ token, user: mockUser });
});

// Translate endpoint (simulated — in production use Google Translate API)
app.post('/api/translate', (req, res) => {
  const { text, targetLang } = req.body;
  // Simulated translation
  res.json({ translated: text, from: 'auto', to: targetLang, note: 'Connect Google Translate API for production' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ⬡ interClouder v3.0.0`);
  console.log(`  ⬡ Running on port ${PORT}`);
  console.log(`  ⬡ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
