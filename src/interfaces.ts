import { EventCallback, EventCallbacks } from './utilities';

export interface PresetInfo {
  name: string;
  title: string;
  description: string;
  path: string;
  checksum: string;
}

type FileContent = string | Uint8Array;

export interface Preset extends PresetInfo {
  content: FileContent;
}

export interface ITargetManager {
  writeToTarget: (content: FileContent) => Promise<void> | void;
  getTargetFile: () => Promise<string | null>;
}

export interface IPresetManager {
  getPresets: () => Promise<Preset[]> | Preset[];
  getCurrentPreset: () => Promise<Preset | null> | Preset | null;
  setCurrentPreset: SetCurrentPreset;
}

interface SetCurrentPreset {
  (presetPath: string | null): Promise<void> | void;
  (preset: Preset | PresetInfo | null): Promise<void> | void;
}

export interface IFileWatcher {
  watchFile(path: string, callbacks: EventCallbacks): void;
  onDidChange(callback: EventCallback): void;
  onDidDelete(callback: EventCallback): void;
  onDidCreate(callback: EventCallback): void;
}

export interface ICurrentPresetPersister {
  get: () => PresetInfo | null;
  set: (presetInfo: PresetInfo | null) => void;
}

export interface IButton {
  setText: (text?: string) => void;
  getText: () => string;
}
