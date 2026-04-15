import { z } from 'zod';
import { UrlStatus } from '../generated/client';
import { cursorPaginationsParams } from './cursorPagination.types';

const allowedUrlStatus = Object.values(UrlStatus);

export const createShortURL = z.object(
  {
    originalUrl: z.url({ protocol: /^https$/, hostname: z.regexes.domain, error: "Invalid URL!" },),
    expiresAt: z.iso.datetime({ local: true, error: "Invalid date passed!" }).optional().refine((value) => {
      if (!value) return true;

      const expiredDate = new Date(value);
      const now = new Date();

      return expiredDate > now;
    }, { error: 'Expiration date must be greater than the current date' })
  }
);

export const findShortUrl = z.object({
  shortUrl: z.string({ error: "Invalid URL passed!" }).optional(),
  urlId: z.uuid({ error: "Invalid ID passed!" }).optional(),
}).refine(({ shortUrl, urlId }) => shortUrl || urlId, { error: "Please provide either shortUrl or urlId for the query" });

export const updateShortUrl = z.object({
  shortUrl: z.string({ error: "Invalid URL passed!" }).optional(),
  status: z.enum(allowedUrlStatus, { error: 'Invalid value provided!' }).optional(),
  originalUrl: z.url({ protocol: /^https$/, hostname: z.regexes.domain, error: "Invalid URL passed!" },).optional(),
  expiresAt: z.iso.datetime({ local: true, error: "Invalid date passed!" }).optional().refine((value) => {
    if (!value) return true;

    const expiredDate = new Date(value);
    const now = new Date();

    return expiredDate > now;
  }, { error: 'Expiration date must be greater than the current date' })
}).refine(({ shortUrl }) => shortUrl, { error: "Please provide shortUrl for the query" });

export const listShortUrl = z.object({
  userId: z.uuid({ error: "Invalid ID passed!" }).optional()
});

export type createShortURLType = z.infer<typeof createShortURL>;
export type findShortURLType = z.infer<typeof findShortUrl>;
export type updateShortURLType = z.infer<typeof updateShortUrl>;
export type listShortURLType = z.infer<typeof listShortUrl>;

export type shortCursorPagination = cursorPaginationsParams & {
  userId?: string;
}

export type insertShortUrl = createShortURLType & {
  shortUrl: string;
}

export type insertUpdateShortUrl = updateShortURLType & {
  id: string;
}