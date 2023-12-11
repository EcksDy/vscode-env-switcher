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
import { Preset, PresetsViewData, Project, ViewActions } from './interfaces';
import { getNonce, getUri } from './utilities';

export class PresetsViewProvider implements WebviewViewProvider {
  public static readonly viewType = 'envSwitcher.presetsView';

  private view?: WebviewView;

  constructor(private readonly extensionUri: Uri) {}

  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken,
  ) {
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
      'node_modules',
      '@vscode/codicons',
      'dist',
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

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param context A reference to the extension context
   */
  private setWebviewMessageListener() {
    this.view?.webview.onDidReceiveMessage(async (data: ViewActions) => {
      switch (data.action) {
        case 'init':
          // Pass dummy data to the webview
          return await this.view?.webview.postMessage({
            action: 'init',
            value: {
              multiSwitch: false,
              // projects: getProjects(),
              // presets: getPresets(),
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
}
