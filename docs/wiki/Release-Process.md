# Release Process

## Versioning Policy
Geodesis adheres to [Semantic Versioning 2.0.0](https://semver.org/).

- **MAJOR** version for incompatible API or architecture shifts.
- **MINOR** version for new backward-compatible feature releases.
- **PATCH** version for backward-compatible bug fixes and patch updates.

## Release Checklist
1. Update `CHANGELOG.md` with version notes.
2. Verify local CI check: `npm run ci`.
3. Tag the release commit: `git tag -a v1.0.0 -m "Release v1.0.0"`.
4. Push tag to GitHub: `git push origin v1.0.0`.
5. Draft GitHub Release notes attaching release build artifacts.
