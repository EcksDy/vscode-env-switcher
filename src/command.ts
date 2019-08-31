import * as vscode from "vscode";
import { FileSystemHandler } from "./fsHandler";
import { selectEnvCommandId, fileHeaderStartToken, fileHeaderEndToken } from "./consts";
import { updateStatusBar } from "./statusBar";

export interface QuickPickItemExtended extends vscode.QuickPickItem {
  filePath: vscode.Uri;
}

export function createSelectEnvCommand(
  statusBar: vscode.StatusBarItem,
  fsHandler: FileSystemHandler,
) {
  const selectEnvCommand = vscode.commands.registerCommand(selectEnvCommandId, async () => {
    const envFileQuickPickList: vscode.QuickPickItem[] = [];
    const envFiles = await fsHandler.findAllEnvFiles();

    envFiles.forEach((file) => {
      const fileName = file.split(".")[0];
      const fileLabel = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const envFileQuickPick: QuickPickItemExtended = {
        label: fileLabel,
        filePath: vscode.Uri.parse(`${fsHandler.root}\\${file}`),
      };

      envFileQuickPickList.push(envFileQuickPick);
    });

    const selectedEnv: QuickPickItemExtended | undefined = (await vscode.window.showQuickPick(
      envFileQuickPickList,
    )) as QuickPickItemExtended | undefined;

    if (selectedEnv === undefined) {
      return;
    }

    const setCurrentEnvHeader = `${fileHeaderStartToken}${
      selectedEnv.label
    }${fileHeaderEndToken}\n`;
    const headerBuffer = new Buffer(setCurrentEnvHeader);
    const selectedFileContent = fsHandler.readFile(selectedEnv.filePath);

    fsHandler.writeFile(Buffer.concat([headerBuffer, selectedFileContent]));

    updateStatusBar(selectedEnv, statusBar);
  });

  return selectEnvCommand;
}
