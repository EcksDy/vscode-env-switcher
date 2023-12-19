# Release steps

`X.X.X` or `vX.X.X` represents the version you're about to release.

- [ ] Checkout the `master` branch and pull the latest changes from origin.
- [ ] Ensure that all changes are documented in `CHANGELOG.md` under the `X.X.X` section.
- [ ] Update the version in `package.json` to `X.X.X`.
- [ ] Run `npm install` to update the `package-lock.json`.
- [ ] Commit the changes and push to origin.
- [ ] Create a tag named `vX.X.X` (without any message) and push it to origin.
- [ ] Verify that the `Publish` GitHub action has completed successfully.
- [ ] Navigate to [releases](https://github.com/EcksDy/vscode-env-switcher/releases).
- [ ] Verify that the `vX.X.X` release exists with the correct description from changelog.
- [ ] 🎉
