/* eslint-disable @typescript-eslint/require-await */
import path from 'path';
import { ConfigurationChangeEvent, Memento, Uri, WorkspaceFolder, workspace } from 'vscode';
import { WorkspaceBase, WorkspaceConfigSource } from 'vscode-helpers';
import { FsPresetManager, MementoCurrPresetPersister, TargetManager } from '../managers';
import { FileWatcher } from '../watchers';
import { EXTENSION_PREFIX } from './consts';
import { IPresetManager, Preset, PresetInfo } from '../interfaces';

export class Workspace extends WorkspaceBase implements IPresetManager {
  private _configSrc: WorkspaceConfigSource;
  private _fileWatcher: FileWatcher;
  private _fsPresetManager: FsPresetManager;
  private _targetManager: TargetManager;
  private _persistanceManager: MementoCurrPresetPersister;

  constructor(
    workspaceFolder: WorkspaceFolder,
    fileWatcher: FileWatcher,
    fsPresetManager: FsPresetManager,
    targetManager: TargetManager,
    persistanceManager: MementoCurrPresetPersister,
  ) {
    super(workspaceFolder);

    this._fileWatcher = fileWatcher;
    this._fsPresetManager = fsPresetManager;
    this._targetManager = targetManager;
    this._persistanceManager = persistanceManager;
    this._configSrc = {
      section: EXTENSION_PREFIX,
      resource: Uri.file(path.join(this.rootPath, '.vscode/settings.json')),
    };

    this._DISPOSABLES.push(this._fileWatcher, this._fsPresetManager);
  }

  public get configSource() {
    return this._configSrc;
  }

  public get fileWatcher() {
    return this._fileWatcher;
  }

  public static async build(
    workspaceFolder: WorkspaceFolder,
    workspaceState: Memento,
  ): Promise<Workspace> {
    const fileWatcher = new FileWatcher({ workspaceFolder });

    const rootDir = workspaceFolder.uri.fsPath;

    const persistanceManager = new MementoCurrPresetPersister({
      state: workspaceState,
    });

    const targetManager = new TargetManager();
    const fsPresetManager = await FsPresetManager.build(
      {
        targetManager,
        persister: persistanceManager,
        fileWatcher,
      },
      { rootDir },
    );

    const workspace = new Workspace(
      workspaceFolder,
      fileWatcher,
      fsPresetManager,
      targetManager,
      persistanceManager,
    );
    return workspace;
  }

  public async onDidChangeConfiguration(e: ConfigurationChangeEvent) {
    const config = workspace.getConfiguration(
      this.configSource.section,
      this.configSource.resource,
    );
  }

  public async getCurrentPreset() {
    return this._fsPresetManager.getCurrentPreset();
  }

  public async getPresets(): Promise<Preset[]> {
    return this._fsPresetManager.getPresets();
  }

  public async setCurrentPreset(preset: PresetInfo | Preset | string | null): Promise<void> {
    await this._fsPresetManager.setCurrentPreset(preset);
  }

  public dispose(): void {
    super.dispose();
  }
}
