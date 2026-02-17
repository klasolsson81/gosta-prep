import { useState, useEffect, useCallback, useRef } from 'react';
import { savePhoto, getPhotos, deletePhoto, idbAvailable } from '../lib/photoDB';

interface PhotoEntry {
  id: string;
  url: string;
  timestamp: number;
  caption?: string;
}

export function useCompanyPhotos(companyId: string) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!idbAvailable) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const records = await getPhotos(companyId);
        if (cancelled) return;

        // Revoke old URLs before creating new ones
        for (const u of urlsRef.current) URL.revokeObjectURL(u);

        const entries: PhotoEntry[] = records
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((r) => {
            const url = URL.createObjectURL(r.blob);
            return { id: r.id, url, timestamp: r.timestamp, caption: r.caption };
          });

        urlsRef.current = entries.map((e) => e.url);
        setPhotos(entries);
      } catch {
        // IndexedDB not available — silently degrade
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      for (const u of urlsRef.current) URL.revokeObjectURL(u);
      urlsRef.current = [];
    };
  }, [companyId]);

  const addPhoto = useCallback(
    async (blob: Blob, caption?: string) => {
      if (!idbAvailable) return;
      try {
        const record = await savePhoto(companyId, blob, caption);
        const url = URL.createObjectURL(record.blob);
        urlsRef.current.push(url);
        setPhotos((prev) => [
          { id: record.id, url, timestamp: record.timestamp, caption: record.caption },
          ...prev,
        ]);
      } catch {
        // silently fail
      }
    },
    [companyId],
  );

  const removePhoto = useCallback(async (id: string) => {
    try {
      await deletePhoto(id);
    } catch {
      // silently fail
    }
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        urlsRef.current = urlsRef.current.filter((u) => u !== target.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  return { photos, loading, addPhoto, removePhoto, available: idbAvailable };
}
