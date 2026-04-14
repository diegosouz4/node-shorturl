import { baseShortUrlPolicy, redirectPolicy } from "../../src/policies/redirect.policy";

describe('redirect.policy', () => {
  describe('canRedirect', () => {
    it('should return canRedirect false and code 404 when targetUrl is null', () => {
      const targetUrl: baseShortUrlPolicy | null = null;

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result).toEqual({ canRedirect: false, code: 404 });
    });

    it('should return canRedirect false and code 410 when URL status is EXPIRED', () => {
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'EXPIRED',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: new Date('2026-01-07T05:37:25.740Z'),
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result).toEqual({ canRedirect: false, code: 410 });
    });

    it('should return canRedirect false and code 403 when URL status is UNACTIVE', () => {
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'UNACTIVE',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: new Date('2026-01-07T05:37:25.740Z'),
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result).toEqual({ canRedirect: false, code: 403 });
    });

    it('should return canRedirect true when URL status is ACTIVE and expiresAt is in the future', () => {
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'ACTIVE',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: new Date('2027-01-07T05:37:25.740Z'),
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result.canRedirect).toBe(true);
    });

    it('should return canRedirect true when URL status is ACTIVE and expiresAt is null', () => {
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'ACTIVE',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: null,
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result.canRedirect).toBe(true);
    });

    it('should return canRedirect false and code 410 when URL expiresAt is in the past', () => {
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'ACTIVE',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: new Date('2026-01-07T05:37:25.740Z'),
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result).toEqual({ canRedirect: false, code: 410 });
    });

    it('should return canRedirect false and code 410 when URL expiresAt is in the past', () => {
      const now = new Date(Date.now() - 1000);
      const targetUrl: baseShortUrlPolicy = {
        id: 'abc',
        originalUrl: "https://teste.com.br",
        shortUrl: "abc",
        status: 'ACTIVE',
        userId: "abc",
        createdAt: new Date('2026-01-03T05:37:25.740Z'),
        expiresAt: now,
      };

      const result = redirectPolicy.canRedirect({ targetUrl });

      expect(result).toEqual({ canRedirect: false, code: 410 });
    });
  });
});