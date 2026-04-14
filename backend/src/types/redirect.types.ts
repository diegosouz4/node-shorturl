import z from "zod";

export type reqDetailsParams = {
  userAgent?: string;
  userIp?: string;
  accessDate?: string;
}

export const redirectValidate = z.object({
  shortCode: z.string("Codigo enviado e invalido")
});

export type redirectRequest = z.infer<typeof redirectValidate>;