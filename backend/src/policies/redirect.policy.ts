import { urlStatus } from '../generated/enums';

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
    if (!targetUrl) return { code: 404, canRedirect: false };

    const isActive = targetUrl.status === 'ACTIVE';
    const hasExpired = targetUrl.expiresAt !== null && targetUrl.expiresAt < new Date()

    if (!isActive) return { code: targetUrl.status === 'UNACTIVE' ? 403 : 410, canRedirect: false };
    if (hasExpired) return { code: 410, canRedirect: false };

    return { code: 204, canRedirect: true };
  }
}

export const redirectPolicy = new RedirectPolicy();