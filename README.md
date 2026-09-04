# StingJS Gauntlet

Independent external-consumer validation for StingJS release candidates.

This repository intentionally contains **no StingJS source checkout, worktree, subtree, local package path, or monorepo-relative dependency**. It exists to prove that a published StingJS release candidate can be consumed by a normal developer from the public package distribution.

## Automated gauntlet

Run the **StingJS RC Gauntlet** workflow manually and provide either an exact prerelease such as `1.0.0-rc.1` or a dist-tag such as `next`.

The workflow first resolves that selector to one exact `create-sting` version. Every lane then independently runs the real public-registry creator and requires the installed Sting packages to match that exact cohort.

It validates:

- `npm create sting@<version>` from the registry;
- `npm install`, `sting doctor`, `sting test`, and `sting ci` in the generated application;
- dependency integrity: no `workspace:`, `file:`, `link:`, absolute Sting source path, symlink into a source checkout, or unexpected Sting package version cohort;
- Android generated-app builds using its packaged Gradle/runtime artifacts, with no Sting source checkout and no Zig setup;
- iOS Simulator generated-app builds using its packaged runtime artifacts, with no Sting source checkout and no Zig setup;
- JSON evidence artifacts containing the exact Sting version, gauntlet commit, workflow run, platform, and timestamp.

## Local/device evidence

After an RC is published, use the same exact RC locally for the device-only portion of `chrisbirster/stingjs#134`:

```bash
npm create sting@1.0.0-rc.1 gauntlet-local
cd gauntlet-local
npm install
npx sting doctor
npx sting test
npx sting ci
npx sting run android
npx sting run ios
```

For Sting Go, start the same app with:

```bash
npx sting dev
```

Then use the QR/deep link in the released Sting Go client and verify initial load plus one reload.

Do not copy packages, native hosts, tarballs, or source files from the StingJS repository into this repository. The authoritative acceptance criteria live in `chrisbirster/stingjs#134`.
