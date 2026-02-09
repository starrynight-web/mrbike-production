import { useState, useEffect } from "react";
import { Brand, Bike } from "@/types";
import { api } from "@/lib/api-service";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.getBrands();
        const data = response.data;
        // Handle DRF paginated response or direct array
        if (Array.isArray(data)) {
          setBrands(data);
        } else if (data && Array.isArray(data.results)) {
          setBrands(data.results);
        } else {
          setBrands([]);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, isLoading };
}

export function useBrand(slug: string) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await api.getBrands();
        const data = response.data;
        let brandsList: Brand[] = [];

        if (Array.isArray(data)) {
          brandsList = data;
        } else if (data && Array.isArray(data.results)) {
          brandsList = data.results;
        } else {
          brandsList = Array.isArray(data) ? data : [];
        }

        const found = brandsList.find((b: Brand) => b.slug === slug);
        setBrand(found || null);
      } catch (error) {
        console.error("Failed to fetch brand:", error);
        setBrand(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBrand();
    } else {
      setIsLoading(false);
    }
  }, [slug]);

  return { brand, isLoading };
}

export function useBrandBikes(slug: string) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        // Pass brand slug to getBikes filter
        // Note: The backend API likely expects 'brand' query param to filter by brand slug
        const response = await api.getBikes({ brand: slug });
        const data = response.data;

        if (Array.isArray(data)) {
          setBikes(data);
        } else if (data && Array.isArray(data.results)) {
          setBikes(data.results);
        } else {
          setBikes([]);
        }
      } catch (error) {
        console.error("Failed to fetch brand bikes:", error);
        setBikes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBikes();
    } else {
      setIsLoading(false);
    }
  }, [slug]);

  return { bikes, isLoading };
}
