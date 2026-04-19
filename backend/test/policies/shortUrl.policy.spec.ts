import { shortUrlPolicy } from "../../src/policies/shortUrl.policy";
import { HTTP_STATUS } from "../../src/utils/httpsStatusCode.utils";
import { Roles } from "../../src/generated/enums";

describe('shortUrl.policy', () => {
  const createBaseUser = (role: Roles, id: string = 'user-1') => ({ id, role });
  const createFindUrlPlusUser = (role: Roles, userId: string = 'user-1', shortUrlId: string = 'short-1', status: 'ACTIVE' | 'UNACTIVE' | 'EXPIRED' = 'ACTIVE') => ({
    id: shortUrlId,
    originalUrl: 'https://example.com',
    shortUrl: 'abc123',
    userId,
    createdAt: new Date('2026-01-01'),
    expiresAt: null,
    status,
    clicks: 0,
    updatedAt: new Date('2026-01-01'),
    user: createBaseUser(role, userId),
  });

  describe('canCreate', () => {
    it('should return isValid as true and statusCode as 200 when the requester.role is SUBSCRIBER', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'SUBSCRIBER', totalCreated: 0 } })
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as true and statusCode as 200 when the requester.role is ADMIN', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'ADMIN', totalCreated: 0 } })
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as true and statusCode as 200 when the requester.role is MASTER', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'MASTER', totalCreated: 0 } })
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as true and statusCode as 200 when the requester.role is FREEBIE and the totalCreated is lower than 3', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'FREEBIE', totalCreated: 0 } })
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as false and statusCode as 403 when the requester.role is FREEBIE but the totalCreated is equal to 3', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'FREEBIE', totalCreated: 3 } })
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return isValid as false and statusCode as 403 when the requester.role is FREEBIE but the totalCreated is bigger than 3', () => {
      const result = shortUrlPolicy.canCreate({ requester: { id: 'abc', role: 'FREEBIE', totalCreated: 4 } })
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });
  });

  describe('canView', () => {
    it('should return true when user views their own URL', () => {
      const requester = createBaseUser('SUBSCRIBER', 'user-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'user-1');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return true when ADMIN views non-ADMIN/MASTER user URL', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when ADMIN tries to view ADMIN user URL', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('ADMIN', 'admin-2');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when ADMIN tries to view MASTER user URL', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('MASTER', 'master-1');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return true when MASTER views non-MASTER user URL', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createFindUrlPlusUser('ADMIN', 'admin-1');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when MASTER tries to view MASTER user URL', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createFindUrlPlusUser('MASTER', 'master-2');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when FREEBIE tries to view another user URL', () => {
      const requester = createBaseUser('FREEBIE', 'freebie-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when SUBSCRIBER tries to view another user URL', () => {
      const requester = createBaseUser('SUBSCRIBER', 'sub-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-2');

      const result = shortUrlPolicy.canView({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });
  });

  describe('canDelete', () => {
    it('should return false when URL status is ACTIVE', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return true when ADMIN deletes non-ADMIN/MASTER user URL with UNACTIVE status', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when ADMIN tries to delete ADMIN user URL even with UNACTIVE status', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('ADMIN', 'admin-2', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when ADMIN tries to delete MASTER user URL even with UNACTIVE status', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('MASTER', 'master-1', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return true when MASTER deletes non-MASTER user URL with UNACTIVE status', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when MASTER tries to delete MASTER user URL even with UNACTIVE status', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createFindUrlPlusUser('MASTER', 'master-2', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when FREEBIE tries to delete another user URL even with UNACTIVE status', () => {
      const requester = createBaseUser('FREEBIE', 'freebie-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return true when user deletes their own URL with UNACTIVE status', () => {
      const requester = createBaseUser('SUBSCRIBER', 'user-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'user-1', 'short-1', 'UNACTIVE');

      const result = shortUrlPolicy.canDelete({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });
  });

  describe('canUpdate', () => {
    it('should return isValid as false and statusCode as 401 when try to change originalUrl to active shortUrl', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');
      const update = { originalUrl: 'https://newurl.com' };

      const result = shortUrlPolicy.canUpdate({ requester, target, update });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return isValid as true and statusCode as 200 when try to update a active shortUrl without change the originalUrl', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');
      const update = { originalUrl: 'https://example.com' };

      const result = shortUrlPolicy.canUpdate({ requester, target, update });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as true and statusCode as 200 when update does not include originalUrl and status is ACTIVE', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');

      const result = shortUrlPolicy.canUpdate({ requester, target, update: {} });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return isValid as false and statusCode as 401 when expiresAt is in the past', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');
      const update = { expiresAt: new Date('2020-01-01').toDateString() };

      const result = shortUrlPolicy.canUpdate({ requester, target, update });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return isValid as true and statusCode as 200 when expiresAt is in the future', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createFindUrlPlusUser('SUBSCRIBER', 'sub-1', 'short-1', 'ACTIVE');
      const update = { expiresAt: new Date('2027-01-01').toDateString() };

      const result = shortUrlPolicy.canUpdate({ requester, target, update });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });
  });

  describe('canList', () => {
    it('should return true when ADMIN lists their own URLs', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createBaseUser('ADMIN', 'admin-1');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return true when ADMIN lists non-ADMIN/MASTER user URLs', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createBaseUser('SUBSCRIBER', 'sub-1');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when ADMIN tries to list ADMIN user URLs', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createBaseUser('ADMIN', 'admin-2');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when ADMIN tries to list MASTER user URLs', () => {
      const requester = createBaseUser('ADMIN', 'admin-1');
      const target = createBaseUser('MASTER', 'master-1');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return true when MASTER lists non-MASTER user URLs', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createBaseUser('ADMIN', 'admin-1');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: true, statusCode: HTTP_STATUS.OK });
    });

    it('should return false when MASTER tries to list MASTER user URLs', () => {
      const requester = createBaseUser('MASTER', 'master-1');
      const target = createBaseUser('MASTER', 'master-2');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when FREEBIE tries to list another user URLs', () => {
      const requester = createBaseUser('FREEBIE', 'freebie-1');
      const target = createBaseUser('SUBSCRIBER', 'sub-1');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });

    it('should return false when SUBSCRIBER tries to list another user URLs', () => {
      const requester = createBaseUser('SUBSCRIBER', 'sub-1');
      const target = createBaseUser('SUBSCRIBER', 'sub-2');

      const result = shortUrlPolicy.canList({ requester, target });
      expect(result).toEqual({ isValid: false, statusCode: HTTP_STATUS.FORBIDDEN });
    });
  });
});