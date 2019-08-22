import * as vscode from "vscode";
import * as glob from "glob-promise";
import * as globTypes from "glob";
import { readFileSync, writeFileSync } from "fs";

let envSwitcherBar: vscode.StatusBarItem;
const prefix = ".env: ";
interface QuickPickItemExtended extends vscode.QuickPickItem {
  filePath: vscode.Uri;
}

export function activate({ subscriptions }: vscode.ExtensionContext) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }
  const commandId = "extension.envSwitch";
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const rootEnvFile = vscode.Uri.parse(`${vscode.workspace.workspaceFolders[0].uri.fsPath}\\.env`);

  envSwitcherBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  envSwitcherBar.command = commandId;
  envSwitcherBar.text = `${prefix}Default`;
  envSwitcherBar.show();
  subscriptions.push(envSwitcherBar);

  const globOptions: globTypes.IOptions = {
    cwd: root,
    root: root,
    nodir: true,
  };

  const envSwitcherCommand = vscode.commands.registerCommand(commandId, async () => {
    const envFileQuickPickList: vscode.QuickPickItem[] = [];
    const envFiles = await glob("*.env", globOptions);

    envFiles.forEach((file) => {
      const fileName = file.split(".")[0];
      const fileLabel = fileName.charAt(0).toUpperCase() + fileName.slice(1);

      const envFileQuickPick: QuickPickItemExtended = {
        label: fileLabel,
        filePath: vscode.Uri.parse(`${root}\\${file}`),
      };
      envFileQuickPickList.push(envFileQuickPick);
    });

    const selectedEnv: QuickPickItemExtended | undefined = (await vscode.window.showQuickPick(
      envFileQuickPickList,
    )) as QuickPickItemExtended | undefined;

    if (selectedEnv === undefined) {
      return;
    }

    const selectedFileContent = readFileSync(selectedEnv.filePath.fsPath);

    writeFileSync(rootEnvFile.fsPath, selectedFileContent);

    updateStatusBar(selectedEnv);
  });

  subscriptions.push(envSwitcherCommand);
}

function updateStatusBar(selectedEnv: QuickPickItemExtended) {
  const isProd = selectedEnv.label.toLowerCase().indexOf("prod") !== -1;
  
  envSwitcherBar.color = isProd ? "#f00" : "#fff";
  envSwitcherBar.text = `${prefix}${isProd ? selectedEnv.label.toUpperCase() : selectedEnv.label}`;
}

export function deactivate() {}
