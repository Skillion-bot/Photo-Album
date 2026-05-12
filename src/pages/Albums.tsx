import React from 'react';
import { SAMPLE_ALBUMS } from '../constants';
import { Card, CardContent } from '../components/ui/Card';
import { Folder, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Albums() {
  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-light tracking-tighter text-white lg:text-5xl">
          Curated Sets
          <span className="ml-4 text-white/20 italic">/ Index</span>
        </h1>
        <p className="max-w-xl text-xs italic tracking-wide text-white/40">
          Thematic groupings of captured moments. A taxonomy of visual memory.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_ALBUMS.map((album) => (
          <motion.div
            key={album.id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 transition-colors group-hover:border-white/10">
              <img
                src={album.coverUrl}
                alt={album.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-60 mix-blend-luminosity transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-1">Set 0{album.id === 'nature' ? '1' : '2'}</p>
                <h3 className="font-display text-xl font-light tracking-tighter text-white">{album.name}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">{album.photoCount} Artifacts</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
