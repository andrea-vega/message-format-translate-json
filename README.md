# message-format-translate-json
Translates a json file with messageformat values into the specified languages.  Uses translate-json and intl-messageformat-parser npm modules.

This script is useful while in development of i81n MessageFormat documents to get a quick and dirty translation while working around variables and pluralization.

Values are aggressively cached to prevent duplicate calls.

## Example
```
node index.js --languages=es,de,ja,pt,zh-CN --dir=/translations
```
