import * as vscode from "vscode";
import {
  LABEL_PREFIX,
  SELECT_ENV_COMMAND_ID,
  FILE_HEADER_START_TOKEN,
  FILE_HEADER_END_TOKEN,
  BUTTON_DEFAULT,
} from "./consts";
import { FileSystemHandler } from "./fsHandler";
import { QuickPickItemExtended } from "./command";

export async function createStatusBar(fsHandler: FileSystemHandler) {
  const envStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

  const currentEnv = await fsHandler.findCurrentEnvFile();
  const stream = fsHandler.streamFile(vscode.Uri.parse(currentEnv[0]));

  const firstLine = await fsHandler.readHeaderAsync(stream);

  envStatusBar.command = SELECT_ENV_COMMAND_ID;
  try {
    envStatusBar.text = templateLabel(cleanHeaderLine(firstLine));
  } catch (error) {
    envStatusBar.text = templateLabel(BUTTON_DEFAULT);
    console.warn(`Warning: ${error.message}`);
  }
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
  if (
    [FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN].every(
      (token) => headerLine.indexOf(token) !== -1,
    )
  ) {
    return headerLine.split(FILE_HEADER_START_TOKEN)[1].split(FILE_HEADER_END_TOKEN)[0];
  }
  throw new Error("No descriptive headers found in .env");
}

function templateLabel(env: string) {
  const isProd = env.toLowerCase().indexOf("prod") !== -1;
  return `${LABEL_PREFIX}${isProd ? `$(issue-opened) ${env.toUpperCase()} $(issue-opened)` : env}`;
}
