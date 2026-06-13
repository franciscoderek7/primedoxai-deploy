"use client";

import { useState, useEffect } from "react";
import { supabase, getUser, signOut } from "@/lib/supabase";
import { Menu, X, Shield, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getUser().then(setUser);
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-doc-dark/90 backdrop-blur-md border-b border-doc-green/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-doc-gold" />
            <span className="text-xl font-bold text-white">zPrimeDox <span className="text-doc-gold">AI HQ</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#apps" className="text-doc-text hover:text-doc-gold transition">Apps</Link>
            <Link href="#pricing" className="text-doc-text hover:text-doc-gold transition">Pricing</Link>
            <Link href="#about" className="text-doc-text hover:text-doc-gold transition">About</Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-doc-gold text-sm flex items-center gap-1">
                  <User className="w-4 h-4" />{user.email?.split('@')[0]}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition">
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-doc-green text-white rounded-lg hover:bg-doc-green/80 transition">
                Sign In
              </Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-doc-gold">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-doc-card border-t border-doc-green/30">
          <div className="px-4 py-3 space-y-2">
            <Link href="#apps" className="block text-doc-text hover:text-doc-gold">Apps</Link>
            <Link href="#pricing" className="block text-doc-text hover:text-doc-gold">Pricing</Link>
            <Link href="#about" className="block text-doc-text hover:text-doc-gold">About</Link>
            {user
              ? <button onClick={handleLogout} className="block text-red-400">Logout</button>
              : <Link href="/auth/login" className="block text-doc-gold">Sign In</Link>
            }
          </div>
        </div>
      )}
    </nav>
  );
}
