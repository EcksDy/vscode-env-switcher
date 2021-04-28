import { workspace } from 'vscode';
import { EXTENSION_PREFIX } from './utilities/consts';

type GlobPattern = string;

interface FsStateConfig {
  envPresets: () => GlobPattern;
  targetEnv: () => GlobPattern;
}

/**
 * Will get the extension `glob.presets` config from workspace settings, with global settings fallback.
 */
function envPresets() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.presets') as GlobPattern;
}

/**
 * Will get the extension `glob.targetEnv` config from workspace settings, with global settings fallback.
 */
function targetEnv() {
  return workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.targetEnv') as GlobPattern;
}

const fsStateConfig: FsStateConfig = {
  envPresets,
  targetEnv,
};

export default fsStateConfig;
