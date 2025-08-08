import './App.css'
import React, { useState, useCallback } from "react";
import ImageGrid from './components/ImageGrid'
import Lightbox from './components/Lightbox'
import { useImages } from './hooks/useImages'

const BASE_URL = "http://51.83.4.19:3002/images/";

function App() {
  const { images, isLoading, isError, error } = useImages();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Liste des URLs absolues pour la lightbox
  const imageUrls = Array.isArray(images)
    ? images.map((img) => BASE_URL + encodeURIComponent(img))
    : [];

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
    <>
      <ImageGrid
        images={imageUrls}
        onImageClick={handleImageClick}
        isLoading={isLoading}
        isError={isError}
        error={error}
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
    </>
  )
}

export default App
