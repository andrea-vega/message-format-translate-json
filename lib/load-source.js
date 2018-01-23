'use strict';

const http = require('request-promise');

module.exports = async function (url) {
    try {
        const messages = await http(url);
        return JSON.parse(messages);
    } catch(err) {
        console.error('Could not load source messages', err);
        throw err;
    }
};