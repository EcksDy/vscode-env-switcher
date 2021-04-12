import { Uri, EventEmitter } from 'vscode';
import { ITextSetter, IEventEmitter } from '../../interfaces';

export interface SelectedEnvPresetEventData {
  fileName: string;
  fileNameFull: string;
  fileUri: Uri;
}

const selectedEnvPresetEventEmitter = new EventEmitter<SelectedEnvPresetEventData>();

interface RegisterSelectedEnvPresetEventListenerDeps {
  setter: ITextSetter;
}

export function register({
  setter,
}: RegisterSelectedEnvPresetEventListenerDeps): IEventEmitter<SelectedEnvPresetEventData> {
  selectedEnvPresetEventEmitter.event((data: SelectedEnvPresetEventData) => {
    setter.setText(data.fileNameFull);
  });

  return selectedEnvPresetEventEmitter;
}

export default selectedEnvPresetEventEmitter as IEventEmitter<SelectedEnvPresetEventData>;
