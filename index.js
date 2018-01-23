'use strict';

const nconf = require('nconf');
const translate = require('./lib');

(async function main () {
    const opts = nconf.argv()
        .env('__')
        .file(nconf.get('config') || 'config.json')
        .defaults({
            cacheDir: './cache',
            url: 'http://localhost:3000/api/messages',
            exclude: '_links',
            lang: '',
            dir: '.'
        })
        .get();
    await translate(opts);
})();