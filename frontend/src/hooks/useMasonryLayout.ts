import { useState, useEffect } from "react";

type MasonryImage = {
  src: string;
  width: number;
  height: number;
};

type MasonryPosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Retourne le nombre de colonnes en fonction des breakpoints Tailwind CSS par défaut :
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px
 * - <640px : 2 colonnes
 * - >=640px (sm) : 3 colonnes
 * - >=768px (md) : 4 colonnes
 * - >=1024px (lg) : 5 colonnes
 * - >=1280px (xl) : 6 colonnes
 */
function getColumnCount(containerWidth: number): number {
  if (containerWidth < 640) return 2; // mobile
  if (containerWidth < 768) return 3; // sm
  if (containerWidth < 1024) return 4; // md
  if (containerWidth < 1280) return 5; // lg
  return 6; // xl+
}

export function useMasonryLayout(
  images: MasonryImage[],
  containerWidth: number
) {
  const [positions, setPositions] = useState<MasonryPosition[]>([]);
  const [columns, setColumns] = useState(getColumnCount(containerWidth));

  useEffect(() => {
    setColumns(getColumnCount(containerWidth));
  }, [containerWidth]);

  useEffect(() => {
    if (!images || images.length === 0 || containerWidth === 0) {
      setPositions([]);
      return;
    }

    // Masonry algorithm
    const gutter = 16; // px, gap between images
    const colCount = columns;
    const colWidth = (containerWidth - gutter * (colCount - 1)) / colCount;

    // Track Y position for each column
    const colHeights = Array(colCount).fill(0);
    const pos: MasonryPosition[] = [];

    images.forEach((img, idx) => {
      // Calculate scaled height
      const scale = colWidth / img.width;
      const imgHeight = img.height * scale;

      // Find shortest column
      const col = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[col];
      const left = col * (colWidth + gutter);

      pos[idx] = {
        top,
        left,
        width: colWidth,
        height: imgHeight,
      };

      colHeights[col] += imgHeight + gutter;
    });

    setPositions(pos);
  }, [images, columns, containerWidth]);

  return {
    positions,
    columnCount: columns,
    columnWidth: positions[0]?.width || 0,
    gutter: 16,
  };
}