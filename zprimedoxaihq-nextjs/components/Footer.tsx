import { Shield, Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-doc-dark border-t border-doc-green/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-doc-gold" />
              <span className="text-lg font-bold text-white">zPrimeDox <span className="text-doc-gold">AI HQ</span></span>
            </div>
            <p className="text-doc-text/60 text-sm max-w-md">
              The World&apos;s First Cannabis Constitutional Intelligence Engine. Built by Doc Weedlaw — 20+ Years Constitutional Advocacy. 45+ Companies. One Empire.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-doc-text/60">PrimeDox AI</span></li>
              <li><span className="text-doc-text/60">VIGILAX</span></li>
              <li><span className="text-doc-text/60">OmniaGuard</span></li>
              <li><span className="text-doc-text/60">CleanSwarm</span></li>
              <li><span className="text-doc-text/60">Weedlaw Edu</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-doc-text/60 hover:text-doc-gold transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-doc-text/60 hover:text-doc-gold transition">Terms of Service</Link></li>
              <li>
                <a href="mailto:franciscoderek7@gmail.com" className="text-doc-text/60 hover:text-doc-gold transition flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-doc-green/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-doc-text/40 text-sm">© 2026 Francisco Holdings Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/franciscoderek7" className="text-doc-text/40 hover:text-doc-gold transition">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-doc-text/40 hover:text-doc-gold transition"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-doc-text/40 hover:text-doc-gold transition"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
        <p className="text-center text-doc-text/20 text-xs mt-4">
          Powered by zPrimeDox AI HQ • #1 Cannabis Constitutional Advocate in Ontario, Canada
        </p>
      </div>
    </footer>
  );
}
