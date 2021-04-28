import { ExtensionContext, workspace, commands } from 'vscode';
import {
  SELECT_ENV_COMMAND_ID,
  EXTENSION_PREFIX,
} from './user_interfaces/vs_code/utilities/consts';
import { selectEnvPreset } from './user_interfaces/vs_code/commands/selectEnvPreset';
import { FileSystemHandler, EnvHandler, EventHandlers } from './handlers';
import EnvStatusBarButton from './user_interfaces/vs_code/ui_components/envStatusBarButton';
import { PresetWatcher } from './user_interfaces/vs_code/watchers';
import vsCodeUiConfig from './user_interfaces/vs_code/config';
import { Switcher } from './switcher';

export async function activate({ subscriptions }: ExtensionContext) {
  if (!vsCodeUiConfig.enabled()) return;

  /* HANDLERS */
  const fsHandler = new FileSystemHandler();
  const switcher = new Switcher({});

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
