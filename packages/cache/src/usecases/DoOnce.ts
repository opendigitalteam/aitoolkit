import { CacheData } from "../domains/CacheData";
import { defaultKeyPrefix } from "../domains/CacheRecord";
import CacheDataGateway from "../gateways/CacheDataGateway";
import SaveCacheData from "./SaveCacheData";

type DoOnceRequest = {
  gateway: CacheDataGateway;
  keyPrefix?: string;
  key: string;
  validateBeforeSave?: (data: CacheData) => boolean;
};

type DoOnceResponse<T extends CacheData> =
  | {
      ok: true;
      alreadyExisted?: boolean;
      data: T;
    }
  | {
      ok: false;
      alreadyExisted?: boolean;
      data?: undefined;
    };

export default async function DoOnce<T extends CacheData>(
  {
    gateway,
    keyPrefix = defaultKeyPrefix,
    key,
    validateBeforeSave,
  }: DoOnceRequest,
  fn: () => Promise<T>
): Promise<DoOnceResponse<T>> {
  const cacheData = await gateway.getCacheDataByPrefixedKey(keyPrefix, key);

  if (cacheData) {
    return {
      ok: true,
      alreadyExisted: true,
      data: cacheData.data,
    };
  }

  try {
    const cacheData = await fn();

    if (validateBeforeSave && !validateBeforeSave(cacheData)) {
      console.error("Failed to DoOnce#validateBeforeSave", {
        keyPrefix,
        key,
      });
      return { ok: false, data: undefined };
    }

    await SaveCacheData({
      gateway,
      keyPrefix,
      key,
      data: cacheData,
    });

    return { ok: true, data: cacheData };
  } catch (err) {
    console.error("Failed to DoOnce error thrown", {
      keyPrefix,
      key,
      err,
    });
    return { ok: false };
  }
}
