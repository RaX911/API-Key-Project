import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertApiKey, type ApiKey } from "@shared/schema";

export function useApiKeys() {
  return useQuery({
    queryKey: [api.keys.list.path],
    queryFn: async () => {
      const res = await fetch(api.keys.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch API keys");
      }
      return api.keys.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertApiKey) => {
      const res = await fetch(api.keys.create.path, {
        method: api.keys.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create API key");
      return api.keys.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.keys.list.path] }),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.keys.revoke.path, { id });
      const res = await fetch(url, {
        method: api.keys.revoke.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to revoke API key");
      return api.keys.revoke.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.keys.list.path] }),
  });
}
