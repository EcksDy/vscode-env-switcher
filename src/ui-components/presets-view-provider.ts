import { createHash } from 'crypto';
import {
  CancellationToken,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
} from 'vscode';
import { PresetsViewData, Project, Preset, ViewActions } from './interfaces';

export class PresetsViewProvider implements WebviewViewProvider {
  public static readonly viewType = 'envSwitcher.presetsView';

  private view?: WebviewView;

  constructor(private readonly _extensionUri: Uri) {}

  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken,
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: ViewActions) => {
      switch (data.action) {
        case 'init':
          // Pass dummy data to the webview
          return await webviewView.webview.postMessage({
            action: 'init',
            value: {
              multiSwitch: false,
              projects: getProjects(),
              presets: getPresets(),
            } as PresetsViewData,
          });
        case 'toggleLock':
          return window.showInformationMessage(`Project ${data.project} is locked`);

        case 'toggleMultiSwitch':
          return window.showInformationMessage(`Mutli switch is toggled`);

        case 'selectPreset':
          return window.showInformationMessage(
            `Preset ${data.newPreset} is selected for project ${data.project}`,
          ); // if multiwswitch is on, look for other projects with the same name and select them too
      }
    });
  }

  // public async addColor() {
  //   if (this.view) {
  //     this.view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
  //     await this.view.webview.postMessage({ type: 'addColor' });
  //   }
  // }

  private getHtmlForWebview(webview: Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'out', 'ui-components', 'webviews', 'presets', 'main.js'),
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'src', 'ui-components', 'webviews', 'presets', 'reset.css'),
    );
    const styleVSCodeUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'src', 'ui-components', 'webviews', 'presets', 'vscode.css'),
    );
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'src', 'ui-components', 'webviews', 'presets', 'main.css'),
    );

    const codiconsUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'),
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">

        <!--
          Use a content security policy to only allow loading styles from our extension directory,
          and only allow scripts that have a specific nonce.
          (See the 'webview-sample' extension sample for img-src content security policy examples)
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${
          webview.cspSource
        }; font-src ${webview.cspSource}; style-src ${
          webview.cspSource
        }; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleResetUri.toString()}" rel="stylesheet" />
        <link href="${styleVSCodeUri.toString()}" rel="stylesheet" />
        <link href="${styleMainUri.toString()}" rel="stylesheet" />
				<link href="${codiconsUri.toString()}" rel="stylesheet" />

        <title>Presets</title>
      </head>
      <body>
        <div class="head-line">
          <div class="inline-buttons-container"></div>
        </div>
        <ul class="project-list">
        </ul>

        <script nonce="${nonce}" src="${scriptUri.toString()}">
          console.log('hello darkness');
        </script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getHash(str: string) {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

function getProjects(): Project[] {
  return [
    {
      id: getHash('path/to/project'),
      locked: false,
      path: 'path/to/project',
      name: 'Project 1',
    },
    {
      id: getHash('path/to/project2'),
      locked: false,
      path: 'path/to/project2',
      name: 'Project 2',
    },
  ];
}

function getPresets(): Preset[] {
  const projectId = getHash('path/to/project');
  const projectId2 = getHash('path/to/project2');
  return [
    {
      id: getHash('path/to/project/preset1'),
      name: 'preset 1',
      selected: true,
      path: 'path/to/project/preset1',
      projectId,
    },
    {
      id: getHash('path/to/project/preset2'),
      name: 'preset 2',
      selected: false,
      path: 'path/to/project/preset2',
      projectId,
    },
    {
      id: getHash('path/to/project2/preset1'),
      name: 'preset 1',
      selected: true,
      path: 'path/to/project2/preset1',
      projectId: projectId2,
    },
    {
      id: getHash('path/to/project2/preset2'),
      name: 'preset 2',
      selected: false,
      path: 'path/to/project2/preset2',
      projectId: projectId2,
    },
  ];
}
