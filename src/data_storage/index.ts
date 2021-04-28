interface IStorage {
  getCurrentPreset: (preset: IPreset) => void;
  setCurrentPreset: (preset: IPreset) => void;
  getPresets: (preset: IPreset) => void;
  getContent: ()
}

export { IStorage };
