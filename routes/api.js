import express from 'express';

import WhatsupCrawler from '../WhatsupCrawler.js';
import WhatsupMemoryCached from '../WhatsupMemoryCached.js';
import WhatsupRSS from '../WhatsupRSS.js';

const router = express.Router();
const ClientClass = WhatsupCrawler; // swap implementation here
// const ClientClass = WhatsupRSS; // swap implementation here
const client = new ClientClass('https://whatsup.org.il');

router.get('/index', async (req, res) => {
    try {
        const mainPage = await client.fetchMainPage();
        res.json(mainPage);
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.get('/articles', async (req, res) => {
    try {
        const mainPage = await client.fetchMainPage();
        res.json(mainPage.articles);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

router.get('/article/:id', async (req, res) => {
    try {
        const article = await client.fetchArticle(req.params.id);
        res.json(article);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

router.get('/forums', async (req, res) => {
    try {
        const mainPage = await client.fetchMainPage();
        res.json(mainPage.forums);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

router.get('/forum/:id', async (req, res) => {
    try {
        const forumTopic = await client.fetchForumTopic(req.params.id);
        res.json(forumTopic);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

export default router;