import { ExtensionContext, WorkspaceFolder, commands, workspace } from 'vscode';
import { StatusBarButton } from './ui-components/env-status-bar-item';
import { config } from './utilities/config';
import { MementoCurrPresetPersister } from './managers/memento-curr-preset-persister';
import { SELECT_ENV_COMMAND_ID, fsHelper } from './utilities';
import { FsPresetManager } from './managers/fs-preset-manager';
import { FileWatcher } from './watchers/file-watcher';
import { TargetManager } from './managers/target-manager';
import { selectEnvPreset } from './command-implementations/select-env-preset';

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
