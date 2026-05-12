import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Info, Heart, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { type Photo } from '../types';
import { Button } from './ui/Button';

interface PhotoViewerProps {
  photo: Photo | null;
  onClose: () => void;
}

export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex bg-brand-bg/98 backdrop-blur-2xl"
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar Navigation */}
          <div className="flex h-20 items-center justify-between px-10">
            <button 
              onClick={onClose}
              className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white"
            >
              <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Dismiss</span>
            </button>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 bg-white/5 text-white/40 hover:bg-white hover:text-black">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 bg-white/5 text-white/40 hover:bg-white hover:text-black">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Visual content */}
          <div className="relative flex flex-1 items-center justify-center p-8 md:p-20">
            <motion.div
              layoutId={`photo-${photo.id}`}
              className="relative max-h-full max-w-full rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="max-h-[70vh] w-auto rounded-xl object-contain ring-1 ring-white/10"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Controls rail */}
          <div className="flex h-24 items-center justify-center gap-12 border-t border-white/5">
             <button className="text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white">Previous Artifact</button>
             <div className="h-px w-32 bg-white/10" />
             <button className="text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white">Next Artifact</button>
          </div>
        </div>

        {/* Inspector Sidebar */}
        <aside className="hidden w-80 flex-col border-l border-white/5 bg-white/[0.02] p-10 lg:flex">
          <div className="mb-10">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-semibold mb-8">Inspector / Data</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-display text-xl font-light tracking-tight text-white mb-2">{photo.title}</h4>
                <p className="text-xs leading-relaxed text-white/40 italic">
                  {photo.description || 'No descriptive metadata available for this artifact.'}
                </p>
              </div>
              
              <div className="pt-6 space-y-4">
                 {[
                   { label: 'Format', value: 'Original / JPEG' },
                   { label: 'Resolution', value: `${photo.width} x ${photo.height}` },
                   { label: 'Dimensions', value: `${(photo.width/photo.height).toFixed(2)} Aspect` },
                   { label: 'Timestamp', value: new Date(photo.createdAt).toLocaleDateString() },
                 ].map((stat) => (
                   <div key={stat.label} className="border-b border-white/5 pb-2 flex justify-between items-center">
                     <span className="text-[9px] uppercase tracking-widest text-white/20">{stat.label}</span>
                     <span className="text-[10px] text-white/60 font-mono tracking-tight">{stat.value}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
             <span className="text-[9px] uppercase tracking-widest text-white/20 block mb-2">Technical Tags</span>
             <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/5 rounded">#Visual</span>
                <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/5 rounded">#Archive</span>
                <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/5 rounded">#Luminal</span>
             </div>
             
             <div className="pt-8 flex gap-3">
                <Button className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
                  Download
                </Button>
                <Button variant="ghost" className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-3 text-rose-400 hover:bg-rose-500/20">
                  <Trash2 className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </aside>
      </motion.div>
    </AnimatePresence>
  );
}
