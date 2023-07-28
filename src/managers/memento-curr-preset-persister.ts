import { Memento } from 'vscode';
import { PresetInfo, ICurrentPresetPersister } from '../interfaces';

const CURRENT_PRESET_KEY = 'CURRENT_PRESET';

interface Deps {
  state: Memento;
}

/**
 * Persistance manager for current preset using built in Memento API.
 */
export class MementoCurrPresetPersister implements ICurrentPresetPersister {
  private state: Memento;

  constructor({ state }: Deps) {
    this.state = state;
  }

  public get(): PresetInfo | null {
    return this.state.get<PresetInfo | null>(CURRENT_PRESET_KEY, null);
  }

  public set(presetInfo: PresetInfo | null) {
    if (!presetInfo) return void this.state.update(CURRENT_PRESET_KEY, null);

    const { name, title, description, checksum, path } = presetInfo;

    void this.state.update(CURRENT_PRESET_KEY, { name, title, description, checksum, path });
  }
}
