import 'reflect-metadata';

import { container } from 'tsyringe';
import { ExtensionContext, Memento, commands, window } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { StatusBarButton } from './ui-components';
import EventEmitter from 'events';
import {
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  WORKSPACE_FOLDER,
  WORKSPACE_STATE,
  Workspace,
  config,
} from './utilities';
import { initContainer } from './utilities/di-container';

export async function activate(context: ExtensionContext) {
  const { subscriptions, workspaceState } = context;
  initContainer([WORKSPACE_STATE, { useValue: workspaceState }]);

  // Allows disabling per workspace
  // if (!config.enabled()) return;
  // Will not initialize if no target file is found
  // if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build

  const eventEmitter = new EventEmitter();
  const workspaceWatcher = registerWorkspaceWatcher<Workspace>(context, async (ev, folder) => {
    eventEmitter.emit(`workspaces-changed`, { workspaceCount: workspaceWatcher.workspaces.length });
    const persister = container.resolve<Memento>(WORKSPACE_STATE);
    const isSingleWorkspace = // TODO: Hacky, need to rethink
      (workspaceWatcher.workspaces.length === 0 && ev === WorkspaceWatcherEvent.Added) ||
      (workspaceWatcher.workspaces.length === 2 && ev === WorkspaceWatcherEvent.Removed);
    await persister.update(`__isSingleWorkspace`, isSingleWorkspace);

    if (ev !== WorkspaceWatcherEvent.Added) return;

    const workspaceContainer = container.createChildContainer();
    workspaceContainer.register(WORKSPACE_FOLDER, { useValue: folder });
    const newWorkspace = await Workspace.build(folder, workspaceContainer);
    return newWorkspace;
  });
  await workspaceWatcher.reload();

  const mainWorkspace = workspaceWatcher.workspaces[0]; // TODO: Not really, dirty hack for now

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton(workspaceState, {
    preset: (await mainWorkspace.getCurrentPreset()) ?? undefined,
  });

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      config,
      presetManager: mainWorkspace,
      button: statusBarButton,
    }),
  );
  const openViewCmd = commands.registerCommand(OPEN_VIEW_COMMAND_ID, () =>
    window.showInformationMessage('Open View'),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(workspaceWatcher, selectEnvPresetCmd, openViewCmd, statusBarButton, container);
}

export function deactivate() {}
