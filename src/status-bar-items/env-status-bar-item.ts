import {
  window,
  StatusBarAlignment,
  StatusBarItem,
  workspace,
  ThemeColor,
  ConfigurationChangeEvent,
} from 'vscode';
import FileSystemHandler from '../handlers/file-system-handler';
import { SELECT_ENV_COMMAND_ID, EXTENSION_PREFIX } from '../utilities/consts';
import { extractHeaderLine } from '../utilities/string-manipulations';
import { selectedEnvPresetEventEmitter, SelectedEnvPresetEventData } from '../utilities/events';

const BUTTON_TEXT_DEFAULT = 'Select .env';
const BUTTON_COLOR_DEFAULT = new ThemeColor('statusBar.foreground');

type PositionConfigsData = {
  [key in PositionConfigs]: StatusBarItemPosition;
};

type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';

interface StatusBarItemPosition {
  alignment: StatusBarAlignment;
  priority: number;
}

const getPositionConfig = () => {
  const config = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get<PositionConfigs>('statusBarPosition')!;

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

type WarningColorConfigsData = {
  [key in WarningColorConfigs]: string | ThemeColor;
};

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';

const getWarningColorConfig = () => {
  const config = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get<WarningColorConfigs>('warning.color')!;

  const configData: WarningColorConfigsData = {
    default: BUTTON_COLOR_DEFAULT,
    white: '#FFFFFF',
    black: '#000000',
    red: '#f01432',
    magenta: '#ffa0ff',
    yellow: '#ffff1e',
  };

  return configData[config];
};

const getWarningRegexConfig = () => {
  const regexConfig = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get<string>('warning.regex')!;

  if (regexConfig === '') return /^\b$/; // If empty config provided, will always match nothing.

  return new RegExp(regexConfig, 'i');
};

const getButtonTextStyle = (text: string, regex: RegExp, warningColor: string | ThemeColor) => {
  const shouldWarn = regex.test(text);
  const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

  return {
    text: styledText,
    color: shouldWarn ? warningColor : BUTTON_COLOR_DEFAULT,
  };
};

/**
 * Decorator class for the StatusBarItem. Will expose the necessary members to the rest of the extension.
 */
export default class EnvStatusBarItem {
  private originalText: string;

  private envStatusBar: StatusBarItem;

  constructor(
    originalText: string,
    styledText: string,
    color: string | ThemeColor,
    { alignment, priority }: StatusBarItemPosition,
  ) {
    this.originalText = originalText;
    this.envStatusBar = window.createStatusBarItem(alignment, priority);
    this.envStatusBar.command = SELECT_ENV_COMMAND_ID;
    this.envStatusBar.text = styledText;
    this.envStatusBar.color = color;
    this.envStatusBar.show();

    selectedEnvPresetEventEmitter.event((data: SelectedEnvPresetEventData) => {
      const style = getButtonTextStyle(
        data.fileNameFull,
        getWarningRegexConfig(),
        getWarningColorConfig(),
      );
      this.envStatusBar.text = style.text;
      this.envStatusBar.color = style.color;
    });

    workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
      const shouldUpdateStyling =
        event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.regex`) ||
        event.affectsConfiguration(`${EXTENSION_PREFIX}.warning.color`);

      if (!shouldUpdateStyling) return;

      const style = getButtonTextStyle(
        this.originalText,
        getWarningRegexConfig(),
        getWarningColorConfig(),
      );
      this.envStatusBar.text = style.text;
      this.envStatusBar.color = style.color;
    });
  }

  public static async build(fsHandler: FileSystemHandler) {
    let text;
    try {
      const stream = fsHandler.streamFile(fsHandler.envFile);
      const envHeader = await fsHandler.readHeaderAsync(stream);
      text = extractHeaderLine(envHeader);
    } catch (error) {
      text = BUTTON_TEXT_DEFAULT;
      console.warn(`Warning: ${error.message}`);
    }

    const position: StatusBarItemPosition = getPositionConfig();
    const style = getButtonTextStyle(text, getWarningRegexConfig(), getWarningColorConfig());

    return new EnvStatusBarItem(text, style.text, style.color, position);
  }

  /**
   * Exposing the original dispose, so EnvStatusBarItem can be registered in extension subscriptions.
   */
  public dispose() {
    this.envStatusBar.dispose();
  }
}
