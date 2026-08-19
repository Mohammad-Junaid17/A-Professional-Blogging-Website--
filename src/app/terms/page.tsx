import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for using Islam360.",
};

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Terms & Conditions</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using Islam360, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. Use of Content</h2>
          <p>The content and materials provided on Islam360 are for educational and informational purposes only. You may view, download, and print content for your personal, non-commercial use, provided you keep intact all copyright and other proprietary notices.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>If you create an account on the website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Q&A and Submissions</h2>
          <p>By submitting questions to our Q&A platform, you grant us the right to publish, edit, or remove the question and answer on our platform for the benefit of other users.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Modifications to Terms</h2>
          <p>We reserve the right to modify these terms at any time. You should check this page regularly. Your continued use of the website following the posting of changes to these terms will mean you accept those changes.</p>
        </div>
      </div>
    </div>
  );
}
