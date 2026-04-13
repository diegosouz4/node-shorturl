import 'dotenv/config';

interface systemTypes {
  jwt: {
    expiresIn: number | '1d',
    secret: string;
  },
  pagination: {
    limit: number;
    orderBy: 'asc' | 'desc';
  }
}

export const config: systemTypes = {
  jwt: {
    expiresIn: '1d',
    secret: process.env.JWT_SECRET ?? ''
  },
  pagination: {
    limit: 1,
    orderBy: 'asc'
  }
}