import { workspace } from 'vscode';
import { EXTENSION_PREFIX } from './consts';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
export const extensionEnabled = workspace
  .getConfiguration(`${EXTENSION_PREFIX}`)
  .get('enabled') as boolean;
