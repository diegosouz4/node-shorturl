import 'dotenv/config';

interface systemTypes {
  jwt: {
    expiresIn: number | '1d',
    secret: string;
  }
}

export const config: systemTypes = {
  jwt: {
    expiresIn: '1d',
    secret: process.env.JWT_SECRET ?? ''
  }
}