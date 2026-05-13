import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SAMPLE_PHOTOS } from '../constants';
import { PhotoCard } from '../components/PhotoCard';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, ShieldAlert, Grid2X2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PhotoViewer } from '../components/PhotoViewer';
import { type Photo } from '../types';
import { useAuth } from '../components/AuthProvider';
import { getUserPhotos } from '../lib/firebase';

export function Home() {
  const { user } = useAuth();
  const { albumId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>(SAMPLE_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If no albumId is provided, we can default to 'nature' for the initial view
  const currentAlbumId = albumId || 'nature';

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Always filter by userId and albumId as requested
      getUserPhotos(user.uid, currentAlbumId)
        .then(userPhotos => {
          // If user has photos in this album, show them. Otherwise show samples for that category.
          if (userPhotos.length > 0) {
             setPhotos(userPhotos);
          } else {
             // Filter samples by album if it matches our category
             const categorySamples = SAMPLE_PHOTOS.filter(p => p.albumId === currentAlbumId);
             setPhotos(categorySamples.length > 0 ? categorySamples : SAMPLE_PHOTOS);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      // Not logged in, show samples for the selected category
      const categorySamples = SAMPLE_PHOTOS.filter(p => p.albumId === currentAlbumId);
      setPhotos(categorySamples.length > 0 ? categorySamples : SAMPLE_PHOTOS);
    }
  }, [user, currentAlbumId]);

  const filteredPhotos = photos.filter(photo => 
    photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-12">
        <div className="space-y-4">
          <motion.h1 
            className="font-display text-6xl font-bold tracking-[-0.05em] text-white lg:text-8xl leading-none uppercase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              fontWeight: [700, 900, 700],
              letterSpacing: ["-0.05em", "0.02em", "-0.05em"]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {albumId ? albumId : 'ARCHIVE'}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4">
             <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 bg-white/5 px-2 py-1 rounded">Visual Study</span>
             {albumId && (
               <>
                 <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">/</span>
                 <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">{albumId}</span>
               </>
             )}
             <span className="text-[10px] uppercase tracking-[0.4em] text-white/20">/</span>
             <p className="text-xs tracking-tight text-white/40 italic font-medium">
               Relishing the architectural narrative of {currentAlbumId} through {photos.length} artifacts.
             </p>
          </div>
        </div>
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <Link to="/albums" className="flex items-center gap-2 transition-colors hover:text-white">
            <Grid2X2 className="h-3 w-3" />
            Switch Set
          </Link>
          <span className="text-white/10">|</span>
          <button className="transition-colors hover:text-white">Relational Sort</button>
        </div>
      </header>

      {/* Mobile Search */}
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
          <h3 className="text-xl font-light tracking-tighter text-white/60">Sector Void</h3>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/20">No matching visual data in the {currentAlbumId} index</p>
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


