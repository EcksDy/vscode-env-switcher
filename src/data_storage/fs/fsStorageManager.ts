import { Disposable } from 'vscode';
import { FsStorageConfig } from './config';
import * as fsHandler from './handlers/fsHandler';
import { PresetWatcher } from './watchers/presetWatcher';
import TargetPresetChanged from './events/targetPresetChangedEvent';

async function onTargetGlobConfigChange(this: FileSystemStorageManager) {
  const newCurrentPresetPath = await fsHandler.getCurrentPresetPath(this.config.targetGlob());

  if (newCurrentPresetPath === null) {
    return;
  }

  const newCurrentPresetId = await fsHandler.getPresetTag(newCurrentPresetPath);
  if (newCurrentPresetId === null) {
    TargetPresetChanged.emitter.fire(null);
  }

  TargetPresetChanged.emitter.fire(newCurrentPresetId);
}

interface FsStorageDeps {
  config: FsStorageConfig;
  rootDir: string;
}

export class FileSystemStorageManager implements IStorage, Disposable {
  protected rootDir: string;

  protected config: FsStorageConfig;

  private garbage: Disposable[];

  constructor({ config, rootDir }: FsStorageDeps) {
    this.rootDir = rootDir;
    this.config = config;
    const configListener = this.config.onChangeTargetGlobConfig(
      onTargetGlobConfigChange.bind(this),
    );
    const presetWatcher = new PresetWatcher({
      rootDir,
      storage: this,
    });
    this.garbage = [configListener, presetWatcher, TargetPresetChanged.emitter];
  }

  /**
   * Returns a IPreset[], using the configured preset glob.
   */
  async getPresets() {
    const paths = await fsHandler.getPresetPaths(this.config.presetsGlob());
    const presetPaths = fsHandler.removePotentialTargetFiles(paths);
    return fsHandler.makePresets(this.rootDir, presetPaths);
  }

  /**
   * Returns the currently selected preset.
   * Returns null if target file or preset tag not found.
   */
  async getCurrentPresetId() {
    const currentPresetPath = await fsHandler.getCurrentPresetPath(this.config.targetGlob());
    if (currentPresetPath === null) {
      return null;
    }

    return await fsHandler.getPresetTag(currentPresetPath);
  }

  async setCurrentPreset(preset: IPreset) {
    const currentPresetPath = await fsHandler.getCurrentPresetPath(this.config.targetGlob());
    if (currentPresetPath === null) {
      throw new Error(`No current preset file found.`);
    }
    const presetFilePath = fsHandler.findPresetFilePath(this.rootDir, preset.path, preset.id);
    if (presetFilePath === null) {
      throw new Error(`No preset file found.`);
    }
    await fsHandler.setCurrentPreset(currentPresetPath, presetFilePath, preset.id);
  }

  dispose() {
    for (const disposable of this.garbage) {
      disposable.dispose();
    }
  }
}
