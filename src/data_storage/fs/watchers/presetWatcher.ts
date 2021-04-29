import { workspace, RelativePattern, Disposable, FileSystemWatcher, Uri } from 'vscode';
import path from 'path';
import * as fsHandler from '../handlers/fsHandler';

const ENV_GLOB = '**.env';

interface PresetWatcherDeps {
  rootDir: string;
  storage: IStorage;
}

/**
 * Decorator class for the FileSystemWatcher.
 * Will expose the necessary members to the rest of the extension.
 */
export class PresetWatcher implements Disposable {
  private watcher: FileSystemWatcher;

  constructor({ rootDir, storage }: PresetWatcherDeps) {
    this.watcher = workspace.createFileSystemWatcher(
      new RelativePattern(rootDir, ENV_GLOB),
      true,
      false,
      true,
    );

    async function onPresetChange(changedPresetUri: Uri) {
      const currentPresetId = await storage.getCurrentPresetId();
      if (currentPresetId === null) {
        return;
      }
      const changedPresetId = path.basename(changedPresetUri.fsPath);
      if (currentPresetId !== changedPresetId) return;

      await storage.setCurrentPreset(fsHandler.makePreset(rootDir, changedPresetUri.fsPath));
    }

    this.watcher.onDidChange(onPresetChange);
  }

  /**
   * Exposing the original dispose, so FileSystemWatcher can be registered in extension subscriptions.
   */
  public dispose() {
    this.watcher.dispose();
  }
}
