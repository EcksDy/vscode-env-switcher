import { workspace } from 'vscode';

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';
type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';

interface VsCodeUiConfig {
  enabled: () => boolean;
  warning: {
    color: () => WarningColorConfigs;
    regex: () => string;
  };
  position: () => PositionConfigs;
}

const EXTENSION_PREFIX = 'envSwitcher';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
function enabled() {
  return (workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('enabled') as boolean) ?? true;
}

/**
 * Will get the extension `statusBarPosition` config.
 */
function position() {
  return workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get('statusBarPosition') as PositionConfigs;
}

/**
 * Will get the extension `warning.color` config from workspace settings, with global settings fallback.
 */
function warningColor() {
  return workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get('warning.color') as WarningColorConfigs;
}

/**
 * Will get the extension `warning.regex` config from workspace settings, with global settings fallback.
 */
function warningRegex() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('warning.regex') as string;
}

const vsCodeUiConfig: VsCodeUiConfig = {
  enabled,
  warning: {
    color: warningColor,
    regex: warningRegex,
  },
  position,
};

export default vsCodeUiConfig;
