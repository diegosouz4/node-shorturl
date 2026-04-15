import { UserPolicy } from '../../src/policies/user.policy';
import { Roles } from '../../src/generated/enums';
import { HTTP_STATUS } from '../../src/utils/httpsStatusCode.utils';

describe('user.policy', () => {
  const createUser = (role: Roles, id: string = 'user-1') => ({ id, role });

  describe('canUpdate', () => {
    it('should return true when user updates their own profile', () => {
      const user = createUser('SUBSCRIBER', 'same-id');
      const target = createUser('SUBSCRIBER', 'same-id');

      expect(UserPolicy.canUpdate(user, target)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return true when ADMIN updates non-ADMIN/MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const subscriber = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canUpdate(admin, subscriber)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when ADMIN tries to update ADMIN user', () => {
      const admin1 = createUser('ADMIN', 'admin-1');
      const admin2 = createUser('ADMIN', 'admin-2');

      expect(UserPolicy.canUpdate(admin1, admin2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to update MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canUpdate(admin, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when MASTER updates non-MASTER user', () => {
      const master = createUser('MASTER', 'master-1');
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canUpdate(master, admin)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when MASTER tries to update MASTER user', () => {
      const master1 = createUser('MASTER', 'master-1');
      const master2 = createUser('MASTER', 'master-2');

      expect(UserPolicy.canUpdate(master1, master2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when FREEBIE tries to update another user', () => {
      const freebie1 = createUser('FREEBIE', 'freebie-1');
      const freebie2 = createUser('FREEBIE', 'freebie-2');

      expect(UserPolicy.canUpdate(freebie1, freebie2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canAssingRole', () => {
    it('should return false when FREEBIE tries to assign role', () => {
      const freebie = createUser('FREEBIE', 'freebie-1');
      const target = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canAssingRole(freebie, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when SUBSCRIBER tries to assign role', () => {
      const subscriber = createUser('SUBSCRIBER', 'sub-1');
      const target = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAssingRole(subscriber, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when ADMIN assigns role to non-ADMIN/MASTER', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAssingRole(admin, freebie)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when ADMIN tries to assign role to ADMIN', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const target = createUser('ADMIN', 'admin-2');

      expect(UserPolicy.canAssingRole(admin, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to assign role to MASTER', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canAssingRole(admin, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when MASTER assigns role to non-MASTER', () => {
      const master = createUser('MASTER', 'master-1');
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canAssingRole(master, admin)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when MASTER tries to assign role to MASTER', () => {
      const master1 = createUser('MASTER', 'master-1');
      const master2 = createUser('MASTER', 'master-2');

      expect(UserPolicy.canAssingRole(master1, master2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canChangeRole', () => {
    it('should delegate to canAssingRole - true case', () => {
      const master = createUser('MASTER', 'master-1');
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canChangeRole(master, freebie)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should delegate to canAssingRole - false case', () => {
      const freebie = createUser('FREEBIE', 'freebie-1');
      const target = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canChangeRole(freebie, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canAdd', () => {
    it('should return false when FREEBIE tries to add user', () => {
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAdd(freebie, 'SUBSCRIBER')).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when SUBSCRIBER tries to add user', () => {
      const subscriber = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canAdd(subscriber, 'FREEBIE')).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when ADMIN adds non-ADMIN/MASTER role', () => {
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canAdd(admin, 'FREEBIE')).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
      expect(UserPolicy.canAdd(admin, 'SUBSCRIBER')).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when ADMIN tries to add ADMIN role', () => {
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canAdd(admin, 'ADMIN')).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to add MASTER role', () => {
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canAdd(admin, 'MASTER')).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when MASTER adds non-MASTER role', () => {
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canAdd(master, 'FREEBIE')).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
      expect(UserPolicy.canAdd(master, 'SUBSCRIBER')).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
      expect(UserPolicy.canAdd(master, 'ADMIN')).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when MASTER tries to add MASTER role', () => {
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canAdd(master, 'MASTER')).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canDelete', () => {
    it('should return false when user tries to delete themselves', () => {
      const user = createUser('ADMIN', 'same-id');
      const target = createUser('ADMIN', 'same-id');

      expect(UserPolicy.canDelete(user, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when ADMIN deletes non-ADMIN/MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canDelete(admin, freebie)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when ADMIN tries to delete ADMIN user', () => {
      const admin1 = createUser('ADMIN', 'admin-1');
      const admin2 = createUser('ADMIN', 'admin-2');

      expect(UserPolicy.canDelete(admin1, admin2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to delete MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canDelete(admin, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when MASTER deletes non-MASTER user', () => {
      const master = createUser('MASTER', 'master-1');
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canDelete(master, admin)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when anyone tries to delete MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const freebie = createUser('FREEBIE', 'freebie-1');
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canDelete(admin, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
      expect(UserPolicy.canDelete(freebie, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canView', () => {
    it('should delegate to canUpdate - true case', () => {
      const user = createUser('SUBSCRIBER', 'same-id');
      const target = createUser('SUBSCRIBER', 'same-id');

      expect(UserPolicy.canView(user, target)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should delegate to canUpdate - false case', () => {
      const freebie1 = createUser('FREEBIE', 'freebie-1');
      const freebie2 = createUser('FREEBIE', 'freebie-2');

      expect(UserPolicy.canView(freebie1, freebie2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canList', () => {
    it('should return true for ADMIN', () => {
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canList(admin)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return true for MASTER', () => {
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canList(master)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false for FREEBIE', () => {
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canList(freebie)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false for SUBSCRIBER', () => {
      const subscriber = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canList(subscriber)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });
  });

  describe('canAssignStatus', () => {
    it('should return false when user tries to assign status to themselves', () => {
      const user = createUser('MASTER', 'same-id');
      const target = createUser('MASTER', 'same-id');

      expect(UserPolicy.canAssignStatus(user, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when FREEBIE tries to assign status', () => {
      const freebie = createUser('FREEBIE', 'freebie-1');
      const target = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canAssignStatus(freebie, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when SUBSCRIBER tries to assign status', () => {
      const subscriber = createUser('SUBSCRIBER', 'sub-1');
      const target = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAssignStatus(subscriber, target)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to assign status to ADMIN user', () => {
      const admin1 = createUser('ADMIN', 'admin-1');
      const admin2 = createUser('ADMIN', 'admin-2');

      expect(UserPolicy.canAssignStatus(admin1, admin2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return false when ADMIN tries to assign status to MASTER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const master = createUser('MASTER', 'master-1');

      expect(UserPolicy.canAssignStatus(admin, master)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when ADMIN assigns status to FREEBIE user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAssignStatus(admin, freebie)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return true when ADMIN assigns status to SUBSCRIBER user', () => {
      const admin = createUser('ADMIN', 'admin-1');
      const subscriber = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canAssignStatus(admin, subscriber)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return false when MASTER tries to assign status to MASTER user', () => {
      const master1 = createUser('MASTER', 'master-1');
      const master2 = createUser('MASTER', 'master-2');

      expect(UserPolicy.canAssignStatus(master1, master2)).toEqual({ isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED });
    });

    it('should return true when MASTER assigns status to FREEBIE user', () => {
      const master = createUser('MASTER', 'master-1');
      const freebie = createUser('FREEBIE', 'freebie-1');

      expect(UserPolicy.canAssignStatus(master, freebie)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return true when MASTER assigns status to SUBSCRIBER user', () => {
      const master = createUser('MASTER', 'master-1');
      const subscriber = createUser('SUBSCRIBER', 'sub-1');

      expect(UserPolicy.canAssignStatus(master, subscriber)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });

    it('should return true when MASTER assigns status to ADMIN user', () => {
      const master = createUser('MASTER', 'master-1');
      const admin = createUser('ADMIN', 'admin-1');

      expect(UserPolicy.canAssignStatus(master, admin)).toEqual({ isValid: true, statusCode: HTTP_STATUS.ACCEPTED });
    });
  });
});
