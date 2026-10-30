# Releases and reviewed upgrades

1. Review the change plan and ADRs. Update the package version and pinned dependencies.
2. Run generator and backend checks. Run disposable Docker integration tests on a
   compatible host. Run native-client smoke scenarios before claiming new support.
3. Generate contracts, build, and run `npm run pack:release`.
4. Run `npm run test:package`; inspect the npm package file list for secrets and omissions.
5. Distribute the immutable `.tgz`, checksum and verification report through the approved
   internal location. Do not copy npm tokens or personal configuration.

For an existing generated project:

```powershell
npm exec --package="C:\TeamTools\create-node-backend-1.0.0.tgz" -- create-node-backend --compare C:\TeamTools\create-node-backend-1.0.0.tgz --project C:\Projects\delivery-api
```

The comparison command reads the new archive and reports local/upstream changes.
It does not edit the project or install the archive's code. Review conflicts and
apply approved changes in a PR. Preserve project documentation, code and ADRs.
Rebaseline only after approving the exact changes; retain the old manifest in Git.

Package archives avoid registry subscriptions. Existing storage, hosting and CI
resources still have costs/limits. Checksums are useful only when their source is
trusted; they do not prove an unknown publisher is trustworthy.
