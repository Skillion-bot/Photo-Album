import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Image as ImageIcon, CheckCircle2, AlertCircle, FileImage, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../components/AuthProvider';
import { addPhoto, getUserAlbums, uploadFile } from '../lib/firebase';
import { type Album } from '../types';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    albumId: '',
  });

  useEffect(() => {
    if (user) {
      getUserAlbums(user.uid).then(setAlbums);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Get dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!formData.title || !formData.albumId) {
         throw new Error("Please fill in all required fields (Classification and Title)");
      }

      // 1. Upload file to Firebase Storage
      const storagePath = `users/${user.uid}/photos/${Date.now()}_${selectedFile.name}`;
      const downloadUrl = await uploadFile(selectedFile, storagePath);

      // 2. Add document to Firestore
      await addPhoto({
        userId: user.uid,
        albumId: formData.albumId,
        url: downloadUrl,
        title: formData.title,
        description: formData.description,
        width: dimensions.width,
        height: dimensions.height,
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      let message = 'Failed to upload photo';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || err.message;
        } catch {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-light tracking-tighter text-white">Access Denied</h2>
        <p className="text-white/40 italic mt-2">Please connect to your archive to contribute.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-light tracking-tighter text-white lg:text-5xl">
          New Artifact
          <span className="ml-4 text-white/20 italic">/ Record</span>
        </h1>
        <p className="max-w-xl text-xs italic tracking-wide text-white/40">
          Submitting a new visual study to the collective archive. Ensure metadata accuracy.
        </p>
      </header>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 md:p-12">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="mb-6 h-px w-24 bg-white/10" />
            <h2 className="text-2xl font-light tracking-tighter text-white">Artifact Synchronized</h2>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40">Integrating into the index...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-[10px] uppercase tracking-widest text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* File Upload Zone */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Visual Source</label>
              {!previewUrl ? (
                <div 
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] transition-all hover:bg-white/[0.03] hover:border-white/20"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full bg-white/5 p-4 transition-transform group-hover:scale-110">
                      <UploadIcon className="h-6 w-6 text-white/40" />
                    </div>
                    <div>
                      <p className="text-sm font-light text-white/60">Drop image artifact or <span className="text-white underline underline-offset-4">browse</span></p>
                      <p className="mt-2 text-[9px] uppercase tracking-widest text-white/20">Supports RAW, JPG, PNG up to 20MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button 
                      type="button"
                      onClick={clearSelection}
                      className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-[10px] uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-105"
                    >
                      <Trash2 className="h-3 w-3" />
                      Discard Artifact
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="Artifact Title"
                  className="w-full border-b border-white/10 bg-transparent py-4 text-sm text-white placeholder:text-white/10 outline-hidden transition-colors focus:border-white/30"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Classification</label>
                <select
                  required
                  className="w-full border-b border-white/10 bg-transparent py-4 text-sm text-white/60 outline-hidden transition-colors focus:border-white/30 cursor-pointer"
                  value={formData.albumId}
                  onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                >
                  <option value="" className="bg-brand-bg text-white">Select Classification</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id} className="bg-brand-bg text-white">{album.name}</option>
                  ))}
                  <option value="nature" className="bg-brand-bg text-white">Nature Escapes</option>
                  <option value="urban" className="bg-brand-bg text-white">Urban Explorer</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Contextual Narrative</label>
              <textarea
                placeholder="Describe the essence..."
                rows={3}
                className="w-full border-b border-white/10 bg-transparent py-4 text-sm text-white placeholder:text-white/10 outline-hidden transition-colors focus:border-white/30 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-8">
              <Button 
                type="submit" 
                disabled={isLoading || !selectedFile}
                className="flex-1 rounded-xl bg-white py-6 text-[10px] uppercase tracking-[0.3em] font-bold text-black hover:bg-white/90 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Authorize Submission'}
              </Button>
              <button 
                type="button" 
                onClick={() => navigate('/')}
                className="px-8 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                disabled={isLoading}
              >
                Abort
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
