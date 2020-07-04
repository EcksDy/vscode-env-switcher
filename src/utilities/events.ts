import { EventEmitter, Uri } from 'vscode';

interface SelectedEnvPresetEventData {
  fileName: string;
  fileNameFull: string;
  fileUri: Uri;
}

const selectedEnvPresetEventEmitter = new EventEmitter<SelectedEnvPresetEventData>();

export { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter };
