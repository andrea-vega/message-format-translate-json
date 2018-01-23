'use strict';

const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const googleTranslate = require('google-translate-api');
const P = require('bluebird');
const _ = require('lodash');

module.exports = (cacheDir = './cache') => {

    const cache = {};

    /**
     * If cache has been created, load it up
     * @param lang
     */
    function loadCacheFromFile (lang) {
        try {
            cache[lang] = JSON.parse(fs.readFileSync(`${cacheDir}/${lang}.json`));
        } catch (err) {
            cache[lang] = {};
        }
    }

    /**
     * Write the changes to cache.  This is done aggressively each time a translation is returned so that if
     * an error occurs during processing, the translation can pick back up where it left off without re-doing anything
     * @param lang
     * @returns {Promise<*>}
     */
    async function writeCacheToFile (lang) {
        return await writeFile(`${cacheDir}/${lang}.json`, JSON.stringify(cache[lang], null, 2));
    }

    /**
     * Check the cache first before asking google-translate
     * @param value
     * @param lang
     * @returns {Promise<*>}
     */
    async function googleTranslateCached (value, lang) {
        if (!value) return { text: '' };
        if (_.get(cache, [lang, value])) return P.resolve({ text: _.get(cache, [lang, value]) });
        const result = await googleTranslate(value, { to: lang });
        _.set(cache, [lang, value], result.text);
        writeCacheToFile(lang)
            .then(() => console.log(`Cached translation ${result.text}`))
            .catch(err => console.error('Could not write cache', err));
        return result;
    }

    return {
        load: loadCacheFromFile,
        translate: googleTranslateCached
    };
};