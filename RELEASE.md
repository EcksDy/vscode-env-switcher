# Release steps

`X.X.X` or `vX.X.X` represents the version you're about to release.

- [ ] Checkout the `dev` branch and pull the latest changes from origin.
- [ ] Ensure that all changes are documented in `CHANGELOG.md` under the `X.X.X` section.
- [ ] Update the version in `package.json` to `X.X.X`.
- [ ] Run `npm install` to update the `package-lock.json`.
- [ ] Commit the changes and push to origin.
- [ ] Open a pull request titled `vX.X.X` from `dev` to `master` and squash merge it.
- [ ] Verify that the `Publish` GitHub action has completed successfully.
- [ ] Checkout the `master` branch and pull the latest changes from origin.
- [ ] Create a tag named `vX.X.X` (without any message) and push it to origin.
- [ ] Navigate to [new release](https://github.com/EcksDy/vscode-env-switcher/releases/new).
- [ ] Select the `vX.X.X` tag from the dropdown menu.
- [ ] Set the title as `vX.X.X`.
- [ ] Copy the changes listed under the next version from `CHANGELOG.md` and paste them into the release body.
- [ ] Check `Set as the latest release` and hit `Publish release`.
- [ ] 🎉
