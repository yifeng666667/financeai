import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { PortfolioProvider } from '../contexts/PortfolioContext';

export const metadata: Metadata = {
  title: 'Global News Analyzer',
  description: 'AI-powered global news and investment tracking application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <PortfolioProvider>
            {children}
          </PortfolioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
