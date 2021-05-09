import { ExtensionContext, workspace, commands, WorkspaceFolder } from 'vscode';
import { SELECT_ENV_COMMAND_ID, settings } from './utilities';
import { selectEnvPreset } from './commands';
import { StatusBarButton } from './ui_components';
import { memento } from './persistance_managers';
import { TargetManager } from './target_manager';
import { FsPresetProvider } from './preset_providers';
import { TargetManagerApi, IButton } from './interfaces';

async function onTargetGlobSettingChange(
  this: { targetManager: TargetManagerApi; button: IButton },
  targetGlob: string,
) {
  await this.targetManager.setTarget(targetGlob);
  this.button.setText();
}

export async function activate({ subscriptions, workspaceState }: ExtensionContext) {
  // I can make this assertion, because extension won't activate if there's no workspace folder open
  const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];
  const rootDir = rootFolder.uri.fsPath;

  /* MANAGERS */
  const persistanceManager = memento({
    state: workspaceState,
  });
  const targetManager = new TargetManager(
    {
      persistanceManager,
    },
    {
      rootDir,
      targetGlob: settings.target.glob(),
    },
  );

  /* PROVIDERS */
  const presetProvider = new FsPresetProvider(
    {
      targetManager,
    },
    { rootDir },
  );

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton({
    preset: (await targetManager.getCurrentPreset()) ?? undefined,
  });

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      targetManager,
      presetProvider,
      button: statusBarButton,
    }),
  );

  /* EVENTS */
  settings.target.onChange(
    onTargetGlobSettingChange.bind({
      targetManager,
      button: statusBarButton,
    }),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(selectEnvPresetCmd, statusBarButton, presetProvider);
}

export function deactivate() {}
