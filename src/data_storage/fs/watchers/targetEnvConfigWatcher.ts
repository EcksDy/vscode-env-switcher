import { workspace, ConfigurationChangeEvent } from 'vscode';
import { EXTENSION_PREFIX } from '../../../user_interfaces/vs_code/utilities/consts';

interface TargetEnvConfigWatcherDeps {
  onChange: () => Promise<void>;
}

export function registerTargetEnvConfigWatcher({ onChange }: TargetEnvConfigWatcherDeps) {
  return workspace.onDidChangeConfiguration(async (event: ConfigurationChangeEvent) => {
    const shouldUpdateTargetEnv = event.affectsConfiguration(`${EXTENSION_PREFIX}.glob.targetEnv`);

    if (!shouldUpdateTargetEnv) return;
    await onChange();
  });
}
