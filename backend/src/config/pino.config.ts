import pino from "pino";
import fs from 'fs';

fs.mkdirSync("./logs", { recursive: true });

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const isProduction = process.env.NODE_ENV === 'production';

const transport = isProduction
  ? {
    target: "pino/file",
    options: { destination: "./logs/app.log" },
  }
  : {
    targets: [
      {
        target: "pino-pretty",
        level: "debug",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/app.log" },
      },
    ],
  };

export const logger = pino({
  level: logLevel,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'node-shorturl-api',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});