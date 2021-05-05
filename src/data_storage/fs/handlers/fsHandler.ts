import * as nodePath from 'path';
import { Readable } from 'stream';
import readline from 'readline';
import { TextEncoder } from 'util';
import fsHelper from './helper/fsHelper';
import concatFilesContent from '../utilities/bufferManipulations';

const NODE_MODULES_GLOB = '**/node_modules/**';
const TARGET_GLOB_DEFAULT = '**/.env';
const ENV_EXTENSION = '.env';
const TAG_START_TOKEN = '#_';
const TAG_END_TOKEN = '_#';

export function getOnlyEnvGlob(glob: string) {
  if (glob.length < 4) return TARGET_GLOB_DEFAULT;
  const includesOnlyEnvFile = glob.slice(glob.length - 4).toLowerCase() === ENV_EXTENSION;
  if (!includesOnlyEnvFile) {
    return `${glob}${ENV_EXTENSION}`;
  }
  return glob;
}

export async function getPresetPaths(glob: string) {
  const paths = await fsHelper.findFiles(getOnlyEnvGlob(glob), NODE_MODULES_GLOB);

  return paths;
}

export function removePotentialTargetFiles(paths: string[]) {
  return paths.filter(
    (path) => nodePath.basename(path) !== ENV_EXTENSION && nodePath.extname(path) === ENV_EXTENSION,
  );
}

function capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export function makePreset(rootDir: string, path: string): IPreset {
  return {
    id: nodePath.basename(path),
    title: capitalize(nodePath.basename(path, ENV_EXTENSION)),
    path: nodePath.relative(rootDir, path),
  };
}

export function makePresets(rootDir: string, paths: string[]): IPreset[] {
  return paths.map((path): IPreset => makePreset(rootDir, path));
}

export function makeTag(tagText: string) {
  return new TextEncoder().encode(`${TAG_START_TOKEN}${tagText}${TAG_END_TOKEN}\n`);
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

/**
 * Will return the first line(until breakline) of the provided stream.
 * @param stream Readable Stream
 */
function readFirstLine(stream: Readable): Promise<string> {
  const lineReader = readline.createInterface({
    input: stream,
  });

  const linePromise: Promise<string> = new Promise((resolve, reject) => {
    lineReader.on('line', (line) => {
      resolve(line);
      lineReader.close();
    });
    lineReader.on('error', (error) => {
      reject(error);
    });
  });

  return linePromise;
}

export async function getCurrentPresetPath(targetGlob: string): Promise<string | null> {
  const currentPresetPath = await fsHelper.findFiles(
    getOnlyEnvGlob(targetGlob),
    NODE_MODULES_GLOB,
    1,
  );

  return currentPresetPath[0] ?? null;
}

export async function getPresetTag(path: string) {
  const stream = fsHelper.streamReadFile(path);
  const line = await readFirstLine(stream);

  try {
    return extractTag(line);
  } catch (error) {
    return null;
  }
}

export function findPresetFilePath(rootDir: string, relativePath: string, fileName: string) {
  const path = nodePath.join(rootDir, relativePath, fileName);
  const exists = fsHelper.fileExists(path);
  return exists ? path : null;
}

export async function setCurrentPreset(target: string, source: string, id: string) {
  const tag: Uint8Array = makeTag(id);
  const sourceFileContent: Uint8Array = await fsHelper.readFileUint8(source);
  const targetFileContent = concatFilesContent([tag, sourceFileContent]);
  fsHelper.writeFileUint8(target, targetFileContent);
}
