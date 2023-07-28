import { QuickPickItem, window } from 'vscode';
import { IButton, IPresetManager, Preset } from '../interfaces';

const NO_FILE = 'No file';

interface Deps {
  presetManager: IPresetManager;
  button: IButton;
}

function presetToQuickPickItem({ description, title }: Preset): QuickPickItem {
  return {
    label: title,
    description,
  };
}

export async function selectEnvPreset({ presetManager, button }: Deps) {
  const presets = await presetManager.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);
  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(
    ({ title, description }) =>
      title === selectedItem.label && description === selectedItem.description,
  );
  if (!selectedPreset) return;

  try {
    await presetManager.setCurrentPreset(selectedPreset);
    const text = selectedPreset.name || NO_FILE;
    button.setText(text);
  } catch (error) {
    console.error(error);
    button.setText(NO_FILE);
  }
}
