import express from 'express';

import WhatsupCrawler from '../WhatsupCrawler.js';
import WhatsupRSS from '../WhatsupRSS.js';
import WhatsupMemoryCached from '../WhatsupMemoryCached.js';

const router = express.Router();
const impl = new WhatsupCrawler('http://whatsup.org.il');
// const impl = new WhatsupRSS('http://whatsup.org.il');
const client = new WhatsupMemoryCached(impl);

router.get('/:id', async (req, res) => {
    try {
        const articleID = req.params.id;
        const article = await client.fetchArticle(articleID);

        res.render('article', {
            title: article.title,
            date: article.date,
            author: article.author,
            content: article.content,
            comments: article.replies,
        });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

export default router;
