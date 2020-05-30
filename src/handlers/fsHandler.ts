import { Uri, workspace } from 'vscode';
import { writeFileSync, readFileSync, createReadStream } from 'fs';
import readline from 'readline';
import glob from 'glob-promise';
import globTypes from 'glob';
import { Readable } from 'stream';
import path from 'path';
import { BACKUP_FILE_NAME } from '../utilities/consts';

export default class FileSystemHandler {
  public readonly root: Uri;

  public readonly rootEnvFile: Uri;

  public readonly rootBackupEnvFile: Uri;

  private globOptions: globTypes.IOptions;

  constructor(env: Uri) {
    this.rootEnvFile = env;
    this.root = Uri.parse(env.path.replace('.env', ''));
    this.rootBackupEnvFile = Uri.parse(`${this.root.path}${BACKUP_FILE_NAME}.env`);

    // TODO: Figure out the cwd/root purpose and format
    this.globOptions = {
      cwd: this.root.toString(),
      root: this.root.toString(),
      nodir: true,
    };

    this.backupEnvCurrentFile();
  }

  /**
   * findFile
   */
  public findFiles = (pattern: string) => {
    return glob(pattern, this.globOptions);
  };

  /**
   * findAllEnvFiles
   */
  public findAllEnvFiles = () => {
    return glob('*.env', this.globOptions);
  };

  /**
   * findCurrentEnvFile
   */
  public findCurrentEnvFile = async () => {
    // TODO: Research glob patterns
    const [firstEnv] = await glob(`.env`, this.globOptions);
    if (firstEnv !== undefined) {
      return Uri.parse(firstEnv);
    }

    return undefined;
  };

  /**
   * readFile
   */
  public readFile = (filePath: Uri) => {
    return readFileSync(filePath.fsPath);
  };

  /**
   * streamFile
   */
  public streamFile = (filePath: Uri) => {
    return createReadStream(filePath.fsPath);
  };

  /**
   * writeFile
   */
  public writeFile = (fileUri: Uri, fileContent: Buffer) => {
    writeFileSync(fileUri.fsPath, fileContent);
  };

  /**
   * readHeader
   */
  public readHeaderAsync = (stream: Readable): Promise<string> => {
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
  };

  /**
   * backupEnvCurrentFile
   */
  private backupEnvCurrentFile = async () => {
    const backupEnvExists = await this.isBackupExists();
    const envExists = await this.findCurrentEnvFile();

    if (!backupEnvExists && envExists) {
      this.writeFile(this.rootBackupEnvFile, this.readFile(this.rootEnvFile));
    }
  };

  /**
   * Return true if backup env file exists
   */
  private isBackupExists = async () =>
    (await this.findFiles(`${this.root.fsPath}${path.sep}${BACKUP_FILE_NAME}.env`)).length !== 0;
}

// TODO: Consider builder pattern for this
const initFileSystemHandler = async () => {
  const [firstEnvFile] = await workspace.findFiles(`**${path.sep}.env`, undefined, 1);

  return new FileSystemHandler(firstEnvFile);
};

export { initFileSystemHandler };
