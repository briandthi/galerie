import React, { useEffect, useState, useRef } from "react";
import ImageCard from "./ImageCard";
import { useMasonryLayout } from "../hooks/useMasonryLayout";

type MasonryImage = {
  src: string;
  width: number;
  height: number;
};

type ImageGridProps = {
  images: string[];
  onImageClick: (idx: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onImageClick,
  isLoading,
  isError,
  error,
}) => {
  const [masonryImages, setMasonryImages] = useState<MasonryImage[]>([]);
  const [loadingDimensions, setLoadingDimensions] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mesure dynamique de la largeur du container
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    const resizeObserver = new window.ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", updateWidth);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Charger les dimensions de toutes les images
  useEffect(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      setMasonryImages([]);
      setLoadingDimensions(false);
      return;
    }
    setLoadingDimensions(true);
    let isMounted = true;
    let loaded = 0;
    const temp: MasonryImage[] = [];
    images.forEach((src: string, idx: number) => {
      const image = new window.Image();
      image.src = src;
      image.onload = () => {
        if (!isMounted) return;
        temp[idx] = {
          src,
          width: image.width,
          height: image.height,
        };
        loaded++;
        if (loaded === images.length) {
          setMasonryImages([...temp]);
          setLoadingDimensions(false);
        }
      };
      image.onerror = () => {
        if (!isMounted) return;
        temp[idx] = {
          src,
          width: 400,
          height: 400,
        };
        loaded++;
        if (loaded === images.length) {
          setMasonryImages([...temp]);
          setLoadingDimensions(false);
        }
      };
    });
    return () => {
      isMounted = false;
    };
  }, [images]);

  const { positions } = useMasonryLayout(masonryImages, containerWidth);

  if (isLoading || loadingDimensions || containerWidth === 0) {
    return (
      <div className="w-full flex flex-wrap gap-4" ref={containerRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 animate-pulse rounded-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4 aspect-square"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-8">
        Error loading images: {error?.message}
      </div>
    );
  }

  if (!masonryImages || masonryImages.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">No images found.</div>
    );
  }

  // Calculer la hauteur totale du container
  const containerHeight =
    positions.length > 0
      ? Math.max(...positions.map((p) => p.top + p.height))
      : 0;

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      style={{
        minHeight: containerHeight,
      }}
    >
      {masonryImages.map((img, idx) => {
        const pos = positions[idx] || { top: 0, left: 0, width: 200, height: 200 };
        return (
          <div
            key={img.src}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              height: pos.height,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <ImageCard
              src={img.src}
              alt={`Image ${idx + 1}`}
              onClick={() => onImageClick(idx)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ImageGrid;
