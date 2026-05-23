import * as encoding from 'encoding';
import * as cheerio from 'cheerio';

function parseHTML(rawHTML, nullifyIfEmpty = false) {
    const text = cheerio.load(`<div>${rawHTML}</div>`)('div').text().trim();

    if (!nullifyIfEmpty) return text;
    return text.length === 0 ? null : text;
}

function stringUntil(s, delimiter) {
    const n = s.indexOf(delimiter);
    return s.substring(0, n !== -1 ? n : s.length);
}

function extractItem(element) {
    const e = cheerio.load(element);
    const a = e('a');
    const t = e('span').html();

    const i = t.split('|')[1].split('<br>');

    return {
        title: a.text(),
        number: a.attr('href'),
        date: i[1],
        category: parseHTML(i[0]),
    };
}

function extractForum(element) {
    const item = extractItem(element);
    const s = cheerio.load(element)('span').html().split('|');
    const t = s[2].split('<br>');

    item.number = item.number.replace(
        'index.php?name=PNphpBB2&file=printview&t=',
        ''
    );

    item.category = parseHTML(s[1]);
    item.responseCount = parseHTML(t[0]);
    item.date = parseHTML(t[1]);

    return item;
}

function extractArticle(element) {
    const item = extractItem(element);
    item.number = item.number.replace('print.php?sid=', '');
    item.summary = null;
    return item;
}

export default class WhatsupCrawler {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async fetchText(url) {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const buffer = Buffer.from(await res.arrayBuffer());

        return encoding
            .convert(buffer, 'UTF8', 'CP1255')
            .toString();
    }

    async fetchMainPage() {
        const url =
            this.baseURL +
            '/modules.php?op=modload&name=AvantGo&file=index';

        const html = await this.fetchText(url);
        const $ = cheerio.load(html);

        const mainPage = {
            articles: [],
            forums: [],
        };

        const lists = $('ul').toArray();

        $(lists[0])
            .find('li')
            .each((_, el) => {
                mainPage.articles.push(extractArticle(el));
            });

        $(lists[1])
            .find('li')
            .each((_, el) => {
                mainPage.forums.push(extractForum(el));
            });

        return mainPage;
    }

    async fetchArticle(articleID) {
        const url =
            this.baseURL +
            '/modules.php?op=modload&name=News&file=article&sid=' +
            articleID;

        const html = await this.fetchText(url);
        const $ = cheerio.load(html);

        const articleHTML = $('div.ng_article');

        if (articleHTML.text().length === 0) {
            throw new Error('Could not parse original site');
        }

        const metaData = articleHTML
            .find('div.ng_info_row')
            .text()
            .trim()
            .split('·');

        const content = articleHTML.find('span.pn-art');

        const article = {
            content: content,
            title: articleHTML.find('h1.ng_article_title a.pn-title').text(),
            date: metaData[0].trim(),
            author: metaData[1].trim(),
            topic: metaData[2].trim(),
            replies: [],
        };
/*
        FIXME: re-implement replies
        $('form table').each((_, element) => {
            const rows = cheerio.load(element)('tr td').toArray();
            const metaData = cheerio.load(rows[0])('font').toArray();

            const reply = {
                title: cheerio.load(metaData[0]).text(),
            };

            if (reply.title) {
                reply.author = cheerio.load(metaData[2]).text();
                reply.content = cheerio.load(rows[1]).html();
                article.replies.push(reply);
            }
        });
*/
        article.content.find('img').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !src.startsWith('http')) {
                $(el).attr('src', this.baseURL + '/' + src);
            }
        });

        article.content.find('a').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/')) {
                $(el).attr('href', this.baseURL + href);
            }
        });

        article.content = article.content.html();

        return article;
    }

    async fetchForumTopic(topicID) {
        const url =
            this.baseURL +
            '/index.php?name=PNphpBB2&file=printview&t=' +
            topicID;

        const html = await this.fetchText(url);
        const $ = cheerio.load(html);

        const topicTitle = parseHTML($('span.Topic'))
            .split('-')[1]
            .trim();

        const topic = {
            subject: topicTitle,
            posts: [],
        };

        const sections = $('body').html().split('<hr>');

        for (let i = 1; i < sections.length - 1; i++) {
            const section = sections[i];
            const parts = section.split('<hr class="sep">');
            const metaParts = parts[0].split(' - ');

            const author = metaParts[0];
            const date =
                metaParts[1] +
                ' ' +
                stringUntil(metaParts[2], '<br>');

            const replyTitle = parts[0]
                .split('<br>')[1]
                .replace(
                    '&#x5E0;&#x5D5;&#x5E9;&#x5D0; &#x5D4;&#x5D4;&#x5D5;&#x5D3;&#x5E2;&#x5D4;: ',
                    ''
                )
                .trim();

            topic.posts.push({
                title: parseHTML(replyTitle, true),
                author: parseHTML(author, true),
                date: date.trim(),
                content: parts[1],
            });
        }

        return topic;
    }
}