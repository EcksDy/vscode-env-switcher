import { EventEmitter } from 'vscode';

interface SelectedEnvPresetEventData {
  text: string;
}

const selectedEnvPresetEventEmitter = new EventEmitter<SelectedEnvPresetEventData>();

export { SelectedEnvPresetEventData, selectedEnvPresetEventEmitter };
