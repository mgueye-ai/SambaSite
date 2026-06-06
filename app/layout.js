import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import './theme.css';
import './dashboard-theme.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Samba — Ticket Platform',
  description: 'Discover events, buy tickets, and manage your nights out.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
