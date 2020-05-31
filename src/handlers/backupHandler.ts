import { Memento } from 'vscode';
import { BACKUP_PREFIX_ORIGINAL, BACKUP_PREFIX_SESSION } from '../utilities/consts';
import FileSystemHandler from './fsHandler';

export default class BackupHandler {
  private fsHandler: FileSystemHandler;

  private workspaceState: Memento;

  constructor(workspaceState: Memento, fsHandler: FileSystemHandler) {
    this.fsHandler = fsHandler;
    this.workspaceState = workspaceState;

    this.backupCurrentEnvFile();
  }

  /**
   * Get the content of the original `.env` file.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  public getOriginalBackupContent() {
    return this.workspaceState.get<string>(BACKUP_PREFIX_ORIGINAL);
  }

  /**
   * Get the content of the session `.env` file.
   * Session `.env` is the `.env` encountered on the current workspace session.
   */
  public getSessionBackupContent() {
    return this.workspaceState.get<string>(BACKUP_PREFIX_SESSION);
  }

  /**
   * Backup the current `.env` file to session `.env` and original `.env`(if it doesn't exist).
   * Session `.env` is the `.env` encountered on the current workspace session.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  private backupCurrentEnvFile() {
    const envContent = this.fsHandler.readFile(this.fsHandler.envFile, 'utf8');
    this.workspaceState.update(BACKUP_PREFIX_SESSION, envContent);

    if (!this.isOriginalBackupExists()) {
      this.workspaceState.update(BACKUP_PREFIX_ORIGINAL, envContent);
    }
  }

  /**
   * Checks if backup of the original `.env` file exists.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  private isOriginalBackupExists() {
    return this.workspaceState.get<string>(BACKUP_PREFIX_ORIGINAL) !== undefined;
  }
}
