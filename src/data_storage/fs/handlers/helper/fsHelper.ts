import { createReadStream, promises as fsPromises, createWriteStream, existsSync } from 'fs';
import * as nodePath from 'path';
import { Uri, workspace } from 'vscode';
import { FileSystemHelper } from '../../interfaces';

/**
 * Returns contents of the file as Uint8Array.
 * @param path Filesystem path
 */
async function readFileUint8(path: string) {
  return await workspace.fs.readFile(Uri.parse(path));
}

/**
 * Will write the provided content to the provided path.
 * Will create the necessary directories and the file itself if they don't exist.
 * @param path Destination filesystem path
 * @param content Content to be written
 */
async function writeFileUint8(path: string, content: Uint8Array) {
  const dirString = nodePath.dirname(path);
  await fsPromises.mkdir(dirString, {
    recursive: true,
  });

  await workspace.fs.writeFile(Uri.parse(path), content);
}

/**
 * streamFile
 */
function streamReadFile(path: string) {
  return createReadStream(path);
}

/**
 * streamFile
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

function fileExists(path: string) {
  return existsSync(path);
}

export default {
  readFileUint8,
  writeFileUint8,
  streamReadFile,
  streamWriteFile,
  findFiles,
  fileExists,
} as FileSystemHelper;
