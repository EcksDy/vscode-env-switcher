import {
  workspace,
  RelativePattern,
  WorkspaceFolder,
  Disposable,
  FileSystemWatcher,
  Uri,
} from 'vscode';
import path from 'path';
import { EXTENSION_PREFIX } from '../utilities/consts';
import { IEnvTagReader, IEnvContentWithTagWriter } from '../interfaces';

const ENV_GLOB = '**.env';

/**
 * Will get the extension `targetEnvGlob` config from workspace settings, with global settings fallback.
 */
function getTargetEnvGlob() {
  const targetEnvGlob = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get('targetEnvGlob') as string;
  return targetEnvGlob !== '' ? targetEnvGlob : ENV_GLOB;
}

async function onPresetChange(
  this: {
    envHandler: IEnvHandler;
  },
  changedPresetUri: Uri,
) {
  const currentEnvTag = await this.envHandler.getCurrentEnvFileTag();
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
      new RelativePattern(rootDir, getTargetEnvGlob()),
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
