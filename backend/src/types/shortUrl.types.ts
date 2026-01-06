import { z } from 'zod';

export const createShortURL = z.object(
  {
    url: z.url({ protocol: /^https$/, hostname: z.regexes.domain }),
    expired: z.iso.datetime({ local: true, error: "Data passada é inválida!" }).optional().refine((value) => {
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

export type createShortURLType = z.infer<typeof createShortURL>;
export type findShortURLType = z.infer<typeof findShortUrl>;

export type insertShortUrl = createShortURLType & {
  shortUrl: string;
}