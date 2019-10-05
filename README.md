# .ENV Switcher

Status bar extension that shows the current content of `.env` file and allows to swap (**overwrite**) `.env` files on click from the status bar.

## Features

Showing the currently selected `.env` preset in status bar:

![Status bar button](images/status-bar-readme.png)

Status bar will change appearance if preset contains "prod" in its name:

![Status bar when "prod" preset detected](images/status-bar-prod-readme.png)

Clicking the status bar button will bring up a prompt to switch the contents of the main `.env` file with the selected preset:

![Presets prompt](images/status-bar-prompt-readme.png)

## Requirements

For the status bar button to show, an `.env` file must be found at the root of the project.
A set of preset files must exist in the root of the project.
Preset file name should be matching the `*.env` glob pattern, i.e.:

- `dev.env`
- `Staging.env`
- `PRODUCTION.env`
