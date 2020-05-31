import { FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN } from './consts';

const makeHeaderLine = (headerStr: string) =>
  `${FILE_HEADER_START_TOKEN}${headerStr}${FILE_HEADER_END_TOKEN}\n`;

const extractHeaderLine = (headerLine: string) => {
  if (
    [FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN].every((token) => headerLine.includes(token))
  ) {
    return headerLine.split(FILE_HEADER_START_TOKEN)[1].split(FILE_HEADER_END_TOKEN)[0];
  }
  throw new Error('No descriptive headers found in .env');
};

const templateLabel = (env: string) => {
  const upperEnv = env.toUpperCase();
  const isProd = env.includes('PROD');
  return `${isProd ? `$(issue-opened) ${upperEnv}` : env}`;
};

const capitalize = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export { makeHeaderLine, extractHeaderLine, templateLabel, capitalize };
