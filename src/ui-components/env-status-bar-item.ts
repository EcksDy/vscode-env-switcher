import { Disposable, StatusBarItem, ThemeColor, window } from 'vscode';
import { IButton, IFileWatcher, PresetInfo } from '../interfaces';
import {
  DEFAULT_BUTTON_COLOR,
  ExtensionConfig,
  SELECT_ENV_COMMAND_ID,
  StatusBarItemPosition,
  config,
} from '../utilities';

const DEFAULT_BUTTON_TEXT = 'Select preset';

interface Deps {
  config: ExtensionConfig;
  fileWatcher: IFileWatcher & Disposable;
}
interface Args {
  preset?: PresetInfo;
}

export class StatusBarButton implements IButton {
  private button: StatusBarItem;
  private fileWatcher: IFileWatcher & Disposable;

  private garbage: Disposable[];

  constructor({ config, fileWatcher }: Deps, { preset }: Args) {
    const { alignment, priority }: StatusBarItemPosition = config.position();
    this.button = window.createStatusBarItem(alignment, priority);

    const text = preset?.name ?? DEFAULT_BUTTON_TEXT;
    const { text: styledText, color } = getButtonTextStyle(
      text,
      config.warning.regex(),
      config.warning.color(),
    );
    this.button.command = SELECT_ENV_COMMAND_ID;
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    const onWarningConfigChange = config.warning.onChange(() => this.setText(this.getText()));

    this.fileWatcher = fileWatcher;
    this.garbage = [this.button, this.fileWatcher, onWarningConfigChange];
  }

  /**
   * Set button text.
   */
  public setText(text: string = DEFAULT_BUTTON_TEXT) {
    const style = getButtonTextStyle(text, config.warning.regex(), config.warning.color());
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
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }
}

function getButtonTextStyle(text: string, regex: RegExp, warningColor: string | ThemeColor) {
  const shouldWarn = regex.test(text);
  const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

  return {
    text: styledText,
    color: shouldWarn ? warningColor : DEFAULT_BUTTON_COLOR,
  };
}