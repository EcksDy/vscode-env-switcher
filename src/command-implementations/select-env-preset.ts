import { QuickPickItem, window } from 'vscode';
import { IButton, IPresetManager, Preset } from '../interfaces';
import { ExtensionConfig } from '../utilities';

const NO_FILE = 'No file';

const OVERWRITE_ALERT_OPTIONS = [`OK`, `Don't show again`, `Cancel`] as const;

interface Deps {
  config: ExtensionConfig;
  presetManager: IPresetManager;
  button: IButton;
}

function presetToQuickPickItem({ description, title, path }: Preset): QuickPickItem {
  return {
    label: title,
    description,
    detail: path,
  };
}

export async function selectEnvPreset({ config, presetManager, button }: Deps) {
  const presets = await presetManager.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);
  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(({ path }) => path === selectedItem.detail);
  if (!selectedPreset) return;

  if (config.overwriteAlert.get()) {
    const result = await window.showInformationMessage(
      `You're about to overwrite your environment variables!\nPlease make sure you have a backup of your target file.`,
      ...OVERWRITE_ALERT_OPTIONS,
    );

    if (result === 'Cancel') return;
    if (result === `Don't show again`) await config.overwriteAlert.set(false);
  }

  try {
    await presetManager.setCurrentPreset(selectedPreset);
    const text = selectedPreset.name || NO_FILE;
    button.setText(text);
  } catch (error) {
    console.error(error);
    button.setText(NO_FILE);
  }
}
