import { z } from 'zod';
import { urlStatus } from '../generated/client';

const allowedUrlStatus = Object.values(urlStatus);

export const createShortURL = z.object(
  {
    originalUrl: z.url({ protocol: /^https$/, hostname: z.regexes.domain }),
    expiresAt: z.iso.datetime({ local: true, error: "Data passada é inválida!" }).optional().refine((value) => {
      if (!value) return true;

      const expiredDate = new Date(value);
      const now = new Date();

      return expiredDate > now;
    }, { error: 'A data de expiração deve ser maior que a data atual' })
  }
);

export const findShortUrl = z.object({
  shortUrl: z.string({ error: "Url passada é inválida!" }).optional(),
  urlId: z.uuid({ error: "Id passado é inválido!" }).optional(),
}).refine(({ shortUrl, urlId }) => shortUrl || urlId, { error: "Informe shortUrl ou urlId para consulta" });

export const updateShortUrl = z.object({
  shortUrl: z.string({ error: "Url passada é inválida!" }).optional(),
  status: z.enum(allowedUrlStatus, { error: 'Valor infromado é inválido!' }).optional(),
  originalUrl: z.url({ protocol: /^https$/, hostname: z.regexes.domain, error: "Url passada é inválida!" },).optional(),
  expiresAt: z.iso.datetime({ local: true, error: "Data passada é inválida!" }).optional().refine((value) => {
    if (!value) return true;

    const expiredDate = new Date(value);
    const now = new Date();

    return expiredDate > now;
  }, { error: 'A data de expiração deve ser maior que a data atual' })
}).refine(({ shortUrl }) => shortUrl, { error: "Informe shortUrl para consulta" });

export const listShortUrl = z.object({
  userId: z.uuid({ error: "id passado é inválida! " }).optional()
});

export type createShortURLType = z.infer<typeof createShortURL>;
export type findShortURLType = z.infer<typeof findShortUrl>;
export type updateShortURLType = z.infer<typeof updateShortUrl>;
export type listShortURLType = z.infer<typeof listShortUrl>;

export type insertShortUrl = createShortURLType & {
  shortUrl: string;
}

export type insertUpdateShortUrl = updateShortURLType & {
  id: string;
}