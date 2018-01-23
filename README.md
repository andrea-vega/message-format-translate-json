# message-format-translate-json
Translates a json file with messageformat values into the specified languages.  Uses translate-json and intl-messageformat-parser npm modules.

This script is useful while in development of i81n MessageFormat documents to get a quick and dirty translation while working around variables and pluralization.

Values are aggressively cached to prevent duplicate calls.

## Example
```
node index.js --lang=es,de,ja,pt,zh-CN

Options:
  --lang              Comma separated list of language codes supported by google translate
  --url               The url that contains the source messages to translate
  --exclude           Regex of keys to skip when translating
  --dir               Output directory (default is current directory)
  --cache             Cache directory (default to ./cache)

```
