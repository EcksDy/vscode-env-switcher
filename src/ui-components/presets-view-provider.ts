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

interface Project {
  id: string;
  locked: boolean;
  path: string; // absolute path
  name: string;
  presets: Preset[];
}

interface Preset {
  id: string;
  name: string;
  selected: boolean;
  path: string; // absolute path
}

interface PresetsViewData {
  multiSwitch: boolean;
  projects: Project[];
}

interface ToggleLock {
  action: 'toggleLock';
  project: string; // project path
  newState: boolean;
}

interface ToggleMultiSwitch {
  action: 'toggleMultiSwitch';
  newState: boolean;
}

interface SelectPreset {
  action: 'selectPreset';
  project: string; // project path
  newPreset: string;
}

type ViewActions = ToggleLock | ToggleMultiSwitch | SelectPreset;

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

    webviewView.onDidChangeVisibility(async (e) => {
      console.log('visibility changed', e);

      if (!webviewView.visible) return;

      // Pass dummy data to the webview
      await webviewView.webview.postMessage({
        action: 'init',
        value: {
          multiSwitch: false,
          projects: [
            {
              id: getHash('path/to/project'),
              locked: false,
              path: 'path/to/project',
              name: 'Project 1',
              presets: [
                {
                  id: getHash('path/to/project/preset1'),
                  name: 'preset 1',
                  selected: true,
                  path: 'path/to/project/preset1',
                },
                {
                  id: getHash('path/to/project/preset2'),
                  name: 'preset 2',
                  selected: false,
                  path: 'path/to/project/preset2',
                },
              ],
            },
            {
              id: getHash('path/to/project2'),
              locked: false,
              path: 'path/to/project2',
              name: 'Project 2',
              presets: [
                {
                  id: getHash('path/to/project2/preset1'),
                  name: 'preset 1',
                  selected: true,
                  path: 'path/to/project2/preset1',
                },
                {
                  id: getHash('path/to/project2/preset2'),
                  name: 'preset 2',
                  selected: false,
                  path: 'path/to/project2/preset2',
                },
              ],
            },
          ],
        } as PresetsViewData,
      });
    });

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data: ViewActions) => {
      switch (data.action) {
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
      Uri.joinPath(this._extensionUri, 'views', 'presets', 'main.js'),
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'views', 'presets', 'reset.css'),
    );
    const styleVSCodeUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'views', 'presets', 'vscode.css'),
    );
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(this._extensionUri, 'views', 'presets', 'main.css'),
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
        <div class="head-line"></div>
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
