export type ImageListResponse = string[];

export async function fetchImageList(): Promise<ImageListResponse> {
  // Simulated API response
  return [
    "RGB.png",
    "RGB2.png",
    "RGB3.png",
    "RGB_2048.png",
    "Tarinor.png",
    "Tree.png",
    "nuance gris.png"
  ];
}