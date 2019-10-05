import * as vscode from "vscode";
import { createSelectEnvCommand } from "./command";
import { FileSystemHandler } from "./fsHandler";
import { createStatusBar } from "./statusBar";

export async function activate({ subscriptions }: vscode.ExtensionContext) {
  // Extension activation event will trigger only on a workspace with ".env" file in it,
  // so we can assert that workspace folders are not undefined
  const fsHandler = new FileSystemHandler(vscode.workspace.workspaceFolders!);
  fsHandler.backupEnvCurrentFile();

  const statusBar = await createStatusBar(fsHandler);
  const command = createSelectEnvCommand(statusBar, fsHandler);

  subscriptions.push(statusBar);
  subscriptions.push(command);
}

export function deactivate() {}
