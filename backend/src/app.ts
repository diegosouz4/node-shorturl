import express from 'express';
import defaultMiddleware from './middlewares/default.middleware';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5000',
  allowedHeaders: ['Content-Type', 'x-access-token'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());

app.use(defaultMiddleware.setHelmet());
app.use(defaultMiddleware.setMorgan());

import systemRouter from "./routers/system.router";
import sessionRouter from "./routers/session.router";
import userRouter from "./routers/user.router";
import shortURLRouter from "./routers/shortUrl.router";
import redirectRouter from "./routers/redirect.router";

app.use('/api/v1/urls', shortURLRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/r/', redirectRouter);
app.use('/health', systemRouter);

app.use(defaultMiddleware.handle404());
export default app; 