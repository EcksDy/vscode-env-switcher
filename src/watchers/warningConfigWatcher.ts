import { workspace, ConfigurationChangeEvent } from 'vscode';
import { EXTENSION_PREFIX } from '../utilities/consts';

interface WarningConfigWatcherDeps {
  onChange: () => void;
}

export function registerWarningConfigWatcher({ onChange }: WarningConfigWatcherDeps) {
  return workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    const shouldUpdateStyling =
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.regex`) ||
      event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.color`);

    if (!shouldUpdateStyling) return;
    onChange();
  });
}
