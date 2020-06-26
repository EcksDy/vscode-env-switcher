import path from 'path';
import { QuickPickItem, window } from 'vscode';
import FileSystemHandler from '../handlers/fsHandler';
import { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter } from '../utilities/events';
import { capitalize } from '../utilities/stringManipulations';

export interface EnvPresetQuickPickItem extends SelectedEnvPresetEventData, QuickPickItem {}

const selectEnvPreset = async (fsHandler: FileSystemHandler) => {
  const envFiles = await fsHandler.getEnvFilesInEnvDir();

  const envFileQuickPickList = envFiles.map((filePath) => {
    const fileName = path.basename(filePath.fsPath, path.extname(filePath.fsPath));
    const fileNameFull = path.basename(filePath.fsPath);
    const label = capitalize(fileName);
    const description = path.relative(fsHandler.rootDir.fsPath, filePath.fsPath);

    const envFileQuickPick: EnvPresetQuickPickItem = {
      description,
      label,
      fileName,
      fileNameFull,
      filePath,
    };

    return envFileQuickPick;
  });

  const selectedEnv = await window.showQuickPick(envFileQuickPickList);

  if (selectedEnv === undefined) {
    return;
  }

  fsHandler.setEnvContentWithHeaders(selectedEnv.filePath, selectedEnv.fileNameFull);

  selectedEnvPresetEventEmitter.fire(selectedEnv);
};

export default selectEnvPreset;
