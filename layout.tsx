import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClassFind — Find Your Perfect Teacher',
  description: 'Connect students with qualified teachers across all subjects',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-slate-400">
              © 2024 ClassFind. Connecting learners and educators.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
