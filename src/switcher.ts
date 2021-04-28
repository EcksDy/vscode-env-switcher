interface IPresetHandler {
  setPreset: (preset: IPreset, content: string) => void;
}

interface SwitcherDeps {
  presetProvider: IPresetProvider;
  contentProvider: IContentProvider;
  presetHandler: IPresetHandler;
}

export class Switcher {
  contentProvider: IContentProvider;

  presetHandler: IPresetHandler;

  constructor({ contentProvider, presetHandler }: SwitcherDeps) {
    this.contentProvider = contentProvider;
    this.presetHandler = presetHandler;
  }

  switchToPreset(preset: IPreset) {
    const content = this.contentProvider.getContent(preset);
    this.presetHandler.setPreset(preset, content);
  }
}
