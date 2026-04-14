import { urlStatus } from '../generated/enums';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

export type baseShortUrlPolicy = {
  shortUrl: string;
  id: string;
  originalUrl: string;
  expiresAt: Date | null;
  status: urlStatus;
  userId: string;
  createdAt: Date;
}

class RedirectPolicy {
  canRedirect({ targetUrl }: { targetUrl: baseShortUrlPolicy | null }) {
    if (!targetUrl) return { code: HTTP_STATUS.NOT_FOUND, canRedirect: false };

    const isActive = targetUrl.status === 'ACTIVE';
    const hasExpired = targetUrl.expiresAt !== null && targetUrl.expiresAt < new Date()

    if (!isActive) return { code: targetUrl.status === 'UNACTIVE' ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.GONE, canRedirect: false };
    if (hasExpired) return { code: HTTP_STATUS.GONE, canRedirect: false };

    return { code: HTTP_STATUS.NO_CONTENT, canRedirect: true };
  }
}

export const redirectPolicy = new RedirectPolicy();