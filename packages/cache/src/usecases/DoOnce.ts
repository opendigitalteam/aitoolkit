import { CacheData } from "../domains/CacheData";
import { defaultKeyPrefix } from "../domains/CacheRecord";
import CacheDataGateway from "../gateways/CacheDataGateway";
import FetchCacheData from "./FetchCacheData";
import SaveCacheData from "./SaveCacheData";

type DoOnceRequest = {
  gateway: CacheDataGateway;
  keyPrefix?: string;
  key: string;
  validateBeforeSave?: (data: CacheData) => boolean;
  overwrite?: boolean;
  expiresAt?: number;
};

type DoOnceResponse =
  | {
      ok: true;
      alreadyExisted?: boolean;
      data: CacheData;
    }
  | {
      ok: false;
      alreadyExisted?: boolean;
      data?: undefined;
    };

export default async function DoOnce(
  {
    gateway,
    keyPrefix = defaultKeyPrefix,
    key,
    validateBeforeSave,
    overwrite = false,
    expiresAt,
  }: DoOnceRequest,
  fn: () => Promise<CacheData>,
): Promise<DoOnceResponse> {
  if (!overwrite) {
    const cacheRecord = await FetchCacheData({
      gateway,
      keyPrefix,
      key,
    });

    if (cacheRecord) {
      return {
        ok: true,
        alreadyExisted: true,
        data: CacheData.parse(cacheRecord.data),
      };
    }
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
      expiresAt,
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
