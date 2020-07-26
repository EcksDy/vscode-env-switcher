import { Uri, workspace } from 'vscode';
import path from 'path';
import {
  EXTENSION_FS_FOLDER,
  BACKUP_PREFIX_ORIGINAL,
  BACKUP_PREFIX_SESSION,
  EXTENSION_PREFIX,
} from '../utilities/consts';
import FileSystemHandler from './fsHandler';

const BACKUP_PREFIX = 'env_switcher_backup';

const backupEnabled = () =>
  workspace.getConfiguration(`${EXTENSION_PREFIX}.backup`).get('enabled') as boolean;

export default class BackupHandler {
  private fsHandler: FileSystemHandler;

  private vscodeStorageRootPath: Uri;

  private vscodeWorkspacePath: Uri;

  /**
   * @param fsHandler Provide FileSystemHandler to handle backup save/read/delete actions
   * @param globalStoragePath String path to VSCodes global data folder
   * @param storagePath String path to currently open workspace data folder,
   * will be `undefined` if none is open
   */
  constructor(fsHandler: FileSystemHandler, globalStoragePath: string, storagePath: string) {
    this.fsHandler = fsHandler;
    this.vscodeWorkspacePath = Uri.parse(storagePath);

    const codeStoragePath = globalStoragePath.split('globalStorage')[0];
    this.vscodeStorageRootPath = Uri.parse(`${codeStoragePath}workspaceStorage`);

    if (backupEnabled()) {
      this.backupCurrentEnvFile();
    }
  }

  /**
   * Get the content of the original `.env` file.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  public async getOriginalBackupContent() {
    return await this.getBackupFileContent(BACKUP_PREFIX_ORIGINAL);
  }

  /**
   * Get the content of the session `.env` file.
   * Session `.env` is the `.env` encountered on the current workspace session.
   */
  public async getSessionBackupContent() {
    return await this.getBackupFileContent(BACKUP_PREFIX_SESSION);
  }

  /**
   * clearAllBackups
   */
  public async clearAllBackups() {
    const fixedSlashesForGlob = this.vscodeStorageRootPath.path.replace(/\\/g, '/');
    const backupFilesInAllWorkspaceDirectoriesGlobPattern = `${fixedSlashesForGlob}/*/${EXTENSION_FS_FOLDER}/${BACKUP_PREFIX}*`;
    const backupFilesUris = await this.fsHandler.findFiles(
      backupFilesInAllWorkspaceDirectoriesGlobPattern,
      {
        nocase: true,
      },
    );

    this.fsHandler.deleteFiles(backupFilesUris);
  }

  /**
   * clearWorkspaceBackups
   */
  public async clearWorkspaceBackups() {
    const fixedSlashesForGlob = this.vscodeWorkspacePath.path.replace(/\\/g, '/');
    const backupFilesInWorkspaceDirectoryGlobPattern = `${fixedSlashesForGlob}/${BACKUP_PREFIX}*`;
    const backupFilesUri = await this.fsHandler.findFiles(
      backupFilesInWorkspaceDirectoryGlobPattern,
      {
        nocase: true,
      },
    );

    this.fsHandler.deleteFiles(backupFilesUri);
  }

  private async getBackupFileContent(fileName: string) {
    const originalBackupUri = this.getBackupFileUri(fileName);
    return await this.fsHandler.readFileToString(originalBackupUri);
  }

  private getBackupFileUri(fileName: string) {
    return Uri.file(`${this.vscodeWorkspacePath.fsPath}${path.sep}${fileName}`);
  }

  /**
   * Backup the current `.env` file to session `.env` and original `.env`(if it doesn't exist).
   * Session `.env` is the `.env` encountered on the current workspace session.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  private async backupCurrentEnvFile() {
    const envContent = await this.fsHandler.readFileToUint8Array(this.fsHandler.envFile);

    this.fsHandler.writeFile(this.getBackupFileUri(BACKUP_PREFIX_SESSION), envContent);

    if (!(await this.isOriginalBackupExists())) {
      this.fsHandler.writeFile(this.getBackupFileUri(BACKUP_PREFIX_ORIGINAL), envContent);
    }
  }

  /**
   * Checks if backup of the original `.env` file exists.
   * Original `.env` is the `.env` encountered on the first time the workspace was opened with the extension active.
   */
  private async isOriginalBackupExists() {
    return await this.fsHandler.fileExists(this.getBackupFileUri(BACKUP_PREFIX_ORIGINAL));
  }
}
