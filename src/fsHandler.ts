import { Uri, WorkspaceFolder } from 'vscode';
import { writeFileSync, readFileSync, createReadStream } from 'fs';
import * as readline from 'readline';
import * as glob from 'glob-promise';
import * as globTypes from 'glob';
import { Readable } from 'stream';
import { BACKUP_FILE_NAME } from './consts';

export default class FileSystemHandler {
  public readonly workspaceFolder: WorkspaceFolder;

  public readonly root: string;

  public readonly rootEnvFile: Uri;

  public readonly rootBackupEnvFile: Uri;

  private globOptions: globTypes.IOptions;

  constructor(workspaceFolders: ReadonlyArray<WorkspaceFolder>, env: Uri) {
    const [mainFolder] = workspaceFolders;
    this.workspaceFolder = mainFolder;
    this.rootEnvFile = env;
    this.root = env.fsPath.replace('.env', '');
    this.rootBackupEnvFile = Uri.parse(`${this.root}${BACKUP_FILE_NAME}.env`);

    this.globOptions = {
      cwd: this.root,
      root: this.root,
      nodir: true,
    };
  }

  /**
   * findFile
   */
  public findFiles(pattern: string) {
    return glob(pattern, this.globOptions);
  }

  /**
   * findAllEnvFiles
   */
  public findAllEnvFiles() {
    return glob('*.env', this.globOptions);
  }

  /**
   * findCurrentEnvFile
   */
  public findCurrentEnvFile() {
    return glob(`${this.root}.env`, this.globOptions);
  }

  /**
   * readFile
   */
  public readFile(filePath: Uri) {
    return readFileSync(filePath.fsPath);
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

  /**
   * backupEnvCurrentFile
   */
  public async backupEnvCurrentFile() {
    const backupEnvExists =
      (await this.findFiles(`${this.root}${BACKUP_FILE_NAME}.env`)).length !== 0;
    const envExists = (await this.findCurrentEnvFile()).length !== 0;

    if (!backupEnvExists && envExists) {
      this.writeFile(this.rootBackupEnvFile, this.readFile(this.rootEnvFile));
    }
  }
}
