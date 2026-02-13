'use client';

import { useState, useRef, useCallback } from 'react';
import { runInex, EXAMPLES } from '@/lib/inex';

export default function InexIDE({ onClose, notify }) {
  const [code, setCode] = useState(EXAMPLES.hello);
  const [result, setResult] = useState(null);
  const [activeExample, setActiveExample] = useState('hello');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    // Use a timeout to allow UI update before executing
    setTimeout(() => {
      const res = runInex(code);
      setResult(res);
      setIsRunning(false);
      if (notify) {
        notify(res.success ? `✓ Ran in ${res.elapsed}ms` : `✗ Errors found`);
      }
    }, 10);
  }, [code, notify]);

  const loadExample = useCallback((key) => {
    setCode(EXAMPLES[key]);
    setActiveExample(key);
    setResult(null);
  }, []);

  const exampleList = [
    { key: 'hello', label: 'Hello World', icon: '👋' },
    { key: 'bot', label: 'Bot', icon: '🤖' },
    { key: 'plugin', label: 'Plugin', icon: '🧩' },
    { key: 'admin', label: 'Admin', icon: '👑' },
    { key: 'advanced', label: 'Advanced', icon: '⚡' },
    { key: 'hook', label: 'Hook', icon: '🪝' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
         role="region" aria-label="INEX IDE — intercoder bridge">

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, color: 'var(--ok)' }}>⟨/⟩</span>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--acl)', lineHeight: 1.2 }}>
              intercoder bridge
            </h2>
            <p style={{ fontSize: 9, color: 'var(--txg)' }}>
              .inex — interClouder Scripting Language
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn bp" onClick={handleRun} disabled={isRunning}
                  aria-label="Run code" style={{ padding: '6px 16px' }}>
            {isRunning ? '⏳ Running...' : '▶ Run'}
          </button>
          {onClose && (
            <button className="btn bs" onClick={onClose} aria-label="Close IDE"
                    style={{ padding: '6px 10px' }}>
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Examples bar */}
      <nav style={{
        display: 'flex', gap: 3, padding: '6px 16px',
        borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)',
        overflowX: 'auto',
      }} role="tablist" aria-label="Code examples">
        {exampleList.map(ex => (
          <button key={ex.key}
            role="tab"
            aria-selected={activeExample === ex.key}
            className={`tab ${activeExample === ex.key ? 'on' : 'off'}`}
            onClick={() => loadExample(ex.key)}
            style={{ whiteSpace: 'nowrap' }}>
            {ex.icon} {ex.label}
          </button>
        ))}
      </nav>

      {/* Editor + Output */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Code Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            padding: '6px 16px', fontSize: 9, color: 'var(--txg)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>EDITOR</span>
            <span>{code.split('\n').length} lines</span>
          </div>
          <textarea
            ref={editorRef}
            className="inex-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => {
              // Tab support
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                setCode(code.substring(0, start) + '  ' + code.substring(end));
                setTimeout(() => {
                  e.target.selectionStart = e.target.selectionEnd = start + 2;
                }, 0);
              }
              // Ctrl+Enter to run
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleRun();
              }
            }}
            placeholder="// Write .inex code here..."
            spellCheck={false}
            aria-label="Code editor"
            style={{ flex: 1, margin: '0 8px 8px', borderRadius: 10 }}
          />
        </div>

        {/* Output Panel */}
        <div style={{
          width: 340, borderLeft: '1px solid var(--bdr)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          background: 'var(--bg)',
        }}>
          <div style={{
            padding: '6px 12px', fontSize: 9, color: 'var(--txg)',
            display: 'flex', justifyContent: 'space-between',
            borderBottom: '1px solid var(--bdr)',
          }}>
            <span>OUTPUT</span>
            {result && <span style={{ color: result.success ? 'var(--ok)' : 'var(--err)' }}>
              {result.success ? '✓' : '✗'} {result.elapsed}ms
            </span>}
          </div>

          <div className="inex-output" style={{ flex: 1, margin: 8, overflow: 'auto' }}
               role="log" aria-label="Execution output" aria-live="polite">
            {!result && (
              <div style={{ color: 'var(--txg)', textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>⟨/⟩</div>
                <div style={{ fontSize: 11 }}>Press ▶ Run or Ctrl+Enter</div>
              </div>
            )}
            {result && result.output.map((entry, i) => (
              <div key={i} className={entry.type} style={{ padding: '1px 0', wordBreak: 'break-word' }}>
                <span style={{ color: 'var(--txg)', marginRight: 6, fontSize: 10 }}>
                  {entry.type === 'log' ? '›' : entry.type === 'error' ? '✗' : entry.type === 'action' ? '→' : entry.type === 'system' ? '⟨⟩' : '·'}
                </span>
                {entry.args.join(' ')}
              </div>
            ))}
            {result && result.errors.length > 0 && (
              <div style={{ borderTop: '1px solid var(--bdr)', marginTop: 6, paddingTop: 6 }}>
                {result.errors.map((err, i) => (
                  <div key={i} className="error" style={{ padding: '2px 0' }}>
                    ✗ [{err.type}] {err.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered entities */}
          {result && (result.bots.length > 0 || result.plugins.length > 0 || result.commands.length > 0) && (
            <div style={{
              padding: '8px 12px', borderTop: '1px solid var(--bdr)',
              fontSize: 10, color: 'var(--txm)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--txg)', fontSize: 9 }}>
                REGISTERED
              </div>
              {result.bots.map(b => (
                <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '1px 0' }}>
                  <span style={{ color: 'var(--ok)' }}>🤖</span> {b.name}
                  {b.config && Object.keys(b.config).length > 0 && (
                    <span className="chip" style={{ background: 'var(--bg4)', color: 'var(--txg)' }}>
                      {Object.keys(b.config).length} config
                    </span>
                  )}
                </div>
              ))}
              {result.plugins.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '1px 0' }}>
                  <span style={{ color: 'var(--inf)' }}>🧩</span> {p.name}
                </div>
              ))}
              {result.commands.map(c => (
                <div key={c} style={{ padding: '1px 0' }}>
                  <span style={{ color: 'var(--wrn)' }}>⚡</span> /{c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
