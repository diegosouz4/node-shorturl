import { db } from '../config/db.config';

const dbShortUrl = db.shortUrl;
const dbShortLogs = db.shortUrlLog;

class RedirectModel {
  async incrementClicks({ id, details }: { id: string, details?: string }) {
    return db.$transaction([
      dbShortUrl.update({ where: { id }, data: { clicks: { increment: 1 } } }),
      dbShortLogs.create({ data: { status: 'ACCESSED', shortUrlId: id, details } })
    ]);
  }
}

export const redirectModel = new RedirectModel();