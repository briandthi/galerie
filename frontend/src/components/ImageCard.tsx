import React, { useState, useEffect, useRef } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

type ImageCardProps = {
  src: string;
  alt?: string;
  onClick?: () => void;
};

const skeletonStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1/1",
  background: "#e5e7eb",
  borderRadius: "0.5rem",
  display: "block",
};

export const ImageCard: React.FC<ImageCardProps> = ({ src, alt, onClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1 });

  useEffect(() => {
    if (isVisible) {
      setShouldLoad(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!shouldLoad) return;
    setLoading(true);
    setError(false);
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src, shouldLoad]);

  return (
    <div
      ref={cardRef}
      className="cursor-pointer overflow-hidden shadow"
      onClick={onClick}
      style={{ position: "relative" }}
      tabIndex={0}
      aria-label={alt || "Image"}
    >
      {(loading || !shouldLoad) && (
        <div style={skeletonStyle} className="animate-pulse" />
      )}
      {error && (
        <div className="flex items-center justify-center bg-red-100 text-red-500 h-40">
          Error loading image
        </div>
      )}
      {!loading && !error && shouldLoad && (
        <img
          src={src}
          alt={alt || "Image"}
          loading="lazy"
          width={dimensions?.width}
          height={dimensions?.height}
          className="w-full h-auto object-cover transition-opacity duration-300"
          style={{ display: loading ? "none" : "block" }}
          draggable={false}
        />
      )}
    </div>
  );
};

export default ImageCard;
