import EventEmitter from 'events';
import { DependencyContainer, container } from 'tsyringe';
import { EVENT_EMITTER } from './utilities';

export function getEventEmitter(localContainer?: DependencyContainer) {
  if (!localContainer) localContainer = container;

  return localContainer.resolve<EventEmitter>(EVENT_EMITTER);
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
  WorkspaceChanged = 'workspace-changed',
}
