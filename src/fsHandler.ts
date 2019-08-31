import * as vscode from "vscode";
import { writeFileSync, readFileSync, createReadStream } from "fs";
import * as readline from "readline";
import * as glob from "glob-promise";
import * as globTypes from "glob";
import { Readable } from "stream";

export class FileSystemHandler {
  public readonly workspaceFolder: vscode.WorkspaceFolder;
  public readonly root: string;
  public readonly rootEnvFile: vscode.Uri;

  private globOptions: globTypes.IOptions;

  constructor(workspaceFolders: vscode.WorkspaceFolder[]) {
    this.workspaceFolder = workspaceFolders[0];
    this.root = this.workspaceFolder.uri.fsPath;
    this.rootEnvFile = vscode.Uri.parse(`${this.root}\\.env`);

    this.globOptions = {
      cwd: this.root,
      root: this.root,
      nodir: true,
    };
  }

  /**
   * findAllEnvFiles
   */
  public findAllEnvFiles() {
    return glob("*.env", this.globOptions);
  }

  /**
   * findCurrentEnvFile
   */
  public findCurrentEnvFile() {
    return glob(".env", this.globOptions);
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
  public writeFile(fileContent: Buffer) {
    writeFileSync(this.rootEnvFile.fsPath, fileContent);
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
      lineReader.on("line", function(line) {
        result = line; // TODO: Promisify/envelope in a promise
        lineReader.close();
      });
      lineReader.on("error", function(error) {
        reject(error);
      });
      lineReader.on("close", function() {
        resolve(result);
      });
    });

    return linePromise;
  }
}
