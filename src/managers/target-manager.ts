import { ITargetManager, Preset } from '../interfaces';
import { config, fsHelper, SwitcherEvents, getEventEmitter } from '../utilities';

export class TargetManager implements ITargetManager {
  private eventEmitter = getEventEmitter();
  constructor() {
    this.eventEmitter.on(SwitcherEvents.PresetChanged, async (newPreset: Preset) => {
      console.debug('[TargetManager - SwitcherEvents.PresetChanged]', newPreset);
      if (!newPreset?.content) return;

      await this.writeToTarget(newPreset.content);
    });
  }
  async writeToTarget(content: string | Uint8Array): Promise<void> {
    console.debug('[TargetManager - writeToTarget]');
    const targetFile = await fsHelper.findTarget(config);
    if (!targetFile) {
      console.warn('No target file found');
      return;
    }

    await fsHelper.writeFile(targetFile, content);
    this.eventEmitter.emit(SwitcherEvents.TargetChanged, targetFile);
  }

  async getTargetFile(): Promise<string | null> {
    console.debug('[TargetManager - getTargetFile]');
    return await fsHelper.findTarget(config);
  }
}
