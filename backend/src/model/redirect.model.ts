import { db } from '../config/db.config';
import { reqDetailsParams } from '../types/redirect.types';

const dbShortUrl = db.shortUrl;
const dbShortLogs = db.shortUrlLog;

class RedirectModel {
  async incrementClicks({ id, details }: { id: string, details?: reqDetailsParams }) {
    return db.$transaction([
      dbShortUrl.update({ where: { id }, data: { clicks: { increment: 1 } } }),
      dbShortLogs.create({ data: { status: 'ACCESSED', shortUrlId: id, userAgent: details?.userAgent, userIp: details?.userIp } })
    ]);
  }
}

export const redirectModel = new RedirectModel();