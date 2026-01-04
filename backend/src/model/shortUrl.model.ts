import { db } from '../config/db.config';
import { createShortURLType } from '../types/shortUrl.types';

class ShortUrl {
  async create({ url }: createShortURLType) {
    return db.shortUrl.create({ data: { originalUrl: url, shortUrl: 'shorted', logs: { create: { status: 'CREATED', details: 'URL de teste' } } } });
  }

  async list() {
    return db.shortUrl.findMany({ take: 20 });
  }

  async updateShortURL({ id, shortUrl }: { id: string, shortUrl: string }) {
    return db.shortUrl.update({ where: { id }, data: { shortUrl } });
  }

  async findByShort(shortUrl: string) {
    return db.shortUrl.findFirst({ where: { shortUrl } });
  }
}

export const shortUrlModel = new ShortUrl();