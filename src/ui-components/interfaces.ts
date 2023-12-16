export interface UiProject {
  name: string;
  path: string;
  isLocked: boolean;
  isOpen: boolean;
  presets: UiPreset[];
}

export interface UiPreset {
  projectPath: string;
  name: string;
  isSelected: boolean;
  path: string;
}

export interface PresetsViewData {
  multiSwitch: boolean;
  projects: UiProject[];
}

export interface ReadyWebviewEvent {
  action: WebviewEventType.Ready;
}

export interface DataWebviewEvent {
  action: WebviewEventType.Data;
  projects: UiProject[];
}

export interface SelectedWebviewEvent {
  action: WebviewEventType.Selected;
  selected: SelectedPreset[];
}

export interface CommandSelectedWebviewEvent {
  action: WebviewEventType.CommandSelected;
  presetPath: string;
}

export interface SelectedPreset {
  projectPath: string;
  presetPath: string;
}

export enum WebviewEventType {
  Ready = 'READY',
  Data = 'DATA',
  Selected = 'SELECTED',
  CommandSelected = 'COMMAND_SELECTED',
}

export type ViewEvents = ReadyWebviewEvent | DataWebviewEvent | SelectedWebviewEvent;
