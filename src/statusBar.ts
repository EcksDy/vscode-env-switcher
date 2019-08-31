import * as vscode from "vscode";
import {
  labelPrefix,
  selectEnvCommandId,
  fileHeaderStartToken,
  fileHeaderEndToken,
} from "./consts";
import { FileSystemHandler } from "./fsHandler";
import { QuickPickItemExtended } from "./command";

export async function createStatusBar(fsHandler: FileSystemHandler) {
  const envStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

  const currentEnv = await fsHandler.findCurrentEnvFile();
  const stream = fsHandler.streamFile(vscode.Uri.parse(`${fsHandler.root}\\${currentEnv}`));
  const firstLine = await fsHandler.readHeaderAsync(stream);

  envStatusBar.command = selectEnvCommandId;
  envStatusBar.text = templateLabel(cleanHeaderLine(firstLine));
  envStatusBar.show();

  return envStatusBar;
}

export function updateStatusBar(
  selectedEnv: QuickPickItemExtended,
  statusBar: vscode.StatusBarItem,
) {
  statusBar.text = templateLabel(selectedEnv.label);
}

function cleanHeaderLine(headerLine: string) {
  return headerLine.split(fileHeaderStartToken)[1].split(fileHeaderEndToken)[0];
}

function templateLabel(env: string) {
  const isProd = env.toLowerCase().indexOf("prod") !== -1;
  return `${labelPrefix}${isProd ? `$(issue-opened) ${env.toUpperCase()} $(issue-opened)` : env}`;
}
