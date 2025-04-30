
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EHS Management Dashboard', // Updated Title
  description: 'Dashboard for Environment, Health, and Safety Management', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning // Add suppressHydrationWarning to body too
      >
        <AuthProvider>
          <TooltipProvider delayDuration={0}> {/* Wrap with TooltipProvider */}
            {children}
            <Toaster /> {/* Add Toaster component */}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
