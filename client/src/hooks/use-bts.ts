import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBtsTower, type BtsTower } from "@shared/schema";

export function useBtsTowers(params?: { page?: number; search?: string; operator?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.operator) queryParams.append("operator", params.operator);

  return useQuery({
    queryKey: [api.bts.list.path, params],
    queryFn: async () => {
      const url = `${api.bts.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch BTS towers");
      return api.bts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBtsTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBtsTower) => {
      const res = await fetch(api.bts.create.path, {
        method: api.bts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create BTS tower");
      return api.bts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bts.list.path] }),
  });
}

export function useUpdateBtsTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBtsTower>) => {
      const url = buildUrl(api.bts.update.path, { id });
      const res = await fetch(url, {
        method: api.bts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update BTS tower");
      return api.bts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bts.list.path] }),
  });
}

export function useDeleteBtsTower() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.bts.delete.path, { id });
      const res = await fetch(url, {
        method: api.bts.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete BTS tower");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bts.list.path] }),
  });
}
