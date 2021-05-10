export interface PresetInfo {
  id: string;
  title: string;
  description: string;
  path: string;
  checksum: string;
}

export interface Preset extends PresetInfo {
  content: string | Uint8Array;
}

export interface TargetManagerApi {
  setTarget: (targetGlob: string) => Promise<void> | void;
  getCurrentPreset: () => Promise<Preset | null> | Preset | null;
  setCurrentPreset: (preset: Preset) => Promise<void> | void;
}

export interface IPresetProvider {
  getPresets: () => Promise<Preset[]>;
}

export interface IPersistanceManager {
  get: () => PresetInfo | null;
  set: (presetInfo: PresetInfo | null) => void;
}

export interface IButton {
  setText: (text?: string) => void;
  getText: () => string;
}
