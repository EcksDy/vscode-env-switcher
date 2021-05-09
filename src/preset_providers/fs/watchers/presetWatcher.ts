import { workspace, RelativePattern, Disposable, FileSystemWatcher, Uri } from 'vscode';
import path from 'path';
import { makePreset } from '../handlers';
import { TargetManagerApi } from '../../../interfaces';

const ENV_GLOB = '**.env';

interface Deps {
  targetManager: TargetManagerApi;
}

interface Args {
  rootDir: string;
}

/**
 * Decorator class for the FileSystemWatcher.
 * Will expose the necessary members to the rest of the extension.
 */
export class PresetWatcher implements Disposable {
  private watcher: FileSystemWatcher;

  constructor({ targetManager }: Deps, { rootDir }: Args) {
    this.watcher = workspace.createFileSystemWatcher(
      new RelativePattern(rootDir, ENV_GLOB),
      true,
      false,
      true,
    );

    async function onPresetChange(changedPresetUri: Uri) {
      const currentPreset = await targetManager.getCurrentPreset();
      if (currentPreset === null) return;

      const changedPresetId = path.basename(changedPresetUri.fsPath);
      if (currentPreset.id !== changedPresetId) return;

      const preset = await makePreset(rootDir, changedPresetUri.fsPath);
      await targetManager.setCurrentPreset(preset);
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
