<img src="images/env-switcher.png" alt="Switch a .env preset from the status bar" height="120" align="right" />

# .ENV Switcher

Status bar extension that swaps(**overwrites**) the `.env` file from provided presets.

## Features

- Displaying the currently selected `.env` preset in status bar.
- Ability to switch to another preset from the status bar.
- Warning in the status bar if the selected preset is matching a configurable regex pattern is selected. Matching "prod" by default.
- View of the original `.env` content that existed in the workspace when it was first opened with the extension active.
- View of the `.env` content that existed in the workspace when it was opened in the current session.

<p align="center">
  <img src="images/preview.gif" alt="Switch a .env preset from the status bar" />
</p>

## Backups

By default the extension will backup the content of the current `.env` file in case of unwanted overwrite.

The `.env` backups are saved per workspace on the filesystem in VSCode's dedicated workspaces data directory.

It's possible to view the backups by running the `.ENV Switcher: Show...` command.  
It's possible to delete the backups by running a `.ENV Switcher: Clear...` command.

_After getting familiar with the extension it's advised to set the `envSwitcher.backups.enabled` option to false in the configuration._

## Requirements

- For the status bar button to show, an `.env` file must be found in the workspace.
- Preset files must be in the root directory.

It's possible to configure a glob pattern to detect the presets by setting `envSwitcher.presetsGlob` configuration. The default configuration will match any of the following examples, if they're found in the root folder:

```list
/dev.env
/Staging.env
/PRODUCTION.env
/sIlLy_EXAmple123.env
```

If you'd like to place the presets in a sub directory, the following configuration will work:

```glob
*/*
```

_Don't forget to check that your `.gitignore` is still valid for these `.envs`_
