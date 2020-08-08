import { createReadStream, promises as fsPromises } from 'fs';
import globTypes from 'glob';
import glob from 'glob-promise';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';
import { Uri, workspace, WorkspaceFolder, ConfigurationChangeEvent, GlobPattern } from 'vscode';
import { TextEncoder, TextDecoder } from 'util';
import { makeHeaderLine } from '../utilities/stringManipulations';
import concatFilesContent from '../utilities/bufferManipulations';
import { EXTENSION_PREFIX } from '../utilities/consts';

const getPresetsGlob = () =>
  workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('presetsGlob') as string;

export default class FileSystemHandler {
  public readonly rootDir: Uri;

  public readonly envDir: Uri;

  public readonly envFile: Uri;

  private globOptions: globTypes.IOptions;

  private presetsGlob: GlobPattern;

  constructor(rootFolder: Uri, mainEnvUri: Uri) {
    this.rootDir = rootFolder;
    this.envDir = Uri.file(path.dirname(mainEnvUri.fsPath));
    this.envFile = mainEnvUri;
    this.presetsGlob = getPresetsGlob();

    this.globOptions = {
      matchBase: true,
      root: this.envDir.fsPath,
      nodir: true,
    };

    workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
      const shouldUpdatePresetsGlob = event.affectsConfiguration(`${EXTENSION_PREFIX}.presetsGlob`);

      if (!shouldUpdatePresetsGlob) return;

      this.presetsGlob = getPresetsGlob();
    });
  }

  /**
   * Performs necessary actions to instantiate a FileSystemHandler.
   */
  public static async build() {
    const [firstEnvFile] = await workspace.findFiles('**/.env', undefined, 1);
    const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];

    return new FileSystemHandler(rootFolder.uri, firstEnvFile);
  }

  /**
   * findFiles
   */
  public async findFiles(pattern: string, globOptions?: globTypes.IOptions) {
    const filePaths = await glob(pattern, globOptions || this.globOptions);
    return filePaths.map((file) => Uri.file(file));
  }

  /**
   * Returns a Uri[] of `.env` files, using the configured preset glob.
   */
  public async getEnvPresetUris() {
    const envPresetUris = await workspace.findFiles(this.presetsGlob);
    return envPresetUris.filter(
      (uri) => path.basename(uri.fsPath) !== '.env' && path.extname(uri.fsPath) === '.env',
    );
  }

  /**
   * setEnvContentWithHeaders
   */
  public async setEnvContentWithHeaders(presetFileUri: Uri, presetName: string) {
    const presetEnvHeader: Uint8Array = new TextEncoder().encode(makeHeaderLine(presetName));
    const presetFileContent: Uint8Array = await this.readFileToUint8Array(presetFileUri);

    const targetFileContent = concatFilesContent([presetEnvHeader, presetFileContent]);
    this.writeFile(this.envFile, targetFileContent);
  }

  /**
   * Returns contents of the uri file as Uint8Array.
   * @param uri File Uri
   */
  public async readFileToUint8Array(uri: Uri) {
    return await workspace.fs.readFile(uri);
  }

  /**
   * Returns contents of the uri file as string.
   * @param uri File Uri
   */
  public async readFileToString(uri: Uri) {
    return new TextDecoder('utf-8').decode(await workspace.fs.readFile(uri));
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
   * Returns true if a file is found at the provided uri.
   * @param uri File Uri
   */
  public async fileExists(uri: Uri) {
    try {
      const file = await workspace.fs.stat(uri);
      return file.size !== 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Will delete files at the provided uri's.
   * @param uris Array of file Uri's
   */
  public deleteFiles(uris: Uri[]) {
    for (const uri of uris) {
      workspace.fs.delete(uri, { useTrash: false });
    }
  }

  /**
   * Will return the first line(until breakline) of the provided stream.
   * @param stream Readable Stream
   */
  public readHeaderAsync(stream: Readable): Promise<string> {
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
}
