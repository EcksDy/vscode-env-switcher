import path from 'path';
import { QuickPickItem, window, Uri } from 'vscode';
import { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter } from '../utilities/events';
import { capitalize } from '../utilities/stringManipulations';
import { IEnvPresetFinder, IEnvContentWithTagWriter } from '../interfaces';

export interface EnvPresetQuickPickItem extends SelectedEnvPresetEventData, QuickPickItem {}

interface IEnvHandler extends IEnvPresetFinder, IEnvContentWithTagWriter {}

interface SelectEnvPresetCmdDeps {
  rootDir: Uri;
  envHandler: IEnvHandler;
}

export const selectEnvPreset = async ({ rootDir, envHandler }: SelectEnvPresetCmdDeps) => {
  const envPresetUris = await envHandler.getEnvPresetUris();

  const envFileQuickPickList = envPresetUris.map((fileUri) => {
    const fileName = path.basename(fileUri.fsPath, path.extname(fileUri.fsPath));
    const fileNameFull = path.basename(fileUri.fsPath);
    const label = capitalize(fileName);
    const description = path.relative(rootDir.fsPath, fileUri.fsPath);

    const envFileQuickPick: EnvPresetQuickPickItem = {
      description,
      label,
      fileName,
      fileNameFull,
      fileUri,
    };

    return envFileQuickPick;
  });

  const selectedEnv = await window.showQuickPick(envFileQuickPickList);

  if (selectedEnv === undefined) return;

  envHandler.setEnvContentWithTag(selectedEnv.fileUri, selectedEnv.fileNameFull);

  selectedEnvPresetEventEmitter.fire(selectedEnv);
};
