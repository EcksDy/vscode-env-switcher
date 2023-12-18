/* eslint-disable @typescript-eslint/require-await */
import path from 'path';
import { DependencyContainer } from 'tsyringe';
import { ConfigurationChangeEvent, Uri, WorkspaceFolder, workspace } from 'vscode';
import { WorkspaceBase, WorkspaceConfigSource } from 'vscode-helpers';
import { IPresetManager, Preset, PresetInfo } from '../interfaces';
import { FsPresetManager, MementoPersister } from '../managers';
import { FileWatcher } from '../watchers';
import { EXTENSION_PREFIX } from './consts';

export class Workspace extends WorkspaceBase implements IPresetManager {
  private _configSource: WorkspaceConfigSource;

  constructor(
    workspaceFolder: WorkspaceFolder,
    private fileWatcher: FileWatcher,
    private fsPresetManager: FsPresetManager,
    private persistanceManager: MementoPersister,
    private container: DependencyContainer,
  ) {
    super(workspaceFolder);

    this.fileWatcher = fileWatcher;
    this._configSource = {
      section: EXTENSION_PREFIX,
      resource: Uri.file(path.join(this.rootPath, '.vscode/settings.json')),
    };

    this._DISPOSABLES.push(this.fileWatcher, this.fsPresetManager);
  }

  public get configSource() {
    return this._configSource;
  }

  public static async build(
    workspaceFolder: WorkspaceFolder,
    container: DependencyContainer,
  ): Promise<Workspace> {
    try {
      const fileWatcher = new FileWatcher({ workspaceFolder });
      container.registerInstance(FileWatcher, fileWatcher);

      const persistanceManager = container.resolve(MementoPersister);
      const fsPresetManager = container.resolve(FsPresetManager);

      console.log(`\n`);
      console.log(`${workspaceFolder.name}: fileWatcher`, fileWatcher);
      console.log(`${workspaceFolder.name}: persistanceManager`, persistanceManager);
      console.log(`${workspaceFolder.name}: fsPresetManager`, fsPresetManager);

      const rootDir = workspaceFolder.uri.fsPath;
      await fsPresetManager.setup({ rootDir });

      const workspace = new Workspace(
        workspaceFolder,
        fileWatcher,
        fsPresetManager,
        persistanceManager,
        container,
      );
      return workspace;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async onDidChangeConfiguration(e: ConfigurationChangeEvent) {
    const config = workspace.getConfiguration(
      this.configSource.section,
      this.configSource.resource,
    );
  }

  public async getCurrentPreset() {
    return this.fsPresetManager.getCurrentPreset();
  }

  public async getPresets(): Promise<Preset[]> {
    return this.fsPresetManager.getPresets();
  }

  public async setCurrentPreset(preset: PresetInfo | Preset | string | null): Promise<void> {
    await this.fsPresetManager.setCurrentPreset(preset);
  }

  /**
   * TODO: Implement, now returns false
   */
  public isMonoRepo() {
    return false;
  }

  public dispose(): void {
    super.dispose();
  }
}
