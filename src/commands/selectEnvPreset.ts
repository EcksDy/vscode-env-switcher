import { QuickPickItem, window } from 'vscode';
import { IButton, IPresetProvider, Preset, TargetManagerApi } from '../interfaces';

const NO_ENV_FOUND = 'No .env found';

interface Deps {
  presetProvider: IPresetProvider;
  targetManager: TargetManagerApi;
  button: IButton;
}

function presetToQuickPickItem({ description, title }: Preset): QuickPickItem {
  return {
    label: title,
    description,
  };
}

export async function selectEnvPreset({ presetProvider, targetManager, button }: Deps) {
  const presets = await presetProvider.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);

  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(
    ({ title, description }) =>
      title === selectedItem.label && description === selectedItem.description,
  );
  if (selectedPreset === undefined) return;
  try {
    await targetManager.setCurrentPreset(selectedPreset);
    button.setText(selectedPreset.id);
  } catch (error) {
    console.error(error);
    button.setText(NO_ENV_FOUND);
  }
}
