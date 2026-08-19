import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Usage Policy",
  description: "Content Usage Policy for Islam360.",
};

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-foreground font-medium">Content Usage Policy</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-6">Content Usage Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Copyright</h2>
          <p>Articles, fatawa, translations, references, page content, and related materials published on Islam360 may be shared, copied, distributed, or republished without modification, provided that reference to the original source is included.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Use of Content</h2>
          <p>Content from Islam360 may be shared, copied, reproduced, republished, uploaded, transmitted, distributed, stored, printed, or circulated in electronic, digital, physical, or other form, as long as the content is not edited or modified and proper reference to the original source is included.</p>
          <p>The reference should clearly include the article title where available, the direct article link where available, and the website link: <a href="https://islam360.ridawiway.com" className="text-primary hover:underline">https://islam360.ridawiway.com</a>.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Required Attribution</h2>
          <p>When referencing Islam360, attribution should be clear enough for readers to find the original source. A proper reference includes:</p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>The name of the article or fatawa being referenced.</li>
            <li>The direct URL of the article page.</li>
            <li>The website name, Islam360, with a link to <a href="https://islam360.ridawiway.com" className="text-primary hover:underline">https://islam360.ridawiway.com</a>.</li>
            <li>A note identifying that the content is shared from the original source.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">No Modification</h2>
          <p>Editing, modifying, adapting, rewriting, translating, summarizing, excerpting in a misleading way, removing references, changing wording, or altering the meaning or scholarly context of content from Islam360 is strictly not allowed. Shared content must remain faithful to the original published source.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Authors and Sources</h2>
          <p>Some materials may include references to scholars, authors, publications, or source works. Those rights remain with their respective owners where applicable. Referencing Islam360 does not replace the need to preserve the original scholarly references shown within an article.</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Questions</h2>
          <p>Permission is not required to share, reproduce, publish, or distribute unmodified material from Islam360, provided that reference to the original source is included. For questions about attribution, contact us at <a href="mailto:sugemadinah7@gmail.com" className="text-primary hover:underline">sugemadinah7@gmail.com</a>.</p>

          <p className="mt-8 text-sm text-muted-foreground">This policy does not limit any rights that may be available under applicable law.</p>
        </div>
      </div>
    </div>
  );
}
