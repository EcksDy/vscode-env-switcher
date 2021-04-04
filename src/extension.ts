import { ExtensionContext } from 'vscode';
import CommandsHandler from './handlers/commandsHandler';
import FileSystemHandler from './handlers/fsHandler';
import EnvStatusBarItem from './status_bar_items/envStatusBarItem';
import { selectedEnvPresetEventEmitter } from './utilities/events';
import { extensionEnabled } from './utilities/config';

export async function activate({ subscriptions, storagePath }: ExtensionContext) {
  if (!extensionEnabled) return;

  // Making sure a workspace is opened so we can assert workspace related objects later
  if (storagePath === undefined) return;

  const fsHandler = await FileSystemHandler.build();
  const cmdHandler = new CommandsHandler(fsHandler);

  subscriptions.push(await EnvStatusBarItem.build(fsHandler));
  subscriptions.push(...cmdHandler.getRegisteredCommands());
  subscriptions.push(selectedEnvPresetEventEmitter);
}

export function deactivate() {}
