/**
 * intercoder bridge — Main Entry
 * The complete .inex language runtime for interClouder.
 *
 * Usage:
 *   import { runInex, validateInex } from '@/lib/inex';
 *   const result = runInex(sourceCode, platformAPI);
 */

import { Lexer, LexerError } from './lexer';
import { Parser, ParseError } from './parser';
import { InexInterpreter, RuntimeError } from './interpreter';

export { LexerError, ParseError, RuntimeError };

/**
 * Run .inex source code and return execution results.
 */
export function runInex(source, platformAPI = {}) {
  const startTime = performance.now();

  try {
    // Phase 1: Lex
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    // Phase 2: Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Phase 3: Execute
    const interpreter = new InexInterpreter(platformAPI);
    const result = interpreter.execute(ast);

    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: result.errors.length === 0,
      output: result.output,
      errors: result.errors,
      bots: result.bots,
      plugins: result.plugins,
      commands: result.commands,
      hooks: result.hooks,
      elapsed,
      ast,
      tokens,
    };
  } catch (e) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    let errorType = 'unknown';
    if (e instanceof LexerError) errorType = 'lexer';
    else if (e instanceof ParseError) errorType = 'parser';
    else if (e instanceof RuntimeError) errorType = 'runtime';

    return {
      success: false,
      output: [],
      errors: [{ message: e.message, type: errorType, line: e.line, col: e.col }],
      bots: [],
      plugins: [],
      commands: [],
      hooks: [],
      elapsed,
      ast: null,
      tokens: null,
    };
  }
}

/**
 * Validate .inex source (parse only, no execution).
 */
export function validateInex(source) {
  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return { valid: true, ast, errors: [] };
  } catch (e) {
    return { valid: false, ast: null, errors: [{ message: e.message, line: e.line, col: e.col }] };
  }
}

/**
 * Get syntax highlighting tokens for editor.
 */
export function tokenizeForHighlight(source) {
  try {
    const lexer = new Lexer(source);
    return lexer.tokenize();
  } catch (_e) {
    return [];
  }
}

/**
 * Example .inex programs for the IDE.
 */
export const EXAMPLES = {
  hello: `// Hello World — intercoder bridge
log("Hello from interClouder!")
log("Language: " + LANGUAGE + " v" + VERSION)`,

  bot: `// Bot Example — GreeterBot
bot "GreeterBot" {
  meta {
    author: "admin",
    version: "1.0",
    description: "Welcomes new users"
  }

  config {
    prefix: "!",
    welcome_channel: "#welcome",
    auto_role: "member"
  }

  perms {
    required: "mod",
    can_ban: false
  }

  on message(msg) {
    if msg.content == "!hello" {
      reply("Hello, " + msg.author.name + "! ??")
    }
    if starts_with(msg.content, "!echo ") {
      let text = replace(msg.content, "!echo ", "")
      reply(text)
    }
  }

  on join(user) {
    send("#welcome", "Welcome to the cloud, " + user.name + "! ☁️")
    assign_role(user, "member")
    log("New member: " + user.name)
  }

  on leave(user) {
    send("#general", user.name + " left the server ??")
  }
}`,

  plugin: `// Plugin Example — AutoMod
plugin "AutoMod+" {
  meta {
    author: "interClouder",
    version: "2.0",
    description: "AI-powered auto-moderation"
  }

  config {
    max_warns: 3,
    mute_time: "10m",
    spam_threshold: 5,
    log_channel: "#mod-log"
  }

  let warn_counts = {}

  fn check_spam(msg) {
    if contains_spam(msg.content) {
      return true
    }
    if len(msg.content) > MAX_MSG_LENGTH {
      return true
    }
    return false
  }

  fn handle_warn(user, reason) {
    let uid = user.id
    if not has_key(warn_counts, uid) {
      warn_counts[uid] = 0
    }
    warn_counts[uid] = warn_counts[uid] + 1
    let count = warn_counts[uid]

    warn(user, reason + " (Warning " + to_string(count) + "/3)")
    send("#mod-log", "⚠️ " + user.name + " warned: " + reason)

    if count >= 3 {
      mute(user, "10m")
      send("#mod-log", "?? " + user.name + " auto-muted (3 warnings)")
      warn_counts[uid] = 0
    }
  }

  on message(msg) {
    if check_spam(msg) {
      delete(msg)
      handle_warn(msg.author, "Spam detected")
    }

    if contains_profanity(msg.content) {
      delete(msg)
      handle_warn(msg.author, "Profanity")
    }
  }
}`,

  admin: `// Admin Tool — Server Stats
admin "ServerStats" {
  command "stats" {
    let server = get_server()
    let info = embed({
      title: "?? Server Statistics",
      color: "#A855F7",
      description: "Overview of " + server.name,
      fields: [
        {name: "Members", value: to_string(server.members)},
        {name: "Channels", value: to_string(server.channels)},
        {name: "Created", value: format_time(server.created)}
      ]
    })
    reply(info)
  }

  command "clear" (count) {
    if is_null(count) {
      reply("Usage: /clear <number>")
    } else {
      let n = to_number(count)
      log("Clearing " + to_string(n) + " messages")
      reply("?? Cleared " + to_string(n) + " messages")
    }
  }
}`,

  advanced: `// Advanced — Pipeline & Functional
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Filter & transform
let evens = filter(numbers, (n) -> { return n % 2 == 0 })
let doubled = map(evens, (n) -> { return n * 2 })

log("Evens: " + to_string(evens))
log("Doubled: " + to_string(doubled))

// Match expression
let role = "mod"
match role {
  "ceo" -> log("?? CEO access")
  "admin" -> log("⚡ Admin access")
  "mod" -> log("?? Moderator access")
  default -> log("?? Standard access")
}

// Error handling
try {
  let result = 100 / 0
} catch (e) {
  error("Caught: " + to_string(e))
}

// Custom functions
fn fibonacci(n) {
  if n <= 1 { return n }
  return fibonacci(n - 1) + fibonacci(n - 2)
}

for i in range(1, 11) {
  log("fib(" + to_string(i) + ") = " + to_string(fibonacci(i)))
}`,

  hook: `// Webhook/Hook example
hook "XP_System" {
  on message(msg) {
    let xp = random(5, 15)
    log("+" + to_string(xp) + " XP for " + msg.author.name)
  }

  on reaction(data) {
    log("Reaction " + data.emoji + " by " + data.user.name)
  }
}`,
};
