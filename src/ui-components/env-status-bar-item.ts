import { container, singleton } from 'tsyringe';
import { Disposable, Memento, StatusBarItem, window } from 'vscode';
import { IButton, Preset, PresetInfo } from '../interfaces';
import {
  DEFAULT_BUTTON_COLOR,
  HAS_MONOREPO,
  IS_SINGLE_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  StatusBarItemPosition,
  SwitcherEvents,
  WORKSPACE_STATE,
  config,
  getEventEmitter,
} from '../utilities';

const DEFAULT_BUTTON_TEXT = 'Select preset';
const ERROR_BUTTON_TEXT = 'No file';

interface Args {
  preset?: PresetInfo;
}

@singleton()
export class StatusBarButton implements IButton {
  private button: StatusBarItem;
  private garbage: Disposable[];
  private persister: Memento = container.resolve<Memento>(WORKSPACE_STATE);
  private eventEmitter = getEventEmitter();

  constructor({ preset }: Args) {
    const { alignment, priority }: StatusBarItemPosition = config.position();
    this.button = window.createStatusBarItem(alignment, priority);

    this.refresh(preset?.name);
    this.button.show();

    const onWarningConfigChange = config.warning.onChange(() => this.setText(this.getText()));

    this.eventEmitter.on(SwitcherEvents.WorkspaceChanged, () => {
      console.debug(`[StatusBarButton - SwitcherEvents.WorkspaceChanged]`);
      this.refresh();
    });
    this.eventEmitter.on(SwitcherEvents.PresetSelected, (selectedPreset: Preset) => {
      console.debug(`[StatusBarButton - SwitcherEvents.PresetSelected]`, { selectedPreset });
      this.setText(selectedPreset.name);
    });
    this.eventEmitter.on(SwitcherEvents.PresetSelectedError, () => {
      console.debug(`[StatusBarButton - SwitcherEvents.PresetSelectedError]`);
      this.setText(ERROR_BUTTON_TEXT);
    });

    this.garbage = [this.button, onWarningConfigChange];
  }

  /**
   * Get button text.
   */
  getText() {
    return this.button.text;
  }

  /**
   * Set button text.
   */
  setText(text: string = DEFAULT_BUTTON_TEXT) {
    const regex = config.warning.regex();
    const warningColor = config.warning.color();
    const shouldWarn = regex.test(text);
    const styledText = shouldWarn ? `$(issue-opened) ${text.toUpperCase()}` : text;

    this.button.text = styledText;
    this.button.color = shouldWarn ? warningColor : DEFAULT_BUTTON_COLOR;
  }

  private refresh(text: string = DEFAULT_BUTTON_TEXT) {
    const isSingleEnv = this.isSingleTargetMode();
    this.button.command = isSingleEnv ? SELECT_ENV_COMMAND_ID : OPEN_VIEW_COMMAND_ID;
    this.setText(isSingleEnv ? text ?? DEFAULT_BUTTON_TEXT : `.ENV view`);

    // TODO: if (isSingleEnv) then check for the current preset name. Think of a way to access the presetmanager of a single workspace
  }

  private isSingleTargetMode() {
    const isSingleWorkspace = this.persister.get(IS_SINGLE_WORKSPACE, true);
    const hasMonorepo = this.persister.get(HAS_MONOREPO, false);

    return isSingleWorkspace && !hasMonorepo;
  }

  dispose() {
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }
}
