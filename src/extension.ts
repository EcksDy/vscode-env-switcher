import * as vscode from "vscode";
import { createSelectEnvCommand } from "./command";
import { FileSystemHandler } from "./fsHandler";
import { createStatusBar } from "./statusBar";

export async function activate({ subscriptions }: vscode.ExtensionContext) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }
  const fsHandler = new FileSystemHandler(vscode.workspace.workspaceFolders);
  if ((await fsHandler.findCurrentEnvFile()).length === 0) {
    return;
  }
  fsHandler.backupEnvCurrentFile();

  const statusBar = await createStatusBar(fsHandler);
  const command = createSelectEnvCommand(statusBar, fsHandler);

  subscriptions.push(statusBar);
  subscriptions.push(command);
}

export function deactivate() {}
