import { ThemeColor } from 'vscode';

export const EXTENSION_PREFIX = 'envSwitcher';

export const SELECT_ENV_COMMAND_ID = `${EXTENSION_PREFIX}.selectEnvPreset`;
export const OPEN_VIEW_COMMAND_ID = `${EXTENSION_PREFIX}.openView`;

export const DEFAULT_BUTTON_COLOR = new ThemeColor('statusBar.foreground');

export const EVENT_EMITTER = 'eventEmitter';
export const WORKSPACE_STATE = 'workspaceState';
export const WORKSPACE_FOLDER = 'workspaceFolder';
export const WORKSPACE_WATCHER = 'workspaceWatcher';

export const IS_SINGLE_WORKSPACE = '__isSingleWorkspace';
export const HAS_MONOREPO = '__hasMonorepo';
