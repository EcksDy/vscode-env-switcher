import { EventEmitter, TextDocumentContentProvider, Uri, workspace } from 'vscode';
import BackupHandler from '../handlers/backupHandler';
import {
  BACKUP_PREFIX_ORIGINAL,
  BACKUP_PREFIX_SESSION,
  EXTENSION_PREFIX,
} from '../utilities/consts';

export default class BackupViewerContentProvider implements TextDocumentContentProvider {
  private backupHandler: BackupHandler;

  public onDidChange = new EventEmitter<Uri>().event;

  constructor(backupHandler: BackupHandler) {
    this.backupHandler = backupHandler;
  }

  public static register(backupHandler: BackupHandler) {
    return workspace.registerTextDocumentContentProvider(
      EXTENSION_PREFIX,
      new BackupViewerContentProvider(backupHandler),
    );
  }

  public provideTextDocumentContent(uri: Uri): string {
    switch (uri.path) {
      case `${BACKUP_PREFIX_ORIGINAL}.env`:
        return this.backupHandler.getOriginalBackupContent() || '';
      case `${BACKUP_PREFIX_SESSION}.env`:
        return this.backupHandler.getSessionBackupContent() || '';
      default:
        return '';
    }
  }
}
