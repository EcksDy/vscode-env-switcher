import { container } from 'tsyringe';
import { QuickPickItem, window } from 'vscode';
import { Preset } from '../interfaces';
import {
  ExtensionConfig,
  MAIN_WORKSPACE,
  SwitcherEvents,
  Workspace,
  getEventEmitter,
} from '../utilities';

const OVERWRITE_ALERT_OPTIONS = [`OK`, `Don't show again`, `Cancel`] as const;
const eventEmitter = getEventEmitter();

interface Deps {
  config: ExtensionConfig;
}

function presetToQuickPickItem({ description, title, path }: Preset): QuickPickItem {
  return {
    label: title,
    description,
    detail: path,
  };
}

export async function selectEnvPreset({ config }: Deps) {
  const presetManager = container.resolve<Workspace | null>(MAIN_WORKSPACE);
  if (!presetManager) return;
  const presets = await presetManager.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);
  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(({ path }) => path === selectedItem.detail);
  if (!selectedPreset) return;

  if (config.overwriteAlert.get()) {
    const result = await window.showWarningMessage(
      `You're about to overwrite your environment variables!\nPlease make sure you have a backup of your target file.`,
      ...OVERWRITE_ALERT_OPTIONS,
    );

    if (result === 'Cancel') return;
    if (result === `Don't show again`) await config.overwriteAlert.set(false);
  }

  eventEmitter.emit(SwitcherEvents.PresetSelected, selectedPreset);
}
