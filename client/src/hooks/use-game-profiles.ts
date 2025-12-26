import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertGameProfile, type GameProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useGameProfiles() {
  return useQuery({
    queryKey: [api.profiles.list.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return api.profiles.list.responses[200].parse(await res.json());
    },
  });
}

export function useGameProfile(id: number | null) {
  return useQuery({
    queryKey: [api.profiles.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("ID required");
      const url = buildUrl(api.profiles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGameProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertGameProfile, "userId">) => {
      const validated = api.profiles.create.input.parse(data);
      const res = await fetch(api.profiles.create.path, {
        method: api.profiles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create profile");
      }
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
      toast({
        title: "Profile Created",
        description: "Your new game configuration is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGameProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Omit<InsertGameProfile, "userId">>) => {
      const validated = api.profiles.update.input.parse(updates);
      const url = buildUrl(api.profiles.update.path, { id });
      const res = await fetch(url, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path, data.id] });
      toast({
        title: "Profile Updated",
        description: "Settings saved successfully.",
      });
    },
  });
}

export function useDeleteGameProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.profiles.delete.path, { id });
      const res = await fetch(url, { 
        method: api.profiles.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete profile");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
      toast({
        title: "Profile Deleted",
        description: "The configuration has been removed.",
        variant: "destructive",
      });
    },
  });
}
