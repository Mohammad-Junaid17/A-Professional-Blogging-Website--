import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page or resource you are looking for does not exist on Islamic Scholarly Resource.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-bold font-serif mb-4">404 - Not Found</h2>
      <p className="text-muted mb-8">The page or resource you are looking for does not exist, or it is currently pending approval.</p>
      <Link 
        href="/"
        className="px-6 py-2.5 bg-primary text-card rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
