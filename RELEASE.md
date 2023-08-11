# Release steps

`X.X.X` / `vX.X.X` means the version you're about to release.

- [ ] Checkout `dev` branch and pull from origin.
- [ ] Make sure changes are written down at `CHANGELOG.md` under the `X.X.X`.
- [ ] Update `package.json` to `X.X.X`.
- [ ] Run `npm install` to update `package-lock.json`.
- [ ] Commit and push to origin.
- [ ] Open a pull request titled `vX.X.X` from `dev` to `master` and squash it.
- [ ] Make sure the `Publish` github action succeeded.
- [ ] Checkout `master` branch and pull from origin.
- [ ] Create a tag named `vX.X.X`, without message, push it.
- [ ] Go to [new release](https://github.com/EcksDy/vscode-env-switcher/releases/new).
- [ ] Choose the `vX.X.X` tag from the dropdown.
- [ ] Title is `vX.X.X`.
- [ ] Copy changes under the next version from `CHANGELOG.md` to the body.
- [ ] Set as the latest release and hit `Publish release`.
- [ ] 🎉
