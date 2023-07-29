# Change Log

Changes to **.ENV Switcher** can be found in this file.

## - 0.4.1

- Added `husky` precommit hook to format and lint staged files.

## - 0.4.0

- Changing a selected preset file, will now update the target file.
- Added the following settings:
  - Glob pattern for target file. By matches the first found `.env` in the workspace.
  - Exclude glob pattern for target file. By default excludes anything in `node_modules`.
  - Glob pattern for preset files. By matches anything anywhere with a `.env` extension.
  - Exclude glob pattern for target file. By default excludes anything in `node_modules`.

### BREAKING CHANGES

- Removed backup functionality.
- Removed "Show current .env file" from `selectEnvPreset` command options.

## - 0.3.2

- Fixed write files paths for linux.

## - 0.3.0

- Added configuration to disable the backup function.
- Added commands to clear `.env` backups.
- Added status bar button position configuration.
- Added regex matching and display color configurations for warnings.
- Added glob configuration to locate presets.
- Updated README.md.

## - 0.2.0

- Fixed URI's for linux once again.
- Cleaner status bar display.
- Added original and session `.env` content backup to VSCodes AppData local storage per workspace.
- Added commands to view current workspace original and session `.env` content backups.
- Undergone major refactor.
- ✨ Added GIFs to the README.md.

## - 0.1.3

- The directory of the first detected `.env` file will be used as the root folder for the extension. All presets should be saved in that folder. Root directory still can be used.  
  Was contributed by [@esttenorio](https://github.com/esttenorio).

## - 0.1.2

- Now using activation events - extension won't try to activate unless a workspace with `.env` file is found.
- Added a CHANGELOG.md file.

## - 0.1.1

- Broken URI's are fixed for linux.
- No longer showing pop-up warning message for missing headers, instead writing to log.

## - 0.1.0

- Initial release.
