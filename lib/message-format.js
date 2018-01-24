const parse = require('intl-messageformat-parser').parse;
const P = require('bluebird');
const _ = require('lodash');

module.exports = async function (value, translate) {

    /**
     * This is a plural option such as =0{there are no values}
     * It has been parsed already and is in a data structure that this function relies on
     * @param opt
     * @returns {Promise<*>}
     */
    function translatePluralOption (opt) {
        return P.map(opt.value.elements, elm => {
            return translate(elm.value)
                .then(translated => `${opt.selector}{${translated.text}}`)
                .catch(err => console.error(`Unable to translate ${elm.value}`, err));
        }, { concurrency: 1 });
    }

    /**
     * After parsing message-format, put all the values through the translation function,
     * then reconstruct the original string so i18n can use the original message format
     *
     * @param element
     * @returns {Promise<*>}
     */
    async function translateElement (element) {
        switch (element.type) {
            case 'argumentElement':
                switch (_.get(element, 'format.type', false)) {
                    case 'pluralFormat':
                        const selectors = await P.all(element.format.options.map(translatePluralOption));
                        return `{${element.id}, plural, ${selectors.join(' ')}}`;
                    default:
                        return `{${element.id}}`;
                }
            case 'messageTextElement':
            default:
                return translate(element.value);
        }
    }

    const parsed = parse(value);
    const translated = await P.map(parsed.elements, e => translateElement(e), { concurrency: 1 });
    return translated.map(t => _.isObject(t) ? t.text : t).join(' ');
};