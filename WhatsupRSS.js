import WhatsupCrawler from './WhatsupCrawler.js';
import { parseStringPromise } from 'xml2js';

function parseHTML(rawHTML, nullifyIfEmpty = false) {
    const text = rawHTML?.toString?.() ?? '';

    if (!nullifyIfEmpty) return text.trim();
    return text.trim().length === 0 ? null : text.trim();
}

function getArticleID(articleURL) {
    const u = new URL(articleURL);
    return u.searchParams.get('sid');
}

function getForumID(articleURL) {
    const u = new URL(articleURL);
    return u.searchParams.get('t');
}

function getArticles(items, getItem) {
    return items.map((item) => ({
        title: parseHTML(item.title?.[0]),
        number: getItem(item.link?.[0]),
        date: parseHTML(item.pubDate?.[0]),
        category: null,
        summary: parseHTML(item.description?.[0]),
    }));
}

export default class WhatsupRSS {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.crawler = new WhatsupCrawler(baseURL);
    }

    async fetchBackendRSS(backend, getItem) {
        const url = `${this.baseURL}${backend}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

        const xml = await res.text();
        const result = await parseStringPromise(xml);

        const items = result?.rss?.channel?.[0]?.item ?? [];

        return getArticles(items, getItem);
    }

    async fetchArticlesRSS() {
        return this.fetchBackendRSS(
            '/backend.php?utf8=1',
            getArticleID
        );
    }

    async fetchTopicsRSS() {
        return this.fetchBackendRSS(
            '/backend-forums.php?utf8=1',
            getForumID
        );
    }

    async fetchMainPage() {
        const [articles, forums] = await Promise.all([
            this.fetchArticlesRSS(),
            this.fetchTopicsRSS(),
        ]);

        return { articles, forums };
    }

    async fetchArticle(id) {
        return this.crawler.fetchArticle(id);
    }

    async fetchForumTopic(id) {
        return this.crawler.fetchForumTopic(id);
    }
}