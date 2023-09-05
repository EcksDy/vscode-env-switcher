import { ExtensionContext, WorkspaceFolder, commands, workspace } from 'vscode';
import { selectEnvPreset } from './command-implementations';
import { FsPresetManager, MementoCurrPresetPersister, TargetManager } from './managers';
import { StatusBarButton } from './ui-components';
import { SELECT_ENV_COMMAND_ID, config, fsHelper } from './utilities';
import { FileWatcher } from './watchers';

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
