import { EventEmitter, Uri } from 'vscode';

interface SelectedEnvPresetEventData {
  fileName: string;
  fileNameFull: string;
  fileUri: Uri;
}

const selectedEnvPresetEventEmitter = new EventEmitter<SelectedEnvPresetEventData>();

interface EnvTargetChangedData {
  tagInTarget: string | null;
  targetUri: Uri;
}

const envTargetChangedEventEmitter = new EventEmitter<EnvTargetChangedData>();

export {
  EnvTargetChangedData,
  envTargetChangedEventEmitter,
  SelectedEnvPresetEventData,
  selectedEnvPresetEventEmitter,
};
