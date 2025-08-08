import React, { useState, useRef, useCallback } from "react";
import { useImages } from "../hooks/useImages";
import ImageGrid from "./ImageGrid";
import Lightbox from "./Lightbox";

const INITIAL_BATCH_SIZE = 40; // Premier batch plus long
const BATCH_SIZE = 15;         // Batchs suivants plus courts

const BASE_URL = "http://51.83.4.19:3002/images/";

function ImageGallery() {
  const { images, isLoading, isError, error } = useImages();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Liste des URLs absolues pour la lightbox

  const imageUrls = React.useMemo(
    () =>
      Array.isArray(images)
        ? images.map((img) => BASE_URL + encodeURIComponent(img))
        : [],
    [images]
  );

  // Intersection Observer pour la sentinelle
  React.useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((count) => {
            if (!images) return count;
            // Premier batch déjà chargé, on incrémente par BATCH_SIZE
            return Math.min(count + BATCH_SIZE, images.length);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "300px", // Marge pour déclencher avant d'être en bas de page
      }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [images]);

  // Images à afficher (mémorisé pour éviter une nouvelle référence à chaque render)
  const visibleImages = React.useMemo(
    () => imageUrls?.slice(0, visibleCount) ?? [],
    [imageUrls, visibleCount]
  );

  // Reset visibleCount si la liste change (ex: reload)
  React.useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [images]);

  const handleImageClick = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((idx) => (idx < imageUrls.length - 1 ? idx + 1 : idx));
  }, [imageUrls.length]);

  return (
    <div className="p-4">
      <ImageGrid
        images={visibleImages}
        onImageClick={handleImageClick}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
      {/* Sentinelle pour infinite scroll */}
      <div
        ref={sentinelRef}
        style={{
          height: "1px",
          width: "100%",
        }}
      />

      <Lightbox
        open={lightboxOpen}
        onClose={handleClose}
        images={imageUrls}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        alt={`Image ${currentIndex + 1}`}
      />
    </div>
  );
}

export default ImageGallery;

