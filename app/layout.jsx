import './globals.css';

export const metadata = {
  title: 'interClouder — Secure Social Network',
  description: 'interClouder v6.0 with intercoder bridge language',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div aria-live="polite" aria-atomic="true" className="live-region" id="live-announcer" />
        {children}
      </body>
    </html>
  );
}
