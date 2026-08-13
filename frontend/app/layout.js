import './globals.css';

export const metadata = {
  title: 'Rate Limiting Practice Lab',
  description: 'Interactive Express API & Next.js Rate Limiting Playground',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
