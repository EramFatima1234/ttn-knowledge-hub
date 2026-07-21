import { useQuery } from "@tanstack/react-query";
import { fetchApiJson } from "@/lib/api";

export interface Competency {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export function useCompetencies() {
  return useQuery({
    queryKey: ["competencies"],
    queryFn: () => fetchApiJson<Competency[]>("competencies"),
    staleTime: 10 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchApiJson<Category[]>("categories"),
    staleTime: 10 * 60_000,
  });
}
