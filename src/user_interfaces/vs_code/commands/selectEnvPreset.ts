import { QuickPickItem, window } from 'vscode';

interface SelectEnvPresetCmdDeps {
  storageManager: IStorage;
  button: IButton;
}

function presetToQuickPickItem({ path, title }: IPreset): QuickPickItem {
  return {
    label: title,
    description: path,
  };
}

export const selectEnvPreset = async ({ storageManager, button }: SelectEnvPresetCmdDeps) => {
  const presets = await storageManager.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);

  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(
    ({ title, path }) => title === selectedItem.label && path === selectedItem.description,
  );
  if (selectedPreset === undefined) return;
  storageManager.setCurrentPreset(selectedPreset);

  button.setText(selectedPreset.id);
};
