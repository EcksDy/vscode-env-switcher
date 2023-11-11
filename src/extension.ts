import 'reflect-metadata';
import './utilities/event-emitter';

import EventEmitter from 'events';
import { container } from 'tsyringe';
import { ExtensionContext, Memento, commands, window } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { StatusBarButton } from './ui-components';
import {
  EVENT_EMITTER,
  IS_SINGLE_WORKSPACE,
  OPEN_VIEW_COMMAND_ID,
  SELECT_ENV_COMMAND_ID,
  WORKSPACE_FOLDER,
  WORKSPACE_STATE,
  WORKSPACE_WATCHER,
  Workspace,
  config,
} from './utilities';
import { registerInContainer } from './utilities/di-container';

export async function activate(context: ExtensionContext) {
  const { subscriptions, workspaceState } = context;
  registerInContainer([WORKSPACE_STATE, { useValue: workspaceState }]);
  const eventEmitter = container.resolve<EventEmitter>(EVENT_EMITTER);

  // Allows disabling per workspace
  // if (!config.enabled()) return;
  // Will not initialize if no target file is found
  // if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build

  const workspaceWatcher = registerWorkspaceWatcher<Workspace>(context, async (ev, folder) => {
    const persister = container.resolve<Memento>(WORKSPACE_STATE);
    const isSingleWorkspace = // TODO: Hacky, need to rethink
      (workspaceWatcher.workspaces.length === 0 && ev === WorkspaceWatcherEvent.Added) ||
      (workspaceWatcher.workspaces.length === 2 && ev === WorkspaceWatcherEvent.Removed);
    await persister.update(IS_SINGLE_WORKSPACE, isSingleWorkspace);
    eventEmitter.emit(`workspaces-changed`);

    if (ev !== WorkspaceWatcherEvent.Added) return;

    const workspaceContainer = container.createChildContainer();
    workspaceContainer.register(WORKSPACE_FOLDER, { useValue: folder });
    const newWorkspace = await Workspace.build(folder, workspaceContainer);
    return newWorkspace;
  });
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
