import {
  ChatCompletionFormat,
  ChatCompletionMessage,
  ChatCompletionTemperature,
  ChatCompletionTradeoff,
} from "./ChatCompletion";

export type ChatCompletionGatewayCreateOptions = {
  format?: ChatCompletionFormat;
  tradeoff?: ChatCompletionTradeoff;
  temperature?: ChatCompletionTemperature;
};

export interface ChatCompletionGateway {
  create(
    messages: ChatCompletionMessage[],
    options: ChatCompletionGatewayCreateOptions
  ): Promise<string | undefined>;
}
