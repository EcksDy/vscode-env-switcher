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

export interface ProjectsCollapsedState {
  [projectPath: string]: boolean;
}

export interface PresetsViewState {
  multiSwitch: boolean;
  collapsedState: ProjectsCollapsedState;
}

export interface RefreshWebviewEvent {
  action: WebviewEventType.Refresh;
}

export interface DataWebviewEvent {
  action: WebviewEventType.Data;
  projects: UiProject[];
}

export interface SelectedWebviewEvent {
  action: WebviewEventType.Selected;
  selected: SelectedPreset[];
}

export interface SelectedPreset {
  projectPath: string;
  presetPath: string;
}

export interface CommandSelectedWebviewEvent {
  action: WebviewEventType.CommandSelected;
  presetPath: string;
}

export enum WebviewEventType {
  Refresh = 'REFRESH',
  Data = 'DATA',
  Selected = 'SELECTED',
  CommandSelected = 'COMMAND_SELECTED',
}

export type WebviewEvents =
  | RefreshWebviewEvent
  | DataWebviewEvent
  | SelectedWebviewEvent
  | CommandSelectedWebviewEvent;
