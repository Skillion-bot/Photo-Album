import React, { useState, useEffect } from 'react';
import { SAMPLE_PHOTOS } from '../constants';
import { PhotoCard } from '../components/PhotoCard';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PhotoViewer } from '../components/PhotoViewer';
import { type Photo } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getUserPhotos } from '../lib/firebase';

export function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>(SAMPLE_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserPhotos(user.uid)
        .then(userPhotos => {
          // Merge sample with user photos for a populated feel, or just show user's
          // For now, let's prioritize user photos if they exist
          if (userPhotos.length > 0) {
            setPhotos([...userPhotos, ...SAMPLE_PHOTOS]);
          } else {
            setPhotos(SAMPLE_PHOTOS);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setPhotos(SAMPLE_PHOTOS);
    }
  }, [user]);

  const filteredPhotos = photos.filter(photo => 
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.albumId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-12">
        <div className="space-y-4">
          <h1 className="font-display text-6xl font-bold tracking-[ -0.05em] text-white lg:text-8xl leading-none">
            {searchQuery ? 'SEARCH' : 'ARCHIVE'}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
             <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 bg-white/5 px-2 py-1 rounded">Visual Study</span>
             <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">/</span>
             <p className="text-xs tracking-tight text-white/40 italic font-medium">
               Relishing the interplay of light and geometry across {photos.length} captured artifacts.
             </p>
          </div>
        </div>
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <button className="transition-colors hover:text-white">Filter by Date</button>
          <span className="text-white/10">|</span>
          <button className="transition-colors hover:text-white">Resolution</button>
        </div>
      </header>

      {/* Mobile Search - Only visible on small screens */}
      <div className="relative block lg:hidden">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
        <input 
          type="text" 
          placeholder="Search archives..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/5 bg-white/[0.03] pl-10 pr-4 text-xs tracking-widest text-white/60 placeholder:text-white/20 outline-hidden"
        />
      </div>

      <div className="masonry-grid min-h-[400px]">
        {filteredPhotos.map((photo) => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            onClick={setSelectedPhoto} 
          />
        ))}
      </div>
      
      {filteredPhotos.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
          <div className="mb-6 h-px w-24 bg-white/10" />
          <h3 className="text-xl font-light tracking-tighter text-white/60">Archive Void</h3>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/20">No matching artifacts found in this sector</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
           <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-[loading_1.5s_infinite] bg-white/50" />
           </div>
        </div>
      )}

      <PhotoViewer 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
    </div>
  );

}


