import { ExtensionContext, workspace, commands } from 'vscode';
import { SELECT_ENV_COMMAND_ID, EXTENSION_PREFIX } from './utilities/consts';
import { selectEnvPreset } from './command_implementations/selectEnvPreset';
import { FileSystemHandler, EnvHandler, EventHandlers } from './handlers';
import EnvStatusBarButton from './ui_components/envStatusBarButton';
import { PresetWatcher } from './watchers';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
const extensionEnabled = workspace
  .getConfiguration(`${EXTENSION_PREFIX}`)
  .get('enabled') as boolean;

export async function activate({ subscriptions }: ExtensionContext) {
  if (!extensionEnabled) return;

  /* HANDLERS */
  const fsHandler = new FileSystemHandler();
  const envHandler = await EnvHandler.build({ fsHandler });

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
