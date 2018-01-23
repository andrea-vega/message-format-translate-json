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
     * Translate before and after a variable, e.g. "Greetings, {username}.  How are you?"
     * @param elm
     * @returns {Promise<string>}
     */
    async function translateAroundVariable (elm) {
        const before = await translate(value.substring(0, elm.location.start.offset));
        const after = await translate(value.substring(elm.location.end.offset));
        return _.compact([before.text, `{${elm.id}}`, after.text]).join('');
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
                        return translateAroundVariable(element);
                }

            case 'messageTextElement':
            default:
                return translate(element.value);
        }
    }

    const parsed = parse(value);
    const translated = await translateElement(parsed.elements[0]);
    return _.isObject(translated) ? translated.text : translated;
};