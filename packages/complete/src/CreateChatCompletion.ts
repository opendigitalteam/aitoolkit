import {
  ChatCompletionFormat,
  ChatCompletionMessage,
  ChatCompletionTemperature,
  ChatCompletionTradeoff,
  ChatCompletionValidator,
} from "./ChatCompletion";
import { ChatCompletionGateway } from "./ChatCompletionGateway";
import { ChatCompletionResponseCache } from "./ChatCompletionPromptCache";
import CreateChatCompletionWithCache from "./CreateChatCompletionWithCache";
import { retry } from "./util/retry";

export type CreateChatCompleteRequest<R extends object> = {
  gateway: ChatCompletionGateway;
  messages: ChatCompletionMessage[];
  responseValidator?: ChatCompletionValidator<R>;
  format?: ChatCompletionFormat;
  tradeoff?: ChatCompletionTradeoff;
  temperature?: ChatCompletionTemperature;
} & (
  | {}
  | {
      cache: ChatCompletionResponseCache<R>;
      forceFreshRequest?: boolean;
    }
);

export type CreateChatCompleteResponse<R> = {
  ok: true;
  fromCache?: boolean;
  content: R;
  raw: string;
};

export async function CreateChatCompletion<
  R extends object = Record<string, any>
>(
  request: CreateChatCompleteRequest<R>
): Promise<CreateChatCompleteResponse<R>> {
  if ("cache" in request) return await CreateChatCompletionWithCache(request);
  console.debug("complete/request", request);

  try {
    return await retry(async (attemptNumber: number) => {
      try {
        const raw = await request.gateway.create(request.messages, {
          format: request.format,
          tradeoff: request.tradeoff,
          temperature: request.temperature,
        });

        if (raw) {
          const content = parseResponse(
            request.format || "json",
            raw,
            request.responseValidator ||
              defaultChatCompletionValidator(request.format)
          );
          console.debug("complete/response:", content);
          return { ok: true, content, raw };
        } else {
          console.error("complete/failure: No response from chat completion", {
            attemptNumber,
          });
          throw new Error("No response from chat completion");
        }
      } catch (err: any) {
        console.debug(
          "complete/error: Error occurred calling chat completion",
          err,
          {
            attemptNumber,
          }
        );
        throw err;
      }
    });
  } catch (err: any) {
    console.error(
      "complete/error: Error occurred calling chat completion, giving up",
      err,
      err.response?.data
    );
    throw err;
  }
}

function defaultChatCompletionValidator(format: ChatCompletionFormat = "text") {
  return function (content: string): Record<string, any> {
    // Return should be something more like: { json: any } | { text: string }
    switch (format) {
      case "json":
        return { json: safeParseUnstructuredJSON(content) };
      case "text":
      default:
        return { text: content };
    }
  };
}

function parseResponse<R extends object>(
  format: ChatCompletionFormat,
  content: string,
  responseValidator: ChatCompletionValidator<R>
): R {
  switch (format) {
    case "text":
      return responseValidator(content);
    case "json":
    default:
      return responseValidator(JSON.parse(content));
  }
}

function safeParseUnstructuredJSON(content: string): any {
  const jsonContent = content.slice(
    content.indexOf("{"),
    content.lastIndexOf("}") + 1
  );
  const parsedContent = JSON.parse(jsonContent);
  return parsedContent;
}
