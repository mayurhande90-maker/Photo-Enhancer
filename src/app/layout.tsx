
import type {Metadata} from 'next';
import { Inter, Poppins, Manrope } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });


export const metadata: Metadata = {
  title: 'Magicpixa',
  description: 'AI that brings your photos to life.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
