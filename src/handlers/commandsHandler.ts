import path from 'path';
import { commands, Disposable, QuickPickItem, Uri, window, workspace } from 'vscode';
import {
  BACKUP_PREFIX_ORIGINAL,
  BACKUP_PREFIX_SESSION,
  EXTENSION_PREFIX,
  SELECT_ENV_COMMAND_ID,
  SHOW_ORIGINAL_BACKUP_COMMAND_ID,
  SHOW_SESSION_BACKUP_COMMAND_ID,
} from '../utilities/consts';
import { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter } from '../utilities/events';
import { makeHeaderLine, capitalize } from '../utilities/stringManipulations';
import BackupHandler from './backupHandler';
import FileSystemHandler from './fsHandler';

export interface EnvPresetQuickPickItem extends SelectedEnvPresetEventData, QuickPickItem {}

export default class CommandsHandler {
  private fsHandler: FileSystemHandler;

  private backupHandler: BackupHandler;

  private registeredCommands: Disposable[] = [];

  constructor(fsHandler: FileSystemHandler, backupHandler: BackupHandler) {
    this.fsHandler = fsHandler;
    this.backupHandler = backupHandler;

    this.registerCommand(SELECT_ENV_COMMAND_ID, this.selectEnvPreset);
    this.registerCommand(SHOW_ORIGINAL_BACKUP_COMMAND_ID, this.showOriginalEnvBackup);
    this.registerCommand(SHOW_SESSION_BACKUP_COMMAND_ID, this.showSessionEnvBackup);
  }

  public getRegisteredCommands = () => this.registeredCommands;

  private selectEnvPreset = async () => {
    const envFiles = await this.fsHandler.getEnvFilesInEnvDir();

    const envFileQuickPickList = envFiles.map((filePath) => {
      const fileName = path.basename(filePath.fsPath, path.extname(filePath.fsPath));
      const fileNameFull = path.basename(filePath.fsPath);
      const label = capitalize(fileName);
      const description = path.relative(this.fsHandler.rootDir.fsPath, filePath.fsPath);

      const envFileQuickPick: EnvPresetQuickPickItem = {
        description,
        label,
        fileName,
        fileNameFull,
        filePath,
      };

      return envFileQuickPick;
    });

    const selectedEnv = await window.showQuickPick(envFileQuickPickList);

    if (selectedEnv === undefined) {
      return;
    }

    const setCurrentEnvHeader = makeHeaderLine(selectedEnv.fileNameFull);
    const headerBuffer = Buffer.from(setCurrentEnvHeader);
    // We can assert because didn't provide encoding
    const selectedFileContent = this.fsHandler.readFile(selectedEnv.filePath) as Buffer;

    this.fsHandler.writeFile(
      this.fsHandler.envFile,
      Buffer.concat([headerBuffer, selectedFileContent]),
    );

    selectedEnvPresetEventEmitter.fire(selectedEnv);
  };

  private showOriginalEnvBackup = async () => {
    const uri = Uri.parse(`${EXTENSION_PREFIX}:${BACKUP_PREFIX_ORIGINAL}.env`);
    const doc = await workspace.openTextDocument(uri);
    await window.showTextDocument(doc, { preview: true });
  };

  private showSessionEnvBackup = async () => {
    const uri = Uri.parse(`${EXTENSION_PREFIX}:${BACKUP_PREFIX_SESSION}.env`);
    const doc = await workspace.openTextDocument(uri);
    await window.showTextDocument(doc, { preview: true });
  };

  private registerCommand(commandId: string, commandCallback: (...args: unknown[]) => unknown) {
    const command = commands.registerCommand(commandId, commandCallback);

    this.registeredCommands.push(command);
  }
}
