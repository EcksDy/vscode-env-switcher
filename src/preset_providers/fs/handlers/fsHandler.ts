import * as nodePath from 'path';
import fsHelper from '../../../utilities/fsHelper';

const NODE_MODULES_GLOB = '**/node_modules/**';
const ENV_EXTENSION = '.env';

export function removePotentialTargetFiles(paths: string[]) {
  return paths.filter(
    (path) => nodePath.basename(path) !== ENV_EXTENSION && nodePath.extname(path) === ENV_EXTENSION,
  );
}

export async function getPresetPaths(glob: string) {
  return await fsHelper.findFiles(glob, NODE_MODULES_GLOB);
}
