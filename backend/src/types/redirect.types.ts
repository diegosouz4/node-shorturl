import z from "zod";

export type reqDetailsParams = {
  userAgent?: string;
  userIp?: string;
}

export const redirectValidate = z.object({
  shortCode: z.string("Short code is required!"),
});

export type redirectRequest = z.infer<typeof redirectValidate>;