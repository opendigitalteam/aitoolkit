import OpenAI from "openai";
import {
  ChatCompletionFormat,
  ChatCompletionMessage,
  ChatCompletionTemperature,
  ChatCompletionTradeoff,
} from "./ChatCompletion";
import {
  ChatCompletionGateway,
  ChatCompletionGatewayCreateOptions,
} from "./ChatCompletionGateway";

type OpenAIModel =
  | "gpt-4o-2024-05-13"
  | "gpt-4-turbo-2024-04-09"
  | "gpt-3.5-turbo-0125"
  | "gpt-4o-mini-2024-07-18";

export type OpenAIChatCompletionGatewayOptions = {
  client?: OpenAI;
  maxRetries?: number;
  timeout?: number;
};

export class OpenAIChatCompletionGateway implements ChatCompletionGateway {
  protected client: OpenAI;

  constructor(protected options: OpenAIChatCompletionGatewayOptions = {}) {
    this.client = options.client || new OpenAI();
  }

  async create(
    messages: ChatCompletionMessage[],
    options: ChatCompletionGatewayCreateOptions,
  ): Promise<string | undefined> {
    const model = mapTradeoffToOpenAIModel(options.tradeoff);
    const completion = await this.client.chat.completions.create(
      {
        model,
        messages,
        temperature: mapTempToOpenAI(options.temperature),
        response_format: mapFormatToOpenAI(options.format),
      },
      // {
      //   maxRetries: this.options.maxRetries,
      //   timeout: this.options.timeout,
      // }
    );

    return completion.choices[0].message.content || undefined;
  }
}

function mapTradeoffToOpenAIModel(
  tradeoff: undefined | ChatCompletionTradeoff,
): OpenAIModel {
  switch (tradeoff) {
    case "quality":
      return "gpt-4o-2024-05-13";

    case "speed":
    default:
      return "gpt-4o-mini-2024-07-18";
  }
}

function mapFormatToOpenAI(format: undefined | ChatCompletionFormat): {
  type: "text" | "json_object";
} {
  switch (format) {
    case "text":
      return { type: "text" };

    case "json":
    default:
      return { type: "json_object" };
  }
}

function mapTempToOpenAI(temp: undefined | ChatCompletionTemperature): number {
  switch (temp) {
    case "cold":
      return 0;
    case "cool":
      return 0.2;
    case "hot":
      return 2;
    case "standard":
    default:
      return 1;
  }
}
