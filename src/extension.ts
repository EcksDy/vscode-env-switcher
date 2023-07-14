import { ExtensionContext, workspace } from 'vscode';
import CommandsHandler from './handlers/commandsHandler';
import FileSystemHandler from './handlers/fsHandler';
import EnvStatusBarItem from './status_bar_items/envStatusBarItem';
import { selectedEnvPresetEventEmitter } from './utilities/events';
import { EXTENSION_PREFIX } from './utilities/consts';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
const extensionEnabled = () =>
  workspace.getConfiguration(`${EXTENSION_PREFIX}`).get<boolean>('enabled');

export async function activate({ subscriptions, storagePath }: ExtensionContext) {
  if (!extensionEnabled()) return;

  // Making sure a workspace is opened so we can assert workspace related objects later
  if (storagePath === undefined) throw new Error('No workspace opened.');

  const fsHandler = await FileSystemHandler.build();
  const cmdHandler = new CommandsHandler(fsHandler);

  subscriptions.push(await EnvStatusBarItem.build(fsHandler));
  subscriptions.push(...cmdHandler.getRegisteredCommands());
  subscriptions.push(selectedEnvPresetEventEmitter);
}

export function deactivate() {}
