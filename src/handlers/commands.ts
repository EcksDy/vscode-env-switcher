import { QuickPickItem, Uri, commands, window } from 'vscode';
import path from 'path';
import FileSystemHandler from './fsHandler';
import {
  SELECT_ENV_COMMAND_ID,
  FILE_HEADER_START_TOKEN,
  FILE_HEADER_END_TOKEN,
} from '../utilities/consts';
import { selectedEnvPresetEventEmitter } from '../utilities/events';

export interface QuickPickItemExtended extends QuickPickItem {
  filePath: Uri;
}
// TODO: Convert to CommandsHandler class
export function createSelectEnvCommand(fsHandler: FileSystemHandler) {
  const selectEnvCommand = commands.registerCommand(SELECT_ENV_COMMAND_ID, async () => {
    const envFiles = await fsHandler.findAllEnvFiles();

    const envFileQuickPickList = envFiles.map((file) => {
      const fileName = file.split('.')[0];
      const fileLabel = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const envFileQuickPick: QuickPickItemExtended = {
        description: `${path.sep}${file}`,
        label: fileLabel,
        filePath: Uri.parse(`${fsHandler.root.fsPath}${path.sep}${file}`),
      };

      return envFileQuickPick;
    });

    const selectedEnv = await window.showQuickPick(envFileQuickPickList);

    if (selectedEnv === undefined) {
      return;
    }

    const setCurrentEnvHeader = `${FILE_HEADER_START_TOKEN}${selectedEnv.label}${FILE_HEADER_END_TOKEN}\n`;
    const headerBuffer = Buffer.from(setCurrentEnvHeader);
    const selectedFileContent = fsHandler.readFile(selectedEnv.filePath);

    fsHandler.writeFile(fsHandler.rootEnvFile, Buffer.concat([headerBuffer, selectedFileContent]));

    selectedEnvPresetEventEmitter.fire({
      text: selectedEnv.label,
    });
  });

  return selectEnvCommand;
}
