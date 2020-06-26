import { Uri, workspace, window } from 'vscode';
import {
  EXTENSION_PREFIX,
  BACKUP_PREFIX_ORIGINAL,
  BACKUP_PREFIX_SESSION,
} from '../utilities/consts';

const showOriginalEnvBackup = async () => {
  const uri = Uri.parse(`${EXTENSION_PREFIX}:${BACKUP_PREFIX_ORIGINAL}.env`);
  const doc = await workspace.openTextDocument(uri);
  await window.showTextDocument(doc, { preview: true });
};

const showSessionEnvBackup = async () => {
  const uri = Uri.parse(`${EXTENSION_PREFIX}:${BACKUP_PREFIX_SESSION}.env`);
  const doc = await workspace.openTextDocument(uri);
  await window.showTextDocument(doc, { preview: true });
};

export { showOriginalEnvBackup, showSessionEnvBackup };
