import { Uri } from 'vscode';

export interface IEnvLocator {
  readonly envDir: Uri;
  readonly envFile: Uri;
}

export interface IEnvPresetFinder {
  getEnvPresetUris: () => Promise<Uri[]>;
}

export interface IEnvContentWithTagWriter {
  setEnvContentWithTag: (sourceFileUri: Uri, tagText: string) => Promise<void>;
}

export interface IEnvTagReader {
  getCurrentEnvFileTag: () => Promise<string>;
}
