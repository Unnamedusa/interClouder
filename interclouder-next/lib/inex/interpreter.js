/**
 * intercoder bridge — Interpreter
 * Executes AST nodes with full platform API access.
 *
 * Language: intercoder bridge (.inex)
 * Platform: interClouder Social Network
 */

import { NodeType } from './parser';
import { createStdlib } from './stdlib';

class BreakSignal { constructor() { this.type = 'break'; } }
class ContinueSignal { constructor() { this.type = 'continue'; } }
class ReturnSignal { constructor(value) { this.type = 'return'; this.value = value; } }
class ThrowSignal { constructor(value) { this.type = 'throw'; this.value = value; } }

export class RuntimeError extends Error {
  constructor(message, node) {
    super(`[Runtime] ${message}`);
    this.node = node;
  }
}

export class Environment {
  constructor(parent = null) {
    this.vars = new Map();
    this.consts = new Set();
    this.parent = parent;
  }

  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    return undefined;
  }

  set(name, value, isConst = false) {
    if (this.consts.has(name)) {
      throw new RuntimeError(`Cannot reassign constant '${name}'`);
    }
    this.vars.set(name, value);
    if (isConst) this.consts.add(name);
  }

  assign(name, value) {
    if (this.consts.has(name)) {
      throw new RuntimeError(`Cannot reassign constant '${name}'`);
    }
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw new RuntimeError(`Undefined variable '${name}'`);
  }

  child() {
    return new Environment(this);
  }
}

export class InexInterpreter {
  constructor(platformAPI = {}) {
    this.platform = platformAPI;
    this.globalEnv = new Environment();
    this.output = [];
    this.errors = [];
    this.bots = new Map();
    this.plugins = new Map();
    this.commands = new Map();
    this.hooks = new Map();
    this.eventHandlers = new Map();
    this.maxIterations = 10000;
    this.maxCallDepth = 64;
    this.callDepth = 0;

    // Inject stdlib
    const stdlib = createStdlib(this);
    for (const [name, fn] of Object.entries(stdlib)) {
      this.globalEnv.set(name, fn, true);
    }
  }

  log(type, ...args) {
    const entry = { type, time: Date.now(), args: args.map(a => this.stringify(a)) };
    this.output.push(entry);
    return entry;
  }

  stringify(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return '[' + value.map(v => this.stringify(v)).join(', ') + ']';
    if (typeof value === 'object') {
      if (value.__type === 'function') return `fn ${value.name || 'anonymous'}(${value.params.join(', ')})`;
      try { return JSON.stringify(value, null, 2); } catch (_e) { return '[Object]'; }
    }
    if (typeof value === 'function') return `[NativeFn]`;
    return String(value);
  }

  // ── Execute Program ──
  execute(ast) {
    this.output = [];
    this.errors = [];
    try {
      for (const node of ast.body) {
        this.execNode(node, this.globalEnv);
      }
    } catch (e) {
      if (e instanceof ThrowSignal) {
        this.errors.push({ message: this.stringify(e.value), type: 'throw' });
      } else if (e instanceof RuntimeError) {
        this.errors.push({ message: e.message, type: 'runtime' });
      } else {
        this.errors.push({ message: e.message, type: 'internal' });
      }
    }
    return {
      output: this.output,
      errors: this.errors,
      bots: [...this.bots.entries()].map(([n, b]) => ({ name: n, ...b })),
      plugins: [...this.plugins.entries()].map(([n, p]) => ({ name: n, ...p })),
      commands: [...this.commands.keys()],
      hooks: [...this.hooks.keys()],
    };
  }

  execNode(node, env) {
    if (!node) return null;

    switch (node.type) {
      case NodeType.Program:
        let last = null;
        for (const n of node.body) last = this.execNode(n, env);
        return last;

      case NodeType.BotDecl: return this.execBotDecl(node, env);
      case NodeType.PluginDecl: return this.execPluginDecl(node, env);
      case NodeType.AdminDecl: return this.execAdminDecl(node, env);
      case NodeType.CommandDecl: return this.execCommandDecl(node, env);
      case NodeType.HookDecl: return this.execHookDecl(node, env);
      case NodeType.EventHandler: return this.execEventHandler(node, env);
      case NodeType.FunctionDecl: return this.execFunctionDecl(node, env);
      case NodeType.ConfigBlock: return this.execConfigBlock(node, env);
      case NodeType.PermsBlock: return this.execPermsBlock(node, env);
      case NodeType.MetaBlock: return this.execMetaBlock(node, env);
      case NodeType.LetDecl: return this.execLetDecl(node, env);
      case NodeType.ConstDecl: return this.execConstDecl(node, env);
      case NodeType.Assignment: return this.execAssignment(node, env);
      case NodeType.IfStmt: return this.execIf(node, env);
      case NodeType.ForStmt: return this.execFor(node, env);
      case NodeType.WhileStmt: return this.execWhile(node, env);
      case NodeType.MatchStmt: return this.execMatch(node, env);
      case NodeType.ReturnStmt: throw new ReturnSignal(node.value ? this.evalExpr(node.value, env) : null);
      case NodeType.BreakStmt: throw new BreakSignal();
      case NodeType.ContinueStmt: throw new ContinueSignal();
      case NodeType.ThrowStmt: throw new ThrowSignal(this.evalExpr(node.value, env));
      case NodeType.TryCatch: return this.execTryCatch(node, env);
      case NodeType.EmitStmt: return this.execEmit(node, env);
      case NodeType.Block: return this.execBlock(node, env);
      case NodeType.ExprStmt: return this.evalExpr(node.expression, env);
      case NodeType.ImportDecl: return this.execImport(node, env);
      default: return this.evalExpr(node, env);
    }
  }

  // ── Declaration Executors ──
  execBotDecl(node, env) {
    const botEnv = env.child();
    const bot = { name: node.name, config: {}, perms: {}, meta: {}, events: {}, commands: {}, functions: {} };
    botEnv.set('self', bot);

    for (const item of node.body) {
      if (item.type === NodeType.ConfigBlock) {
        bot.config = this.evalObjectPairs(item.pairs, botEnv);
      } else if (item.type === NodeType.PermsBlock) {
        bot.perms = this.evalObjectPairs(item.pairs, botEnv);
      } else if (item.type === NodeType.MetaBlock) {
        bot.meta = this.evalObjectPairs(item.pairs, botEnv);
      } else if (item.type === NodeType.EventHandler) {
        bot.events[item.event] = { params: item.params, body: item.body, env: botEnv };
      } else if (item.type === NodeType.CommandDecl) {
        bot.commands[item.name] = { params: item.params, body: item.body, env: botEnv };
      } else if (item.type === NodeType.FunctionDecl) {
        const fn = { __type: 'function', name: item.name, params: item.params, body: item.body, env: botEnv };
        botEnv.set(item.name, fn);
        bot.functions[item.name] = fn;
      } else {
        this.execNode(item, botEnv);
      }
    }

    this.bots.set(node.name, bot);
    this.log('system', `?? Bot "${node.name}" registered`);
    return bot;
  }

  execPluginDecl(node, env) {
    const plugEnv = env.child();
    const plug = { name: node.name, config: {}, perms: {}, meta: {}, events: {}, commands: {}, functions: {} };
    plugEnv.set('self', plug);

    for (const item of node.body) {
      if (item.type === NodeType.ConfigBlock) {
        plug.config = this.evalObjectPairs(item.pairs, plugEnv);
      } else if (item.type === NodeType.PermsBlock) {
        plug.perms = this.evalObjectPairs(item.pairs, plugEnv);
      } else if (item.type === NodeType.MetaBlock) {
        plug.meta = this.evalObjectPairs(item.pairs, plugEnv);
      } else if (item.type === NodeType.EventHandler) {
        plug.events[item.event] = { params: item.params, body: item.body, env: plugEnv };
      } else if (item.type === NodeType.CommandDecl) {
        plug.commands[item.name] = { params: item.params, body: item.body, env: plugEnv };
      } else if (item.type === NodeType.FunctionDecl) {
        const fn = { __type: 'function', name: item.name, params: item.params, body: item.body, env: plugEnv };
        plugEnv.set(item.name, fn);
        plug.functions[item.name] = fn;
      } else {
        this.execNode(item, plugEnv);
      }
    }

    this.plugins.set(node.name, plug);
    this.log('system', `?? Plugin "${node.name}" registered`);
    return plug;
  }

  execAdminDecl(node, env) {
    const adminEnv = env.child();
    for (const item of node.body) {
      this.execNode(item, adminEnv);
    }
    this.log('system', `?? Admin module "${node.name}" loaded`);
  }

  execCommandDecl(node, env) {
    this.commands.set(node.name, { params: node.params, body: node.body, env });
    this.log('system', `⚡ Command "/${node.name}" registered`);
  }

  execHookDecl(node, env) {
    const hookEnv = env.child();
    const hook = { name: node.name, events: {} };
    for (const item of node.body) {
      if (item.type === NodeType.EventHandler) {
        hook.events[item.event] = { params: item.params, body: item.body, env: hookEnv };
      } else {
        this.execNode(item, hookEnv);
      }
    }
    this.hooks.set(node.name, hook);
    this.log('system', `?? Hook "${node.name}" registered`);
  }

  execEventHandler(node, env) {
    const key = node.event;
    if (!this.eventHandlers.has(key)) this.eventHandlers.set(key, []);
    this.eventHandlers.get(key).push({ params: node.params, body: node.body, env });
  }

  execFunctionDecl(node, env) {
    const fn = { __type: 'function', name: node.name, params: node.params, body: node.body, env };
    env.set(node.name, fn);
    return fn;
  }

  execConfigBlock(node, env) {
    return this.evalObjectPairs(node.pairs, env);
  }
  execPermsBlock(node, env) {
    return this.evalObjectPairs(node.pairs, env);
  }
  execMetaBlock(node, env) {
    return this.evalObjectPairs(node.pairs, env);
  }

  execLetDecl(node, env) {
    const val = node.init ? this.evalExpr(node.init, env) : null;
    env.set(node.name, val);
    return val;
  }

  execConstDecl(node, env) {
    const val = this.evalExpr(node.init, env);
    env.set(node.name, val, true);
    return val;
  }

  execAssignment(node, env) {
    const value = this.evalExpr(node.value, env);
    if (node.target.type === NodeType.Identifier) {
      env.assign(node.target.name, value);
    } else if (node.target.type === NodeType.MemberExpr) {
      const obj = this.evalExpr(node.target.object, env);
      if (obj && typeof obj === 'object') {
        obj[node.target.property] = value;
      }
    } else if (node.target.type === NodeType.IndexExpr) {
      const obj = this.evalExpr(node.target.object, env);
      const idx = this.evalExpr(node.target.index, env);
      if (obj && typeof obj === 'object') {
        obj[idx] = value;
      }
    }
    return value;
  }

  // ── Control Flow ──
  execIf(node, env) {
    if (this.isTruthy(this.evalExpr(node.condition, env))) {
      return this.execBlock(node.then, env.child());
    }
    for (const elif of (node.elifs || [])) {
      if (this.isTruthy(this.evalExpr(elif.condition, env))) {
        return this.execBlock(elif.body, env.child());
      }
    }
    if (node.otherwise) {
      return this.execBlock(node.otherwise, env.child());
    }
    return null;
  }

  execFor(node, env) {
    const iterable = this.evalExpr(node.iterable, env);
    let items = [];
    if (Array.isArray(iterable)) items = iterable;
    else if (typeof iterable === 'string') items = [...iterable];
    else if (typeof iterable === 'number') items = Array.from({ length: iterable }, (_, i) => i);
    else if (iterable && typeof iterable === 'object') items = Object.entries(iterable);

    let iterations = 0;
    for (const item of items) {
      if (++iterations > this.maxIterations) {
        throw new RuntimeError('Max iterations exceeded in for loop');
      }
      const loopEnv = env.child();
      loopEnv.set(node.variable, item);
      try {
        this.execBlock(node.body, loopEnv);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        throw e;
      }
    }
  }

  execWhile(node, env) {
    let iterations = 0;
    while (this.isTruthy(this.evalExpr(node.condition, env))) {
      if (++iterations > this.maxIterations) {
        throw new RuntimeError('Max iterations exceeded in while loop');
      }
      try {
        this.execBlock(node.body, env.child());
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        throw e;
      }
    }
  }

  execMatch(node, env) {
    const subject = this.evalExpr(node.subject, env);
    for (const c of node.cases) {
      const pattern = this.evalExpr(c.pattern, env);
      if (subject === pattern) {
        return this.execBlock(c.body, env.child());
      }
    }
    if (node.defaultCase) {
      return this.execBlock(node.defaultCase, env.child());
    }
  }

  execTryCatch(node, env) {
    try {
      this.execBlock(node.tryBlock, env.child());
    } catch (e) {
      const catchEnv = env.child();
      if (node.errorVar) {
        catchEnv.set(node.errorVar, e instanceof ThrowSignal ? e.value : e.message);
      }
      this.execBlock(node.catchBlock, catchEnv);
    }
  }

  execEmit(node, env) {
    const data = node.data ? this.evalExpr(node.data, env) : null;
    this.triggerEvent(node.event, data);
    this.log('event', `?? Emitted: ${node.event}`);
  }

  execBlock(node, env) {
    let last = null;
    for (const stmt of node.stmts) {
      last = this.execNode(stmt, env);
    }
    return last;
  }

  execImport(node, env) {
    this.log('system', `?? Import: ${node.names.join(', ')} from "${node.source}"`);
    // Simulated imports from platform modules
    for (const name of node.names) {
      env.set(name, `[module:${node.source}/${name}]`);
    }
  }

  // ── Expression Evaluator ──
  evalExpr(node, env) {
    if (!node) return null;

    switch (node.type) {
      case NodeType.NumberLit: return node.value;
      case NodeType.StringLit: return node.value;
      case NodeType.BoolLit: return node.value;
      case NodeType.NullLit: return null;

      case NodeType.Identifier: {
        const val = env.get(node.name);
        if (val === undefined && !['self', 'this'].includes(node.name)) {
          // Check if it's a platform API
          if (this.platform[node.name]) return this.platform[node.name];
        }
        return val;
      }

      case NodeType.ArrayLit:
        return node.elements.map(e => this.evalExpr(e, env));

      case NodeType.ObjectLit:
        return this.evalObjectPairs(node.pairs, env);

      case NodeType.BinaryExpr:
        return this.evalBinary(node, env);

      case NodeType.UnaryExpr: {
        const operand = this.evalExpr(node.operand, env);
        if (node.op === '-') return -operand;
        if (node.op === '!') return !this.isTruthy(operand);
        return operand;
      }

      case NodeType.CallExpr:
        return this.evalCall(node, env);

      case NodeType.MemberExpr: {
        const obj = this.evalExpr(node.object, env);
        if (obj === null || obj === undefined) return null;
        const prop = node.property;
        // String methods
        if (typeof obj === 'string') {
          const stringMethods = {
            length: obj.length,
            upper: () => obj.toUpperCase(),
            lower: () => obj.toLowerCase(),
            trim: () => obj.trim(),
            split: (sep) => obj.split(sep),
            contains: (sub) => obj.includes(sub),
            starts_with: (pre) => obj.startsWith(pre),
            ends_with: (suf) => obj.endsWith(suf),
            replace: (old, nw) => obj.replaceAll(old, nw),
            slice: (s, e) => obj.slice(s, e),
          };
          if (prop in stringMethods) return stringMethods[prop];
        }
        // Array methods
        if (Array.isArray(obj)) {
          const arrayMethods = {
            length: obj.length,
            push: (v) => { obj.push(v); return obj; },
            pop: () => obj.pop(),
            map: (fn) => obj.map((item, i) => this.callFunction(fn, [item, i], env)),
            filter: (fn) => obj.filter((item, i) => this.isTruthy(this.callFunction(fn, [item, i], env))),
            find: (fn) => obj.find((item, i) => this.isTruthy(this.callFunction(fn, [item, i], env))),
            join: (sep) => obj.join(sep || ','),
            contains: (v) => obj.includes(v),
            sort: () => [...obj].sort(),
            reverse: () => [...obj].reverse(),
            first: obj[0],
            last: obj[obj.length - 1],
            count: obj.length,
          };
          if (prop in arrayMethods) return arrayMethods[prop];
        }
        return typeof obj === 'object' ? obj[prop] : null;
      }

      case NodeType.IndexExpr: {
        const obj = this.evalExpr(node.object, env);
        const idx = this.evalExpr(node.index, env);
        if (obj === null || obj === undefined) return null;
        return obj[idx];
      }

      case NodeType.PipeExpr: {
        const left = this.evalExpr(node.left, env);
        // Right side should be a callable — call it with left as first arg
        if (node.right.type === NodeType.CallExpr) {
          const callee = this.evalExpr(node.right.callee, env);
          const args = [left, ...node.right.args.map(a => this.evalExpr(a, env))];
          return this.callFunction(callee, args, env);
        }
        const fn = this.evalExpr(node.right, env);
        return this.callFunction(fn, [left], env);
      }

      case NodeType.ArrowFn:
        return { __type: 'function', name: 'anonymous', params: node.params, body: node.body, env };

      default:
        throw new RuntimeError(`Cannot evaluate node type: ${node.type}`);
    }
  }

  evalBinary(node, env) {
    const left = this.evalExpr(node.left, env);
    const right = this.evalExpr(node.right, env);

    switch (node.op) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
        return (left || 0) + (right || 0);
      case '-': return (left || 0) - (right || 0);
      case '*': return (left || 0) * (right || 0);
      case '/':
        if (right === 0) throw new RuntimeError('Division by zero');
        return (left || 0) / (right || 0);
      case '%': return (left || 0) % (right || 0);
      case '==': case 'is': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '>=': return left >= right;
      case '&&': return this.isTruthy(left) ? right : left;
      case '||': return this.isTruthy(left) ? left : right;
      case 'has':
        if (Array.isArray(left)) return left.includes(right);
        if (typeof left === 'string') return left.includes(right);
        if (left && typeof left === 'object') return right in left;
        return false;
      default:
        throw new RuntimeError(`Unknown operator: ${node.op}`);
    }
  }

  evalCall(node, env) {
    const callee = this.evalExpr(node.callee, env);
    const args = node.args.map(a => this.evalExpr(a, env));

    if (typeof callee === 'function') {
      return callee(...args);
    }

    return this.callFunction(callee, args, env);
  }

  callFunction(fn, args, env) {
    if (typeof fn === 'function') return fn(...args);
    if (!fn || fn.__type !== 'function') {
      throw new RuntimeError(`Not a function: ${this.stringify(fn)}`);
    }

    if (this.callDepth >= this.maxCallDepth) {
      throw new RuntimeError('Maximum call stack depth exceeded');
    }
    this.callDepth++;

    try {
      const fnEnv = fn.env.child();
      for (let i = 0; i < fn.params.length; i++) {
        fnEnv.set(fn.params[i], args[i] !== undefined ? args[i] : null);
      }
      this.execBlock(fn.body, fnEnv);
      return null;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    } finally {
      this.callDepth--;
    }
  }

  evalObjectPairs(pairs, env) {
    const obj = {};
    for (const { key, value } of pairs) {
      obj[key] = this.evalExpr(value, env);
    }
    return obj;
  }

  // ── Events ──
  triggerEvent(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const h of handlers) {
      const evEnv = h.env.child();
      if (h.params.length > 0) evEnv.set(h.params[0], data);
      try {
        this.execBlock(h.body, evEnv);
      } catch (e) {
        if (e instanceof ReturnSignal) continue;
        this.errors.push({ message: e.message || this.stringify(e), type: 'event_error' });
      }
    }
    // Also trigger for bots and plugins
    for (const [, bot] of this.bots) {
      if (bot.events[event]) {
        const h = bot.events[event];
        const evEnv = h.env.child();
        if (h.params.length > 0) evEnv.set(h.params[0], data);
        try { this.execBlock(h.body, evEnv); } catch (e) {
          if (!(e instanceof ReturnSignal)) this.errors.push({ message: e.message, type: 'bot_error' });
        }
      }
    }
  }

  // ── Utilities ──
  isTruthy(value) {
    if (value === null || value === undefined || value === false || value === 0 || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }
}
