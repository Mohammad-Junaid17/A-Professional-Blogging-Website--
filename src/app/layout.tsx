import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CanonicalMeta } from "@/components/CanonicalMeta";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serifFont = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-amiri", // Keeping variable name same to map to tailwind's font-serif easily
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://islam360.ridawiway.com"),
  title: {
    default: "Islam360 — Encyclopaedia of Sunni Islam",
    template: "%s | Islam360",
  },
  description:
    "A comprehensive encyclopaedia and educational platform for Islamic sciences, jurisprudence (Fiqh), theology (Aqeedah), and Sunni scholarly tradition. Explore articles, books, Q&A, scholar biographies, and lectures.",
  keywords: [
    "Islamic articles",
    "Sunni Islam",
    "Aqeedah",
    "Fiqh",
    "Hanafi",
    "Imam Ahmad Raza Khan",
    "Ala Hazrat",
    "Barelvi",
    "Islamic books",
    "Islamic Q&A",
    "Sunni scholars",
    "Islamic lectures",
    "Ahl as-Sunnah",
    "Islamic knowledge",
    "Islamic jurisprudence",
  ],
  authors: [{ name: "Islam360" }],
  creator: "Islam360",
  publisher: "Islam360",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Islam360",
    title: "Islam360 — Encyclopaedia of Sunni Islam",
    description:
      "Explore articles, books, Q&A, scholar biographies, and lectures on Islamic sciences from the Ahl as-Sunnah tradition.",
    images: [
      {
        url: "/icon.png",
        width: 516,
        height: 516,
        alt: "Islam360 Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Islam360 — Encyclopaedia of Sunni Islam",
    description:
      "Explore articles, books, Q&A, scholar biographies, and lectures on Islamic sciences from the Ahl as-Sunnah tradition.",
    images: ["/icon.png"],
    creator: "@sugemadinah",
  },
  verification: {
    google: "MNqfI7SUHfq8Xk4XqtCRySp7DZBnE7EGOxCKf_x_ZpQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <CanonicalMeta />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${serifFont.variable} ${lora.variable} font-sans antialiased flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200`}
      >
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
          <StickyMobileCTA />
        </ThemeProvider>
      </body>
    </html>
  );
}
