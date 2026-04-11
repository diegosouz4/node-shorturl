import { handleUserPass } from '../../src/utils/handleUserPass.util';

describe('handleUserPass.util', () => {
  describe('generateHash', () => {
    it('should generate a hash from a plain password', async () => {
      const password = 'mySecurePassword123';
      const hash = await handleUserPass.generateHash({ password });
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe('string');
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await handleUserPass.generateHash({ password });
      const hash2 = await handleUserPass.generateHash({ password });
      
      expect(hash1).not.toBe(hash2);
    });

    it('should use default saltRounds when not provided', async () => {
      const password = 'testPassword';
      const hash = await handleUserPass.generateHash({ password });
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should accept custom saltRounds parameter', async () => {
      const password = 'testPassword';
      const saltRounds = 8;
      const hash = await handleUserPass.generateHash({ password, saltRounds });
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should generate hash for empty password', async () => {
      const hash = await handleUserPass.generateHash({ password: '' });
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePass', () => {
    it('should return true when password matches the hash', async () => {
      const password = 'correctPassword';
      const hash = await handleUserPass.generateHash({ password });
      
      const result = await handleUserPass.comparePass(password, hash);
      expect(result).toBe(true);
    });

    it('should return false when password does not match the hash', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await handleUserPass.generateHash({ password });
      
      const result = await handleUserPass.comparePass(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#$%^&*()_+';
      const hash = await handleUserPass.generateHash({ password });
      
      const result = await handleUserPass.comparePass(password, hash);
      expect(result).toBe(true);
    });

    it('should handle unicode characters in password', async () => {
      const password = 'senha-com-açúcar-日本語';
      const hash = await handleUserPass.generateHash({ password });
      
      const result = await handleUserPass.comparePass(password, hash);
      expect(result).toBe(true);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await handleUserPass.generateHash({ password });
      
      const result = await handleUserPass.comparePass(password, hash);
      expect(result).toBe(true);
    });
  });
});
