import { ConfigurationChangeEvent, Disposable, workspace } from 'vscode';
import { EXTENSION_PREFIX } from './utilities/consts';

type GlobPattern = string;

export interface FsStorageConfig {
  presetsGlob: () => GlobPattern;
  targetGlob: () => GlobPattern;
  onChangeTargetGlobConfig: (onChange: () => Promise<void>) => Disposable;
}

/**
 * Will get the `glob.presets` config from workspace settings, with global settings fallback.
 */
function presetsGlob() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.presets') as GlobPattern;
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
function onChangeTargetGlobConfig(onChange: () => Promise<void>) {
  return workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
    const shouldUpdateTargetEnv = event.affectsConfiguration(`${EXTENSION_PREFIX}.glob.targetEnv`);

    if (!shouldUpdateTargetEnv) return;
    await onChange();
  });
}

export const fsStorageConfig: FsStorageConfig = {
  presetsGlob,
  targetGlob,
  onChangeTargetGlobConfig,
};
