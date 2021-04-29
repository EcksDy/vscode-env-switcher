interface IIdentified {
  id: string;
}

interface ITitled {
  title: string;
}

interface ILocated {
  path: string;
}

interface IPreset extends IIdentified, ITitled, ILocated {}

interface IStorage {
  getPresets: () => Promise<IPreset[]>;
  getCurrentPresetId: () => Promise<string | null>;
  setCurrentPreset: (preset: IPreset) => Promise<void>;
}
