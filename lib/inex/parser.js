/**
 * intercoder bridge — Parser
 * Builds an Abstract Syntax Tree from tokens.
 *
 * Language: intercoder bridge (.inex)
 * Platform: interClouder Social Network
 */

import { TokenType } from './lexer';

export class ParseError extends Error {
  constructor(message, token) {
    super(`[Parser] Line ${token?.line || '?'}, Col ${token?.col || '?'}: ${message}`);
    this.token = token;
  }
}

// AST Node types
export const NodeType = {
  Program: 'Program',
  BotDecl: 'BotDecl',
  PluginDecl: 'PluginDecl',
  AdminDecl: 'AdminDecl',
  CommandDecl: 'CommandDecl',
  HookDecl: 'HookDecl',
  EventHandler: 'EventHandler',
  FunctionDecl: 'FunctionDecl',
  ConfigBlock: 'ConfigBlock',
  PermsBlock: 'PermsBlock',
  MetaBlock: 'MetaBlock',
  LetDecl: 'LetDecl',
  ConstDecl: 'ConstDecl',
  Assignment: 'Assignment',
  IfStmt: 'IfStmt',
  ForStmt: 'ForStmt',
  WhileStmt: 'WhileStmt',
  MatchStmt: 'MatchStmt',
  ReturnStmt: 'ReturnStmt',
  BreakStmt: 'BreakStmt',
  ContinueStmt: 'ContinueStmt',
  TryCatch: 'TryCatch',
  ThrowStmt: 'ThrowStmt',
  EmitStmt: 'EmitStmt',
  Block: 'Block',
  ExprStmt: 'ExprStmt',
  BinaryExpr: 'BinaryExpr',
  UnaryExpr: 'UnaryExpr',
  CallExpr: 'CallExpr',
  MemberExpr: 'MemberExpr',
  IndexExpr: 'IndexExpr',
  PipeExpr: 'PipeExpr',
  ArrowFn: 'ArrowFn',
  Identifier: 'Identifier',
  NumberLit: 'NumberLit',
  StringLit: 'StringLit',
  BoolLit: 'BoolLit',
  NullLit: 'NullLit',
  ArrayLit: 'ArrayLit',
  ObjectLit: 'ObjectLit',
  TemplateLit: 'TemplateLit',
  ImportDecl: 'ImportDecl',
};

export class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE);
    this.pos = 0;
  }

  current() {
    return this.tokens[this.pos] || { type: TokenType.EOF, value: null, line: 0, col: 0 };
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset] || { type: TokenType.EOF, value: null };
  }

  advance() {
    const tok = this.current();
    this.pos++;
    return tok;
  }

  expect(type, value) {
    const tok = this.current();
    if (tok.type !== type || (value !== undefined && tok.value !== value)) {
      throw new ParseError(
        `Expected ${type}${value ? ` '${value}'` : ''}, got ${tok.type} '${tok.value}'`,
        tok
      );
    }
    return this.advance();
  }

  match(type, value) {
    const tok = this.current();
    if (tok.type === type && (value === undefined || tok.value === value)) {
      return this.advance();
    }
    return null;
  }

  is(type, value) {
    const tok = this.current();
    return tok.type === type && (value === undefined || tok.value === value);
  }

  // ── Program ──
  parse() {
    const body = [];
    while (!this.is(TokenType.EOF)) {
      body.push(this.parseTopLevel());
    }
    return { type: NodeType.Program, body };
  }

  parseTopLevel() {
    const tok = this.current();
    if (tok.type === TokenType.KEYWORD) {
      switch (tok.value) {
        case 'bot': return this.parseBotDecl();
        case 'plugin': return this.parsePluginDecl();
        case 'admin': return this.parseAdminDecl();
        case 'command': return this.parseCommandDecl();
        case 'hook': return this.parseHookDecl();
        case 'import': return this.parseImport();
        case 'fn': return this.parseFunctionDecl();
        case 'let': case 'mut': return this.parseLetDecl();
        case 'const': return this.parseConstDecl();
        default: return this.parseStatement();
      }
    }
    return this.parseStatement();
  }

  // ── Declarations ──
  parseBotDecl() {
    this.expect(TokenType.KEYWORD, 'bot');
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.LBRACE);
    const body = this.parseDeclBody();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.BotDecl, name, body, line: name.line };
  }

  parsePluginDecl() {
    this.expect(TokenType.KEYWORD, 'plugin');
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.LBRACE);
    const body = this.parseDeclBody();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.PluginDecl, name, body };
  }

  parseAdminDecl() {
    this.expect(TokenType.KEYWORD, 'admin');
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.LBRACE);
    const body = this.parseDeclBody();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.AdminDecl, name, body };
  }

  parseCommandDecl() {
    this.expect(TokenType.KEYWORD, 'command');
    const name = this.expect(TokenType.STRING).value;
    const params = [];
    if (this.match(TokenType.LPAREN)) {
      while (!this.is(TokenType.RPAREN)) {
        params.push(this.expect(TokenType.IDENTIFIER).value);
        if (!this.match(TokenType.COMMA)) break;
      }
      this.expect(TokenType.RPAREN);
    }
    this.expect(TokenType.LBRACE);
    const body = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.CommandDecl, name, params, body };
  }

  parseHookDecl() {
    this.expect(TokenType.KEYWORD, 'hook');
    const name = this.expect(TokenType.STRING).value;
    this.expect(TokenType.LBRACE);
    const body = this.parseDeclBody();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.HookDecl, name, body };
  }

  parseDeclBody() {
    const items = [];
    while (!this.is(TokenType.RBRACE) && !this.is(TokenType.EOF)) {
      const tok = this.current();
      if (tok.type === TokenType.KEYWORD) {
        switch (tok.value) {
          case 'on': items.push(this.parseEventHandler()); continue;
          case 'config': items.push(this.parseConfigBlock()); continue;
          case 'perms': items.push(this.parsePermsBlock()); continue;
          case 'meta': items.push(this.parseMetaBlock()); continue;
          case 'fn': items.push(this.parseFunctionDecl()); continue;
          case 'command': items.push(this.parseCommandDecl()); continue;
          default: items.push(this.parseStatement()); continue;
        }
      }
      items.push(this.parseStatement());
    }
    return items;
  }

  parseEventHandler() {
    this.expect(TokenType.KEYWORD, 'on');
    const event = this.expect(TokenType.IDENTIFIER).value;
    const params = [];
    if (this.match(TokenType.LPAREN)) {
      while (!this.is(TokenType.RPAREN)) {
        params.push(this.expect(TokenType.IDENTIFIER).value);
        if (!this.match(TokenType.COMMA)) break;
      }
      this.expect(TokenType.RPAREN);
    }
    this.expect(TokenType.LBRACE);
    const body = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.EventHandler, event, params, body };
  }

  parseConfigBlock() {
    this.expect(TokenType.KEYWORD, 'config');
    this.expect(TokenType.LBRACE);
    const pairs = this.parseObjectPairs();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.ConfigBlock, pairs };
  }

  parsePermsBlock() {
    this.expect(TokenType.KEYWORD, 'perms');
    this.expect(TokenType.LBRACE);
    const pairs = this.parseObjectPairs();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.PermsBlock, pairs };
  }

  parseMetaBlock() {
    this.expect(TokenType.KEYWORD, 'meta');
    this.expect(TokenType.LBRACE);
    const pairs = this.parseObjectPairs();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.MetaBlock, pairs };
  }

  parseFunctionDecl() {
    this.expect(TokenType.KEYWORD, 'fn');
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LPAREN);
    const params = [];
    while (!this.is(TokenType.RPAREN)) {
      params.push(this.expect(TokenType.IDENTIFIER).value);
      if (!this.match(TokenType.COMMA)) break;
    }
    this.expect(TokenType.RPAREN);
    this.expect(TokenType.LBRACE);
    const body = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.FunctionDecl, name, params, body };
  }

  parseLetDecl() {
    this.advance(); // 'let' or 'mut'
    const name = this.expect(TokenType.IDENTIFIER).value;
    let init = null;
    if (this.match(TokenType.ASSIGN)) {
      init = this.parseExpression();
    }
    return { type: NodeType.LetDecl, name, init, mutable: true };
  }

  parseConstDecl() {
    this.expect(TokenType.KEYWORD, 'const');
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.ASSIGN);
    const init = this.parseExpression();
    return { type: NodeType.ConstDecl, name, init };
  }

  parseImport() {
    this.expect(TokenType.KEYWORD, 'import');
    const names = [];
    if (this.match(TokenType.LBRACE)) {
      while (!this.is(TokenType.RBRACE)) {
        names.push(this.expect(TokenType.IDENTIFIER).value);
        if (!this.match(TokenType.COMMA)) break;
      }
      this.expect(TokenType.RBRACE);
    } else {
      names.push(this.expect(TokenType.IDENTIFIER).value);
    }
    this.expect(TokenType.KEYWORD, 'from');
    const source = this.expect(TokenType.STRING).value;
    return { type: NodeType.ImportDecl, names, source };
  }

  // ── Statements ──
  parseStatement() {
    const tok = this.current();
    if (tok.type === TokenType.KEYWORD) {
      switch (tok.value) {
        case 'let': case 'mut': return this.parseLetDecl();
        case 'const': return this.parseConstDecl();
        case 'if': return this.parseIf();
        case 'for': return this.parseFor();
        case 'while': return this.parseWhile();
        case 'match': return this.parseMatch();
        case 'return': return this.parseReturn();
        case 'break': this.advance(); return { type: NodeType.BreakStmt };
        case 'continue': this.advance(); return { type: NodeType.ContinueStmt };
        case 'try': return this.parseTryCatch();
        case 'throw': return this.parseThrow();
        case 'emit': return this.parseEmit();
        case 'fn': return this.parseFunctionDecl();
      }
    }
    return this.parseExpressionStatement();
  }

  parseBlock() {
    const stmts = [];
    while (!this.is(TokenType.RBRACE) && !this.is(TokenType.EOF)) {
      stmts.push(this.parseStatement());
    }
    return { type: NodeType.Block, stmts };
  }

  parseIf() {
    this.expect(TokenType.KEYWORD, 'if');
    const condition = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const then = this.parseBlock();
    this.expect(TokenType.RBRACE);
    const elifs = [];
    while (this.match(TokenType.KEYWORD, 'elif')) {
      const cond = this.parseExpression();
      this.expect(TokenType.LBRACE);
      const body = this.parseBlock();
      this.expect(TokenType.RBRACE);
      elifs.push({ condition: cond, body });
    }
    let otherwise = null;
    if (this.match(TokenType.KEYWORD, 'else')) {
      this.expect(TokenType.LBRACE);
      otherwise = this.parseBlock();
      this.expect(TokenType.RBRACE);
    }
    return { type: NodeType.IfStmt, condition, then, elifs, otherwise };
  }

  parseFor() {
    this.expect(TokenType.KEYWORD, 'for');
    const variable = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.KEYWORD, 'in');
    const iterable = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const body = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.ForStmt, variable, iterable, body };
  }

  parseWhile() {
    this.expect(TokenType.KEYWORD, 'while');
    const condition = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const body = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.WhileStmt, condition, body };
  }

  parseMatch() {
    this.expect(TokenType.KEYWORD, 'match');
    const subject = this.parseExpression();
    this.expect(TokenType.LBRACE);
    const cases = [];
    let defaultCase = null;
    while (!this.is(TokenType.RBRACE) && !this.is(TokenType.EOF)) {
      if (this.match(TokenType.KEYWORD, 'default')) {
        this.expect(TokenType.ARROW);
        if (this.is(TokenType.LBRACE)) {
          this.expect(TokenType.LBRACE);
          defaultCase = this.parseBlock();
          this.expect(TokenType.RBRACE);
        } else {
          defaultCase = { type: NodeType.Block, stmts: [this.parseStatement()] };
        }
      } else {
        const pattern = this.parseExpression();
        this.expect(TokenType.ARROW);
        let body;
        if (this.is(TokenType.LBRACE)) {
          this.expect(TokenType.LBRACE);
          body = this.parseBlock();
          this.expect(TokenType.RBRACE);
        } else {
          body = { type: NodeType.Block, stmts: [this.parseStatement()] };
        }
        cases.push({ pattern, body });
      }
    }
    this.expect(TokenType.RBRACE);
    return { type: NodeType.MatchStmt, subject, cases, defaultCase };
  }

  parseReturn() {
    this.expect(TokenType.KEYWORD, 'return');
    let value = null;
    if (!this.is(TokenType.RBRACE) && !this.is(TokenType.NEWLINE) && !this.is(TokenType.EOF)) {
      value = this.parseExpression();
    }
    return { type: NodeType.ReturnStmt, value };
  }

  parseTryCatch() {
    this.expect(TokenType.KEYWORD, 'try');
    this.expect(TokenType.LBRACE);
    const tryBlock = this.parseBlock();
    this.expect(TokenType.RBRACE);
    this.expect(TokenType.KEYWORD, 'catch');
    let errorVar = null;
    if (this.match(TokenType.LPAREN)) {
      errorVar = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.RPAREN);
    }
    this.expect(TokenType.LBRACE);
    const catchBlock = this.parseBlock();
    this.expect(TokenType.RBRACE);
    return { type: NodeType.TryCatch, tryBlock, errorVar, catchBlock };
  }

  parseThrow() {
    this.expect(TokenType.KEYWORD, 'throw');
    const value = this.parseExpression();
    return { type: NodeType.ThrowStmt, value };
  }

  parseEmit() {
    this.expect(TokenType.KEYWORD, 'emit');
    const event = this.expect(TokenType.IDENTIFIER).value;
    let data = null;
    if (this.match(TokenType.LPAREN)) {
      if (!this.is(TokenType.RPAREN)) {
        data = this.parseExpression();
      }
      this.expect(TokenType.RPAREN);
    }
    return { type: NodeType.EmitStmt, event, data };
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    // Check for assignment
    if (this.match(TokenType.ASSIGN)) {
      const value = this.parseExpression();
      return { type: NodeType.Assignment, target: expr, value };
    }
    return { type: NodeType.ExprStmt, expression: expr };
  }

  // ── Expressions ──
  parseExpression() {
    return this.parsePipe();
  }

  parsePipe() {
    let left = this.parseOr();
    while (this.match(TokenType.PIPE)) {
      const right = this.parseOr();
      left = { type: NodeType.PipeExpr, left, right };
    }
    return left;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.match(TokenType.OR) || this.match(TokenType.KEYWORD, 'or')) {
      const right = this.parseAnd();
      left = { type: NodeType.BinaryExpr, op: '||', left, right };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseEquality();
    while (this.match(TokenType.AND) || this.match(TokenType.KEYWORD, 'and')) {
      const right = this.parseEquality();
      left = { type: NodeType.BinaryExpr, op: '&&', left, right };
    }
    return left;
  }

  parseEquality() {
    let left = this.parseComparison();
    while (true) {
      if (this.match(TokenType.EQUAL)) {
        left = { type: NodeType.BinaryExpr, op: '==', left, right: this.parseComparison() };
      } else if (this.match(TokenType.NOT_EQUAL)) {
        left = { type: NodeType.BinaryExpr, op: '!=', left, right: this.parseComparison() };
      } else if (this.match(TokenType.KEYWORD, 'is')) {
        left = { type: NodeType.BinaryExpr, op: 'is', left, right: this.parseComparison() };
      } else {
        break;
      }
    }
    return left;
  }

  parseComparison() {
    let left = this.parseAddition();
    while (true) {
      if (this.match(TokenType.LESS)) {
        left = { type: NodeType.BinaryExpr, op: '<', left, right: this.parseAddition() };
      } else if (this.match(TokenType.LESS_EQ)) {
        left = { type: NodeType.BinaryExpr, op: '<=', left, right: this.parseAddition() };
      } else if (this.match(TokenType.GREATER)) {
        left = { type: NodeType.BinaryExpr, op: '>', left, right: this.parseAddition() };
      } else if (this.match(TokenType.GREATER_EQ)) {
        left = { type: NodeType.BinaryExpr, op: '>=', left, right: this.parseAddition() };
      } else if (this.match(TokenType.KEYWORD, 'has')) {
        left = { type: NodeType.BinaryExpr, op: 'has', left, right: this.parseAddition() };
      } else {
        break;
      }
    }
    return left;
  }

  parseAddition() {
    let left = this.parseMultiplication();
    while (true) {
      if (this.match(TokenType.PLUS)) {
        left = { type: NodeType.BinaryExpr, op: '+', left, right: this.parseMultiplication() };
      } else if (this.match(TokenType.MINUS)) {
        left = { type: NodeType.BinaryExpr, op: '-', left, right: this.parseMultiplication() };
      } else {
        break;
      }
    }
    return left;
  }

  parseMultiplication() {
    let left = this.parseUnary();
    while (true) {
      if (this.match(TokenType.STAR)) {
        left = { type: NodeType.BinaryExpr, op: '*', left, right: this.parseUnary() };
      } else if (this.match(TokenType.SLASH)) {
        left = { type: NodeType.BinaryExpr, op: '/', left, right: this.parseUnary() };
      } else if (this.match(TokenType.PERCENT)) {
        left = { type: NodeType.BinaryExpr, op: '%', left, right: this.parseUnary() };
      } else {
        break;
      }
    }
    return left;
  }

  parseUnary() {
    if (this.match(TokenType.MINUS)) {
      return { type: NodeType.UnaryExpr, op: '-', operand: this.parseUnary() };
    }
    if (this.match(TokenType.NOT) || this.match(TokenType.KEYWORD, 'not')) {
      return { type: NodeType.UnaryExpr, op: '!', operand: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();
    while (true) {
      if (this.match(TokenType.DOT)) {
        const prop = this.expect(TokenType.IDENTIFIER).value;
        expr = { type: NodeType.MemberExpr, object: expr, property: prop };
      } else if (this.match(TokenType.LBRACKET)) {
        const index = this.parseExpression();
        this.expect(TokenType.RBRACKET);
        expr = { type: NodeType.IndexExpr, object: expr, index };
      } else if (this.match(TokenType.LPAREN)) {
        const args = [];
        while (!this.is(TokenType.RPAREN)) {
          args.push(this.parseExpression());
          if (!this.match(TokenType.COMMA)) break;
        }
        this.expect(TokenType.RPAREN);
        expr = { type: NodeType.CallExpr, callee: expr, args };
      } else {
        break;
      }
    }
    return expr;
  }

  parsePrimary() {
    const tok = this.current();

    // Number
    if (tok.type === TokenType.NUMBER) {
      this.advance();
      return { type: NodeType.NumberLit, value: tok.value };
    }

    // String
    if (tok.type === TokenType.STRING) {
      this.advance();
      return { type: NodeType.StringLit, value: tok.value };
    }

    // Boolean
    if (tok.type === TokenType.BOOLEAN) {
      this.advance();
      return { type: NodeType.BoolLit, value: tok.value };
    }

    // Null
    if (tok.type === TokenType.NULL) {
      this.advance();
      return { type: NodeType.NullLit };
    }

    // Identifier or keyword-as-builtin
    if (tok.type === TokenType.IDENTIFIER ||
        (tok.type === TokenType.KEYWORD && [
          'reply', 'send', 'delete', 'warn', 'kick', 'ban', 'mute',
          'log', 'error', 'debug', 'self', 'this'
        ].includes(tok.value))) {
      this.advance();
      return { type: NodeType.Identifier, name: tok.value };
    }

    // Array literal
    if (tok.type === TokenType.LBRACKET) {
      this.advance();
      const elements = [];
      while (!this.is(TokenType.RBRACKET)) {
        elements.push(this.parseExpression());
        if (!this.match(TokenType.COMMA)) break;
      }
      this.expect(TokenType.RBRACKET);
      return { type: NodeType.ArrayLit, elements };
    }

    // Object literal or block
    if (tok.type === TokenType.LBRACE) {
      this.advance();
      const pairs = this.parseObjectPairs();
      this.expect(TokenType.RBRACE);
      return { type: NodeType.ObjectLit, pairs };
    }

    // Parenthesized or arrow function
    if (tok.type === TokenType.LPAREN) {
      this.advance();
      // Arrow function check: (x, y) -> { ... }
      const start = this.pos;
      try {
        const params = [];
        while (!this.is(TokenType.RPAREN)) {
          params.push(this.expect(TokenType.IDENTIFIER).value);
          if (!this.match(TokenType.COMMA)) break;
        }
        this.expect(TokenType.RPAREN);
        if (this.match(TokenType.ARROW)) {
          if (this.is(TokenType.LBRACE)) {
            this.expect(TokenType.LBRACE);
            const body = this.parseBlock();
            this.expect(TokenType.RBRACE);
            return { type: NodeType.ArrowFn, params, body };
          }
          const expr = this.parseExpression();
          return { type: NodeType.ArrowFn, params, body: { type: NodeType.Block, stmts: [{ type: NodeType.ReturnStmt, value: expr }] } };
        }
        // Not an arrow fn, it's a grouped expression — if only 1 param it was an expression
        if (params.length === 1) {
          return { type: NodeType.Identifier, name: params[0] };
        }
      } catch (e) {
        // Rewind if arrow parse failed
        this.pos = start;
      }
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    // Hash for channel refs: #channel
    if (tok.type === TokenType.HASH) {
      this.advance();
      const name = this.expect(TokenType.IDENTIFIER).value;
      return { type: NodeType.StringLit, value: '#' + name };
    }

    // At for user refs: @user
    if (tok.type === TokenType.AT) {
      this.advance();
      const name = this.expect(TokenType.IDENTIFIER).value;
      return { type: NodeType.StringLit, value: '@' + name };
    }

    throw new ParseError(`Unexpected token: ${tok.type} '${tok.value}'`, tok);
  }

  parseObjectPairs() {
    const pairs = [];
    while (!this.is(TokenType.RBRACE) && !this.is(TokenType.EOF)) {
      const key = this.current();
      let keyName;
      if (key.type === TokenType.IDENTIFIER || key.type === TokenType.KEYWORD) {
        keyName = this.advance().value;
      } else if (key.type === TokenType.STRING) {
        keyName = this.advance().value;
      } else {
        break;
      }
      this.expect(TokenType.COLON);
      const value = this.parseExpression();
      pairs.push({ key: keyName, value });
      this.match(TokenType.COMMA);
    }
    return pairs;
  }
}
