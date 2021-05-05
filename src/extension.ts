import { ExtensionContext, workspace, commands, WorkspaceFolder } from 'vscode';
import { SELECT_ENV_COMMAND_ID } from './user_interfaces/vs_code/utilities/consts';
import { selectEnvPreset } from './user_interfaces/vs_code/commands/selectEnvPreset';
import EnvStatusBarButton from './user_interfaces/vs_code/ui_components/envStatusBarButton';
import { getConfig } from './config';
import { vsCodeUiConfig } from './user_interfaces/vs_code';
import {
  FileSystemStorageManager,
  fsStorageConfig,
  onTargetPresetChangedEvent,
} from './data_storage/fs';

export async function activate({ subscriptions }: ExtensionContext) {
  const config = getConfig(vsCodeUiConfig, fsStorageConfig);

  if (!config.ui.enabled()) return;

  const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];
  const storageManager = new FileSystemStorageManager({
    config: config.storage,
    rootDir: rootFolder.uri.fsPath,
  });

  /* UI COMPONENTS */
  const statusBarButton = new EnvStatusBarButton(
    {
      config: config.ui,
      onTargetPresetChangedEvent,
    },
    { text: (await storageManager.getCurrentPresetId()) ?? undefined },
  );

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      storageManager,
      button: statusBarButton,
    }),
  );

  /* REGISTRATION */
  subscriptions.push(storageManager, selectEnvPresetCmd, statusBarButton);
}

export function deactivate() {}
