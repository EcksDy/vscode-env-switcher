import { Uri } from 'vscode';
import globTypes from 'glob';

export interface IEnvLocator {
  readonly envDir: Uri;
  readonly envFile: Uri;
}

export interface IEnvPresetFinder {
  getEnvPresetUris: () => Promise<Uri[]>;
}

export interface IEnvFinder {
  findEnvFiles: (pattern: string, globOptions?: globTypes.IOptions) => Promise<Uri[]>;
}

export interface IEnvContentWithTagWriter {
  setEnvContentWithTag: (sourceFileUri: Uri, tagText: string) => Promise<void>;
}

export interface IEnvTagReader {
  getCurrentEnvFileTag: () => Promise<string>;
}
