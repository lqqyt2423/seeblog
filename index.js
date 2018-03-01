'use strict';

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const pages = require('./spider');
const Template = require('./template');

const indexTemp = new Template(fs.readFileSync(path.join(__dirname, './template/index.temp'), 'utf8'));

const app = express();

// async function wrap for handle error
const wrap = fn => (...args) => fn(...args).catch(args[2]);

app.use(morgan('dev'));

app.get('/', wrap(async (req, res) => {
  await pages.getPages();

  // render html
  let content = '';
  pages.forEach(page => {
    const { url, name, posts } = page;
    content += `<h3><a href="${url}" target="_blank">${name}</a></h3>`;
    if (posts.length) {
      content += '<ol>';
      posts.forEach(post => {
        const { link, title, date } = post;
        content += `<li class="mono-font"><span class="margin-right-10 gray">${date}</span><a href="${link}" target="_blank">${title}</a></li>`;
      });
      content += '</ol>';
    }
  });
  const html = indexTemp.render({ content, title: 'index' });
  res.type('html');
  res.send(html);
}));

// 错误处理
// eslint-disable-next-line
app.use((err, req, res, next) => {
  res.status(500);
  res.send(err.message);
});

app.listen(8000);
