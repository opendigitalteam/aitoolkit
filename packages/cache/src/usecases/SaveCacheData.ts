import { CacheData } from "../domains/CacheData";
import { defaultKeyPrefix } from "../domains/CacheRecord";
import CacheDataGateway from "../gateways/CacheDataGateway";

type SaveCacheDataRequest = {
  gateway: CacheDataGateway;
  keyPrefix?: string;
  key: string;
  data: CacheData;
};

export default async function SaveCacheData(request: SaveCacheDataRequest) {
  await request.gateway.saveCacheData(
    request.keyPrefix || defaultKeyPrefix,
    request.key,
    request.data
  );
}
