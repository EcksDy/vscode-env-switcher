import * as vscode from 'vscode';
import { writeFileSync, readFileSync, createReadStream, ReadStream } from 'fs';
import * as readline from 'readline';
import * as glob from 'glob-promise';
import * as globTypes from 'glob';
import { Readable } from 'stream';
import * as path from 'path';
import { BACKUP_FILE_NAME } from './consts';

export default class FileSystemHandler {
  public readonly workspaceFolder: vscode.WorkspaceFolder;

  public readonly root: string;

  public readonly rootEnvFile: vscode.Uri;

  public readonly rootBackupEnvFile: vscode.Uri;

  private globOptions: globTypes.IOptions;

  constructor(workspaceFolders: vscode.WorkspaceFolder[], env: vscode.Uri) {
    this.workspaceFolder = workspaceFolders[0];
    this.rootEnvFile = env;
    this.root = env.fsPath.replace('.env', '');
    this.rootBackupEnvFile = vscode.Uri.parse(`${this.root}${BACKUP_FILE_NAME}.env`);

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
  public readFile(filePath: vscode.Uri) {
    return readFileSync(filePath.fsPath);
  }

  /**
   * streamFile
   */
  public streamFile(filePath: vscode.Uri) {
    return createReadStream(filePath.fsPath);
  }

  /**
   * writeFile
   */
  public writeFile(fileUri: vscode.Uri, fileContent: Buffer) {
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
      lineReader.on('line', function (line) {
        if (line.trim() !== '') {
          result = line; // TODO: Promisify/envelope in a promise
          lineReader.close();
        }
      });
      lineReader.on('error', function (error) {
        reject(error);
      });
      lineReader.on('close', function () {
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
