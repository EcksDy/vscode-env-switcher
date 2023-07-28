import * as nodePath from 'path';
import { Disposable } from 'vscode';
import {
  ICurrentPresetPersister,
  IFileWatcher,
  IPresetManager,
  ITargetManager,
  Preset,
  PresetInfo,
} from '../interfaces';
import { ExtensionConfig, capitalize, fsHelper } from '../utilities';

interface Deps {
  config: ExtensionConfig;
  targetManager: ITargetManager;
  persister: ICurrentPresetPersister;
  fileWatcher: IFileWatcher & Disposable;
}

interface Args {
  rootDir: string;
}

export class FsPresetManager implements IPresetManager {
  private config: ExtensionConfig;
  private rootDir: string;
  private persister: ICurrentPresetPersister;
  private targetManager: ITargetManager;
  private fileWatcher: IFileWatcher & Disposable;
  // private presetCache: Record<string, Preset> = {};

  private garbage: Disposable[] = [];

  constructor({ config, targetManager, persister, fileWatcher }: Deps, { rootDir }: Args) {
    this.rootDir = rootDir;
    this.persister = persister;
    this.targetManager = targetManager;
    this.fileWatcher = fileWatcher;
    this.config = config;

    const currentPresetPath = persister.get()?.path;
    if (currentPresetPath) this.setFileWatcher(currentPresetPath);

    this.garbage.push(this.fileWatcher);
  }

  async getCurrentPreset(): Promise<Preset | null> {
    const presetInfo = this.persister.get();
    if (!presetInfo) return null;

    const isPresetExists = await fsHelper.exists(presetInfo.path);
    if (!isPresetExists) return void this.persister.set(null) ?? null;

    const content = await fsHelper.readFile(presetInfo.path);
    const preset = { ...presetInfo, content };

    return preset;
  }

  async setCurrentPreset(preset: PresetInfo | Preset | string | null): Promise<void> {
    if (!preset) {
      this.persister.set(null);
      this.dispose();
      return;
    }

    const newPreset = await this.getPresetFromOverloadedParameter(preset);
    this.persister.set(newPreset);

    if (!newPreset) {
      this.dispose();
      return;
    }

    this.setFileWatcher(newPreset.path);

    await this.targetManager.writeToTarget(newPreset.content);
  }

  async getPresets() {
    const paths = await fsHelper.findFiles(
      this.config.presets.glob(),
      this.config.presets.excludeGlob(),
    );
    const validatedPaths = await this.validatePaths(paths);
    return this.makePresets(this.rootDir, validatedPaths);
  }

  dispose() {
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }

  private async getPresetByPath(presetPath: string) {
    const preset = await this.makePreset(this.rootDir, presetPath);
    return preset;
  }

  private async getPresetFromOverloadedParameter(preset: string | Preset | PresetInfo) {
    switch (typeof preset) {
      case `string`:
        return await this.getPresetByPath(preset);
      case `object`:
        return isPreset(preset)
          ? preset
          : { ...preset, content: await fsHelper.readFile(preset.path) };
      default:
        return null;
    }
  }

  private setFileWatcher(path: string) {
    this.fileWatcher.watchFile(path, {
      onDidChange: this.onCurrentPresetChange.bind(this),
      onDidDelete: this.onCurrentPresetDelete.bind(this),
    });
  }

  private async onCurrentPresetChange(changedFile: string) {
    const currentPreset = await this.getCurrentPreset();
    if (!currentPreset) return;
    if (currentPreset.path !== changedFile) return;

    try {
      const presetChanged = await this.hasChanged(changedFile, currentPreset.checksum);
      if (!presetChanged) return;

      await this.setCurrentPreset(changedFile);
    } catch (error) {
      console.error(error);
    }
  }

  private async onCurrentPresetDelete() {
    const currentPreset = await this.getCurrentPreset();
    if (!currentPreset) return;

    this.persister.set(null);
  }

  private async makePresets(rootDir: string, paths: string[]): Promise<Preset[]> {
    const presets = await Promise.all(
      paths.map((path): Promise<Preset> => this.makePreset(rootDir, path)),
    );
    presets.sort((a, b) => (a.title < b.title ? -1 : 1));
    return presets;
  }

  private async makePreset(rootDir: string, path: string): Promise<Preset> {
    const name = nodePath.basename(path);
    const title = capitalize(name);
    const description = nodePath.relative(rootDir, path);
    const content = await fsHelper.readFile(path);
    const contentString = fsHelper.decodeArray(content);
    const checksum = fsHelper.generateChecksum(contentString);

    return {
      name,
      title,
      description,
      path,
      content,
      checksum,
    };
  }

  private async validatePaths(paths: string[]) {
    const targetFile = await this.targetManager.getTargetFile();
    const excludedPaths = [targetFile];
    const currentPreset = await this.getCurrentPreset();
    if (currentPreset) excludedPaths.push(currentPreset.path);

    const validatedPaths = paths.filter((path) => !excludedPaths.includes(path));
    return validatedPaths;
  }

  private async hasChanged(path: string, previousChecksum: string) {
    const content = await fsHelper.decodeFile(path);
    const checksum = fsHelper.generateChecksum(content);
    return checksum !== previousChecksum;
  }
}

function isPreset(preset: Preset | PresetInfo): preset is Preset {
  return !!(preset as Preset).content;
}
