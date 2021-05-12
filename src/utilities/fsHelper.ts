import {
  createReadStream,
  createWriteStream,
  existsSync,
  ReadStream,
  WriteStream,
} from 'fs';
import * as nodePath from 'path';
import { Uri, workspace } from 'vscode';
import { TextEncoder, TextDecoder } from 'util';
import { createHash } from 'crypto';

interface FileSystemHelperApi {
  readFile: (path: string) => Promise<Uint8Array>;
  decodeFile: (path: string) => Promise<string>;
  decodeArray: (arr: Uint8Array) => string;
  writeFile: (path: string, content: string | Uint8Array) => Promise<void>;
  streamReadFile: (path: string) => ReadStream;
  streamWriteFile: (path: string) => WriteStream;
  findFiles: (include: string, exclude?: string | null, maxResults?: number) => Promise<string[]>;
  exists: (path: string) => boolean;
  generateChecksum: (str: string) => string;
}

/**
 * Returns contents of the file as Uint8Array.
 * @param path Filesystem path
 */
async function readFile(path: string) {
  return await workspace.fs.readFile(Uri.parse(path));
}

/**
 * Returns contents of the file as string.
 * @param path Filesystem path
 */
async function decodeFile(path: string) {
  const content = await workspace.fs.readFile(Uri.parse(path));

  return new TextDecoder().decode(content);
}

/**
 * Returns string from Uint8Array.
 */
function decodeArray(arr: Uint8Array) {
  return new TextDecoder().decode(arr);
}

/**
 * Will write the provided content to the provided path.
 * Will create the necessary directories and the file itself if they don't exist.
 * @param path Destination filesystem path
 * @param content Content to be written
 */
async function writeFile(path: string, content: string | Uint8Array) {
  const dirString = nodePath.dirname(path);
  await workspace.fs.createDirectory(Uri.parse(dirString));

  let writable = content;
  if (typeof content === 'string') {
    writable = new TextEncoder().encode(content);
  }

  await workspace.fs.writeFile(Uri.parse(path), writable as Uint8Array);
}

/**
 * Creates a read stream.
 */
function streamReadFile(path: string) {
  return createReadStream(path);
}

/**
 * Creates a write stream.
 */
function streamWriteFile(path: string) {
  return createWriteStream(path);
}

/**
 * Find files across all directories in the defined rootDir.
 *
 * @param include A glob pattern that defines the files to search for.
 * @param exclude A glob pattern that defines files and folders to exclude.
 * @param maxResults An upper-bound for the result.
 * @return A promise that resolves to an array of resource identifiers.
 */
async function findFiles(
  include: string,
  exclude?: string | null,
  maxResults?: number,
): Promise<string[]> {
  const uris = await workspace.findFiles(include, exclude, maxResults);
  return uris.map(({ fsPath }) => fsPath);
}

/**
 * Checks if file/directory exists.
 */
function exists(path: string) {
  return existsSync(path);
}

/**
 * Generates checksum.
 */
function generateChecksum(str: string) {
  return createHash('md5').update(str, 'utf8').digest('hex');
}

export default {
  readFile,
  decodeFile,
  writeFile,
  streamReadFile,
  streamWriteFile,
  findFiles,
  exists,
  generateChecksum,
  decodeArray,
} as FileSystemHelperApi;
