# StingJS Gauntlet

Independent external-consumer validation for StingJS release candidates.

This repository intentionally contains **no StingJS source checkout, worktree, subtree, local package path, or monorepo-relative dependency**. It exists to prove that a published StingJS release candidate can be consumed by a normal developer from the public package distribution.

The gauntlet validates:

- `npm create sting@<version>` from the registry;
- `npm install`, `sting doctor`, `sting test`, and `sting ci` in the generated application;
- dependency integrity: no `workspace:`, `file:`, `link:`, absolute Sting source path, or unexpected Sting package version cohort;
- Android generated-app builds without Zig or a Sting source checkout;
- iOS Simulator generated-app builds without Zig or a Sting source checkout;
- optional local `sting run` and Sting Go smoke evidence.

The authoritative release acceptance criteria live in `chrisbirster/stingjs#134`.
