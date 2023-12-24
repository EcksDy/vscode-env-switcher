# Release steps

`X.X.X` or `vX.X.X` represents the version you're about to release.  
Use `vX.<EVEN_NUMBER>.X` for releases and `vX.<ODD_NUMBER>.X-pre` for pre-releases.\*

- [ ] Checkout the `master` branch and pull the latest changes from origin.
- [ ] Ensure that all changes are documented in `CHANGELOG.md` under the `X.X.X` section.
- [ ] Update the version in `package.json` to `X.X.X`.
- [ ] Run `npm install` to update the `package-lock.json`.
- [ ] Commit the changes and push to origin.
- [ ] Create a tag (without any message), and push it to origin.
- [ ] Verify that the `Publish` GitHub action has completed successfully.
- [ ] Navigate to [releases](https://github.com/EcksDy/vscode-env-switcher/releases).
- [ ] Verify that the `vX.X.X` release exists with the correct description from changelog.
- [ ] 🎉

> \* _The `vX.<EVEN_NUMBER>.X` and `vX.<ODD_NUMBER>.X-pre` convetion is following the [VSCode documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#prerelease-extensions):_  
> _That is, if 1.2.3 is uploaded as a pre-release, the next regular release must be uploaded with a distinct version, such as 1.2.4. Full semver support will be available in the future.  
> ... So, we recommend that extensions use `major.EVEN_NUMBER.patch` for release versions and `major.ODD_NUMBER.patch` for pre-release versions. For example: `0.2.*` for release and `0.3.*` for pre-release._
