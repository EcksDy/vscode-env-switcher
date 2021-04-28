const TAG_START_TOKEN = '#_';
const TAG_END_TOKEN = '_#';

function makeTag(str: string) {
  return `${TAG_START_TOKEN}${str}${TAG_END_TOKEN}\n`;
}

/**
 * Searches for a tag with the pattern of `#_**_#` in the provided string.
 * @throws If string doesn't contain a tag.
 */
function extractTag(str: string) {
  const startsAndEndsWithTokensRegex = new RegExp(/^#_.*_#$/, 'g');

  if (startsAndEndsWithTokensRegex.test(str)) {
    return str.split(TAG_START_TOKEN)[1].split(TAG_END_TOKEN)[0];
  }

  throw new Error('No tag found in .env file');
}

export { makeTag, extractTag };
