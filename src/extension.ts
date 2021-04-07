import { ExtensionContext, workspace } from 'vscode';
import { initialize } from './utilities/config';
import { EXTENSION_PREFIX } from './utilities/consts';

/**
 * Will get the extension `enabled` config from workspace settings, with global settings fallback.
 */
const extensionEnabled = workspace
  .getConfiguration(`${EXTENSION_PREFIX}`)
  .get('enabled') as boolean;

export async function activate({ subscriptions }: ExtensionContext) {
  if (!extensionEnabled) return;

  await initialize({ subscriptions });
}

export function deactivate() {}
