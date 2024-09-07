import { ChatCompletionResponseCache } from "./ChatCompletionPromptCache";
import { CreateChatCompleteRequest } from "./CreateChatCompletion";

export type CreateChatCompleteWithCacheRequest<R extends object> =
  CreateChatCompleteRequest<R> & {
    cache: ChatCompletionResponseCache<R>;
    forceFreshRequest?: boolean;
  };

// export default async function CreateChatCompletionWithCache<
//   R extends object = Record<string, any>,
// >(
//   request: CreateChatCompleteWithCacheRequest<R>,
// ): Promise<CreateChatCompleteResponse<R>> {
//   if (!request.forceFreshRequest) {
//     console.debug("complete-with-cache: getting from cache", request);
//     const { content, raw } = await request.cache.get();

//     if (content && raw) {
//       return {
//         ok: true,
//         fromCache: true,
//         content,
//         raw,
//       };
//     }
//   } else {
//     console.debug("complete-with-cache: skipping cache");
//   }

//   const response = await CreateChatCompletion({ ...request, cache: undefined });

//   if (response.ok) {
//     console.debug("complete-with-cache: setting cache");
//     await request.cache.set(response);
//   }

//   return response;
// }
