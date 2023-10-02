import { ExtensionContext, commands } from 'vscode';
import { WorkspaceWatcherEvent, registerWorkspaceWatcher } from 'vscode-helpers';
import { selectEnvPreset } from './command-implementations';
import { StatusBarButton } from './ui-components';
import { SELECT_ENV_COMMAND_ID, Workspace, config, fsHelper } from './utilities';

export async function activate(context: ExtensionContext) {
  const { subscriptions, workspaceState } = context;

  // Allows disabling per workspace
  if (!config.enabled()) return;
  // Will not initialize if no target file is found
  if (!(await fsHelper.findTarget(config))) return; // TODO: Move into Workspace.build
  const workspaceWatcher = registerWorkspaceWatcher<Workspace>(context, async (ev, folder) => {
    if (ev !== WorkspaceWatcherEvent.Added) return;

    const newWorkspace = await Workspace.build(folder, workspaceState);
    return newWorkspace;
  });
  await workspaceWatcher.reload();

  const mainWorkspace = workspaceWatcher.workspaces[0]; // TODO: Not really, dirty hack for now

  /* UI COMPONENTS */
  const statusBarButton = new StatusBarButton(
    { fileWatcher: mainWorkspace.fileWatcher },
    {
      preset: (await mainWorkspace.getCurrentPreset()) ?? undefined,
    },
  );

  /* COMMANDS */
  const selectEnvPresetCmd = commands.registerCommand(SELECT_ENV_COMMAND_ID, () =>
    selectEnvPreset({
      config,
      presetManager: mainWorkspace,
      button: statusBarButton,
    }),
  );

  /* GARBAGE REGISTRATION */
  subscriptions.push(workspaceWatcher, selectEnvPresetCmd, statusBarButton);
}

export function deactivate() {}
