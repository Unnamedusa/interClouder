/**
 * intercoder bridge — Lexer (Tokenizer)
 * Tokenizes .inex source code into a stream of tokens.
 *
 * Language: intercoder bridge (.inex)
 * Platform: interClouder Social Network
 */

export const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',

  // Identifiers & Keywords
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD',

  // Operators
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  STAR: 'STAR',
  SLASH: 'SLASH',
  PERCENT: 'PERCENT',
  ASSIGN: 'ASSIGN',
  EQUAL: 'EQUAL',
  NOT_EQUAL: 'NOT_EQUAL',
  LESS: 'LESS',
  LESS_EQ: 'LESS_EQ',
  GREATER: 'GREATER',
  GREATER_EQ: 'GREATER_EQ',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  DOT: 'DOT',
  ARROW: 'ARROW',
  PIPE: 'PIPE',

  // Delimiters
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  COMMA: 'COMMA',
  COLON: 'COLON',
  SEMICOLON: 'SEMICOLON',
  AT: 'AT',
  HASH: 'HASH',

  // Special
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
  COMMENT: 'COMMENT',
};

export const KEYWORDS = new Set([
  'bot', 'plugin', 'admin', 'command', 'hook',
  'on', 'emit', 'listen',
  'let', 'const', 'mut',
  'fn', 'return',
  'if', 'else', 'elif',
  'for', 'in', 'while', 'break', 'continue',
  'match', 'case', 'default',
  'import', 'from', 'export', 'as',
  'true', 'false', 'null',
  'config', 'perms', 'meta',
  'reply', 'send', 'delete', 'warn', 'kick', 'ban', 'mute',
  'log', 'error', 'debug',
  'try', 'catch', 'throw',
  'await', 'async',
  'this', 'self',
  'and', 'or', 'not',
  'is', 'has',
]);

export class Token {
  constructor(type, value, line, col) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.col = col;
  }
  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, L${this.line}:${this.col})`;
  }
}

export class LexerError extends Error {
  constructor(message, line, col) {
    super(`[Lexer] Line ${line}, Col ${col}: ${message}`);
    this.line = line;
    this.col = col;
  }
}

export class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  peek() {
    return this.pos < this.source.length ? this.source[this.pos] : null;
  }

  advance() {
    const ch = this.source[this.pos];
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return ch;
  }

  match(expected) {
    if (this.pos < this.source.length && this.source[this.pos] === expected) {
      this.advance();
      return true;
    }
    return false;
  }

  skipWhitespace() {
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  readString(quote) {
    const startLine = this.line;
    const startCol = this.col;
    let value = '';
    while (this.pos < this.source.length) {
      const ch = this.advance();
      if (ch === quote) {
        return new Token(TokenType.STRING, value, startLine, startCol);
      }
      if (ch === '\\') {
        const next = this.advance();
        switch (next) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          case "'": value += "'"; break;
          default: value += '\\' + next;
        }
      } else {
        value += ch;
      }
    }
    throw new LexerError('Unterminated string', startLine, startCol);
  }

  readNumber() {
    const startLine = this.line;
    const startCol = this.col;
    let num = '';
    let hasDot = false;
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (ch === '.' && !hasDot) {
        hasDot = true;
        num += this.advance();
      } else if (/[0-9]/.test(ch)) {
        num += this.advance();
      } else {
        break;
      }
    }
    return new Token(TokenType.NUMBER, parseFloat(num), startLine, startCol);
  }

  readIdentifier() {
    const startLine = this.line;
    const startCol = this.col;
    let id = '';
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (/[a-zA-Z0-9_$]/.test(ch)) {
        id += this.advance();
      } else {
        break;
      }
    }
    if (id === 'true' || id === 'false') {
      return new Token(TokenType.BOOLEAN, id === 'true', startLine, startCol);
    }
    if (id === 'null') {
      return new Token(TokenType.NULL, null, startLine, startCol);
    }
    if (KEYWORDS.has(id)) {
      return new Token(TokenType.KEYWORD, id, startLine, startCol);
    }
    return new Token(TokenType.IDENTIFIER, id, startLine, startCol);
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      const startLine = this.line;
      const startCol = this.col;
      const ch = this.source[this.pos];

      // Comments
      if (ch === '/' && this.source[this.pos + 1] === '/') {
        this.advance(); this.advance();
        let comment = '';
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          comment += this.advance();
        }
        this.tokens.push(new Token(TokenType.COMMENT, comment.trim(), startLine, startCol));
        continue;
      }
      if (ch === '/' && this.source[this.pos + 1] === '*') {
        this.advance(); this.advance();
        let comment = '';
        while (this.pos < this.source.length) {
          if (this.source[this.pos] === '*' && this.source[this.pos + 1] === '/') {
            this.advance(); this.advance();
            break;
          }
          comment += this.advance();
        }
        this.tokens.push(new Token(TokenType.COMMENT, comment.trim(), startLine, startCol));
        continue;
      }

      // Newlines
      if (ch === '\n') {
        this.advance();
        this.tokens.push(new Token(TokenType.NEWLINE, '\\n', startLine, startCol));
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        this.advance();
        this.tokens.push(this.readString(ch));
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Identifiers & keywords
      if (/[a-zA-Z_$]/.test(ch)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Multi-char operators
      this.advance();
      switch (ch) {
        case '+': this.tokens.push(new Token(TokenType.PLUS, '+', startLine, startCol)); break;
        case '-':
          if (this.match('>')) this.tokens.push(new Token(TokenType.ARROW, '->', startLine, startCol));
          else this.tokens.push(new Token(TokenType.MINUS, '-', startLine, startCol));
          break;
        case '*': this.tokens.push(new Token(TokenType.STAR, '*', startLine, startCol)); break;
        case '/': this.tokens.push(new Token(TokenType.SLASH, '/', startLine, startCol)); break;
        case '%': this.tokens.push(new Token(TokenType.PERCENT, '%', startLine, startCol)); break;
        case '=':
          if (this.match('=')) this.tokens.push(new Token(TokenType.EQUAL, '==', startLine, startCol));
          else this.tokens.push(new Token(TokenType.ASSIGN, '=', startLine, startCol));
          break;
        case '!':
          if (this.match('=')) this.tokens.push(new Token(TokenType.NOT_EQUAL, '!=', startLine, startCol));
          else this.tokens.push(new Token(TokenType.NOT, '!', startLine, startCol));
          break;
        case '<':
          if (this.match('=')) this.tokens.push(new Token(TokenType.LESS_EQ, '<=', startLine, startCol));
          else this.tokens.push(new Token(TokenType.LESS, '<', startLine, startCol));
          break;
        case '>':
          if (this.match('=')) this.tokens.push(new Token(TokenType.GREATER_EQ, '>=', startLine, startCol));
          else this.tokens.push(new Token(TokenType.GREATER, '>', startLine, startCol));
          break;
        case '&':
          if (this.match('&')) this.tokens.push(new Token(TokenType.AND, '&&', startLine, startCol));
          break;
        case '|':
          if (this.match('|')) this.tokens.push(new Token(TokenType.OR, '||', startLine, startCol));
          else this.tokens.push(new Token(TokenType.PIPE, '|', startLine, startCol));
          break;
        case '(': this.tokens.push(new Token(TokenType.LPAREN, '(', startLine, startCol)); break;
        case ')': this.tokens.push(new Token(TokenType.RPAREN, ')', startLine, startCol)); break;
        case '{': this.tokens.push(new Token(TokenType.LBRACE, '{', startLine, startCol)); break;
        case '}': this.tokens.push(new Token(TokenType.RBRACE, '}', startLine, startCol)); break;
        case '[': this.tokens.push(new Token(TokenType.LBRACKET, '[', startLine, startCol)); break;
        case ']': this.tokens.push(new Token(TokenType.RBRACKET, ']', startLine, startCol)); break;
        case ',': this.tokens.push(new Token(TokenType.COMMA, ',', startLine, startCol)); break;
        case ':': this.tokens.push(new Token(TokenType.COLON, ':', startLine, startCol)); break;
        case ';': this.tokens.push(new Token(TokenType.SEMICOLON, ';', startLine, startCol)); break;
        case '.': this.tokens.push(new Token(TokenType.DOT, '.', startLine, startCol)); break;
        case '@': this.tokens.push(new Token(TokenType.AT, '@', startLine, startCol)); break;
        case '#': this.tokens.push(new Token(TokenType.HASH, '#', startLine, startCol)); break;
        default:
          throw new LexerError(`Unexpected character: '${ch}'`, startLine, startCol);
      }
    }
    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.col));
    return this.tokens.filter(t => t.type !== TokenType.COMMENT);
  }
}
