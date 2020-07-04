import { window, StatusBarAlignment, StatusBarItem, workspace } from 'vscode';
import FileSystemHandler from '../handlers/fsHandler';
import { SELECT_ENV_COMMAND_ID, EXTENSION_PREFIX } from '../utilities/consts';
import { templateLabel, extractHeaderLine } from '../utilities/stringManipulations';
import { selectedEnvPresetEventEmitter, SelectedEnvPresetEventData } from '../utilities/events';

const BUTTON_DEFAULT = 'Select .env';

interface StatusBarItemPosition {
  alignment: StatusBarAlignment;
  priority: number;
}

type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';

type PositionConfigsData = {
  [key in PositionConfigs]: StatusBarItemPosition;
};

const getPositionConfig = () => {
  const config = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get('statusBarPosition') as PositionConfigs;

  const configData: PositionConfigsData = {
    outerLeft: {
      alignment: StatusBarAlignment.Left,
      priority: 100,
    },
    innerLeft: {
      alignment: StatusBarAlignment.Left,
      priority: 0,
    },
    outerRight: {
      alignment: StatusBarAlignment.Right,
      priority: 0,
    },
    innerRight: {
      alignment: StatusBarAlignment.Right,
      priority: 100,
    },
  };

  return configData[config];
};

/**
 * Decorator class for the StatusBarItem. Will expose the necessary members to the rest of the app.
 */
export default class EnvStatusBarItem {
  private envStatusBar: StatusBarItem;

  constructor(text: string, { alignment, priority }: StatusBarItemPosition) {
    this.envStatusBar = window.createStatusBarItem(alignment, priority);
    this.envStatusBar.command = SELECT_ENV_COMMAND_ID;
    this.envStatusBar.text = text;
    this.envStatusBar.show();

    selectedEnvPresetEventEmitter.event((data: SelectedEnvPresetEventData) => {
      this.envStatusBar.text = templateLabel(data.fileNameFull);
    });
  }

  public static async build(fsHandler: FileSystemHandler) {
    let text;
    try {
      const stream = fsHandler.streamFile(fsHandler.envFile);
      const envHeader = await fsHandler.readHeaderAsync(stream);
      text = templateLabel(extractHeaderLine(envHeader));
    } catch (error) {
      text = templateLabel(BUTTON_DEFAULT);
      console.warn(`Warning: ${error.message}`);
    }

    const position: StatusBarItemPosition = getPositionConfig();

    return new EnvStatusBarItem(text, position);
  }

  /**
   * Exposing the original dispose, so EnvStatusBarItem can be registered in extension subscriptions.
   */
  public dispose() {
    this.envStatusBar.dispose();
  }
}
