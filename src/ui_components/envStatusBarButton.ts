import { window, StatusBarAlignment, StatusBarItem, workspace, ThemeColor } from 'vscode';
import { SELECT_ENV_COMMAND_ID, EXTENSION_PREFIX } from '../utilities/consts';
import { IEnvTagReader, IEnvLocator, ITextSetter } from '../interfaces';
import { registerWarningConfigWatcher } from '../watchers';

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

type WarningColorConfigsData = {
  [key in WarningColorConfigs]: string | ThemeColor;
};

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';

const getWarningColorConfig = () => {
  const config = workspace
    .getConfiguration(`${EXTENSION_PREFIX}`)
    .get('warning.color') as WarningColorConfigs;

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
  const config = workspace.getConfiguration(`${EXTENSION_PREFIX}`).get('warning.regex') as string;
  const MATCH_NOTHING_REGEX = /^\b$/;

  if (config === '') return MATCH_NOTHING_REGEX;
  return new RegExp(config, 'i');
};

const getButtonTextStyle = (text: string, regex: RegExp, warningColor: string | ThemeColor) => {
  const shouldWarn = regex.test(text);
  const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

  return {
    text: styledText,
    color: shouldWarn ? warningColor : BUTTON_COLOR_DEFAULT,
  };
};

function onWarningConfigChange(this: EnvStatusBarButton) {
  this.setText(this.button.text);
}

interface IEnvHandler extends IEnvLocator, IEnvTagReader {}

interface EnvStatusBarButtonDeps {
  envHandler: IEnvHandler;
}

/**
 * Decorator class for the StatusBarItem.
 * Will expose the necessary members to the rest of the extension.
 */
export default class EnvStatusBarButton implements ITextSetter {
  protected button: StatusBarItem;

  constructor(
    styledText: string,
    color: string | ThemeColor,
    { alignment, priority }: StatusBarItemPosition,
  ) {
    this.button = window.createStatusBarItem(alignment, priority);
    this.button.command = SELECT_ENV_COMMAND_ID;
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    registerWarningConfigWatcher({ onChange: onWarningConfigChange.bind(this) });
  }

  public static async build({ envHandler }: EnvStatusBarButtonDeps) {
    let text = BUTTON_TEXT_DEFAULT;
    try {
      text = await envHandler.getCurrentEnvFileTag();
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
    }

    const position: StatusBarItemPosition = getPositionConfig();
    const style = getButtonTextStyle(text, getWarningRegexConfig(), getWarningColorConfig());

    return new EnvStatusBarButton(style.text, style.color, position);
  }

  /**
   * Set status bar button text.
   */
  public setText(text: string = BUTTON_TEXT_DEFAULT) {
    const style = getButtonTextStyle(text, getWarningRegexConfig(), getWarningColorConfig());
    this.button.text = style.text;
    this.button.color = style.color;
  }

  /**
   * Exposing the original dispose, so EnvStatusBarItem can be registered in extension subscriptions.
   */
  public dispose() {
    this.button.dispose();
  }
}
