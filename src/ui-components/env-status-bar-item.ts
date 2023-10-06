import { singleton } from 'tsyringe';
import { Disposable, Memento, StatusBarItem, ThemeColor, window } from 'vscode';
import { IButton, PresetInfo } from '../interfaces';
import {
  DEFAULT_BUTTON_COLOR,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  StatusBarItemPosition,
  config,
} from '../utilities';

const DEFAULT_BUTTON_TEXT = 'Select preset';

interface Args {
  preset?: PresetInfo;
}

@singleton()
export class StatusBarButton implements IButton {
  private button: StatusBarItem;

  private garbage: Disposable[];

  constructor(
    private workspaceState: Memento,
    { preset }: Args,
  ) {
    const { alignment, priority }: StatusBarItemPosition = config.position();
    this.button = window.createStatusBarItem(alignment, priority);

    const text = preset?.name ?? DEFAULT_BUTTON_TEXT;
    const { text: styledText, color } = this.getButtonTextStyle(
      text,
      config.warning.regex(),
      config.warning.color(),
    );
    this.button.command = this.getCommand();
    this.button.text = styledText;
    this.button.color = color;
    this.button.show();

    const onWarningConfigChange = config.warning.onChange(() => this.setText(this.getText()));

    this.garbage = [this.button, onWarningConfigChange];
  }

  /**
   * Set button text.
   */
  setText(text: string = DEFAULT_BUTTON_TEXT) {
    const style = this.getButtonTextStyle(text, config.warning.regex(), config.warning.color());
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

  private getCommand() {
    const isSingleWorkspace = this.workspaceState.get(`__isSingleWorkspace`, true);
    const hasMonorepo = this.workspaceState.get(`__hasMonorepo`, false);

    if (isSingleWorkspace && !hasMonorepo) return SELECT_ENV_COMMAND_ID;

    return OPEN_VIEW_COMMAND_ID;
  }
}
