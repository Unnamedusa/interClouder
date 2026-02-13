import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0d0a14', color: '#e8e0f0',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 42 }}>⬡</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#A855F7', margin: '14px 0 6px' }}>404</h1>
        <p style={{ fontSize: 13, color: '#8a82a0', marginBottom: 20 }}>
          This page does not exist in the cloud.
        </p>
        <Link href="/" style={{
          padding: '10px 24px', borderRadius: 9, fontWeight: 700,
          background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
          color: '#fff', textDecoration: 'none', fontSize: 13,
        }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
