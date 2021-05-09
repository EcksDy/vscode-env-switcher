import { window, StatusBarAlignment, StatusBarItem, ThemeColor, Disposable } from 'vscode';
import { SELECT_ENV_COMMAND_ID, settings } from '../utilities';
import { PresetInfo, IButton } from '../interfaces';

const DEFAULT_BUTTON_TEXT = 'Select .env';
const DEFAULT_BUTTON_COLOR = new ThemeColor('statusBar.foreground');

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
    default: DEFAULT_BUTTON_COLOR,
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
    color: shouldWarn ? warningColor : DEFAULT_BUTTON_COLOR,
  };
}

interface Args {
  preset?: PresetInfo;
}

export class StatusBarButton implements IButton {
  private button: StatusBarItem;

  private garbage: Disposable[];

  constructor({ preset }: Args) {
    const { alignment, priority }: StatusBarItemPosition = getPositionConfig(settings.position());
    this.button = window.createStatusBarItem(alignment, priority);

    const text = preset?.id ?? DEFAULT_BUTTON_TEXT;
    const { text: styledText, color } = getButtonTextStyle(
      text,
      getWarningRegexConfig(settings.warning.regex()),
      getWarningColorConfig(settings.warning.color()),
    );
    this.button.command = SELECT_ENV_COMMAND_ID;
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    const onWarningConfigChange = settings.warning.onChange(() => this.setText(this.getText()));
    this.garbage = [this.button, onWarningConfigChange];
  }

  /**
   * Set button text.
   */
  public setText(text: string = DEFAULT_BUTTON_TEXT) {
    const style = getButtonTextStyle(
      text,
      getWarningRegexConfig(settings.warning.regex()),
      getWarningColorConfig(settings.warning.color()),
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
