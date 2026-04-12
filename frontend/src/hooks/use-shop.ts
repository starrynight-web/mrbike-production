import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-service";
import { toast } from "sonner";

export function useShop() {
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getMyShop();
      if (response.success) {
        setShop(response.data);
      } else {
        setError(response.error?.message || "Failed to load shop details");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const updateShop = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.updateMyShop(data);
      if (response.success) {
        setShop(response.data);
        toast.success("Shop updated successfully");
        return { success: true, data: response.data };
      } else {
        toast.error(response.error?.message || "Failed to update shop");
        return { success: false, error: response.error };
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { shop, isLoading, error, updateShop, refresh: fetchShop };
}
