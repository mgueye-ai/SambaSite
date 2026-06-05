import { Inter } from 'next/font/google';
import './globals.css';
import './theme.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Samba — Ticket Platform',
  description: 'Discover events, buy tickets, and manage your nights out.',
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
