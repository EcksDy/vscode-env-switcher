import { ConfigurationChangeEvent, StatusBarAlignment, ThemeColor, workspace } from 'vscode';
import { GlobPattern, PositionConfigs, StatusBarItemPosition, WarningColorConfigs } from './types';
import { DEFAULT_BUTTON_COLOR, EXTENSION_PREFIX } from './consts';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
function enabled() {
  return getConfig<boolean>('enabled');
}

/**
 * Will get the `overwriteAlert` config from workspace settings, with global settings fallback.
 */
function getOverwriteAlert() {
  return getConfig<boolean>('overwriteAlert')!;
}

/**
 * Will set the `overwriteAlert` in global settings fallback.
 */
async function setOverwriteAlert(value?: boolean): Promise<void> {
  return setConfig('overwriteAlert', value);
}

type PositionConfigsData = {
  [key in PositionConfigs]: StatusBarItemPosition;
};

function getPositionFromConfig(config: PositionConfigs) {
  const configData: PositionConfigsData = {
    outerLeft: {
      alignment: StatusBarAlignment.Left,
      priority: 100,
    },
    innerLeft: {
      alignment: StatusBarAlignment.Left,
      priority: 0,
    },
    outerRight: {
      alignment: StatusBarAlignment.Right,
      priority: 0,
    },
    innerRight: {
      alignment: StatusBarAlignment.Right,
      priority: 100,
    },
  };

  return configData[config];
}

/**
 * Will get the extension `statusBarPosition` config.
 */
function position() {
  const config = getConfig<PositionConfigs>('statusBarPosition')!;

  return getPositionFromConfig(config);
}

type WarningColorConfigsData = {
  [key in WarningColorConfigs]: string | ThemeColor;
};

function getWarningColorFromConfig(config: WarningColorConfigs) {
  const configData: WarningColorConfigsData = {
    default: DEFAULT_BUTTON_COLOR,
    white: '#FFFFFF',
    black: '#000000',
    red: '#f01432',
    magenta: '#ffa0ff',
    yellow: '#ffff1e',
  };

  return configData[config];
}

/**
 * Will get the extension `warning.color` config from workspace settings, with global settings fallback.
 */
function warningColor() {
  const config = getConfig<WarningColorConfigs>('warning.color')!;
  return getWarningColorFromConfig(config);
}

/**
 * Will get the extension `warning.regex` config from workspace settings, with global settings fallback.
 */
function warningRegex() {
  const config = getConfig<string>('warning.regex')!;
  const MATCH_NOTHING_REGEX = /^\b$/;

  if (config === '') return MATCH_NOTHING_REGEX;

  return new RegExp(config, 'i');
}

function onChangeWarningConfig(onChange: () => Promise<void> | void) {
  return workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
    const shouldUpdateStyling =
      isConfigAffected(event, 'warning.regex') || isConfigAffected(event, 'warning.color');

    if (!shouldUpdateStyling) return;
    await onChange();
  });
}

/**
 * Will get the `glob.target` config from workspace settings, with global settings fallback.
 */
function targetGlob() {
  return getConfig<GlobPattern>('glob.target')!;
}

/**
 * Will get the `glob.targetExclude` config from workspace settings, with global settings fallback.
 */
function targetExcludeGlob() {
  return getConfig<GlobPattern>('glob.targetExclude')!;
}

/**
 * Registers a listener for `glob.target` config from workspace settings, with global settings fallback.
 */
function onChangeTargetGlobConfig(
  onChange: (targetGlob: string, targetGlobExclude: string) => Promise<void> | void,
) {
  return workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
    const shouldUpdateTarget =
      isConfigAffected(event, 'glob.target') || isConfigAffected(event, 'glob.targetExclude');

    if (!shouldUpdateTarget) return;
    await onChange(targetGlob(), targetExcludeGlob());
  });
}

/**
 * Will get the `glob.presets` config from workspace settings, with global settings fallback.
 */
function presetsGlob() {
  return getConfig<GlobPattern>('glob.presets')!;
}

/**
 * Will get the `glob.presetsExclude` config from workspace settings, with global settings fallback.
 */
function presetsExcludeGlob() {
  return getConfig<GlobPattern>('glob.presetsExclude')!;
}

/**
 * Registers a listener for `glob.presets` config from workspace settings, with global settings fallback.
 */
function onChangePresetsGlobConfig(
  onChange: (presetsGlob: string, presetsGlobExclude: string) => Promise<void> | void,
) {
  return workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
    const shouldUpdatePresets =
      isConfigAffected(event, 'glob.presets') || isConfigAffected(event, 'glob.presetsExclude');

    if (!shouldUpdatePresets) return;
    await onChange(presetsGlob(), presetsExcludeGlob());
  });
}

function isConfigAffected(event: ConfigurationChangeEvent, config: string) {
  return event.affectsConfiguration(`${EXTENSION_PREFIX}.${config}`);
}

function getConfig<T = unknown>(config: string) {
  return workspace.getConfiguration(EXTENSION_PREFIX).get<T>(config);
}

function setConfig<T = unknown>(config: string, value: T) {
  return workspace.getConfiguration(EXTENSION_PREFIX).update(config, value, true);
}

export const config = {
  enabled,
  overwriteAlert: {
    get: getOverwriteAlert,
    set: setOverwriteAlert,
  },
  warning: {
    color: warningColor,
    regex: warningRegex,
    onChange: onChangeWarningConfig,
  },
  position,
  target: {
    glob: targetGlob,
    excludeGlob: targetExcludeGlob,
    onChange: onChangeTargetGlobConfig,
  },
  presets: {
    glob: presetsGlob,
    excludeGlob: presetsExcludeGlob,
    onChange: onChangePresetsGlobConfig,
  },
};
