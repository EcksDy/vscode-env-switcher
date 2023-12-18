import EventEmitter from 'events';
import { Disposable } from 'vscode';
import { EVENT_EMITTER } from './consts';
import { registerInContainer } from './di-container';

const eventEmitter = new EventEmitter();

registerInContainer([EVENT_EMITTER, { useValue: eventEmitter }]);

export function getEventEmitter(): EventEmitter {
  return eventEmitter;
}

export function getEventEmitterDisposable(): Disposable {
  return {
    dispose() {
      eventEmitter.removeAllListeners();
    },
  };
}

export enum SwitcherEvents {
  PresetSelected = 'PRESET_SELECTED',
  PresetSelectedError = 'PRESET_SELECTED_ERROR',
  PresetsSelected = 'PRESETS_SELECTED',
  PresetsSelectedError = 'PRESETS_SELECTED_ERROR',
  PresetChanged = 'PRESET_CHANGED',
  PresetChangedError = 'PRESET_CHANGED_ERROR',
  TargetChanged = 'TARGET_CHANGED',
  TargetChangedError = 'TARGET_CHANGED_ERROR',
  FileChanged = 'FILE_CHANGED',
  FileDeleted = 'FILE_DELETED',
  FileCreated = 'FILE_CREATED',
  WorkspacesChanged = 'WORKSPACES_CHANGED',
}
