import { z } from 'zod';

export const createShortURL = z.object(
  {
    url: z.url({protocol: /^https$/, hostname: z.regexes.domain}),
    expired: z.iso.datetime({local: true}).optional()
  }
);

export type createShortURLType = z.infer<typeof createShortURL>;