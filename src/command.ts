import * as vscode from 'vscode';
import * as path from 'path';
import FileSystemHandler from './fsHandler';
import { SELECT_ENV_COMMAND_ID, FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN } from './consts';

export interface QuickPickItemExtended extends vscode.QuickPickItem {
  filePath: vscode.Uri;
}

function cleanHeaderLine(headerLine: string) {
  if (
    [FILE_HEADER_START_TOKEN, FILE_HEADER_END_TOKEN].every((token) => headerLine.includes(token))
  ) {
    return headerLine.split(FILE_HEADER_START_TOKEN)[1].split(FILE_HEADER_END_TOKEN)[0];
  }
  throw new Error('No descriptive headers found in .env');
}

function templateLabel(env: string) {
  const isProd = env.toLowerCase().includes('prod');
  return `${LABEL_PREFIX}${isProd ? `$(issue-opened) ${env.toUpperCase()} $(issue-opened)` : env}`;
}

export function createSelectEnvCommand(
  statusBar: vscode.StatusBarItem,
  fsHandler: FileSystemHandler,
) {
  const selectEnvCommand = vscode.commands.registerCommand(SELECT_ENV_COMMAND_ID, async () => {
    const envFileQuickPickList: vscode.QuickPickItem[] = [];
    const envFiles = await fsHandler.findAllEnvFiles();

    envFiles.forEach((file) => {
      const fileName = file.split('.')[0];
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

    // eslint-disable-next-line no-param-reassign
    statusBar.text = templateLabel(selectedEnv.label);
  });

  return selectEnvCommand;
}

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
