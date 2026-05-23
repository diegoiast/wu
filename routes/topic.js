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
        const topicID = req.params.id;
        const replies = await client.fetchForumTopic(topicID);
        res.render('topic', {
            subject: replies.subject,
            posts: replies.posts,
        });
    } catch (error) {
        console.error(error);
        res.render('topic', {
            subject: null,
            posts: [],
        });
    }
});

export default router;