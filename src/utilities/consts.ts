import { ThemeColor } from 'vscode';

export const EXTENSION_PREFIX = 'envSwitcher';

export const SELECT_ENV_COMMAND_ID = `${EXTENSION_PREFIX}.selectEnvPreset`;
export const OPEN_VIEW_COMMAND_ID = `${EXTENSION_PREFIX}.openView`;

export const DEFAULT_BUTTON_COLOR = new ThemeColor('statusBar.foreground');

export const EVENT_EMITTER = 'EVENT_EMITTER';
export const WORKSPACE_STATE = 'WORKSPACE_STATE';
export const WORKSPACE_FOLDER = 'WORKSPACE_FOLDER';
export const WORKSPACE_CONTAINER = 'WORKSPACE_CONTAINER';
export const MAIN_WORKSPACE = 'MAIN_WORKSPACE';

export const HAS_WORKSPACE_TARGET = 'HAS_WORKSPACE_TARGET';
