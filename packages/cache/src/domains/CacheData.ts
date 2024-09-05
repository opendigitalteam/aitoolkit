import { z } from "zod";

export const CacheData = z.record(z.any());
export type CacheData = z.infer<typeof CacheData>;
