<img src="images/env-switcher.png" alt="Switch a .env preset from the status bar" height="120" align="right" />

# .ENV Switcher

Status bar extension that swaps(**overwrites**) the `.env` file from provided presets. This essentially means that the `.env` file is a placeholder for presets.  
**It's strongly advised to backup your `.env` file before using this extension.**

## Features

- Displaying the currently selected `.env` preset in status bar.
- Ability to switch to another preset from the status bar/via command.
- Warning in the status bar if the selected preset is matching a configurable regex pattern is selected. Matching "prod" by default.
- Automatically updating target `.env` file if currently selected preset file is updated.

<p align="center">
  <img src="images/preview.gif" alt="Switch a .env preset from the status bar" />
</p>

## Requirements

- For the extension to work, a `.env` file must be found in the workspace.

## Settings

### Presets Glob - `envSwitcher.glob.presets`

Allows to narrow down the preset search. Searching all workspace directories except `**/node_modules/**`. This setting can be set per workspace. Extension will always look for `.env` file extension, even if it's not specified in the glob.

The default configuration `**/*.env` will match any of the following examples:

```list
/dev.env
/Staging.env
/nested/PRODUCTION.env
/nested/twice/sIlLy_EXAmple123.env
```

If you'd like to place the presets in a sub directory, the following configuration will work:

```glob
*/*
```

**Don't forget to check that your `.gitignore` is still valid for these `.envs`**

### Target .env Glob - `envSwitcher.glob.targetEnv`

Allows to specify the location of the `.env` that will serve as the placeholder. If multiple `.env` files exist in the workspace, will use the first file found, usually in the root of the workspace. Searching all workspace directories except `**/node_modules/**`. This setting can be set per workspace. Extension will always look for `.env` file extension, even if it's not specified in the glob.

The default configuration `**/.env` will match any of the following examples:

```list
/.env
/nested/.env
/nested/twice/.env
```

### Status Bar Position - `envSwitcher.statusBarPosition`

Will try to align the position of the status bar button, according to one of the options on the illustration.

Default configuration is outer left.

```list
 _________________________________________________________________________
|==(Outer left)========Inner left========Inner right========Outer right==|
 ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

This isn't completely under the extensions control, VS Code has predefined status bar positions for some of the items.

### Warning notification detection - `envSwitcher.warning.regex`

Allows to set a regex pattern(with case insensitive flag) to test for presets that should appear with a warning on the status bar button. By default warnings will appear for presets with 'prod'(any case) in their file name.  
Changing the setting to an empty string will disable warnings.

You'd want that setting if you'd like to visually distinguish some of the more sensitive presets, in case you're about to do something naughty.

### Warning notification color - `envSwitcher.warning.color`

Every one's theme is the different, configuring this setting will change the status bar button warnings color. Make it red.

You'd want that setting if you'd like to visually distinguish some of the more sensitive presets, in case you're about to do something naughty.

### Enable/Disable - `envSwitcher.enabled`

Allows to enable/disable this extension per workspace.
