import { CacheRecord, defaultKeyPrefix } from "../domains/CacheRecord";
import CacheDataGateway from "../gateways/CacheDataGateway";

type FetchCacheDataRequest = {
  gateway: CacheDataGateway;
  keyPrefix?: string;
  key: string;
};

export default async function FetchCacheData(
  request: FetchCacheDataRequest,
): Promise<CacheRecord | undefined> {
  const dataRecord = await request.gateway.getCacheDataByPrefixedKey(
    request.keyPrefix || defaultKeyPrefix,
    request.key,
  );

  if (!dataRecord?.expiresAt || dataRecord.expiresAt > Date.now()) {
    return dataRecord;
  }
}
