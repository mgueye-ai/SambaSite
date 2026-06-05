import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
