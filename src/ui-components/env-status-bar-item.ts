import { container, singleton } from 'tsyringe';
import { Disposable, StatusBarItem, window } from 'vscode';
import { IButton, PresetInfo } from '../interfaces';
import {
  DEFAULT_BUTTON_COLOR,
  MAIN_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  StatusBarItemPosition,
  SwitcherEvents,
  WORKSPACE_CONTAINER,
  Workspace,
  WorkspaceContainer,
  config,
  getEventEmitter,
} from '../utilities';

const DEFAULT_BUTTON_TEXT = 'Select preset';
const MRWORKSPACE_BUTTON_TEXT = '.ENV Switcher';
const ERROR_BUTTON_TEXT = 'No file';

interface Args {
  preset?: PresetInfo;
}

@singleton()
export class StatusBarButton implements IButton {
  private hasOneTarget = false;
  private button: StatusBarItem;
  private garbage: Disposable[];
  private eventEmitter = getEventEmitter();

  constructor({ preset }: Args) {
    const { alignment, priority }: StatusBarItemPosition = config.position();
    this.button = window.createStatusBarItem(alignment, priority);

    this.refresh(preset?.name);
    this.button.show();

    const onWarningConfigChange = config.warning.onChange(() => this.setText(this.getText()));

    this.eventEmitter.on(SwitcherEvents.WorkspacesChanged, async () => {
      console.debug(`[StatusBarButton - ${SwitcherEvents.WorkspacesChanged}]`);
      const { workspaces } = container.resolve<WorkspaceContainer>(WORKSPACE_CONTAINER);

      if (!workspaces?.length || workspaces?.length > 1) return this.refresh();

      const currentPreset = await workspaces[0].getCurrentPreset();
      this.refresh(currentPreset?.name);
    });
    this.eventEmitter.on(SwitcherEvents.TargetChanged, (newPreset: PresetInfo) => {
      console.debug(`[StatusBarButton - ${SwitcherEvents.TargetChanged}]`, { newPreset });
      this.setText(newPreset.name);
    });
    this.eventEmitter.on(SwitcherEvents.TargetChangedError, () => {
      console.debug(`[StatusBarButton - ${SwitcherEvents.TargetChangedError}]`);
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

    this.button.text = this.hasOneTarget ? styledText : MRWORKSPACE_BUTTON_TEXT;
    this.button.color = shouldWarn ? warningColor : DEFAULT_BUTTON_COLOR;
  }

  private refreshCommand() {
    this.button.command = this.hasOneTarget ? SELECT_ENV_COMMAND_ID : OPEN_VIEW_COMMAND_ID;
  }

  private refresh(text?: string) {
    this.ensureHasOneTarget();
    this.refreshCommand();
    this.setText(text);
  }

  private ensureHasOneTarget() {
    const mainWorkspace = container.resolve<Workspace | null>(MAIN_WORKSPACE);
    if (!mainWorkspace) return void (this.hasOneTarget = false);

    const isMonoRepo = mainWorkspace.isMonoRepo();
    this.hasOneTarget = !isMonoRepo;
  }

  dispose() {
    this.garbage.forEach((disposable) => void disposable.dispose());
    this.garbage = [];
  }
}
