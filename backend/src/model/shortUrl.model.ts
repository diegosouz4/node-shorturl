import { db } from '../config/db.config';
import type { findShortURLType, insertShortUrl, insertUpdateShortUrl } from '../types/shortUrl.types';

const dbShortUrl = db.shortUrl;

class ShortUrlModel {
  async create({ payload, userId }: { payload: insertShortUrl, userId: string }) {
    const { shortUrl, originalUrl, expiresAt } = payload;
    const deadline = expiresAt ? new Date(expiresAt) : null;
    return dbShortUrl.create({ data: { originalUrl, shortUrl, expiresAt: deadline, userId, logs: { create: { status: 'CREATED', details: 'URL de teste' } } } });
  }

  async find({ shortUrl, urlId }: findShortURLType) {
    return dbShortUrl.findFirst({ where: { OR: [{ id: urlId }, { shortUrl }] }, include: { user: { select: { id: true, role: true } } } });
  }

  async remove({ urlId }: findShortURLType) {
    return dbShortUrl.delete({ where: { id: urlId } });
  }

  async list({ userId }: { userId: string }) {
    return dbShortUrl.findMany({ where: { userId }, take: 20 });
  }

  async update(payload: insertUpdateShortUrl) {
    const deadline = payload.expiresAt ? new Date(payload.expiresAt) : null;
    return dbShortUrl.update({ where: { id: payload.id }, data: { ...payload, expiresAt: deadline } });
  }

  async countByUser({ id }: { id: string }) {
    return dbShortUrl.count({ where: { userId: id } });
  }
}

export const shortUrlModel = new ShortUrlModel();