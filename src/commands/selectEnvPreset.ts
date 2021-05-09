import { QuickPickItem, window } from 'vscode';
import { IButton, IPresetProvider, Preset, TargetManagerApi } from '../interfaces';

interface Deps {
  presetProvider: IPresetProvider;
  targetManager: TargetManagerApi;
  button: IButton;
}

function presetToQuickPickItem({ path, title }: Preset): QuickPickItem {
  return {
    label: title,
    description: path,
  };
}

export async function selectEnvPreset({ presetProvider, targetManager, button }: Deps) {
  const presets = await presetProvider.getPresets();

  const presetQuickPickList: QuickPickItem[] = presets.map(presetToQuickPickItem);

  const selectedItem = await window.showQuickPick(presetQuickPickList);

  if (selectedItem === undefined) return;

  const selectedPreset = presets.find(
    ({ title, path }) => title === selectedItem.label && path === selectedItem.description,
  );
  if (selectedPreset === undefined) return;
  targetManager.setCurrentPreset(selectedPreset);

  button.setText(selectedPreset.id);
}
