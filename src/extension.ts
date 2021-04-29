import { ExtensionContext, workspace, commands, WorkspaceFolder } from 'vscode';
import {
  SELECT_ENV_COMMAND_ID,
  EXTENSION_PREFIX,
} from './user_interfaces/vs_code/utilities/consts';
import { selectEnvPreset } from './user_interfaces/vs_code/commands/selectEnvPreset';
import { FileSystemHandler, EnvHandler, EventHandlers } from './handlers';
import EnvStatusBarButton from './user_interfaces/vs_code/ui_components/envStatusBarButton';
import { PresetWatcher } from './user_interfaces/vs_code/watchers';
import { Switcher } from './switcher';
import { getConfig } from './config';
import { vsCodeUiConfig } from './user_interfaces/vs_code';
import {
  FileSystemStorageManager,
  fsStorageConfig,
  targetPresetChangedEvent,
} from './data_storage/fs';

export async function activate({ subscriptions }: ExtensionContext) {
  const config = getConfig(vsCodeUiConfig, fsStorageConfig);

  if (!config.ui.enabled()) return;

  const [rootFolder] = workspace.workspaceFolders as WorkspaceFolder[];
  const storageManager = new FileSystemStorageManager({
    config: config.storage,
    rootDir: rootFolder.uri.fsPath,
  });

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      envHandler,
      rootDir: fsHandler.rootDir.uri,
    }),
  );

  /* UI COMPONENTS */
  const statusBarButton = await EnvStatusBarButton.build({ envHandler });

  /* WATCHERS */
  const presetChangeWatcher = new PresetWatcher({
    rootDir: fsHandler.rootDir,
    envHandler,
  });

  /* EVENT HANDLERS */
  const selectedEnvPresetEventHandler = EventHandlers.SelectedEnvPreset.register({
    setter: statusBarButton,
  });
  const targetEnvChangedEventHandler = EventHandlers.TargetEnvChanged.register({
    setter: statusBarButton,
  });

  /* REGISTRATION */
  subscriptions.push(
    selectedEnvPresetEventHandler,
    targetEnvChangedEventHandler,
    selectEnvPresetCmd,
    statusBarButton,
    presetChangeWatcher,
  );
}

export function deactivate() {}
