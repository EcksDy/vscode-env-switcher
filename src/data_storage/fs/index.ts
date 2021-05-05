import TargetPresetChanged, {
  TargetPresetChangedEventListener,
} from './events/targetPresetChangedEvent';

const onTargetPresetChangedEvent = TargetPresetChanged.register;

export * from './config';
export * from './fsStorageManager';
export { TargetPresetChangedEventListener, onTargetPresetChangedEvent };
