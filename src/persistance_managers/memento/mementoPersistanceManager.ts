import { Memento } from 'vscode';
import { PresetInfo, IPersistanceManager } from '../../interfaces';

const CURRENT_PRESET_KEY = 'CURRENT_PRESET';

function get(this: Memento): PresetInfo | null {
  return this.get<PresetInfo | null>(CURRENT_PRESET_KEY, null);
}

function set(this: Memento, presetInfo: PresetInfo | null) {
  this.update(CURRENT_PRESET_KEY, presetInfo);
}

interface Deps {
  state: Memento;
}

export default function memento({ state }: Deps): IPersistanceManager {
  return {
    get: get.bind(state),
    set: set.bind(state),
  };
}
