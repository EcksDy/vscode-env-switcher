import { Disposable, commands } from 'vscode';
import { SELECT_ENV_COMMAND_ID } from './consts';
import selectEnvPreset from '../command_implementations/selectEnvPreset';
import { FileSystemHandler } from '../handlers';
import { selectedEnvPresetEventEmitter } from './events';
import EnvStatusBarItem from '../status_bar_items/envStatusBarItem';
import { EnvHandler } from '../handlers/envHandler';

interface InitializationDeps {
  subscriptions: Disposable[];
}

export async function initialize({ subscriptions }: InitializationDeps) {
  const fsHandler = new FileSystemHandler();
  const envHandler = await EnvHandler.build({ fsHandler });
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      envHandler,
      rootDir: fsHandler.rootDir,
    }),
  );
  subscriptions.push(selectEnvPresetCmd);

  subscriptions.push(await EnvStatusBarItem.build({ envHandler }));
  subscriptions.push(selectedEnvPresetEventEmitter);
}
