import { db } from '../config/db.config';
import type { insertShortUrl } from '../types/shortUrl.types';

const dbShortUrl = db.shortUrl;

class ShortUrlModel {
  async create({ payload, userId }: { payload: insertShortUrl, userId: string }) {
    const { shortUrl, url, expired } = payload;
    const expiresAt = expired ? new Date(expired) : null;
    return dbShortUrl.create({ data: { originalUrl: url, shortUrl, expiresAt, userId, logs: { create: { status: 'CREATED', details: 'URL de teste' } } } });
  }

  async list() {
    return dbShortUrl.findMany({ take: 20 });
  }

  async updateShortURL({ id, shortUrl }: { id: string, shortUrl: string }) {
    return dbShortUrl.update({ where: { id }, data: { shortUrl } });
  }

  async findByShort(shortUrl: string) {
    return dbShortUrl.findFirst({ where: { shortUrl } });
  }

  async countByUser({ id }: { id: string }) {
    return dbShortUrl.count({ where: { userId: id } });
  }
}

export const shortUrlModel = new ShortUrlModel();