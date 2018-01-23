'use strict';

const cached = require('./cached-translate');
const { translateDeep } = require('../node_modules/translate-json/lib/translate');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const messageFormat = require('./message-format');
const loadSource = require('./load-source');
const P = require('bluebird');
const _ = require('lodash');

module.exports = async function ({ lang, exclude, url, dir, cacheDir }) {
    const { translate, load } = cached(cacheDir);

    // Get languages and load cached translations
    const languages = lang.split(',').filter(l => !!l);
    languages.forEach(lang => load(lang));
    if (languages.length < 1) {
        console.error('Provide languages to translate.  Use argument --lang=es,de,zh');
        process.exit();
    }

    // Load up messages from URL -- expecting JSON
    const messages = await loadSource(url);
    const excludeFn = ({ cursor, path }) => _.isString(cursor) && !new RegExp(exclude, 'i').test(path);
    const translateFn = lang => value => messageFormat(value, token => translate(token, lang));

    await P.map(languages, async lang => {
        try {
            console.log(`Translating into ${lang}...`);
            const translatedDoc = await translateDeep({
                doc: messages,
                transforms: [{ test: excludeFn, transform: translateFn(lang) }],
                options: { concurrency: 1, verbose: false }
            });
            const outputFile = `${dir}/messages-${lang}.json`;
            const prettyPrintedResult = JSON.stringify(translatedDoc, null, 4);
            const result = writeFile(outputFile, prettyPrintedResult, { encoding: 'utf8' });
            console.log(` -> ${outputFile}`);
            return result;
        } catch (err) {
            throw err;
        }
    }, { concurrency: 1 });
};