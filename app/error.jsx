'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0d0a14', color: '#e8e0f0',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 20 }}>
        <div style={{ fontSize: 42 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#EF4444', marginTop: 14 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 12, color: '#8a82a0', margin: '10px 0' }}>
          {error?.message || 'Unknown error'}
        </p>
        <button onClick={reset} style={{
          padding: '8px 20px', borderRadius: 9, fontWeight: 700,
          background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13,
        }}>
          Try Again
        </button>
      </div>
    </div>
  );
}
