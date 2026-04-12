import { useQuery } from "@tanstack/react-query";
import { Brand, Bike } from "@/types";
import { api } from "@/lib/api-service";
import { mapBrand, mapBike } from "@/lib/data-utils";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.getBrands();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brands");
      return (response.data || []).map(mapBrand);
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useBrand(slug: string) {
  return useQuery({
    queryKey: ["brands", slug],
    queryFn: async () => {
      const response = await api.getBrands();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brand");
      const brands = (response.data || []).map(mapBrand);
      return brands.find((b) => b.slug === slug) || null;
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000,
  });
}

export function useBrandBikes(slug: string) {
  return useQuery({
    queryKey: ["brands", slug, "bikes"],
    queryFn: async () => {
      const response = await api.getBikes({ brand: slug });
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brand bikes");
      return (response.data || []).map(mapBike);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
