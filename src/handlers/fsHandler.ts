import { createReadStream, promises as fsPromises } from 'fs';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';
import { Uri, workspace, WorkspaceFolder, GlobPattern, CancellationToken } from 'vscode';
import {
  IUint8Reader,
  IStreamReader,
  IUint8Writer,
  IStreamFirstLineReader,
  IFileFinder,
} from '../interfaces';

export class FileSystemHandler
  implements IUint8Reader, IStreamReader, IUint8Writer, IStreamFirstLineReader, IFileFinder {
  public readonly rootDir: Uri;

  constructor() {
    const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];

    this.rootDir = rootFolder.uri;
  }

  /**
   * Returns contents of the uri file as Uint8Array.
   * @param uri File Uri
   */
  public async readFileToUint8Array(uri: Uri) {
    return await workspace.fs.readFile(uri);
  }

  /**
   * streamFile
   */
  public streamFile(uri: Uri) {
    return createReadStream(uri.fsPath);
  }

  /**
   * Will write the provided content to the provided uri.
   * Will create the necessary directories and the file itself if they don't exist.
   * @param uri Destination file Uri
   * @param content Content to be written
   */
  public async writeFile(uri: Uri, content: Uint8Array) {
    const dirString = path.dirname(uri.fsPath);
    await fsPromises.mkdir(dirString, {
      recursive: true,
    });

    await workspace.fs.writeFile(uri, content);
  }

  /**
   * Will return the first line(until breakline) of the provided stream.
   * @param stream Readable Stream
   */
  public readFirstLine(stream: Readable): Promise<string> {
    const lineReader = readline.createInterface({
      input: stream,
    });

    const linePromise: Promise<string> = new Promise((resolve, reject) => {
      let result: string;
      lineReader.on('line', (line) => {
        if (line.trim() !== '') {
          result = line; // TODO: Promisify/envelope in a promise
          lineReader.close();
        }
      });
      lineReader.on('error', (error) => {
        reject(error);
      });
      lineReader.on('close', () => {
        resolve(result);
      });
    });

    return linePromise;
  }

  /**
   * Find files across all [workspace folders](#workspace.workspaceFolders) in the workspace.
   *
   * @param include A [glob pattern](#GlobPattern) that defines the files to search for. The glob pattern
   * will be matched against the file paths of resulting matches relative to their workspace. Use a [relative pattern](#RelativePattern)
   * to restrict the search results to a [workspace folder](#WorkspaceFolder).
   * @param exclude  A [glob pattern](#GlobPattern) that defines files and folders to exclude. The glob pattern
   * will be matched against the file paths of resulting matches relative to their workspace. When `undefined` only default excludes will
   * apply, when `null` no excludes will apply.
   * @param maxResults An upper-bound for the result.
   * @param token A token that can be used to signal cancellation to the underlying search engine.
   * @return A thenable that resolves to an array of resource identifiers. Will return no results if no
   * [workspace folders](#workspace.workspaceFolders) are opened.
   */
  public findFiles(
    include: GlobPattern,
    exclude?: GlobPattern | null,
    maxResults?: number,
    token?: CancellationToken,
  ) {
    return workspace.findFiles(include, exclude, maxResults, token) as Promise<Uri[]>;
  }
}
