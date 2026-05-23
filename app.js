import express from 'express';
import path from 'node:path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'node:url';

// routes (ESM imports MUST include .js)
import index from './routes/index.js';
import article from './routes/article.js';
import topic from './routes/topic.js';
import api from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', index);
app.use('/article', article);
app.use('/topic', topic);
app.use('/forum', topic);

app.use('/api', api);
app.use('/api/article', api);

// 404 handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || err.statusCode || 500);
    res.render('error', {
        message: err.message,
        error: {
            status: err.status || err.statusCode || 500,
            stack: req.app.get('env') === 'development' ? err.stack : ''
        }
    });
});

export default app;