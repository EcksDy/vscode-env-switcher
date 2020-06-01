# .ENV Switcher

Status bar extension that enables management of `.env` file with a set of presets by swapping (**overwriting**) the main `.env` file content.

## Features

[![Image from Gyazo](https://i.gyazo.com/ff461d74ae6c359bc5e293aa7680b5df.gif)](https://gyazo.com/ff461d74ae6c359bc5e293aa7680b5df)

- Displaying the currently selected `.env` preset in status bar.
- Ability to switch to another preset from the status bar.
- Warning if a preset that contants the word "prod" is selected.

[![Image from Gyazo](https://i.gyazo.com/96e43361a2febf063c4cc02a059cde85.gif)](https://gyazo.com/96e43361a2febf063c4cc02a059cde85)

- View of the original `.env` content that existed in the workspace when it was first opened with the extension active. Useful in case of undesired `.env` overwrite.  
  _VSCode AppData local storage(vscode.workspaceState) is used to save the original .env content._

[![Image from Gyazo](https://i.gyazo.com/ad27c5e39c2ea085f909d34bc5103135.gif)](https://gyazo.com/ad27c5e39c2ea085f909d34bc5103135)

- View of the `.env` content that existed in the workspace when it was opened in the current session. Useful in case of undesired `.env` overwrite.  
  _VSCode AppData local storage(vscode.workspaceState) is used to save the original .env content._

## Requirements

- For the status bar button to show, an `.env` file must be found in the workspace.
- Preset files must be in the same directory as the original `.env` file for them to be detected by the extension.
- Preset file name should be matching the `*.env` glob pattern, i.e.:
  - `dev.env`
  - `Staging.env`
  - `PRODUCTION.env`
  - `sIlLy_EXAmple123.env`
