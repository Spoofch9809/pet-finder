// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pet Finder',
  description: 'Frontend for Pet Finder'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
