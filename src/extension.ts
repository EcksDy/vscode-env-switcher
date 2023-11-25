import 'reflect-metadata';
import './utilities/event-emitter';

import { container } from 'tsyringe';
import { ExtensionContext, commands, window } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { StatusBarButton } from './ui-components';
import {
  MAIN_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  SwitcherEvents,
  WORKSPACE_CONTAINER,
  WORKSPACE_FOLDER,
  WORKSPACE_STATE,
  Workspace,
  WorkspaceContainer,
  config,
  getEventEmitter,
  getEventEmitterDisposable,
  registerInContainer,
} from './utilities';

const eventEmitter = getEventEmitter();

export async function activate(context: ExtensionContext) {
  const { subscriptions, workspaceState } = context;
  registerInContainer([WORKSPACE_STATE, { useValue: workspaceState }]);

  // Allows disabling per workspace
  // if (!config.enabled()) return;
  // Will not initialize if no target file is found
  // if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build

  const workspaceContainer = registerWorkspaceWatcher<Workspace>(
    context,
    async (ev, folder) => {
      if (ev !== WorkspaceWatcherEvent.Added) return;

      const workspaceContainer = container.createChildContainer();
      workspaceContainer.register(WORKSPACE_FOLDER, { useValue: folder });
      const newWorkspace = await Workspace.build(folder, workspaceContainer);

      return newWorkspace;
    },
    () => void eventEmitter.emit(SwitcherEvents.WorkspacesChanged),
  );
  await workspaceContainer.reload();
  registerInContainer([WORKSPACE_CONTAINER, { useValue: workspaceContainer }]);
  registerInContainer([
    MAIN_WORKSPACE,
    {
      useFactory(container) {
        const { workspaces } = container.resolve<WorkspaceContainer>(WORKSPACE_CONTAINER);
        if (workspaces.length !== 1) return null;

        return workspaces[0];
      },
    },
  ]);

  const mainWorkspace = container.resolve<Workspace | null>(MAIN_WORKSPACE); // TODO: Not really, dirty hack for now

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton({
    preset: (await mainWorkspace?.getCurrentPreset()) ?? undefined,
  });

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({ config }),
  );
  const openViewCmd = commands.registerCommand(OPEN_VIEW_COMMAND_ID, () =>
    window.showInformationMessage('=== placeholder for tree view ==='),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(
    workspaceContainer,
    selectEnvPresetCmd,
    openViewCmd,
    statusBarButton,
    container,
    getEventEmitterDisposable(),
  );
}

export function deactivate() {}
