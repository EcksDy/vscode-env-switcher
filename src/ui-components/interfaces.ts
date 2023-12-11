export interface Project {
  id: string;
  locked: boolean;
  path: string; // absolute path
  name: string;
  open: boolean;
}

export interface Preset {
  id: string;
  projectId: string;
  name: string;
  selected: boolean;
  path: string; // absolute path
}

export interface PresetsViewData {
  multiSwitch: boolean;
  projects: Project[];
  presets: Preset[];
}

export interface Init {
  action: 'init';
}

export interface ToggleLock {
  action: 'toggleLock';
  project: string; // project path
  newState: boolean;
}

export interface ToggleMultiSwitch {
  action: 'toggleMultiSwitch';
  newState: boolean;
}

export interface SelectPreset {
  action: 'selectPreset';
  project: string; // project path
  newPreset: string;
}

export type ViewActions = Init | ToggleLock | ToggleMultiSwitch | SelectPreset;
