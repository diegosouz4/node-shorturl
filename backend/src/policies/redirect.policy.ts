import { UrlStatus } from '../generated/enums';
import { policyResult } from '../types/controllerResponse.type';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

export type baseShortUrlPolicy = {
  shortUrl: string;
  id: string;
  originalUrl: string;
  expiresAt: Date | null;
  status: UrlStatus;
  userId: string;
  createdAt: Date;
}

class RedirectPolicy {
  canRedirect({ targetUrl }: { targetUrl: baseShortUrlPolicy | null }): policyResult {
    if (!targetUrl) return { statusCode: HTTP_STATUS.NOT_FOUND, isValid: false };

    const isActive = targetUrl.status === 'ACTIVE';
    const hasExpired = targetUrl.expiresAt !== null && targetUrl.expiresAt < new Date()

    if (!isActive) return { statusCode: targetUrl.status === 'UNACTIVE' ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.GONE, isValid: false };
    if (hasExpired) return { statusCode: HTTP_STATUS.GONE, isValid: false };

    return { statusCode: HTTP_STATUS.NO_CONTENT, isValid: true };
  }
}

export const redirectPolicy = new RedirectPolicy();