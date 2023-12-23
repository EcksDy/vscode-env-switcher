import { commands } from 'vscode';
import { PresetsViewProvider } from '../ui-components';

export async function openView() {
  return await commands.executeCommand(`${PresetsViewProvider.viewType}.focus`);
}
