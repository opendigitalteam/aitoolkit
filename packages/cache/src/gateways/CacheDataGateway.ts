import { CacheData } from "../domains/CacheData";
import { CacheRecord, CacheRecordKey } from "../domains/CacheRecord";

export default interface CacheDataGateway {
  saveCacheData(
    keyPrefix: string,
    key: string,
    data: CacheData,
    expiresAt?: number,
  ): Promise<void>;

  getCacheDataByPrefixedKey(
    keyPrefix: string,
    key: string,
  ): Promise<CacheRecord | undefined>;

  getCacheDataKeysByPrefix(keyPrefix: string): Promise<CacheRecordKey[]>;

  getCacheDataKeysByPrefixedKey(
    keyPrefix: string,
    key: string,
  ): Promise<CacheRecordKey[]>;

  getCacheDataDownloadUrl(keyPrefix: string, key: string): Promise<string>;
  getCacheDataDownloadUrl(cacheRecordKey: CacheRecordKey): Promise<string>;
  getCacheDataDownloadUrl(
    keyPrefixOrCacheRecordKey: string | CacheRecordKey,
    key?: string,
  ): Promise<string>;

  deleteCacheData(keyPrefix: string, key: string): Promise<void>;

  renameKeyPrefix(oldPrefix: string, newPrefix: string): Promise<void>;
}
