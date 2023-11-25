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
  PresetSelected = 'preset-selected',
  PresetSelectedError = 'preset-selected-error',
  PresetsSelected = 'presets-selected',
  PresetsSelectedError = 'presets-selected-error',
  PresetChanged = 'preset-changed',
  PresetChangedError = 'preset-changed-error',
  TargetChanged = 'target-changed',
  TargetChangedError = 'target-changed-error',
  FileChanged = 'file-changed',
  FileDeleted = 'file-deleted',
  FileCreated = 'file-created',
  WorkspacesChanged = 'workspaces-changed',
}
