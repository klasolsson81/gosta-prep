import { useRef, useState, useCallback } from 'react';
import { Camera, X, Trash2, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyPhotos } from '../../hooks/useCompanyPhotos';
import { compressImage } from '../../utils/compressImage';

interface Props {
  companyId: string;
}

export default function PhotoGallery({ companyId }: Props) {
  const { photos, loading, addPhoto, removePhoto, available } = useCompanyPhotos(companyId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAdding(true);
      try {
        const compressed = await compressImage(file);
        await addPhoto(compressed);
      } catch {
        // silently fail
      } finally {
        setAdding(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [addPhoto],
  );

  const handleDelete = useCallback(async () => {
    if (lightboxIndex === null) return;
    const photo = photos[lightboxIndex];
    await removePhoto(photo.id);
    setConfirmDelete(false);
    // Adjust index after deletion
    if (photos.length <= 1) {
      setLightboxIndex(null);
    } else if (lightboxIndex >= photos.length - 1) {
      setLightboxIndex(photos.length - 2);
    }
  }, [lightboxIndex, photos, removePhoto]);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      setLightboxIndex((i) => {
        if (i === null) return null;
        const next = i + dir;
        if (next < 0 || next >= photos.length) return i;
        return next;
      });
      setConfirmDelete(false);
    },
    [photos.length],
  );

  if (!available) {
    return (
      <div className="bg-glass border border-glass-border rounded-xl px-4 py-3">
        <p className="text-sm text-text-muted">
          Foto-funktionen kräver en vanlig webbläsare. Öppna i Chrome eller Safari.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Camera button */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors min-h-[44px] disabled:opacity-50"
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <Camera size={16} />
          )}
          Ta foto
        </button>
        <button
          onClick={() => {
            // Remove capture attribute to allow gallery pick
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture');
              fileRef.current.click();
              // Restore capture after a tick
              requestAnimationFrame(() => {
                fileRef.current?.setAttribute('capture', 'environment');
              });
            }
          }}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass text-text-muted border border-glass-border text-sm font-medium hover:bg-glass-hover transition-colors min-h-[44px] disabled:opacity-50"
        >
          <ImagePlus size={16} />
          Välj bild
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {/* Grid */}
      {loading ? (
        <div className="text-sm text-text-dim py-4 text-center">Laddar foton...</div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-text-dim py-2">Fota visitkort, montern eller presentationen — allt sparas lokalt på din telefon.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setLightboxIndex(i);
                setConfirmDelete(false);
              }}
              className="aspect-square rounded-xl overflow-hidden border border-glass-border hover:border-primary/30 transition-colors"
            >
              <img
                src={photo.url}
                alt={photo.caption || `Foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={() => {
              setLightboxIndex(null);
              setConfirmDelete(false);
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 shrink-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-white/60 text-sm font-medium">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-2.5 rounded-lg hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={18} className="text-white/60" />
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-error text-white text-sm font-medium min-h-[44px] flex items-center"
                  >
                    Ta bort
                  </button>
                )}
                <button
                  onClick={() => {
                    setLightboxIndex(null);
                    setConfirmDelete(false);
                  }}
                  className="p-2.5 rounded-lg hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className="flex-1 flex items-center justify-center px-4 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev */}
              {lightboxIndex > 0 && (
                <button
                  onClick={() => navigate(-1)}
                  className="absolute left-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
              )}

              <AnimatePresence mode="popLayout">
                <motion.img
                  key={photos[lightboxIndex].id}
                  src={photos[lightboxIndex].url}
                  alt={photos[lightboxIndex].caption || 'Foto'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </AnimatePresence>

              {/* Next */}
              {lightboxIndex < photos.length - 1 && (
                <button
                  onClick={() => navigate(1)}
                  className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              )}
            </div>

            {/* Caption / timestamp */}
            <div className="p-4 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
              <p className="text-white/40 text-xs">
                {new Date(photos[lightboxIndex].timestamp).toLocaleString('sv-SE')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
