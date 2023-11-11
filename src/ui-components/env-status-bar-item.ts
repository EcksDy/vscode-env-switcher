import { container, singleton } from 'tsyringe';
import { Disposable, Memento, StatusBarItem, ThemeColor, window } from 'vscode';
import { IButton, PresetInfo } from '../interfaces';
import {
  DEFAULT_BUTTON_COLOR,
  EVENT_EMITTER,
  HAS_MONOREPO,
  IS_SINGLE_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  StatusBarItemPosition,
  WORKSPACE_STATE,
  WORKSPACE_WATCHER,
  config,
} from '../utilities';
import EventEmitter from 'events';
import { WorkspaceWatcher, WorkspaceWatcherContext } from 'vscode-helpers';

const DEFAULT_BUTTON_TEXT = 'Select preset';

interface Args {
  preset?: PresetInfo;
}

@singleton()
export class StatusBarButton implements IButton {
  private button: StatusBarItem;
  private persister: Memento;
  private garbage: Disposable[];

  constructor({ preset }: Args) {
    this.persister = container.resolve<Memento>(WORKSPACE_STATE);
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

    const eventEmitter = container.resolve<EventEmitter>(EVENT_EMITTER);
    eventEmitter.on(`workspaces-changed`, () => {
      this.button.command = this.getCommand();
    });

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
    const isSingleWorkspace = this.persister.get(IS_SINGLE_WORKSPACE, true);
    const hasMonorepo = this.persister.get(HAS_MONOREPO, false);

    if (isSingleWorkspace && !hasMonorepo) return SELECT_ENV_COMMAND_ID;

    return OPEN_VIEW_COMMAND_ID;
  }
}
