import { Lifecycle, inject, injectable, scoped } from 'tsyringe';
import { Memento, WorkspaceFolder } from 'vscode';
import { IWorkspacePersister, PresetInfo } from '../interfaces';
import { WORKSPACE_FOLDER, WORKSPACE_STATE } from '../utilities';

const CURRENT_PRESET_KEY = 'CURRENT_PRESET';

/**
 * Persistance manager using built in Memento API.
 */
@injectable()
@scoped(Lifecycle.ContainerScoped)
export class MementoPersister implements IWorkspacePersister {
  constructor(
    @inject(WORKSPACE_STATE) private state: Memento,
    @inject(WORKSPACE_FOLDER) private workspaceFolder: WorkspaceFolder, // TODO: This resolves to the correct workspace folder because it's set in the the workspace container?
  ) {}

  public getPresetInfo(): PresetInfo | null {
    return this.state.get<PresetInfo | null>(this.getKey(CURRENT_PRESET_KEY), null);
  }

  public setPresetInfo(presetInfo: PresetInfo | null) {
    const key = this.getKey(CURRENT_PRESET_KEY);

    if (!presetInfo) return void this.state.update(key, null);

    const { name, title, description, checksum, path } = presetInfo;

    void this.state.update(key, {
      name,
      title,
      description,
      checksum,
      path,
    });
  }

  private getKey(key: string) {
    return `${this.workspaceFolder.name}.${key}`;
  }
}
