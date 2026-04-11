import { handlePermisson } from '../../src/utils/checkPermision.util';

describe('checkPermision.util', () => {
  describe('hasPermision', () => {
    it('should return false when currentRole is not provided', () => {
      const result = handlePermisson.hasPermision(null as any);
      expect(result).toBe(false);
    });

    it('should return false when currentRole is undefined', () => {
      const result = handlePermisson.hasPermision(undefined as any);
      expect(result).toBe(false);
    });

    it('should return true when currentRole is in allowedRoles (default: ADMIN, MASTER)', () => {
      expect(handlePermisson.hasPermision('ADMIN')).toBe(true);
      expect(handlePermisson.hasPermision('MASTER')).toBe(true);
    });

    it('should return false when currentRole is not in allowedRoles (default)', () => {
      expect(handlePermisson.hasPermision('FREEBIE')).toBe(false);
      expect(handlePermisson.hasPermision('SUBSCRIBER')).toBe(false);
    });

    it('should return true when currentRole is in custom allowedRoles', () => {
      expect(handlePermisson.hasPermision('FREEBIE', ['FREEBIE', 'SUBSCRIBER'])).toBe(true);
      expect(handlePermisson.hasPermision('SUBSCRIBER', ['FREEBIE', 'SUBSCRIBER'])).toBe(true);
    });

    it('should return false when currentRole is not in custom allowedRoles', () => {
      expect(handlePermisson.hasPermision('ADMIN', ['FREEBIE', 'SUBSCRIBER'])).toBe(false);
    });

    it('should handle empty allowedRoles array', () => {
      const result = handlePermisson.hasPermision('ADMIN', []);
      expect(result).toBe(false);
    });
  });

  describe('isAdminOrMaster', () => {
    it('should return true for ADMIN role', () => {
      expect(handlePermisson.isAdminOrMaster('ADMIN')).toBe(true);
    });

    it('should return true for MASTER role', () => {
      expect(handlePermisson.isAdminOrMaster('MASTER')).toBe(true);
    });

    it('should return false for FREEBIE role', () => {
      expect(handlePermisson.isAdminOrMaster('FREEBIE')).toBe(false);
    });

    it('should return false for SUBSCRIBER role', () => {
      expect(handlePermisson.isAdminOrMaster('SUBSCRIBER')).toBe(false);
    });
  });
});
