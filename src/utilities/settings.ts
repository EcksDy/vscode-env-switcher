import { ConfigurationChangeEvent, Disposable, workspace } from 'vscode';

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';
type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';
type GlobPattern = string;

interface Settings {
  warning: {
    color: () => WarningColorConfigs;
    regex: () => string;
    onChange: (onChange: () => Promise<void> | void) => Disposable;
  };
  position: () => PositionConfigs;
  target: {
    glob: () => GlobPattern;
    onChange: (onChange: (targetGlob: string) => Promise<void> | void) => Disposable;
  };
}

const EXTENSION_PREFIX = 'envSwitcher';

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

function onChangeWarningConfig(onChange: () => Promise<void> | void) {
  return workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    const shouldUpdateStyling =
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.regex`) ||
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.color`);

    if (!shouldUpdateStyling) return;
    onChange();
  });
}

/**
 * Will get the `glob.targetEnv` config from workspace settings, with global settings fallback.
 */
function targetGlob() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.targetEnv') as GlobPattern;
}

/**
 * Registers a listener for `glob.targetEnv` config from workspace settings, with global settings fallback.
 */
function onChangeTargetGlobConfig(onChange: (targetGlob: string) => Promise<void> | void) {
  return workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    const shouldUpdateTargetEnv = event.affectsConfiguration(`${EXTENSION_PREFIX}.glob.targetEnv`);

    if (!shouldUpdateTargetEnv) return;
    onChange(targetGlob());
  });
}

export const settings: Settings = {
  warning: {
    color: warningColor,
    regex: warningRegex,
    onChange: onChangeWarningConfig,
  },
  position,
  target: {
    glob: targetGlob,
    onChange: onChangeTargetGlobConfig,
  },
};
