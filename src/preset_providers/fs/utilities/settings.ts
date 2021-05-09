import { workspace } from 'vscode';
import { EXTENSION_PREFIX } from '../../../utilities';

type GlobPattern = string;

const DEFAULT_TARGET_GLOB = '**/.env';
const ENV_EXTENSION = '.env';

function getOnlyEnvGlob(glob?: string): GlobPattern {
  if (glob === undefined || glob.length < 4) return DEFAULT_TARGET_GLOB;
  const includesOnlyEnvFile = glob.slice(glob.length - 4).toLowerCase() === ENV_EXTENSION;
  if (!includesOnlyEnvFile) {
    return `${glob}${ENV_EXTENSION}`;
  }
  return glob;
}

/**
 * Will get the `glob.presets` config from workspace settings, with global settings fallback.
 */
function presetsGlob() {
  return getOnlyEnvGlob(workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('glob.presets'));
}

export const settings = {
  presetsGlob,
};
