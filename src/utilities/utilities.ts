import { FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN, LABEL_PREFIX } from './consts';

const cleanHeaderLine = (headerLine: string) => {
  if (
    [FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN].every((token) => headerLine.includes(token))
  ) {
    return headerLine.split(FILE_HEADER_START_TOKEN)[1].split(FILE_HEADER_END_TOKEN)[0];
  }
  throw new Error('No descriptive headers found in .env');
};

const templateLabel = (env: string) => {
  const isProd = env.toLowerCase().includes('prod');
  return `${LABEL_PREFIX}${isProd ? `$(issue-opened) ${env.toUpperCase()} $(issue-opened)` : env}`;
};

export { cleanHeaderLine, templateLabel };
