import * as vscode from "vscode";
import { FileSystemHandler } from "./fsHandler";
import { SELECT_ENV_COMMAND_ID, FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN } from "./consts";
import { updateStatusBar } from "./statusBar";
import * as path from "path";

export interface QuickPickItemExtended extends vscode.QuickPickItem {
  filePath: vscode.Uri;
}

export function createSelectEnvCommand(
  statusBar: vscode.StatusBarItem,
  fsHandler: FileSystemHandler,
) {
  const selectEnvCommand = vscode.commands.registerCommand(SELECT_ENV_COMMAND_ID, async () => {
    const envFileQuickPickList: vscode.QuickPickItem[] = [];
    const envFiles = await fsHandler.findAllEnvFiles();

    envFiles.forEach((file) => {
      const fileName = file.split(".")[0];
      const fileLabel = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const envFileQuickPick: QuickPickItemExtended = {
        description: `${path.sep}${file}`,
        label: fileLabel,
        filePath: vscode.Uri.parse(`${fsHandler.root}${path.sep}${file}`),
      };

      envFileQuickPickList.push(envFileQuickPick);
    });

    const selectedEnv: QuickPickItemExtended | undefined = (await vscode.window.showQuickPick(
      envFileQuickPickList,
    )) as QuickPickItemExtended | undefined;

    if (selectedEnv === undefined) {
      return;
    }

    const setCurrentEnvHeader = `${FILE_HEADER_START_TOKEN}${selectedEnv.label}${FILE_HEADER_END_TOKEN}\n`;
    const headerBuffer = Buffer.from(setCurrentEnvHeader);
    const selectedFileContent = fsHandler.readFile(selectedEnv.filePath);

    fsHandler.writeFile(fsHandler.rootEnvFile, Buffer.concat([headerBuffer, selectedFileContent]));

    updateStatusBar(selectedEnv, statusBar);
  });

  return selectEnvCommand;
}
