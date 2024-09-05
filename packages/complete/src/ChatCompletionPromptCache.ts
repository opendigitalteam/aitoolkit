import { CreateChatCompleteResponse } from "./CreateChatCompletion";

export interface ChatCompletionResponseCache<R> {
  get(): Promise<CreateChatCompleteResponse<R>>;
  set(response: CreateChatCompleteResponse<R>): Promise<void>;
}
