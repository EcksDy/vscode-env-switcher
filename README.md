<img src="images/env-switcher.png" alt="Switch a .env preset from the status bar" height="120" align="right" />

# .ENV Switcher

Status bar extension that swaps(**overwrites**) the target file(`.env` by default) from provided presets. This means that the target file is a placeholder for presets.  
**It's strongly advised to backup your `.env` file before using this extension.**

## Features

- Displaying the currently selected preset in status bar.
- Ability to switch to another preset from the status bar.
- Warning in the status bar if the selected preset is matching a configurable regex pattern is selected. Matching `prod` by default.

<p align="center">
  <img src="images/preview.gif" alt="Switch a .env preset from the status bar" />
</p>

## Requirements

- For the status bar button to show, a file matching the target glob must be found in the workspace.
  - The `envSwitcher.glob.target` default is `**/.env`.
  - The `envSwitcher.glob.targetExclude` default is `**/node_modules/**`.
- To see presets when you click on the button or use the `.ENV Switcher: Select preset` command, files matching the presets glob must be found in the workspace.
  - The `envSwitcher.glob.target` default is `**/*.env`.
  - The `envSwitcher.glob.targetExclude` default is `**/node_modules/**`.

The default configuration will match any of the following presets in the workspace, as long as they're not in `node_modules` directory:

```list
/dev.env
/presets/Staging.env
/sub-dir/PRODUCTION.env
/very/nested/sIlLy_EXAmple123.env
```

_Don't forget to check that your `.gitignore` is still valid for these `.envs`_

## FAQ

### Why my target file is not detected?

- Make sure `envSwitcher.glob.target` is set to the correct glob pattern.
- Make sure `envSwitcher.glob.targetExclude` is set to the correct glob pattern.

### My presets are not detected, why?

- Make sure `envSwitcher.glob.presets` is set to the correct glob pattern.
- Make sure `envSwitcher.glob.presetsExclude` is set to the correct glob pattern.

For people preferring `.env.preset-name` naming convention, change the `envSwitcher.glob.presets` to `**/.env.*`

### I've added the target file, but the status bar button is not showing, why?

Extension will not start if no target was found when the directory was first opened.

- Ensure the target file would be found by the glob specified in `envSwitcher.glob.target` setting.
- Reload the window via `Developer: Reload Window` command.

### Will you support monorepos?

I'd like to, but there are so many ways to structure a monorepo and so many approaches to handle targets and presets that I'm not sure how to even approach it.  
If you'd like to help with an idea or join the discussion - you can do that [here](https://github.com/EcksDy/vscode-env-switcher/issues/17).

### How can I turn off the warning in the status bar?

Set `envSwitcher.warning.regex` to an empty string.

### Can I change the status bar button position?

There isn't a way to set an exact position on the status bar, the options on `envSwitcher.statusBarPosition` are what the VSCode API allows.

### Does it work with WSL?

Personally, I've tried it on WSL 2 and I haven't had any issues.
