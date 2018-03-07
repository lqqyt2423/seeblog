'use strict';

const rq = require('./rq');

// 文章请求次数计数
const countPost = function() {
  const { posts, getCount, hidePoint } = this;
  posts.forEach(post => {
    const { link } = post;
    if (getCount[link]) {
      getCount[link]++;
    } else {
      getCount[link] = 1;
    }
  });
  const targetPosts = posts.filter(post => {
    const { link } = post;
    return getCount[link] <= hidePoint;
  });
  this.targetPosts = targetPosts;
};

const pages = [
  {
    name: 'v2ex-hot',
    url: 'https://www.v2ex.com/?tab=hot',
    getPosts: async function(page) {
      const { url } = page;
      const { body } = await rq.get(url);
      const posts = [];
      body.replace(/class="item_title"><a href="(.+?)">(.+?)<\/a>(.|\n)+?&nbsp; (\d.+?前) &nbsp/g, (match, link, title, _, date) => {
        link = 'https://www.v2ex.com' + link;
        posts.push({ link, title, date });
      });
      this.posts = posts;
      return posts;
    },
    posts: [],
    getCount: {},
    hidePoint: 3,
    targetPosts: []
  },
  {
    name: '阮一峰的网络日志',
    url: 'http://www.ruanyifeng.com/blog/',
    getPosts: async function(page) {
      const { url } = page;
      const { body } = await rq.get(url);

      const posts = [];
      
      // 第一篇文章
      let matches = /asset-name.+?href="(.+?)".+?>(.+?)<\/a>/.exec(body);
      const [link, title] = [matches[1], matches[2]];
      matches = /published.+?>(.+?日)/.exec(body);
      let date = matches[1];
      date = date.replace(/年(\d)月/, (match, month) => {
        return `年0${month}月`;
      }).replace(/月(\d)日/, (match, day) => {
        return `月${day}日`;
      });
      posts.push({ link, title, date });

      // 其他文章
      matches = /<h3>最新文章<\/h3>(.|\n)+?<strong>更多文章……<\/strong>/.exec(body);
      const tmpStr = matches[0];
      tmpStr.replace(/module-list-item.+?<span>(.+?日).+?href="(.+?)">(.+?)<\/a>/g, (match, date, link, title) => {
        date = date.replace(' ', '0');
        posts.push({ link, title, date });
      });

      this.posts = posts;
      return posts;
    },
    posts: [],
    getCount: {},
    hidePoint: 10,
    targetPosts: []
  },
  {
    name: 'Jerry Qu',
    url: 'https://imququ.com/',
    getPosts: async function(page) {
      const { url } = page;
      const { body } = await rq.get(url);
      const posts = [];
      body.replace(/post post-list.+?class=date> <time>(.+?)<\/time>.+?<h1 class=title> <a href="(.+?)">(.+?)<\/a><\/h1>/g, (match, date, link, title) => {
        link = url.replace(/\/$/, '') + link;
        posts.push({ link, title, date });
      });
      this.posts = posts;
      return posts;
    },
    posts: [],
    getCount: {},
    hidePoint: 10,
    targetPosts: []
  },
  // {
  //   name: '酷壳',
  //   url: 'https://coolshell.cn/',
  //   getPosts: async function(page) {
  //     const { url } = page;
  //     const { body } = await rq.get(url);
  //     const posts = [];
  //     body.replace(/class="entry-title(.|\n)+?<a href="(.+?)".+?>(.+?)<\/a>(.|\n)+?pubdate>(.+?) </g, (match, _a, link, title, _b, date) => {
  //       posts.push({ link, title, date });
  //     });
  //     this.posts = posts;
  //     return posts;
  //   }
  // }
];

const getPages = async () => {
  await Promise.all(pages.map(page => {
    const start = Date.now();
    return page.getPosts(page).then(() => {
      // eslint-disable-next-line
      console.log(page.name, `${Date.now() - start}ms`);

      // 计数 筛选出可能未看的文章
      countPost.call(page);
    });
  }));
};

module.exports = exports = pages;
exports.getPages = getPages;
