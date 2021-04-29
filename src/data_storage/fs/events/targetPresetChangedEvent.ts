import { EventEmitter } from 'vscode';
import { IEventEmitter, IEventListener } from '../interfaces';

type TargetPresetId = string | null;

const targetPresetChangedEventEmitter = new EventEmitter<TargetPresetId>();

function register(onEvent: (data: TargetPresetId) => void) {
  targetPresetChangedEventEmitter.event(onEvent);
}

export default {
  emitter: targetPresetChangedEventEmitter as IEventEmitter<TargetPresetId>,
  register: register as IEventListener<TargetPresetId>,
};
