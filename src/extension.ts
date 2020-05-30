import { ExtensionContext } from 'vscode';
import CommandsHandler from './handlers/commandsHandler';
import FileSystemHandler from './handlers/fsHandler';
import StatusBarHandler from './handlers/statusBarHandler';
import { selectedEnvPresetEventEmitter } from './utilities/events';

export async function activate({ subscriptions }: ExtensionContext) {
  const fsHandler = await FileSystemHandler.build();
  const statusBarHandler = await StatusBarHandler.build(fsHandler);
  const cmdHandler = new CommandsHandler(fsHandler);

  subscriptions.push(statusBarHandler.getStatusBarItem());
  subscriptions.push(...cmdHandler.getRegisteredCommands());
}

export function deactivate() {
  selectedEnvPresetEventEmitter.dispose();
}
