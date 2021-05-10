import { getContent, getPath, setContent, hasChanged } from './helpers';
import { TargetManagerApi, IPersistanceManager, Preset } from '../interfaces';

interface Deps {
  persistanceManager: IPersistanceManager;
}

interface Args {
  rootDir: string;
  targetGlob: string;
}

export class TargetManager implements TargetManagerApi {
  protected rootDir: string;

  private targetGlob: string;

  private persistanceManager: IPersistanceManager;

  constructor({ persistanceManager }: Deps, { rootDir, targetGlob }: Args) {
    this.rootDir = rootDir;
    this.targetGlob = targetGlob;
    this.persistanceManager = persistanceManager;
  }

  static async build(deps: Deps, args: Args) {
    const currentPresetPath = await getPath(args.targetGlob);
    const presetInfo = deps.persistanceManager.get();
    const shouldResetPersistance =
      currentPresetPath === null ||
      presetInfo === null ||
      (await hasChanged(currentPresetPath, presetInfo.checksum));

    if (shouldResetPersistance) {
      deps.persistanceManager.set(null);
    }

    return new TargetManager(deps, args);
  }

  /**
   * Returns the currently selected preset.
   * Returns null if target file or preset tag not found.
   */
  async getCurrentPreset(): Promise<Preset | null> {
    const presetInfo = this.persistanceManager.get();
    if (presetInfo === null) return null;

    const presetContent = await getContent(presetInfo.path);
    return {
      ...presetInfo,
      content: presetContent ?? '',
    };
  }

  async setCurrentPreset(preset: Preset) {
    const currentPresetPath = await getPath(this.targetGlob);
    if (currentPresetPath === null) {
      this.persistanceManager.set(null);
      throw new Error(`No current preset file found.`);
    }

    this.persistanceManager.set(preset);
    await setContent(currentPresetPath, preset.content);
  }

  setTarget(targetGlob: string) {
    this.targetGlob = targetGlob;
    this.persistanceManager.set(null);
  }
}
