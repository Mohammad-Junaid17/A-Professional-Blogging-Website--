import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Islam360.",
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Privacy Policy</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-6">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>Welcome to Islam360. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. The Data We Collect About You</h2>
          <p>We believe in minimal data collection. We only collect the information strictly necessary for you to use our services:</p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li><strong>Account Data:</strong> If you create an account, we collect your username.</li>
            <li><strong>Contact Data:</strong> We collect your email address only when necessary (for example, to notify you when your question is answered or if you subscribe to our newsletter).</li>
          </ul>
          <p>We do not collect your phone numbers, physical addresses, or detailed technical tracking data beyond what is strictly necessary to run the website securely.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">5. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us via the contact information provided on our website.</p>
        </div>
      </div>
    </div>
  );
}
