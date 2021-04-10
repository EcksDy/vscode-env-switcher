import {
  workspace,
  RelativePattern,
  WorkspaceFolder,
  Disposable,
  FileSystemWatcher,
  Uri,
} from 'vscode';
import path from 'path';
import { IEnvTagReader, IEnvContentWithTagWriter } from '../interfaces';

const ENV_GLOB = '**.env';

async function onPresetChange(
  this: {
    envHandler: IEnvHandler;
  },
  changedPresetUri: Uri,
) {
  let currentEnvTag;
  try {
    currentEnvTag = await this.envHandler.getCurrentEnvFileTag();
  } catch (error) {
    return;
  }
  const changedPresetTag = path.basename(changedPresetUri.fsPath);
  if (currentEnvTag !== changedPresetTag) return;

  await this.envHandler.setEnvContentWithTag(changedPresetUri, changedPresetTag);
}

interface IEnvHandler extends IEnvTagReader, IEnvContentWithTagWriter {}

interface PresetChangeWatcherDeps {
  rootDir: WorkspaceFolder;
  envHandler: IEnvHandler;
}

/**
 * Decorator class for the FileSystemWatcher.
 * Will expose the necessary members to the rest of the extension.
 */
export class PresetChangeWatcher implements Disposable {
  private watcher: FileSystemWatcher;

  constructor({ rootDir, envHandler }: PresetChangeWatcherDeps) {
    this.watcher = workspace.createFileSystemWatcher(
      new RelativePattern(rootDir, ENV_GLOB),
      true,
      false,
      true,
    );

    this.watcher.onDidChange(onPresetChange.bind({ envHandler }));
  }

  /**
   * Exposing the original dispose, so FileSystemWatcher can be registered in extension subscriptions.
   */
  public dispose() {
    this.watcher.dispose();
  }
}
