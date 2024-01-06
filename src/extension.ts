// Must be first for reflect-metadata to work and event emitter to register correctly
import 'reflect-metadata';
import './utilities/event-emitter';

import { container } from 'tsyringe';
import { ExtensionContext, commands, window } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { openView } from './command-implementations/open-view';
import { PresetsViewProvider, StatusBarButton } from './ui-components';
import {
  HAS_WORKSPACE_TARGET,
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
  const { subscriptions, workspaceState, extensionUri } = context;
  registerInContainer([WORKSPACE_STATE, { useValue: workspaceState }]);

  // Allows disabling per workspace
  // if (!config.enabled()) return;
  // Will not initialize if no target file is found
  // if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build

  const workspaceContainer = registerWorkspaceWatcher<Workspace>(
    context,
    async (ev, folder) => {
      const hasWorkspaceTarget = workspaceState.get<boolean>(HAS_WORKSPACE_TARGET);
      const { workspaces } = container.resolve<WorkspaceContainer>(WORKSPACE_CONTAINER);
      if (ev === WorkspaceWatcherEvent.Removed) {
        if (!workspaces.length || !hasWorkspaceTarget)
          return await workspaceState.update(HAS_WORKSPACE_TARGET, false);

        const workspaceTargets = await Promise.all(
          workspaces.map((workspace) => workspace.getCurrentPreset()),
        );
        const hasTargets = workspaceTargets.some((target) => !!target);
        return await workspaceState.update(HAS_WORKSPACE_TARGET, hasTargets);
      }

      const workspaceContainer = container.createChildContainer();
      workspaceContainer.register(WORKSPACE_FOLDER, { useValue: folder });
      const newWorkspace = await Workspace.build(folder, workspaceContainer);

      if (!hasWorkspaceTarget)
        await workspaceState.update(
          HAS_WORKSPACE_TARGET,
          !!(await newWorkspace.getCurrentPreset()),
        );

      return newWorkspace;
    },
    () => void eventEmitter.emit(SwitcherEvents.WorkspacesChanged),
  );
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
  await workspaceContainer.reload();

  const mainWorkspace = container.resolve<Workspace | null>(MAIN_WORKSPACE);

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton({
    preset: (await mainWorkspace?.getCurrentPreset()) ?? undefined,
  }); // TODO: Add StatusBarButton.build and get preset asynchronously there

  const provider = new PresetsViewProvider({ extensionUri });
  const presetView = window.registerWebviewViewProvider(PresetsViewProvider.viewType, provider);

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(
    SELECT_ENV_COMMAND_ID,
    selectEnvPreset({ config }),
  );
  const openViewCmd = commands.registerCommand(OPEN_VIEW_COMMAND_ID, openView);

  /* GARBAGE REGISTRATION */
  subscriptions.push(
    workspaceContainer,
    selectEnvPresetCmd,
    openViewCmd,
    statusBarButton,
    container,
    presetView,
    getEventEmitterDisposable(),
  );
}

export function deactivate() {}
