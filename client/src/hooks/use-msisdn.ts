import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMsisdnLookup(msisdn: string) {
  return useQuery({
    queryKey: [api.msisdn.lookup.path, msisdn],
    queryFn: async () => {
      if (!msisdn) return null;
      const url = `${api.msisdn.lookup.path}?msisdn=${msisdn}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Lookup failed");
      return api.msisdn.lookup.responses[200].parse(await res.json());
    },
    enabled: !!msisdn && msisdn.length > 5,
    retry: false,
  });
}

export function useMsisdnList(params?: { page?: number; search?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.search) queryParams.append("search", params.search);

  return useQuery({
    queryKey: [api.msisdn.list.path, params],
    queryFn: async () => {
      const url = `${api.msisdn.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch MSISDN list");
      return api.msisdn.list.responses[200].parse(await res.json());
    },
  });
}
