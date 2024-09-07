import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import assert from "assert";
import { CacheData } from "../domains/CacheData";
import { CacheRecord, CacheRecordKey } from "../domains/CacheRecord";
import CacheDataGateway from "./CacheDataGateway";

export default class CacheDataS3Gateway implements CacheDataGateway {
  private client: S3Client;

  constructor(private options: { bucketName: string }) {
    this.client = new S3Client({});
  }

  private encodeKey(key: string) {
    return Buffer.from(key).toString("base64");
  }

  private decodeKey(key: string) {
    return Buffer.from(key, "base64").toString();
  }

  private keyParts(...parts: string[]) {
    return parts.join("/");
  }

  private key(keyPrefix: string, key: string) {
    return this.keyParts(keyPrefix, this.encodeKey(key));
  }

  async saveCacheData(keyPrefix: string, key: string, data: CacheData) {
    const request = new Upload({
      client: this.client,
      params: {
        Bucket: this.options.bucketName,
        Key: this.key(keyPrefix, key),
        Body: JSON.stringify(
          CacheRecord.parse({
            keyPrefix,
            key,
            data,
          }),
        ),
      },
    });

    await request.done();
  }

  private async checkIfCacheDataExists(
    keyPrefix: string,
    key: string,
  ): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.options.bucketName,
          Key: this.key(keyPrefix, key),
        }),
      );
      return true;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        err.name === "NotFound"
      ) {
        return false;
      }

      throw err;
    }
  }

  async getCacheDataByPrefixedKey(
    keyPrefix: string,
    key: string,
  ): Promise<CacheRecord | undefined> {
    if (!(await this.checkIfCacheDataExists(keyPrefix, key))) {
      return;
    }

    const { Body: body } = await this.client.send(
      new GetObjectCommand({
        Bucket: this.options.bucketName,
        Key: this.key(keyPrefix, key),
      }),
    );

    if (body) {
      try {
        return CacheRecord.parse(JSON.parse(await body.transformToString()));
      } catch (e) {
        console.error(e);
        throw new Error("Could not parse file as JSON");
      }
    } else {
      throw new Error("File had no body");
    }
  }

  private async getCacheDataKeysByParts(
    ...keyParts: string[]
  ): Promise<CacheRecordKey[]> {
    const { Contents: cacheDataSet } = await this.client.send(
      new ListObjectsCommand({
        Bucket: this.options.bucketName,
        Prefix: this.keyParts(...keyParts),
        MaxKeys: 10,
      }),
    );

    if (!cacheDataSet) return [];

    return cacheDataSet
      .map((cacheData) => cacheData.Key)
      .filter((path): path is string => !!path)
      .map((path) => {
        const [keyPrefix, key] = path.split("/");
        return CacheRecordKey.parse({
          keyPrefix,
          key: this.decodeKey(key),
          path,
        });
      });
  }

  async getCacheDataKeysByPrefix(keyPrefix: string): Promise<CacheRecordKey[]> {
    return this.getCacheDataKeysByParts(keyPrefix);
  }

  async getCacheDataKeysByPrefixedKey(
    keyPrefix: string,
    key: string,
  ): Promise<CacheRecordKey[]> {
    return this.getCacheDataKeysByParts(keyPrefix, key);
  }

  async getCacheDataDownloadUrl(
    keyPrefix: string,
    key: string,
  ): Promise<string>;
  async getCacheDataDownloadUrl(
    cacheRecordKey: CacheRecordKey,
  ): Promise<string>;
  async getCacheDataDownloadUrl(
    keyPrefixOrCacheRecordKey: string | CacheRecordKey,
    key?: string,
  ): Promise<string> {
    let keyPrefix: string;

    if (typeof keyPrefixOrCacheRecordKey === "string") {
      assert(key);
      keyPrefix = keyPrefixOrCacheRecordKey;
    } else {
      assert(!key);
      const cacheRecordKey = CacheRecordKey.parse(keyPrefixOrCacheRecordKey);
      keyPrefix = cacheRecordKey.keyPrefix;
      key = cacheRecordKey.key;
    }

    const path = this.key(keyPrefix, key);

    const filename = `${keyPrefix}-${key}.json`;
    const expiresIn = 60 * 5;

    const command = new GetObjectCommand({
      Bucket: this.options.bucketName,
      Key: path,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      ResponseContentType: "application/json",
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn,
    });

    return url;
  }

  async deleteCacheData(keyPrefix: string, key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.options.bucketName,
        Key: this.key(keyPrefix, key),
      }),
    );
  }

  async renameKeyPrefix(oldPrefix: string, newPrefix: string) {
    const cacheDataSetKeys = await this.getCacheDataKeysByPrefix(oldPrefix);

    await serialBatchFn(cacheDataSetKeys, 100, async (cacheDataSetKeys) => {
      await Promise.all(
        cacheDataSetKeys.map(({ key }) =>
          this.client.send(
            new CopyObjectCommand({
              Bucket: this.options.bucketName,
              CopySource: key,
              Key: key.replace(oldPrefix, newPrefix),
            }),
          ),
        ),
      );
    });

    await serialBatchFn(cacheDataSetKeys, 100, async (cacheDataSetKeys) => {
      await Promise.all(
        cacheDataSetKeys.map(({ key }) =>
          this.client.send(
            new DeleteObjectCommand({
              Bucket: this.options.bucketName,
              Key: key,
            }),
          ),
        ),
      );
    });
  }
}

async function serialBatchFn<T>(
  items: T[],
  batchSize: number,
  fn: (batch: T[]) => Promise<any>,
) {
  if (items.length === 0) return;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await fn(batch);
  }
}
