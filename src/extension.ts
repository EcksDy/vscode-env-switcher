import 'reflect-metadata';
import './utilities/event-emitter';

import { container } from 'tsyringe';
import { ExtensionContext, Memento, commands, window } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { StatusBarButton } from './ui-components';
import {
  IS_SINGLE_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  WORKSPACE_FOLDER,
  WORKSPACE_STATE,
  WORKSPACE_WATCHER,
  Workspace,
  config,
  SwitcherEvents,
  getEventEmitter,
} from './utilities';
import { registerInContainer } from './utilities/di-container';

const eventEmitter = getEventEmitter();

export async function activate(context: ExtensionContext) {
  const { subscriptions, workspaceState } = context;
  registerInContainer([WORKSPACE_STATE, { useValue: workspaceState }]);

  // Allows disabling per workspace
  // if (!config.enabled()) return;
  // Will not initialize if no target file is found
  // if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build

  const workspaceWatcher = registerWorkspaceWatcher<Workspace>(
    context,
    async (ev, folder) => {
      if (ev !== WorkspaceWatcherEvent.Added) return;

      const workspaceContainer = container.createChildContainer();
      workspaceContainer.register(WORKSPACE_FOLDER, { useValue: folder });
      const newWorkspace = await Workspace.build(folder, workspaceContainer);

      return newWorkspace;
    },
    async () => {
      const persister = container.resolve<Memento>(WORKSPACE_STATE);
      console.log(`workspaceWatcher.workspaces`, workspaceWatcher.workspaces);

      const isSingleWorkspace = workspaceWatcher.workspaces.length === 1;
      await persister.update(IS_SINGLE_WORKSPACE, isSingleWorkspace);

      eventEmitter.emit(SwitcherEvents.WorkspaceChanged);
    },
  );
  await workspaceWatcher.reload();
  registerInContainer([WORKSPACE_WATCHER, { useValue: workspaceWatcher }]);

  const mainWorkspace = workspaceWatcher.workspaces[0]; // TODO: Not really, dirty hack for now

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton({
    preset: (await mainWorkspace.getCurrentPreset()) ?? undefined,
  });

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      config,
      presetManager: mainWorkspace,
    }),
  );
  const openViewCmd = commands.registerCommand(OPEN_VIEW_COMMAND_ID, () =>
    window.showInformationMessage('Open View (place holder for tree view)'),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(workspaceWatcher, selectEnvPresetCmd, openViewCmd, statusBarButton, container);
}

export function deactivate() {}
