import { db } from '../config/db.config';
import { config } from '../config/system.config';
import type { ShortUrlWhereInput } from '../generated/models';
import type { cursorObjTypes } from '../types/cursorPagination.types';
import type { findShortURLType, insertShortUrl, insertUpdateShortUrl } from '../types/shortUrl.types';

const dbShortUrl = db.shortUrl;
const defaultPaginationsParams = config.pagination;

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

  async list({ limit = defaultPaginationsParams.limit, where, cursor }: { limit: number, cursor?: cursorObjTypes, where?: ShortUrlWhereInput }) {
    return dbShortUrl.findMany({
      take: limit + 1,
      where,
      skip: !cursor || !cursor.id ? 0 : 1,
      orderBy: [
        { createdAt: 'asc' }
      ],
      cursor: !cursor ? undefined : {
        id: cursor.id ?? undefined
      }
    });
  }

  async update(payload: insertUpdateShortUrl) {
    const deadline = payload.expiresAt ? new Date(payload.expiresAt) : null;
    return dbShortUrl.update({ where: { id: payload.id }, data: { ...payload, expiresAt: deadline } });
  }

  async incrementClicks({ id }: { id: string }) {
    return dbShortUrl.update({ where: { id }, data: { clicks: { increment: 1 } } });
  }

  async countByUser({ id }: { id: string }) {
    return dbShortUrl.count({ where: { userId: id } });
  }
}

export const shortUrlModel = new ShortUrlModel();