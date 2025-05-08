import './typeorm/index.typeorm';
import './utils/core/app.config';

import routes from './modules/app/app.routes';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import * as dotenv from 'dotenv';
import path from 'path';
import { applicationLogger } from './middleware/logging.middleware';
import { exceptionsFilter } from './middleware/exceptions.middleware';

import Socket from './socket';
import { rabbitMQ, rabbitMQConsumer } from './utils/rabbitmq.utils';

dotenv.config();

const port = process.env.BACKEND_PORT || 8001;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(applicationLogger);

app.use(express.static(path.join(__dirname, '/public')));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || '',
    cookie: {
      httpOnly: true,
      domain: process.env.COOKIES_DOMAIN,
      sameSite: 'lax',
      maxAge: Number(process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000),
    },
  }),
);

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || '').split(', '),
    credentials: true,
  }),
);

app.use((req, res, next) => {
  console.log('Session ID from cookie:', req.sessionID);
  console.log('Session object:', req.session);
  next();
});

app.use(routes);
app.use(exceptionsFilter);

const server = app.listen(port, () => {
  console.log(`Application started on port ${port}!`);
});

const socket = new Socket(server);
socket.configure();

rabbitMQ.connect();
rabbitMQConsumer.consume();