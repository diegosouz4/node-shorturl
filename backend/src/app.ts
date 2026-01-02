import express from 'express';
import defaultMiddleware from './middlewares/default.middleware';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use(defaultMiddleware.setCors());
app.use(defaultMiddleware.setHelmet());
app.use(defaultMiddleware.setMorgan());

import systemRouter from "./routers/system.router";
import sessionRouter from "./routers/session.router";
import userRouter from "./routers/user.router";
import shortURLRouter from "./routers/shortUrl.router";

app.use('/api/v1/urls', shortURLRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/users', userRouter);
app.use('/health', systemRouter);

app.use(defaultMiddleware.handle404());
export default app;