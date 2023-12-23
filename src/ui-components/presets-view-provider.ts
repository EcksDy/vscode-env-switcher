import { container } from 'tsyringe';
import { Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext } from 'vscode';
import { Preset } from '../interfaces';
import {
  SwitcherEvents,
  WORKSPACE_CONTAINER,
  WorkspaceContainer,
  getEventEmitter,
  isDefined,
} from '../utilities';
import { UiPreset, UiProject, WebviewEventType, WebviewEvents } from './interfaces';
import { getNonce, getUri } from './utilities';

interface PresetsViewProviderArgs {
  extensionUri: Uri;
}

export class PresetsViewProvider implements WebviewViewProvider {
  public static readonly viewType = 'envSwitcher.presetsView';
  private view?: WebviewView;
  private eventEmitter = getEventEmitter();
  private extensionUri: Uri;

  constructor({ extensionUri }: PresetsViewProviderArgs) {
    this.extensionUri = extensionUri;
  }

  public async resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext) {
    this.view = webviewView;

    webviewView.webview.options = {
      // Enable JavaScript in the webview
      enableScripts: true,
      // Restrict the webview to only load resources from the `out` and `webview-ui/public/build` directories
      localResourceRoots: [
        Uri.joinPath(this.extensionUri, 'out'),
        Uri.joinPath(this.extensionUri, 'node_modules', '@vscode/codicons', 'dist'),
        Uri.joinPath(this.extensionUri, 'webview-ui', 'public', 'build'),
      ],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    this.setWebviewMessageListener();

    this.eventEmitter.on(SwitcherEvents.TargetChanged, (newPreset: Preset) => {
      webviewView.webview.postMessage({
        action: WebviewEventType.CommandSelected,
        presetPath: newPreset.path,
      });
    });
  }

  private async getProjectsFromWorkspaces() {
    const { workspaces } = container.resolve<WorkspaceContainer>(WORKSPACE_CONTAINER);
    const projects: UiProject[] = [];
    for (const workspace of workspaces) {
      const projectPath = workspace.folder.uri.fsPath;
      const name = workspace.folder.name;
      const currentPreset = await workspace.getCurrentPreset();
      const rawPresets = await workspace.getPresets();

      const presets = rawPresets.map(this.getPresetMapper(projectPath, false));
      if (isDefined(currentPreset))
        presets.push(this.getPresetMapper(projectPath, true)(currentPreset));

      if (!presets?.length) continue;

      presets.sort((a, b) => a.name.localeCompare(b.name));
      projects.push({
        name,
        path: projectPath,
        presets,
        isLocked: false,
        isOpen: true,
      });
    }
    return projects;
  }

  private getHtmlForWebview(webview: Webview) {
    // The CSS file from the Svelte build output
    const stylesUri = getUri(webview, this.extensionUri, [
      'webview-ui',
      'public',
      'build',
      'bundle.css',
    ]);
    // The JS file from the Svelte build output
    const scriptUri = getUri(webview, this.extensionUri, [
      'webview-ui',
      'public',
      'build',
      'bundle.js',
    ]);
    const codiconsUri = getUri(webview, this.extensionUri, [
      'webview-ui',
      'public',
      'build',
      'codicon.css',
    ]);

    const nonce = getNonce();
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Webview</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
            webview.cspSource
          }; img-src ${webview.cspSource}; font-src ${
            webview.cspSource
          }; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri.toString()}">
          <link rel="stylesheet" href="${codiconsUri.toString()}" />
          <script defer nonce="${nonce}" src="${scriptUri.toString()}"></script>
        </head>
        <body>
        </body>
      </html>
    `;
  }

  private getPresetMapper(projectPath: string, isSelected: boolean) {
    return (preset: Preset): UiPreset => {
      const { name, path } = preset;
      return {
        name,
        path,
        projectPath,
        isSelected,
      };
    };
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   */
  private setWebviewMessageListener() {
    this.view?.webview.onDidReceiveMessage(async (data: WebviewEvents) => {
      console.debug(`[WebViewProvider - event - ${data.action}]`);

      switch (data.action) {
        case WebviewEventType.Refresh:
          const projects = await this.getProjectsFromWorkspaces();
          return void (await this.view?.webview.postMessage({
            action: WebviewEventType.Data,
            projects,
          }));
        case WebviewEventType.Selected:
          const event =
            data.selected.length === 1
              ? SwitcherEvents.PresetSelected
              : SwitcherEvents.PresetsSelected;
          return void this.eventEmitter.emit(event, {
            ...data.selected[0],
          });
      }
    });
  }
}
