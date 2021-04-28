function getCurrentPreset() {}

function getPresets() {}

interface IPreset extends IIdentified, ITitled, IDescribed {}

interface IPresetProvider {
  getPresets: () => IPreset[];
  getCurrentPreset: () => IPreset;
}
