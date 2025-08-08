import { useQuery } from "@tanstack/react-query";
import { fetchImageList, type ImageListResponse } from "../services/imageService";

export function useImages() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ImageListResponse, Error>({
    queryKey: ["images"],
    queryFn: fetchImageList,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  return {
    images: data,
    isLoading,
    isError,
    error,
  };
}