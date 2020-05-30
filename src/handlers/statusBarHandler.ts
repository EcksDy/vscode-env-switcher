import { window, StatusBarAlignment, StatusBarItem } from 'vscode';
import FileSystemHandler from './fsHandler';
import { SELECT_ENV_COMMAND_ID, BUTTON_DEFAULT } from '../utilities/consts';
import { templateLabel, extractHeaderLine } from '../utilities/stringManipulations';
import { selectedEnvPresetEventEmitter, SelectedEnvPresetEventData } from '../utilities/events';

export default class StatusBarHandler {
  private envStatusBar: StatusBarItem;

  constructor(envHeader: string) {
    this.envStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 100);
    this.envStatusBar.command = SELECT_ENV_COMMAND_ID;

    selectedEnvPresetEventEmitter.event((data: SelectedEnvPresetEventData) => {
      this.envStatusBar.text = templateLabel(data.fileNameFull);
    });

    try {
      this.envStatusBar.text = templateLabel(extractHeaderLine(envHeader));
    } catch (error) {
      this.envStatusBar.text = templateLabel(BUTTON_DEFAULT);
      console.warn(`Warning: ${error.message}`);
    }

    this.envStatusBar.show();
  }

  public static async build(fsHandler: FileSystemHandler) {
    const currentEnv = fsHandler.envFile;
    if (currentEnv === undefined) {
      throw new Error('No .env file found');
    }

    const stream = fsHandler.streamFile(currentEnv);
    const envHeader = await fsHandler.readHeaderAsync(stream);

    return new StatusBarHandler(envHeader);
  }

  /**
   * getStatusBarItem
   */
  public getStatusBarItem() {
    return this.envStatusBar;
  }
}
