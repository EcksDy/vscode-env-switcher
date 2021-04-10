import { Disposable, commands } from 'vscode';
import { SELECT_ENV_COMMAND_ID } from './utilities/consts';
import { selectEnvPreset } from './command_implementations/selectEnvPreset';
import { FileSystemHandler } from './handlers';
import { selectedEnvPresetEventEmitter } from './utilities/events';
import EnvStatusBarButton from './status_bar_items/envStatusBarItem';
import { EnvHandler } from './handlers/envHandler';
import { PresetChangeWatcher } from './watchers/presetChangeWatcher';

interface InitializationDeps {
  subscriptions: Disposable[];
}

export async function initialize({ subscriptions }: InitializationDeps) {
  const fsHandler = new FileSystemHandler();
  const envHandler = await EnvHandler.build({ fsHandler });

  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      envHandler,
      rootDir: fsHandler.rootDir.uri,
    }),
  );
  const statusBarButton = await EnvStatusBarButton.build({ envHandler });
  const presetChangeWatcher = new PresetChangeWatcher({
    rootDir: fsHandler.rootDir,
    envHandler,
  });

  subscriptions.push(selectedEnvPresetEventEmitter);
  subscriptions.push(selectEnvPresetCmd);
  subscriptions.push(statusBarButton);
  subscriptions.push(presetChangeWatcher);
}
