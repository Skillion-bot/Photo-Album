import React from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Grid, Folder, History, LogIn, LogOut, Disc } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/src/lib/utils';
import { useAuth } from './AuthProvider';
import { signInWithGoogle, signOut } from '../lib/firebase';

export function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { name: 'All Perspectives', path: '/', icon: Grid },
    { name: 'Curated Sets', path: '/albums', icon: Folder },
    { name: 'Recent Artifacts', path: '#', icon: History },
  ];

  const categories = [
    { name: 'Minimalism', count: 12 },
    { name: 'Urban Voids', count: 24 },
    { name: 'Brutalist Art', count: 8 },
  ];

  return (
    <aside className="hidden w-72 flex-col border-r border-white/5 bg-brand-bg p-8 lg:flex">
      <div className="mb-12">
        <NavLink to="/" className="group flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-110">
            <div className="h-1.5 w-1.5 rounded-full bg-black" />
          </div>
          <div>
             <h1 className="font-display text-2xl font-bold tracking-tighter italic text-white leading-none">SNAPVAULT</h1>
             <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">Visual Study Archive</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 space-y-10">
        <div>
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-white/20 font-bold">Main Index</p>
          <ul className="space-y-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 text-base transition-all duration-300",
                    isActive ? "text-white font-semibold transform translate-x-2" : "text-white/30 hover:text-white hover:translate-x-1"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-white/20")} />
                      <span className="tracking-tight">{item.name}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Categories</p>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat.name} className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm text-white/40 transition-colors group-hover:text-white">{cat.name}</span>
                <span className="text-[10px] text-white/20 uppercase tracking-widest">{cat.count.toString().padStart(2, '0')}</span>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto space-y-6">
        {user ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={user.photoURL || ''} alt="User" className="h-8 w-8 rounded-full ring-1 ring-white/10" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.displayName}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Collector</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-white" />
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">64.2GB / 100GB</p>
              </div>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="w-full justify-start gap-3 rounded-xl border border-white/5 text-white/40 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        ) : (
          <Button 
            onClick={signInWithGoogle}
            className="w-full gap-3 rounded-xl bg-white font-semibold text-black hover:bg-white/90"
          >
            <LogIn className="h-4 w-4" />
            <span>Connect Archive</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
