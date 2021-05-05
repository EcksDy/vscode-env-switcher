import { EventEmitter } from 'vscode';
import { IEventEmitter, IEventListener } from '../interfaces';

const targetPresetChangedEventEmitter = new EventEmitter<string | null>();

function register(onEvent: (data: string | null) => void) {
  targetPresetChangedEventEmitter.event(onEvent);
}

export default {
  emitter: targetPresetChangedEventEmitter as IEventEmitter<string | null>,
  register: register as IEventListener<string | null>,
};

export type TargetPresetChangedEventListener = IEventListener<string | null>;
