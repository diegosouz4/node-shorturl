const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateShortURL = (lenght: number = 7):string => {
  let result = '';
  
  for(let i = 0; i < lenght ; i++) {
    const index = Math.floor(Math.random() * BASE62.length);
    result += BASE62[index];
  }

  return result;
}