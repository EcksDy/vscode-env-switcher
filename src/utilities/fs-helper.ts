import { createHash } from 'crypto';
import { createReadStream, createWriteStream, constants } from 'fs';
import { access } from 'fs/promises';
import * as nodePath from 'path';
import { TextDecoder, TextEncoder } from 'util';
import { Uri, workspace } from 'vscode';
import { ExtensionConfig } from './types';

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

  const writable = typeof content === 'string' ? new TextEncoder().encode(content) : content;

  await workspace.fs.writeFile(Uri.parse(path), writable);
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
 * Find files in the workspace.
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
  const excludes = exclude?.split(',').filter((e) => !!e) ?? [''];
  const paths: Record<string, true> = {};
  for (const exclude of excludes) {
    const uris = await workspace.findFiles(include, exclude || undefined, maxResults);
    for (const uri of uris) {
      paths[uri.fsPath] = true;
    }
  }
  return Object.keys(paths);
}

async function findFile(include: string, exclude?: string | null): Promise<string | null> {
  const [file] = await findFiles(include, exclude, 1);
  return file ?? null;
}

async function findTarget(config: ExtensionConfig): Promise<string | null> {
  const file = await findFile(config.target.glob(), config.target.excludeGlob());
  return file;
}

async function findPresets(config: ExtensionConfig): Promise<string[]> {
  const files = await findFiles(config.target.glob(), config.target.excludeGlob());
  return files;
}

/**
 * Checks if file/directory exists.
 */
async function exists(path: string) {
  return await access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * Generates checksum.
 */
function generateChecksum(str: string) {
  return createHash('md5').update(str, 'utf8').digest('hex');
}

export const fsHelper = {
  decodeArray,
  decodeFile,
  exists,
  findFile,
  findFiles,
  findPresets,
  findTarget,
  generateChecksum,
  readFile,
  streamReadFile,
  streamWriteFile,
  writeFile,
};
