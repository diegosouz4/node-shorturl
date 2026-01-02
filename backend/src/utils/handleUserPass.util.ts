import { compare, hash, genSalt } from 'bcrypt';

export type UserPassParams = {
  password: string;
  saltRounds?: number;
}

class UserPass {
  async generateHash({ password, saltRounds = 10 }: UserPassParams) {
    const salt = await genSalt(saltRounds);
    const passHash = await hash(password, salt);
    return passHash;
  }

  async comparePass(reqPassword: string, hashPass: string) {
    return await compare(reqPassword, hashPass);
  }
}

export const handleUserPass = new UserPass();