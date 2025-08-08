import React, { useState, useRef, useCallback } from "react";
import { useImages } from "../hooks/useImages";
import ImageGrid from "./ImageGrid";
import Lightbox from "./Lightbox";

const IMAGES_PER_BATCH = 20;

const BASE_URL = "http://51.83.4.19:3002/images/";

const ImageGallery: React.FC = () => {
  const { images, isLoading, isError, error } = useImages();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(IMAGES_PER_BATCH);
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
            // Ne pas dépasser la longueur totale
            if (!images) return count;
            return Math.min(count + IMAGES_PER_BATCH, images.length);
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [images]);

  // Images à afficher
  const visibleImages = imageUrls?.slice(0, visibleCount) ?? [];

  // Reset visibleCount si la liste change (ex: reload)
  React.useEffect(() => {
    setVisibleCount(IMAGES_PER_BATCH);
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
    <div>
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
};

export default ImageGallery;
