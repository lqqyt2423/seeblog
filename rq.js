'use strict';

const http = require('http');
const https = require('https');

const rq = {};

module.exports = rq;

/**
 * @param {string} url
 * @returns {object} { statusCode, headers, body }
 */
rq.get = async url => {
  const isUrl = /https?:\/\/.+/.test(url);
  if (!isUrl) return Promise.reject(new Error('请传入正确url'));
  let hp = http;
  if (/^https/.test(url)) hp = https;
  return await new Promise((resolve, reject) => {
    hp.get(url, res => {
      const { statusCode, headers } = res;
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode, headers, body });
      });
    }).on('error', reject);
  });
};
