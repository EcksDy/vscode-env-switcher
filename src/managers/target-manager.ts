import { ITargetManager } from '../interfaces';
import { config, fsHelper } from '../utilities';

export class TargetManager implements ITargetManager {
  async writeToTarget(content: string | Uint8Array): Promise<void> {
    const targetFile = await fsHelper.findTarget(config);
    if (!targetFile) {
      console.warn('No target file found');
      return;
    }

    await fsHelper.writeFile(targetFile, content);
  }

  async getTargetFile(): Promise<string | null> {
    return await fsHelper.findTarget(config);
  }
}
