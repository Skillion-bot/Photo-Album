import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Heart, Trash2, AlertCircle } from 'lucide-react';
import { type Photo } from '../types';
import { useAuth } from './AuthProvider';
import { deletePhoto } from '../lib/firebase';
import { Button } from './ui/Button';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const isOwner = user?.uid === photo.userId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    try {
      await deletePhoto(photo.id);
      // We rely on the parent (Home) re-fetching or being lucky with the state for now.
      // In a real app, I'd use a listener.
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      layoutId={`photo-${photo.id}`}
      className="masonry-item group relative overflow-hidden rounded-2xl cursor-pointer bg-neutral-900 border border-white/5"
      onClick={() => onClick(photo)}
      whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="relative overflow-hidden"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <img
          src={photo.url}
          alt={photo.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-80 mix-blend-luminosity transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-4 text-center backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
            >
              <AlertCircle className="mb-2 h-6 w-6 text-white/40" />
              <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/60">Destroy Artifact?</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 rounded-full bg-white px-4 text-[10px] uppercase tracking-widest text-black" onClick={handleDelete}>
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 px-4 text-[10px] uppercase tracking-widest text-white/40" onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Vol. {new Date(photo.createdAt).getFullYear()}</p>
              <h3 className="text-sm font-light tracking-tight text-white truncate">{photo.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <button 
                  onClick={handleDelete}
                  className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400 backdrop-blur-md transition-all border border-white/10"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              <button className="rounded-full bg-white/5 p-2 text-white/40 hover:bg-white hover:text-black backdrop-blur-md transition-all border border-white/10">
                <Heart className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
