import { ITargetManager } from '../interfaces';
import { ExtensionConfig, fsHelper } from '../utilities';

interface Deps {
  config: ExtensionConfig;
}

export class TargetManager implements ITargetManager {
  private config: ExtensionConfig;

  constructor({ config }: Deps) {
    this.config = config;
  }

  async writeToTarget(content: string | Uint8Array): Promise<void> {
    const targetFile = await fsHelper.findTarget(this.config);
    if (!targetFile) {
      console.warn('No target file found');
      return;
    }

    await fsHelper.writeFile(targetFile, content);
  }

  async getTargetFile(): Promise<string | null> {
    return await fsHelper.findTarget(this.config);
  }
}
