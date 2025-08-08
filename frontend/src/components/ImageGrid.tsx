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

function ImageGrid(props: ImageGridProps) {
  const { images, onImageClick, isLoading, isError, error } = props;
  const [masonryImages, setMasonryImages] = useState<MasonryImage[]>([]);
  const [loadingDimensions, setLoadingDimensions] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mesure dynamique de la largeur du container
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        console.log("[ImageGrid] Container width updated:", width);
        setContainerWidth(width);
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
    console.log(
      "[ImageGrid] useEffect (dimensions) triggered, images:",
      images
    );
    if (!images || !Array.isArray(images) || images.length === 0) {
      setMasonryImages([]);
      setLoadingDimensions(false);
      console.log("[ImageGrid] No images to load, skip dimension loading.");
      return;
    }
    setLoadingDimensions(true);
    console.log(
      "[ImageGrid] Start loading dimensions for",
      images.length,
      "images"
    );
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
          console.log("[ImageGrid] All dimensions loaded");
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
          console.log("[ImageGrid] All dimensions loaded (with errors)");
        }
      };
    });
    return () => {
      isMounted = false;
    };
  }, [images]);

  // On mappe toutes les images pour leur associer leur position (si connue) ou une position par défaut
  const masonryImagesMap = new Map(masonryImages.map((img) => [img.src, img]));

  // On prépare un tableau d'objets { src, idx, ready, position }
  // Mémorise le mapping pour éviter une nouvelle référence à chaque render
  const allImages = React.useMemo(
    () =>
      images.map((src, idx) => {
        const found = masonryImagesMap.get(src);
        return {
          src,
          idx,
          ready: !!found,
          width: found?.width ?? 200,
          height: found?.height ?? 200,
        };
      }),
    [images, masonryImages]
  );

  // Mémorise le tableau passé à useMasonryLayout pour éviter une nouvelle référence à chaque render
  const memoizedMasonryImages = React.useMemo(
    () =>
      allImages.map((img) => ({
        src: img.src,
        width: img.width,
        height: img.height,
      })),
    [allImages]
  );

  // On calcule le layout pour toutes les images (même celles non prêtes) avec une taille par défaut
  const { positions } = useMasonryLayout(memoizedMasonryImages, containerWidth);

  // Calculer la hauteur totale du container
  const containerHeight =
    positions.length > 0
      ? Math.max(...positions.map((p) => p.top + p.height))
      : 0;

  return (
    <div
      className="w-full relative"
      ref={containerRef}
      style={{
        minHeight: containerHeight,
      }}
    >
      {/* Affichage des messages d'erreur ou d'absence d'images */}
      {isError && (
        <div className="text-red-500 text-center py-8">
          Error loading images: {error?.message}
        </div>
      )}
      {!isError && images.length === 0 && !isLoading && !loadingDimensions && (
        <div className="text-gray-500 text-center py-8">No images found.</div>
      )}
      {/* Affichage des images ou skeletons à leur position calculée */}
      {allImages.map((img, i) => {
        const pos = positions[i] || {
          top: 0,
          left: 0,
          width: 200, 
          height: 200,
        };
        return (
          <div
            key={img.ready ? img.src : `skeleton-${img.src}`}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              height: pos.height,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              zIndex: img.ready ? 2 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {img.ready ? (
              <ImageCard
                src={img.src}
                alt={`Image ${img.idx + 1}`}
                onClick={() => onImageClick(img.idx)}
              />
            ) : null}
          </div>
        );
      })}
      {(isLoading || loadingDimensions || containerWidth === 0) &&
        images.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50"
            style={{ pointerEvents: "none" }}
          >
            Loading
          </div>
        )}
    </div>
  );
}

export default ImageGrid;
