import { ILocation } from './filesystem';

export interface IEnvLocator {
  targetEnvFile: ILocation;
}

export interface IEnvPresetFinder {
  getEnvPresetUris: () => Promise<ILocation[]>;
}

export interface IEnvContentWithTagWriter {
  setEnvContentWithTag: (sourceFile: ILocation, tagText: string) => Promise<void>;
}

export interface IEnvTagReader {
  getCurrentEnvFileTag: () => Promise<string>;
}
