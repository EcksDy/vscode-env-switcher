# .ENV Switcher

Status bar extension that enables management of `.env` file with a set of presets by swapping (**overwriting**) the main `.env` file content.

## Features

<img src="https://i.gyazo.com/ff461d74ae6c359bc5e293aa7680b5df.gif" alt="Switch a .env preset from the status bar" width="600" />

- Displaying the currently selected `.env` preset in status bar.
- Ability to switch to another preset from the status bar.
- Warning if a preset that contants the word "prod" is selected.

<img src="https://i.gyazo.com/96e43361a2febf063c4cc02a059cde85.gif" alt="Restore original .env" width="600" />

- View of the original `.env` content that existed in the workspace when it was first opened with the extension active. Useful in case of undesired `.env` overwrite.  
  _VSCode AppData local storage(vscode.workspaceState) is used to save the original .env content._

<img src="https://i.gyazo.com/ad27c5e39c2ea085f909d34bc5103135.gif" alt="Restore session .env" width="600" />

- View of the `.env` content that existed in the workspace when it was opened in the current session. Useful in case of undesired `.env` overwrite.  
  _VSCode AppData local storage(vscode.workspaceState) is used to save the session .env content._

## Requirements

- For the status bar button to show, an `.env` file must be found in the workspace.
- Preset files must be in the same directory as the original `.env` file for them to be detected by the extension.
- Preset file name should be matching the `*.env` glob pattern, i.e.:
  - `dev.env`
  - `Staging.env`
  - `PRODUCTION.env`
  - `sIlLy_EXAmple123.env`
