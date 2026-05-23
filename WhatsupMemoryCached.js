import memoryCache from 'memory-cache';

const DefaultCacheTimeout = 1000 * 60*60; // a full hour
const ArticleCacheTimeout = 1000 * 60*60*3; // 3 hours
const ForumsCacheTimeout = 1000 * 60*10; // 10 minutes

export default class WhatsupMemoryCached {
    constructor(whastUpImpl) {
        this.cache = memoryCache;
        this.client = whastUpImpl;
    }

    async fetchMainPage() {
        const cached = this.cache.get('main');

        if (cached) {
            console.log('Main page was found in cache - using it');
            return cached;
        }
        console.log('Main page is not in cache - getting');
        const mainPage = await this.client.fetchMainPage();
        this.cache.put('main', mainPage, DefaultCacheTimeout);
        console.log('Main page stored in cache');
        return mainPage;
    }

    async fetchArticle(articleID) {
        const key = `article/${articleID}`;
        const cached = this.cache.get(key);

        if (cached) {
            console.log(`Article ${articleID} was found in cache - using it`);
            return cached;
        }

        console.log(`Article ${articleID} is not in cache - getting`);
        const article = await this.client.fetchArticle(articleID);
        this.cache.put(key, article, ArticleCacheTimeout);
        console.log(`Article ${articleID} stored in cache`);
        return article;
    }

    async fetchForumTopic(topicID) {
        const key = `forum/${topicID}`;
        const cached = this.cache.get(key);

        if (cached) {
            console.log(`Forum topic ${topicID} was found in cache - using it`);
            return cached;
        }

        console.log(`Forum topic ${topicID} is not in cache - getting`);
        const topic = await this.client.fetchForumTopic(topicID);
        this.cache.put(key, topic, ForumsCacheTimeout);
        console.log(`Forum topic ${topicID} stored in cache`);
        return topic;
    }
}