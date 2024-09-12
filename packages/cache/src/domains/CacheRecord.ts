import { z } from "zod";
import { CacheData } from "./CacheData";

export const CacheRecord = z.object({
  keyPrefix: z.string(),
  key: z.string(),
  data: CacheData,
  expiresAt: z.number().optional(),
});
export type CacheRecord = z.infer<typeof CacheRecord>;

export const CacheRecordKey = CacheRecord.pick({
  keyPrefix: true,
  key: true,
}).extend({
  key: z.string(),
});
export type CacheRecordKey = z.infer<typeof CacheRecordKey>;

export const defaultKeyPrefix = "aitools/cache";
