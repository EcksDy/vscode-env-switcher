import { window, StatusBarAlignment, StatusBarItem, ThemeColor, Disposable } from 'vscode';
import { SELECT_ENV_COMMAND_ID } from '../utilities/consts';
import { VsCodeUiConfig } from '../config';
import { TargetPresetChangedEventListener } from '../../../data_storage';

const BUTTON_TEXT_DEFAULT = 'Select .env';
const BUTTON_COLOR_DEFAULT = new ThemeColor('statusBar.foreground');

type PositionConfigs = 'outerLeft' | 'innerLeft' | 'outerRight' | 'innerRight';

interface StatusBarItemPosition {
  alignment: StatusBarAlignment;
  priority: number;
}

type PositionConfigsData = {
  [key in PositionConfigs]: StatusBarItemPosition;
};

function getPositionConfig(config: PositionConfigs) {
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
}

type WarningColorConfigsData = {
  [key in WarningColorConfigs]: string | ThemeColor;
};

type WarningColorConfigs = 'default' | 'white' | 'black' | 'red' | 'magenta' | 'yellow';

function getWarningColorConfig(config: WarningColorConfigs) {
  const configData: WarningColorConfigsData = {
    default: BUTTON_COLOR_DEFAULT,
    white: '#FFFFFF',
    black: '#000000',
    red: '#f01432',
    magenta: '#ffa0ff',
    yellow: '#ffff1e',
  };

  return configData[config];
}

function getWarningRegexConfig(config: string) {
  const MATCH_NOTHING_REGEX = /^\b$/;

  if (config === '') return MATCH_NOTHING_REGEX;
  return new RegExp(config, 'i');
}

function getButtonTextStyle(text: string, regex: RegExp, warningColor: string | ThemeColor) {
  const shouldWarn = regex.test(text);
  const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

  return {
    text: styledText,
    color: shouldWarn ? warningColor : BUTTON_COLOR_DEFAULT,
  };
}

interface EnvStatusBarButtonDeps {
  config: VsCodeUiConfig;
  onTargetPresetChangedEvent: TargetPresetChangedEventListener;
}
interface EnvStatusBarButtonArgs {
  text?: string;
}

export default class EnvStatusBarButton implements IButton {
  private config: VsCodeUiConfig;

  private button: StatusBarItem;

  private garbage: Disposable[];

  constructor(
    { config, onTargetPresetChangedEvent }: EnvStatusBarButtonDeps,
    { text = BUTTON_TEXT_DEFAULT }: EnvStatusBarButtonArgs,
  ) {
    this.config = config;
    const { alignment, priority }: StatusBarItemPosition = getPositionConfig(
      this.config.position(),
    );
    this.button = window.createStatusBarItem(alignment, priority);

    const { text: styledText, color } = getButtonTextStyle(
      text,
      getWarningRegexConfig(this.config.warning.regex()),
      getWarningColorConfig(this.config.warning.color()),
    );
    this.button.command = SELECT_ENV_COMMAND_ID;
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    onTargetPresetChangedEvent((data: string | null) => this.setText(data ?? undefined));
    const onWarningConfigChange = this.config.warning.onChange(() => this.setText(this.getText()));
    this.garbage = [this.button, onWarningConfigChange];
  }

  /**
   * Set button text.
   */
  public setText(text: string = BUTTON_TEXT_DEFAULT) {
    const style = getButtonTextStyle(
      text,
      getWarningRegexConfig(this.config.warning.regex()),
      getWarningColorConfig(this.config.warning.color()),
    );
    this.button.text = style.text;
    this.button.color = style.color;
  }

  /**
   * Get button text.
   */
  public getText() {
    return this.button.text;
  }

  public dispose() {
    for (const disposable of this.garbage) {
      disposable.dispose();
    }
  }
}
