import { createReadStream, promises as fsPromises, createWriteStream } from 'fs';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';
import { Uri, workspace, WorkspaceFolder } from 'vscode';
import {
  IUint8Reader,
  IStreamReader,
  IUint8Writer,
  IStreamFirstLineReader,
  IFileFinder,
  IRootDirLocator,
} from '../interfaces';

export class FileSystemHandler
  implements
    IRootDirLocator,
    IUint8Reader,
    IStreamReader,
    IUint8Writer,
    IStreamFirstLineReader,
    IFileFinder {
  public readonly rootDir: WorkspaceFolder;

  constructor() {
    const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];

    this.rootDir = rootFolder;
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
  public streamReadFile(uri: Uri) {
    return createReadStream(uri.fsPath);
  }

  /**
   * streamFile
   */
  public streamWriteFile(uri: Uri) {
    return createWriteStream(uri.fsPath);
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
   * Find files across all directories in the defined rootDir.
   *
   * @param include A glob pattern that defines the files to search for.
   * @param exclude A glob pattern that defines files and folders to exclude.
   * @param maxResults An upper-bound for the result.
   * @return A promise that resolves to an array of resource identifiers.
   */
  public findFiles(include: string, exclude?: string | null, maxResults?: number) {
    return workspace.findFiles(include, exclude, maxResults) as Promise<Uri[]>;
  }
}
