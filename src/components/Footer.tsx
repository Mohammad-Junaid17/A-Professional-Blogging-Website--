"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mail, Send, Globe } from "lucide-react";

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#31373D] text-gray-300 pt-16 pb-6">
      <div className="container mx-auto px-4">
        
        {/* Social Banner */}
        <div className="flex flex-col items-center justify-center space-y-5 mb-16 pb-12 border-b border-border">
          <span className="text-sm text-white font-bold uppercase tracking-[0.2em]">Follow Our Updates</span>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a href="https://x.com/sugemadinah" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#252A2E] border border-[#404850] rounded-full hover:bg-primary/20 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all group" aria-label="Twitter">
                <TwitterIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
              </a>
              <a href="https://www.instagram.com/q.sunnahh_/" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#252A2E] border border-[#404850] rounded-full hover:bg-primary/20 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all group" aria-label="Instagram">
                <InstagramIcon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
              </a>
            </div>
            <span className="text-sm text-gray-500 italic mt-2">Curated by @q.sunnahh_</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center group">
              <div className="w-12 h-12 flex items-center justify-center -mr-2">
                <img src="/MuftieAzam2.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert scale-110" />
              </div>
              <span className="font-bold text-white text-xl">
                Islamic Scholarly Resource
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A comprehensive knowledge hub for Islamic sciences, jurisprudence, theology, and general Islamic learning.
            </p>
            <a href="mailto:sugemadinah7@gmail.com" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mt-4">
              <Mail size={16} />
              <span>Contact Admin: sugemadinah7@gmail.com</span>
            </a>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-bold mb-4 text-white">Browse</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/articles" className="hover:text-primary transition-colors">Articles</Link></li>
              <li><Link href="/books" className="hover:text-primary transition-colors">Books & Library</Link></li>
              <li><Link href="/scholars" className="hover:text-primary transition-colors">Scholar Biographies</Link></li>
              <li><Link href="/qa" className="hover:text-primary transition-colors">Q&A / Fatawa</Link></li>
              <li><Link href="/lectures" className="hover:text-primary transition-colors">Lectures</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/contentions" className="hover:text-primary transition-colors">Contentions</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">Search</Link></li>
            </ul>

            <h3 className="font-bold mt-8 mb-4 text-white">Acknowledgements</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Special thanks to <a href="https://thesunniway.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors font-semibold underline decoration-gray-600 underline-offset-2">TheSunniWay</a> and <a href="https://sunnahcentral.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors font-semibold underline decoration-gray-600 underline-offset-2">SunnahCentral</a> for their invaluable resources and inspiration.
            </p>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-bold mb-4 text-white">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for updates on new articles, books, and scholarly content.
            </p>
            <form className="flex" action="/#">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 px-3 py-2 bg-[#252A2E] border border-[#404850] rounded-l-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <button 
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                aria-label="Subscribe"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
          
        </div>

        <div className="border-t border-[#404850] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Islamic Scholarly Resource. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-gray-500">
            <a href="https://x.com/sugemadinah" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary transition-colors"><TwitterIcon size={20} /></a>
            <a href="https://www.instagram.com/q.sunnahh_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><InstagramIcon size={20} /></a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Website"><Globe size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
