<img src="images/env-switcher.png" alt="Switch a .env preset from the status bar" height="120" align="right" />

# .ENV Switcher

Status bar extension that swaps(**overwrites**) the target file(`.env` by default) from provided presets. This means that the target file is a placeholder for presets.  
**It's strongly advised to backup your `.env` file before using this extension.**

## Features

- Displaying the currently selected `.env` preset in status bar.
- Ability to switch to another preset from the status bar.
- Warning in the status bar if the selected preset is matching a configurable regex pattern is selected. Matching "prod" by default.
- View of the original `.env` content that existed in the workspace when it was first opened with the extension active.
- View of the `.env` content that existed in the workspace when it was opened in the current session.

<p align="center">
  <img src="images/preview.gif" alt="Switch a .env preset from the status bar" />
</p>

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
