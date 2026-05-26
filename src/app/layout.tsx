import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const arabicFont = Noto_Naskh_Arabic({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Islamic Scholarly Resource",
  description: "A comprehensive knowledge hub for Islamic sciences, jurisprudence, theology, and general Islamic learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${arabicFont.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AnalyticsTracker />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            success: {
              style: {
                background: '#1B5E37',
                color: '#fff',
                fontWeight: '500'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#1B5E37'
              }
            },
            error: {
              style: {
                background: '#DC2626',
                color: '#fff',
                fontWeight: '500'
              }
            },
            loading: {
              style: {
                background: '#1e40af',
                color: '#fff'
              }
            }
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
