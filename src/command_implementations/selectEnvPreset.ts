import path from 'path';
import { QuickPickItem, window, workspace, Uri } from 'vscode';
import { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter } from '../utilities/events';
import { capitalize } from '../utilities/stringManipulations';
import { EnvHandler } from '../handlers';

export interface EnvPresetQuickPickItem extends SelectedEnvPresetEventData, QuickPickItem {}

interface SelectEnvPresetCmdDeps {
  rootDir: Uri;
  envHandler: EnvHandler;
}

const selectEnvPreset = async ({ rootDir, envHandler }: SelectEnvPresetCmdDeps) => {
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

  envFileQuickPickList.unshift({
    alwaysShow: true,
    label: 'Show current .env file',
    fileName: '.env',
    fileNameFull: '.env',
    fileUri: envHandler.envFile,
  });

  const selectedEnv = await window.showQuickPick(envFileQuickPickList);

  if (selectedEnv === undefined) return;

  const showCurrent = selectedEnv.fileName === '.env';
  if (showCurrent) {
    const doc = await workspace.openTextDocument(selectedEnv.fileUri);
    await window.showTextDocument(doc);
    return;
  }

  envHandler.setEnvContentWithTag(selectedEnv.fileUri, selectedEnv.fileNameFull);

  selectedEnvPresetEventEmitter.fire(selectedEnv);
};

export default selectEnvPreset;
