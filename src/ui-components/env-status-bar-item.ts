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
  private config: ExtensionConfig;

  private garbage: Disposable[];

  constructor({ config, fileWatcher }: Deps, { preset }: Args) {
    this.config = config;
    const { alignment, priority }: StatusBarItemPosition = this.config.position();
    this.button = window.createStatusBarItem(alignment, priority);

    const text = preset?.name ?? DEFAULT_BUTTON_TEXT;
    const { text: styledText, color } = this.getButtonTextStyle(
      text,
      this.config.warning.regex(),
      this.config.warning.color(),
    );
    this.button.command = SELECT_ENV_COMMAND_ID;
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    const onWarningConfigChange = this.config.warning.onChange(() => this.setText(this.getText()));

    this.fileWatcher = fileWatcher;
    this.garbage = [this.button, this.fileWatcher, onWarningConfigChange];
  }

  /**
   * Set button text.
   */
  setText(text: string = DEFAULT_BUTTON_TEXT) {
    const style = this.getButtonTextStyle(
      text,
      this.config.warning.regex(),
      this.config.warning.color(),
    );
    this.button.text = style.text;
    this.button.color = style.color;
  }

  /**
   * Get button text.
   */
  getText() {
    return this.button.text;
  }

  dispose() {
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }

  private getButtonTextStyle(text: string, regex: RegExp, warningColor: string | ThemeColor) {
    const shouldWarn = regex.test(text);
    const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

    return {
      text: styledText,
      color: shouldWarn ? warningColor : DEFAULT_BUTTON_COLOR,
    };
  }
}
