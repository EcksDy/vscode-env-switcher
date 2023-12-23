import * as nodePath from 'path';
import { inject, injectable } from 'tsyringe';
import { Disposable } from 'vscode';
import {
  IFileWatcher,
  IPresetManager,
  IWorkspacePersister,
  Preset,
  PresetInfo,
} from '../interfaces';
import { capitalize, config, fsHelper, SwitcherEvents, getEventEmitter } from '../utilities';
import { FileWatcher } from '../watchers';
import { MementoPersister } from './memento-persister';
import { SelectedPreset } from '../ui-components';

interface SetupArgs {
  rootDir: string;
}

@injectable()
export class FsPresetManager implements IPresetManager {
  private rootDir = '';
  private eventEmitter = getEventEmitter();
  // private presetCache: Record<string, Preset> = {};

  private garbage: Disposable[] = [];

  constructor(
    @inject(MementoPersister) private persister: IWorkspacePersister,
    @inject(FileWatcher) private fileWatcher: IFileWatcher & Disposable,
  ) {
    this.persister = persister;
    this.fileWatcher = fileWatcher;

    // TODO: Extract to WorkspaceContainer level, catch event once and find the correct workspace
    this.eventEmitter.on(SwitcherEvents.PresetSelected, async (selectedPreset: SelectedPreset) => {
      console.debug(`[FsPresetManager - ${SwitcherEvents.PresetSelected}]`, { ...selectedPreset });
      const { presetPath, projectPath } = selectedPreset;
      if (this.rootDir !== projectPath)
        return console.debug(
          `[FsPresetManager - ${SwitcherEvents.PresetSelected}] - project mismatch, skipping`,
          projectPath,
          this.rootDir,
        );

      try {
        await this.setCurrentPreset(presetPath);
      } catch (error) {
        console.error(error);
        this.eventEmitter.emit(SwitcherEvents.PresetSelectedError, error.message, selectedPreset);
      }
    });

    this.garbage.push(this.fileWatcher);
  }

  async setup({ rootDir }: SetupArgs) {
    this.rootDir = rootDir;

    const currentPresetPath = this.persister.getPresetInfo()?.path;
    const isSynced = await this.isCurrentPresetSynced();
    if (currentPresetPath && isSynced) this.setFileWatcher(currentPresetPath);
  }

  async getCurrentPreset(): Promise<Preset | null> {
    const presetInfo = this.persister.getPresetInfo();
    if (!presetInfo) return null;

    const isSynced = await this.isCurrentPresetSynced();
    if (!isSynced) return null;

    const preset = await this.getCurrentPresetWithoutValidation();
    return preset;
  }

  async setCurrentPreset(preset: PresetInfo | Preset | string | null): Promise<void> {
    if (!preset) {
      this.persister.setPresetInfo(null);
      this.eventEmitter.emit(SwitcherEvents.TargetChanged, null);
      this.dispose();
      return;
    }

    const newPreset = await this.getPresetFromOverloadedParameter(preset);
    this.persister.setPresetInfo(newPreset);
    this.eventEmitter.emit(SwitcherEvents.TargetChanged, newPreset); // TODO: check if this is needed

    if (!newPreset) return this.dispose();

    this.setFileWatcher(newPreset.path);
    await this.writeToTarget(newPreset.content);
    this.eventEmitter.emit(SwitcherEvents.TargetChanged, newPreset);
  }

  async getPresets() {
    const paths = await fsHelper.findFiles(config.presets.glob(), config.presets.excludeGlob());
    const validatedPaths = await this.validatePaths(paths);
    return this.makePresets(this.rootDir, validatedPaths);
  }

  dispose() {
    this.garbage.forEach((disposable) => disposable.dispose());
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

  private async isCurrentPresetSynced() {
    const presetInfo = this.persister.getPresetInfo();
    if (!presetInfo) return false;

    const isPresetExists = await fsHelper.exists(presetInfo.path);
    if (!isPresetExists) return void this.persister.setPresetInfo(null) ?? false;

    const targetFile = await this.getTargetFile();
    if (!targetFile) return false;

    const targetFileContent = await fsHelper.decodeFile(targetFile);
    const isDifferent = await this.hasChanged(
      presetInfo.path,
      fsHelper.generateChecksum(targetFileContent),
    );
    if (isDifferent) return false;

    return true;
  }

  private async getCurrentPresetWithoutValidation(): Promise<Preset | null> {
    const presetInfo = this.persister.getPresetInfo();
    if (!presetInfo) return null;

    const content = await fsHelper.readFile(presetInfo.path);
    const preset = { ...presetInfo, content };
    return preset;
  }

  private setFileWatcher(path: string) {
    this.fileWatcher.watchFile(path, {
      onDidChange: this.onCurrentPresetChange.bind(this),
      onDidDelete: this.onCurrentPresetDelete.bind(this),
    });
  }

  private async onCurrentPresetChange(changedFile: string) {
    const currentPreset = await this.getCurrentPresetWithoutValidation();
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
    const currentPreset = await this.getCurrentPresetWithoutValidation();
    if (!currentPreset) return;

    this.persister.setPresetInfo(null);
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
    const targetFile = await this.getTargetFile();
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

  private async writeToTarget(content: string | Uint8Array): Promise<void> {
    const targetFile = await fsHelper.findTarget(config);
    if (!targetFile) return console.warn('No target file found');

    await fsHelper.writeFile(targetFile, content);
  }

  private async getTargetFile(): Promise<string | null> {
    return await fsHelper.findTarget(config);
  }
}

function isPreset(preset: Preset | PresetInfo): preset is Preset {
  return !!(preset as Preset).content;
}
