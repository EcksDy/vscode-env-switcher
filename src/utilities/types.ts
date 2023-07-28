import { GlobOptions } from 'glob';
import { StatusBarAlignment } from 'vscode';
import { config } from './config';

export type ClassicGlobOptions = GlobOptions & { withFileTypes?: false };

export type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';
export type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';
export type GlobPattern = string;

export type EventType = 'onDidChange' | 'onDidCreate' | 'onDidDelete';
export type EventCallback = (file: string) => Promise<void> | void;
export type EventCallbacks = {
  [key in EventType]?: EventCallback;
};

export interface StatusBarItemPosition {
  alignment: StatusBarAlignment;
  priority: number;
}

export type ExtensionConfig = typeof config;
