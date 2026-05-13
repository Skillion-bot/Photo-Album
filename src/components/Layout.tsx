import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Upload, Menu, X, LogIn, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from './AuthProvider';
import { ThemeToggle } from './ThemeToggle';
import { signInWithGoogle, signOut } from '../lib/firebase';

export function Layout() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg select-none">
      <Sidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 lg:hidden">
          <div className="flex items-center gap-2 italic">
            <div className="h-3 w-3 rounded-full bg-white" />
            <motion.span 
              className="font-display text-2xl font-bold tracking-tighter text-white"
              animate={{ 
                fontWeight: [700, 800, 700],
                letterSpacing: ["-0.05em", "0.05em", "-0.05em"],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              SNAPVAULT
            </motion.span>
          </div>
          <div className="flex items-center gap-3">
             {!user && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signInWithGoogle}
                  className="h-8 px-3 text-[10px] uppercase tracking-widest text-white/60 border border-white/10 rounded-full"
                >
                  Sign In
                </Button>
             )}
             <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
               {isMobileMenuOpen ? <X /> : <Menu />}
             </Button>
          </div>
        </header>

        {/* Global Desktop Header */}
        <header className="hidden h-20 items-center justify-between border-b border-white/5 px-10 lg:flex">
          <div className="flex flex-1 items-center gap-6">
             <div className="relative w-full max-w-md">
                <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Search archives..." 
                  className="w-full bg-transparent py-2 pl-8 text-sm text-white/60 placeholder:text-white/20 outline-hidden"
                />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <NavLink to="/upload">
                  <Button className="rounded-full bg-white px-8 py-2 text-xs font-semibold text-black hover:bg-white/90">
                    + New Artifact
                  </Button>
                </NavLink>
                <button 
                  onClick={signOut}
                  className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Button 
                onClick={signInWithGoogle}
                className="rounded-full bg-white px-8 py-2 text-xs font-semibold text-black hover:bg-white/90"
              >
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Metadata Rail Footer */}
        <footer className="hidden h-16 items-center justify-between border-t border-white/5 px-10 lg:flex">
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] text-white/30">
            <span>Grid View (G)</span>
            <span>Archive Index (A)</span>
            <span>Inspector (I)</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Vol. 2024</span>
               <div className="mt-1 h-[2px] w-12 overflow-hidden rounded-full bg-white/10">
                 <div className="h-full w-1/3 bg-white/50" />
               </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-50 bg-brand-bg p-8 lg:hidden"
          >
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X />
              </Button>
            </div>
            <nav className="mt-12 space-y-12">
               <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-6xl font-bold tracking-tighter text-white font-display">ROOT</NavLink>
               <NavLink to="/albums" onClick={() => setIsMobileMenuOpen(false)} className="block text-6xl font-bold tracking-tighter text-white font-display">SETS</NavLink>
               <NavLink to="/upload" onClick={() => setIsMobileMenuOpen(false)} className="block text-6xl font-bold tracking-tighter text-white font-display">SYNC</NavLink>
               
               <div className="pt-12 border-t border-white/5">
                 {user ? (
                    <button 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-6 text-white/40 text-2xl font-bold tracking-tighter hover:text-white font-display"
                    >
                      <LogOut className="h-6 w-6" />
                      TERMINATE
                    </button>
                 ) : (
                    <button 
                      onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-6 text-white hover:text-white/80 text-2xl font-bold tracking-tighter font-display"
                    >
                      <LogIn className="h-6 w-6" />
                      CONNECT
                    </button>
                 )}
               </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

