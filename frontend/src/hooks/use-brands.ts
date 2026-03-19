import { useQuery } from "@tanstack/react-query";
import { Brand, Bike } from "@/types";
import { api } from "@/lib/api-service";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.getBrands();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brands");
      return response.data as Brand[];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useBrand(slug: string, initialData?: Brand | null) {
  return useQuery({
    queryKey: ["brands", slug],
    queryFn: async () => {
      const response = await api.getBrands();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brand");
      const brands = response.data as Brand[];
      return brands.find((b) => b.slug === slug) || null;
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000,
    initialData,
  });
}

export function useBrandBikes(slug: string, initialData?: Bike[]) {
  return useQuery({
    queryKey: ["brands", slug, "bikes"],
    queryFn: async () => {
      const response = await api.getBikes({ brand: slug });
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch brand bikes");
      return (response.data as Bike[]) || [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    initialData,
  });
}
