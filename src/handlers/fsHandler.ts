import { createReadStream, readFileSync, writeFileSync } from 'fs';
import globTypes from 'glob';
import glob from 'glob-promise';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';
import { Uri, workspace } from 'vscode';

export default class FileSystemHandler {
  public readonly rootDir: Uri;

  public readonly envDir: Uri;

  public readonly envFile: Uri;

  private globOptions: globTypes.IOptions;

  constructor(rootFolder: Uri, mainEnv: Uri) {
    this.rootDir = rootFolder;
    this.envDir = Uri.file(path.dirname(mainEnv.fsPath));
    this.envFile = mainEnv;

    this.globOptions = {
      matchBase: true,
      root: this.envDir.fsPath,
      nodir: true,
    };
  }

  public static async build() {
    if (workspace.workspaceFolders === undefined) throw new Error('No workspace opened.');

    const [firstEnvFile] = await workspace.findFiles(`**/.env`, undefined, 1);
    const [rootFolder] = workspace.workspaceFolders;

    return new FileSystemHandler(rootFolder.uri, firstEnvFile);
  }

  /**
   * findFiles
   */
  public async findFiles(pattern: string) {
    const filePaths = await glob(pattern, this.globOptions);
    return filePaths.map(Uri.file.bind(this));
  }

  /**
   * findAllEnvFiles
   */
  public async getEnvFilesInEnvDir() {
    const filePaths = await glob('/*.env', this.globOptions);
    return filePaths.map(Uri.file.bind(this));
  }

  /**
   * readFile
   */
  public readFile(filePath: Uri, encoding?: BufferEncoding) {
    return readFileSync(filePath.fsPath, encoding);
  }

  /**
   * streamFile
   */
  public streamFile(filePath: Uri) {
    return createReadStream(filePath.fsPath);
  }

  /**
   * writeFile
   */
  public writeFile(fileUri: Uri, fileContent: Buffer) {
    writeFileSync(fileUri.fsPath, fileContent);
  }

  /**
   * readHeader
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
