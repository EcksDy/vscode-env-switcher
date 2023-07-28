import * as nodePath from 'path';
import {
  Disposable,
  FileSystemWatcher,
  RelativePattern,
  Uri,
  WorkspaceFolder,
  workspace,
} from 'vscode';
import { EventCallback, EventCallbacks, EventType, isDefined } from '../utilities';
import { IFileWatcher } from '../interfaces';

interface Args extends EventCallbacks {
  workspaceFolder: WorkspaceFolder;
  path?: string;
}

export class FileWatcher implements IFileWatcher, Disposable {
  private watcher: FileSystemWatcher | null = null;
  private workspaceFolder: WorkspaceFolder;

  private garbage: Disposable[] = [];

  constructor({ workspaceFolder, path, onDidChange, onDidCreate, onDidDelete }: Args) {
    this.workspaceFolder = workspaceFolder;
    if (!path) return;

    this.watcher = this.makeWatcher(path);
    this.garbage = [
      this.watcher,
      ...this.registerEventListeners({ onDidChange, onDidCreate, onDidDelete }),
    ];
  }

  watchFile(path: string, callbacks: EventCallbacks) {
    this.dispose();
    this.watcher = this.makeWatcher(path);
    this.garbage = [this.watcher, ...this.registerEventListeners(callbacks)];
  }

  onDidChange(callback: EventCallback) {
    const disposable = this.listenToEvent('onDidChange', callback);
    if (disposable) this.garbage.push(disposable);
  }

  onDidDelete(callback: EventCallback) {
    const disposable = this.listenToEvent('onDidDelete', callback);
    if (disposable) this.garbage.push(disposable);
  }

  onDidCreate(callback: EventCallback) {
    const disposable = this.listenToEvent('onDidCreate', callback);
    if (disposable) this.garbage.push(disposable);
  }

  dispose() {
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }

  private registerEventListeners(callbacks: EventCallbacks) {
    return Object.entries(callbacks)
      .map(([eventType, callback]) => this.listenToEvent(eventType as EventType, callback))
      .filter(isDefined);
  }

  private makeWatcher(path: string) {
    const watchedFile = nodePath.relative(this.workspaceFolder.uri.fsPath, path);
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(this.workspaceFolder, watchedFile),
      true,
      false,
      true,
    );

    return watcher;
  }

  private listenToEvent(
    eventType: EventType,
    callback?: ((file: string) => void | Promise<void>) | undefined,
  ) {
    if (!callback || !this.watcher) return null;

    return this.watcher[eventType]((affectedUri: Uri) => callback(affectedUri.fsPath));
  }
}
