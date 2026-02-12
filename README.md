# ⬡ interClouder v6.0

> Secure social network with **intercoder bridge** — a custom scripting language (.inex) for bots, plugins, admin tools, and hooks.

## Stack

- **Runtime**: Next.js 14 (App Router)
- **Frontend**: React 18 (Client Components)
- **Language**: intercoder bridge (.inex) — custom interpreter
- **Accessibility**: WCAG 2.1 AA compliant

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## intercoder bridge (.inex)

A custom scripting language exclusive to interClouder for creating bots, plugins, admin tools, and event hooks.

### Language Features

| Feature | Syntax |
|---------|--------|
| Variables | `let x = 10`, `const PI = 3.14`, `mut counter = 0` |
| Functions | `fn greet(name) { reply("Hello " + name) }` |
| Conditionals | `if`, `elif`, `else` |
| Loops | `for item in list { }`, `while condition { }` |
| Pattern matching | `match role { "admin" -> log("admin") }` |
| Pipe operator | `data \| transform \| output` |
| Arrow functions | `(x) -> { return x * 2 }` |
| Error handling | `try { } catch (e) { }` |
| Events | `on message(msg) { }` |
| Operators | `and`, `or`, `not`, `is`, `has` |

### Declarations

```inex
// Bot
bot "GreeterBot" {
  config { prefix: "!" }
  on message(msg) {
    if starts_with(msg.content, "!hello") {
      reply("Hello! 👋")
    }
  }
}

// Plugin
plugin "AutoMod" {
  meta { author: "admin", version: "1.0" }
  on message(msg) {
    if contains_profanity(msg.content) {
      delete(msg)
      warn(msg.author, "Language")
    }
  }
}

// Admin tool
admin "Stats" {
  command "info" {
    let server = get_server()
    reply(embed({ title: "Server Info", color: "#A855F7" }))
  }
}

// Hook
hook "XP_System" {
  on message(msg) {
    let xp = random(5, 15)
    log("+" + to_string(xp) + " XP")
  }
}
```

### Built-in Standard Library

**Platform actions**: `reply`, `send`, `delete`, `warn`, `kick`, `ban`, `mute`, `unmute`, `assign_role`, `remove_role`, `create_channel`, `broadcast`, `pin_message`, `embed`

**String**: `len`, `upper`, `lower`, `trim`, `split`, `join`, `replace`, `contains`, `starts_with`, `ends_with`, `regex_match`, `sanitize`

**Math**: `abs`, `ceil`, `floor`, `round`, `min`, `max`, `random`, `sqrt`, `pow`

**Array**: `range`, `push`, `pop`, `map`, `filter`, `reduce`, `sort`, `reverse`, `flat`, `unique`, `slice`, `find`, `count`

**Object**: `keys`, `values`, `entries`, `merge`, `has_key`, `clone`

**Type**: `type`, `is_string`, `is_number`, `is_bool`, `is_list`, `is_map`, `is_null`, `is_fn`

**Conversion**: `to_string`, `to_number`, `to_bool`, `parse_int`, `parse_float`

**Moderation**: `contains_spam`, `contains_profanity`

**Time**: `now`, `timestamp`, `format_time`

### Access

- **INEX IDE**: Full editor with syntax examples, output panel, and registered entity tracking. Open via the `⟨/⟩` button or `Ctrl+Shift+I`.
- **Terminal**: Run inline with `/inex <code>` in the admin terminal.
- **API**: `POST /api/inex` with `{ "code": "...", "action": "run" | "validate" }`.

---

## Accessibility

- Skip navigation link
- Full keyboard navigation (Tab, Enter, Escape, shortcuts)
- ARIA roles, labels, and live regions throughout
- Focus-visible outlines on all interactive elements
- Screen reader support (sr-only labels, role=log, role=alert)
- High Contrast theme option
- Reduced Motion support (CSS + JS toggle)
- Adjustable font size (11-20px)
- Semantic HTML (main, nav, header, aside, fieldset, legend)
- Form labels and autocomplete attributes
- Proper role=switch on toggle buttons
- role=radiogroup on theme/status selectors

---

## Project Structure

```
interclouder-next/
├── app/
│   ├── api/
│   │   ├── health/route.js      # Health check endpoint
│   │   └── inex/route.js        # INEX code execution API
│   ├── globals.css               # All styles + accessibility
│   ├── layout.jsx                # Root layout with skip-link
│   └── page.jsx                  # Main app (all views)
├── components/
│   └── inex/
│       └── InexIDE.jsx           # Full INEX IDE component
├── lib/
│   ├── data.js                   # All app data (roles, badges, etc.)
│   └── inex/
│       ├── index.js              # Entry point + examples
│       ├── lexer.js              # Tokenizer
│       ├── parser.js             # AST builder
│       ├── interpreter.js        # Executor + environment
│       └── stdlib.js             # Built-in functions
├── jsconfig.json
├── next.config.js
└── package.json
```

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health + version info |
| POST | `/api/inex` | Run or validate .inex code |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+,` | Open settings |
| `Ctrl+Shift+I` | Toggle INEX IDE |
| `Escape` | Close modals |
| `Shift+ArrowUp` | Edit last message |
| `Delete` | Delete last message |
| `Ctrl+Enter` | Run code (in IDE) |
| `Tab` | Insert indent (in IDE) |
