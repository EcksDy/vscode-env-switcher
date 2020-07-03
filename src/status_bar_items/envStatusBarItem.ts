import { window, StatusBarAlignment, StatusBarItem } from 'vscode';
import FileSystemHandler from '../handlers/fsHandler';
import { SELECT_ENV_COMMAND_ID } from '../utilities/consts';
import { templateLabel, extractHeaderLine } from '../utilities/stringManipulations';
import { selectedEnvPresetEventEmitter, SelectedEnvPresetEventData } from '../utilities/events';

const BUTTON_DEFAULT = 'Select .env';

/**
 * Decorator class for the StatusBarItem. Will expose the necessary members to the rest of the app.
 */
export default class EnvStatusBarItem {
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
    const stream = fsHandler.streamFile(currentEnv);
    const envHeader = await fsHandler.readHeaderAsync(stream);

    return new EnvStatusBarItem(envHeader);
  }

  /**
   * Exposing the original dispose, so EnvStatusBarItem can be registered in extension subscriptions.
   */
  public dispose() {
    this.envStatusBar.dispose();
  }
}
