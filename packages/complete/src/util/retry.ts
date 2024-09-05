import sleep from "./sleep";

export async function retry(
  fn: Function,
  {
    retries,
    delay,
    backOff,
  }: { retries: number; delay: number; backOff: boolean } = {
    retries: 3,
    delay: 5000,
    backOff: false,
  },
  attempt?: number
): Promise<any> {
  attempt = attempt || 0;

  try {
    return await fn(++attempt);
  } catch (err: any) {
    if (attempt < retries) {
      console.debug("retry", { retries, delay, backOff, attempt }, err);
      if (delay) {
        await sleep(backOff ? delay * attempt : delay);
      }
      return await retry(fn, { retries, delay, backOff }, attempt);
    } else {
      console.error(
        "retry (giving up)",
        { retries, delay, backOff, attempt },
        err
      );
      throw err;
    }
  }
}
