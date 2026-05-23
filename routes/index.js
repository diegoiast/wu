import express from 'express';
import WhatsupRSS from '../WhatsupRSS.js';
import WhatsupCrawler from '../WhatsupCrawler.js';
import WhatsupMemoryCached from '../WhatsupMemoryCached.js';

const router = express.Router();
// const impl = new WhatsupRSS('http://whatsup.org.il');
const impl = new WhatsupCrawler('http://whatsup.org.il');
const client = new WhatsupMemoryCached(impl);

router.get('/', async (req, res) => {
    try {
        const mainPage = await client.fetchMainPage();

        res.render('index', {
            articles: mainPage.articles,
            forums: mainPage.forums,
        });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

export default router;
