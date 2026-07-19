import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  metadataBase: new URL('https://studyhub.app'),
  title: 'StudyHub — Share & Discover College Study Resources',
  description:
    'A community platform for college students to upload, share, and discover notes, assignments, previous year questions, lab files, projects, and study materials.',
  keywords: ['study resources', 'college notes', 'PYQs', 'lab files', 'student community', 'placements'],
  authors: [{ name: 'StudyHub' }],
  openGraph: {
    title: 'StudyHub — Share & Discover College Study Resources',
    description: 'Notes, assignments, PYQs, lab files, projects — all in one student community.',
    type: 'website',
    siteName: 'StudyHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyHub',
    description: 'Share & discover college study resources.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
