import { Disposable } from 'vscode';
import { settings } from './utilities';
import { getPresetPaths, makePresets, removePotentialTargetFiles } from './handlers';
import { PresetWatcher } from './watchers/presetWatcher';
import { TargetManagerApi } from '../../interfaces';

interface Deps {
  targetManager: TargetManagerApi;
}

interface Args {
  rootDir: string;
}

export class FsPresetProvider {
  private rootDir: string;

  private garbage: Disposable[];

  constructor({ targetManager }: Deps, { rootDir }: Args) {
    this.rootDir = rootDir;

    const presetWatcher = new PresetWatcher({ targetManager }, { rootDir });
    this.garbage = [presetWatcher];
  }

  async getPresets() {
    const paths = await getPresetPaths(settings.presetsGlob());
    const presetPaths = removePotentialTargetFiles(paths);
    return makePresets(this.rootDir, presetPaths);
  }

  dispose() {
    for (const disposable of this.garbage) {
      disposable.dispose();
    }
  }
}
