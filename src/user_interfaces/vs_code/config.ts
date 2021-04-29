import { ConfigurationChangeEvent, Disposable, workspace } from 'vscode';

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';
type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';

export interface VsCodeUiConfig {
  enabled: () => boolean;
  warning: {
    color: () => WarningColorConfigs;
    regex: () => string;
    onChange: (onChange: () => void) => Disposable;
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

function onChangeWarningConfig(onChange: () => void) {
  return workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    const shouldUpdateStyling =
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.regex`) ||
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.color`);

    if (!shouldUpdateStyling) return;
    onChange();
  });
}

export const vsCodeUiConfig: VsCodeUiConfig = {
  enabled,
  warning: {
    color: warningColor,
    regex: warningRegex,
    onChange: onChangeWarningConfig,
  },
  position,
};
