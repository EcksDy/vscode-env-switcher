import {
  ExtensionContext,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  WorkspaceFolder,
  commands,
  window,
  workspace,
  Command,
  EventEmitter,
  Event,
} from 'vscode';
import { StatusBarButton } from './ui-components/env-status-bar-item';
import { config } from './utilities/config';
import { MementoCurrPresetPersister } from './managers/memento-curr-preset-persister';
import { SELECT_ENV_COMMAND_ID, fsHelper } from './utilities';
import { FsPresetManager } from './managers/fs-preset-manager';
import { FileWatcher } from './watchers/file-watcher';
import { TargetManager } from './managers/target-manager';
import { selectEnvPreset } from './command-implementations/select-env-preset';
import path from 'path';

export async function activate({ subscriptions, workspaceState }: ExtensionContext) {
  // Allows disabling per workspace
  if (!config.enabled()) return;
  // Will not initialize if no target file is found
  if (!(await fsHelper.findTarget(config))) return;

  // I can make this assertion, because extension won't activate if there's no workspace folder open
  const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];
  const rootDir = rootFolder.uri.fsPath;

  /* WATCHER */
  const fileWatcher = new FileWatcher({ workspaceFolder: rootFolder });

  /* MANAGERS */
  const persistanceManager = new MementoCurrPresetPersister({
    state: workspaceState,
  });

  const targetManager = new TargetManager({ config });
  const fsPresetManager = await FsPresetManager.build(
    {
      config,
      targetManager,
      persister: persistanceManager,
      fileWatcher,
    },
    { rootDir },
  );

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton(
    { config, fileWatcher },
    {
      preset: (await fsPresetManager.getCurrentPreset()) ?? undefined,
    },
  );

  window.registerTreeDataProvider('preset-panel', new PresetPanelProvider());

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      config,
      presetManager: fsPresetManager,
      button: statusBarButton,
    }),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(selectEnvPresetCmd, statusBarButton, fsPresetManager);
}

export function deactivate() {}

class Preset extends TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', 'images', 'env-switcher-for-light-theme.png'),
    dark: path.join(__filename, '..', 'images', 'env-switcher-for-dark-theme.png'),
  };

  contextValue = 'smthing';
}

class Project extends TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
    public readonly children?: Preset[],
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', 'images', 'env-switcher-for-light-theme.png'),
    dark: path.join(__filename, '..', 'images', 'env-switcher-for-dark-theme.png'),
  };

  contextValue = 'smthing';
}

class PresetPanelProvider implements TreeDataProvider<Project> {
  private _onDidChangeTreeData: EventEmitter<Project | undefined | void> = new EventEmitter<
    Project | undefined | void
  >();
  readonly onDidChangeTreeData: Event<Project | undefined | void> = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Project): TreeItem {
    return element;
  }

  getChildren(element?: Project): Thenable<Project[]> {
    if (element) {
      return new Promise<Project[]>((resolve) => {
        resolve([
          new Project('Project 1', '1.0.0', TreeItemCollapsibleState.Expanded, undefined, [
            new Preset('test', '1.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '2.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '3.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '4.0.0', TreeItemCollapsibleState.None),
          ]),
          new Project('Project 2', '1.0.0', TreeItemCollapsibleState.Expanded, undefined, [
            new Preset('test', '1.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '2.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '3.0.0', TreeItemCollapsibleState.None),
            new Preset('test', '4.0.0', TreeItemCollapsibleState.None),
          ]),
        ]);
      });
    }
    return new Promise<Project[]>((resolve) => {
      resolve([]);
    });
  }
}
