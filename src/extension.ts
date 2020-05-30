import { ExtensionContext } from 'vscode';
import { createSelectEnvCommand } from './handlers/commands';
import { initFileSystemHandler } from './handlers/fsHandler';
import { initStatusBarHandler } from './handlers/statusBarHandler';
import { selectedEnvPresetEventEmitter } from './utilities/events';

export async function activate({ subscriptions }: ExtensionContext) {
  const fsHandler = await initFileSystemHandler();

  const statusBar = await initStatusBarHandler(fsHandler);
  const selectEnvCommand = createSelectEnvCommand(fsHandler);

  subscriptions.push(statusBar.getStatusBarItem());
  subscriptions.push(selectEnvCommand);
}

export function deactivate() {
  selectedEnvPresetEventEmitter.dispose();
}
