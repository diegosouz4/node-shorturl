import { generateShortURL } from '../../src/utils/generateShortURL.util';

describe('generateShortURL', () => {
  it('should generate a short URL of the specified length', () => {
    const length = 7;
    const url = generateShortURL(length);
    expect(url.length).toBe(length);
    expect(typeof url).toBe('string');
  });

  it('should use only characters from the BASE62 set', () => {
    const url = generateShortURL(10);
    const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let char of url) {
      expect(validChars).toContain(char);
    }
  });

  it('should generate different URLs for different lengths', () => {
    const length1 = 7;
    const length2 = 10;
    const url1 = generateShortURL(length1);
    const url2 = generateShortURL(length2);
    expect(url1).not.toEqual(url2);
    expect(url1.length).toBe(length1);
    expect(url2.length).toBe(length2);
  });

  it('should generate different URLs for the same length', () => {
    const length = 7;
    const url1 = generateShortURL(length);
    const url2 = generateShortURL(length);
    expect(url1).not.toEqual(url2);
    expect(url1.length).toBe(length);
    expect(url2.length).toBe(length);
  });

  it('should generate a URLs with length 7 by default', () => {
    const length = 7;
    const url = generateShortURL();
    expect(url.length).toBe(length);
  });
});