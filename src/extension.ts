import { ExtensionContext } from 'vscode';
import BackupViewerContentProvider from './content_providers/backupViewerContentProvider';
import BackupHandler from './handlers/backupHandler';
import CommandsHandler from './handlers/commandsHandler';
import FileSystemHandler from './handlers/fsHandler';
import EnvStatusBarItem from './status_bar_items/envStatusBarItem';
import { selectedEnvPresetEventEmitter } from './utilities/events';

export async function activate({
  subscriptions,
  globalStoragePath,
  storagePath,
}: ExtensionContext) {
  // Making sure a workspace is opened so we can assert workspace related objects later
  if (storagePath === undefined) throw new Error('No workspace opened.');

  const fsHandler = await FileSystemHandler.build();
  const backupHandler = new BackupHandler(fsHandler, globalStoragePath, storagePath);
  const cmdHandler = new CommandsHandler(fsHandler, backupHandler);

  subscriptions.push(await EnvStatusBarItem.build(fsHandler));
  subscriptions.push(...cmdHandler.getRegisteredCommands());
  subscriptions.push(BackupViewerContentProvider.register(backupHandler));
  subscriptions.push(selectedEnvPresetEventEmitter);
}

export function deactivate() {}
