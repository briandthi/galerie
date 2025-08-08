import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "./ui/dialog";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  alt?: string;
}

const Lightbox: React.FC<LightboxProps> = ({
  open,
  onClose,
  images,
  currentIndex,
  onPrev,
  onNext,
  alt,
}) => {
  const imageSrc = images[currentIndex];

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onPrev();
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNext();
      }
    },
    [open, currentIndex, images.length, onPrev, onNext]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  // Preload next/prev images
  useEffect(() => {
    if (currentIndex < images.length - 1) {
      const nextImg = new window.Image();
      nextImg.src = images[currentIndex + 1];
    }
    if (currentIndex > 0) {
      const prevImg = new window.Image();
      prevImg.src = images[currentIndex - 1];
    }
  }, [currentIndex, images]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex items-center justify-center p-0 max-w-none bg-[#000000b9]"
      >
        <DialogClose
          asChild
          className="absolute top-4 right-4 z-10 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
        >
          <button aria-label="Fermer la lightbox" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </DialogClose>
        {/* Flèche gauche */}
        {currentIndex > 0 && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition"
            onClick={onPrev}
            aria-label="Image précédente"
            style={{ lineHeight: 0 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {/* Flèche droite */}
        {currentIndex < images.length - 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition"
            onClick={onNext}
            aria-label="Image suivante"
            style={{ lineHeight: 0 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <img
          src={imageSrc}
          alt={alt || "Image"}
          className="max-h-[90vh] max-w-[90vw] object-contain mx-auto my-auto rounded shadow-lg"
          draggable={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Lightbox;