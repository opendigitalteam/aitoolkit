import { z } from "zod";

export const SearchResult = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  googlePageMap: z.record(z.array(z.record(z.any()))).optional(),
});
export type SearchResult = z.infer<typeof SearchResult>;

export const SearchResults = z.object({
  results: SearchResult.array(),
  totalResults: z.number(),
  rawResults: z.any(),
});
export type SearchResults = z.infer<typeof SearchResults>;
