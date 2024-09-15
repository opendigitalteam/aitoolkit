# @aitoolkit/agentic

A set of tools for building agentic user experiences.

```ts
import { nextRoute } from "@aitoolkit/agentic/next";
import { validZodObject } from "@aitoolkit/agentic/zod";
import { ConversationalRouter, Task } from "@aitoolkit/agentic";
import { z } from "zod";

const signInValidator = z
  .object({
    email: z.string().min(1).email(),
    password: z.string().min(1).refine(check),
  })
  .refine(({ email, password }) => checkPasswordValid(email, password), {
    message: "Email and password do not match",
  });

function checkPasswordValid(email: string, password: string) {
  // Check database IRL, but for sake of simple example...
  return password === "password";
}

const task = Task({
  goal: "assist the user to sign in",
  progress: validZodObject(signInValidator),
});

const router = ConversationalRouter(task);

export const POST = nextRoute(router);
```

````ts
function validZodObject(zodObject) {
  return function progress({ state, status }) {
    const validation = zodObject.safeParse(state);
    if (validation.success) {
      return status.complete();
    } else {
      return status.fromZodErrors(validation.errors);
    }
  };
}```
````
