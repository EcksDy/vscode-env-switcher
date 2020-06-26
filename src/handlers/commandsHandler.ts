import { commands, Disposable } from 'vscode';
import {
  SELECT_ENV_COMMAND_ID,
  SHOW_ORIGINAL_BACKUP_COMMAND_ID,
  SHOW_SESSION_BACKUP_COMMAND_ID,
  CLEAR_WORKSPACE_BACKUPS_COMMAND_ID,
  CLEAR_ALL_BACKUPS_COMMAND_ID,
} from '../utilities/consts';
import BackupHandler from './backupHandler';
import FileSystemHandler from './fsHandler';
import selectEnvPreset from '../command_implementations/selectEnvPreset';
import {
  showOriginalEnvBackup,
  showSessionEnvBackup,
} from '../command_implementations/showEnvBackups';
import { clearWorkspaceBackups, clearAllBackups } from '../command_implementations/clearBackups';

export default class CommandsHandler {
  private fsHandler: FileSystemHandler;

  private backupHandler: BackupHandler;

  private registeredCommands: Disposable[] = [];

  constructor(fsHandler: FileSystemHandler, backupHandler: BackupHandler) {
    this.fsHandler = fsHandler;
    this.backupHandler = backupHandler;

    this.registerCommand(SELECT_ENV_COMMAND_ID, () => selectEnvPreset(this.fsHandler));
    this.registerCommand(SHOW_ORIGINAL_BACKUP_COMMAND_ID, showOriginalEnvBackup);
    this.registerCommand(SHOW_SESSION_BACKUP_COMMAND_ID, showSessionEnvBackup);
    this.registerCommand(CLEAR_ALL_BACKUPS_COMMAND_ID, () => clearAllBackups(this.backupHandler));
    this.registerCommand(CLEAR_WORKSPACE_BACKUPS_COMMAND_ID, () =>
      clearWorkspaceBackups(this.backupHandler),
    );
  }

  public getRegisteredCommands = () => this.registeredCommands;

  private registerCommand(commandId: string, commandCallback: (...args: unknown[]) => unknown) {
    const command = commands.registerCommand(commandId, commandCallback);

    this.registeredCommands.push(command);
  }
}
