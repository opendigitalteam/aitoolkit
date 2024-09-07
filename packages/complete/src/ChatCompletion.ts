export type ChatCompletionMessage =
  | ChatCompletionSystemTextMessage
  | ChatCompletionAssistantTextMessage
  | ChatCompletionUserTextMessage;

type ChatCompletionSystemTextMessage = {
  role: "system";
  content: string;
  name?: string;
};

type ChatCompletionAssistantTextMessage = {
  role: "assistant";
  content: string;
  name?: string;
};

type ChatCompletionUserTextMessage = {
  role: "user";
  content: string;
  name?: string;
};
export type ChatCompletionFormat = "json" | "text";
export type ChatCompletionTradeoff = "speed" | "quality";
export type ChatCompletionTemperature = "cold" | "cool" | "standard" | "hot";
export type ChatCompletionValidator<R> = (input: string) => R;

export type ChatCompletionPrompt<R> = {
  messages: ChatCompletionMessage[];
  responseValidator: ChatCompletionValidator<R>;
  format: ChatCompletionFormat;
  tradeoff?: ChatCompletionTradeoff;
  temperature?: ChatCompletionTemperature;
};
