import * as vscode from 'vscode';
import { createSelectEnvCommand } from './command';
import FileSystemHandler from './fsHandler';

export async function activate({ subscriptions }: vscode.ExtensionContext) {
  const fsHandler = await vscode.workspace.findFiles('**/.env', undefined, 1).then((results) => {
    const envFile = results[0];

    // Extension activation event will trigger only on a workspace with ".env" file in it,
    // so we can assert that workspace folders are not undefined
    return new FileSystemHandler(vscode.workspace.workspaceFolders!, envFile);
  });

  fsHandler.backupEnvCurrentFile();

  const statusBar = await createStatusBar(fsHandler);
  const command = createSelectEnvCommand(statusBar, fsHandler);

  subscriptions.push(statusBar);
  subscriptions.push(command);
}

export function deactivate() {}
