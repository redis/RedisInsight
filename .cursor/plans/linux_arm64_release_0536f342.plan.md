---
name: Linux ARM64 Release
overview: "Plan support for Linux ARM64 desktop release artifacts for GitHub issue #5637 by updating Electron builder targets, release workflows, publishing metadata, and validation coverage without changing application behavior."
todos:
  - id: phase1-packaging
    content: Add Linux ARM64 packaging targets and manual build entry points
    status: pending
  - id: phase2-release
    content: Update publication, summaries, and checksum mappings for Linux ARM64 artifacts
    status: pending
  - id: phase3-validate
    content: Validate ARM64 native-module/runtime behavior and finalize rollout scope
    status: pending
isProject: false
---

# Implementation Plan: Linux ARM64 release support

**GitHub Issue:** [#5637](https://github.com/redis/RedisInsight/issues/5637)
**Plan Date:** 2026-03-16
**Planner:** Cursor Agent

## Executive Summary

Add Linux ARM64 as a first-class desktop release target. The current gap is not just missing publication: the repo is explicitly configured to build and publish only Linux `x64` desktop artifacts. The safest rollout is a small PR stack:

- PR 1: enable Linux ARM64 packaging targets and manual build entry points
- PR 2: extend release publication, summaries, checksums, and artifact metadata
- PR 3: validate runtime/build behavior for native modules and release test coverage

**Key files already showing the constraint:**

- [electron-builder.json](electron-builder.json)
- [.github/workflows/pipeline-build-linux.yml](.github/workflows/pipeline-build-linux.yml)
- [.github/workflows/manual-build.yml](.github/workflows/manual-build.yml)
- [.github/workflows/aws-upload-prod.yml](.github/workflows/aws-upload-prod.yml)
- [.github/workflows/publish-stores.yml](.github/workflows/publish-stores.yml)
- [.github/generate-build-summary.js](.github/generate-build-summary.js)
- [.github/generate-checksums-summary.js](.github/generate-checksums-summary.js)

## Requirements Summary

**Problem:** Ubuntu/Linux ARM64 users cannot install RedisInsight from official release assets today. The issue reports missing ARM64 snaps and missing ARM64 release assets overall.

**Functional goals:**

- Produce Linux ARM64 desktop artifacts for supported package types
- Make those artifacts flow through the existing release pipeline
- Ensure summaries, checksums, and release metadata include new ARM64 artifacts
- Preserve current x64 behavior

**Non-functional goals:**

- Keep release automation reviewable and incremental
- Avoid breaking production release publishing
- Validate native Electron modules on ARM64 (`keytar`, `sqlite3`)

**Important assumption:**

- `AppImage`, `deb`, and `rpm` are the most likely initial targets.
- `snap` may need separate handling depending on builder/store limitations and whether the current runner architecture can build/publish ARM64 snaps reliably.

## Current State Analysis

### Packaging configuration

Linux targets are hardcoded to `x64` only in [electron-builder.json](electron-builder.json). The same file already demonstrates multi-arch support for macOS, so Linux ARM64 fits the current packaging model.

Relevant existing config:

```97:116:electron-builder.json
  "linux": {
    "target": [
      { "target": "AppImage", "arch": ["x64"] },
      { "target": "deb", "arch": ["x64"] },
      { "target": "rpm", "arch": ["x64"] },
      { "target": "snap", "arch": ["x64"] }
    ]
  },
```

### Build orchestration

The Linux builder workflow is generic enough to support new targets, but the surrounding entry points are x64-oriented:

- [build.yml](.github/workflows/build.yml) routes Linux builds through the shared Linux pipeline
- [pipeline-build-linux.yml](.github/workflows/pipeline-build-linux.yml) uploads all Linux artifacts, but does not explicitly validate ARM64 names/outputs
- [manual-build.yml](.github/workflows/manual-build.yml) exposes only `build_linux_*_x64` options
- test workflows currently request AppImage-only Linux builds, effectively assuming x64

### Publication and release metadata

Production publication hardcodes Linux x64 artifact names and tags in [aws-upload-prod.yml](.github/workflows/aws-upload-prod.yml). Store publishing also hardcodes the snap filename in [publish-stores.yml](.github/workflows/publish-stores.yml). Release summaries/checksum generation only recognize existing x64 Linux filenames.

### Native module risk

The desktop package relies on native modules unpacked for Electron builds:

- `keytar`
- `sqlite3`

These appear in [electron-builder.json](electron-builder.json), [package.json](package.json), and the dependency install action at [.github/actions/install-all-build-libs/action.yml](.github/actions/install-all-build-libs/action.yml). ARM64 support depends on whether current install/rebuild behavior resolves ARM64 binaries correctly in CI or requires a dedicated ARM64 build environment.

## Implementation Plan

### Phase 1: Packaging enablement

**Goal:** Make Linux ARM64 a declared build target without touching production publication yet.

1. Update [electron-builder.json](electron-builder.json)

- Add `arm64` to supported Linux targets.
- Prefer enabling `AppImage`, `deb`, and `rpm` first.
- Treat `snap` as optional until CI/store compatibility is verified.
- Acceptance: local/CI builder config resolves ARM64 artifact names for selected Linux targets.

1. Update manual build inputs in [manual-build.yml](.github/workflows/manual-build.yml) and, if needed, [manual-build-enterprise.yml](.github/workflows/manual-build-enterprise.yml)

- Add `build_linux_appimage_arm64`, `build_linux_deb_arm64`, `build_linux_rpm_arm64`, and possibly `build_linux_snap_arm64`.
- Acceptance: manual workflow can request Linux ARM64 targets explicitly.

1. Review Linux target parsing in [pipeline-build-linux.yml](.github/workflows/pipeline-build-linux.yml)

- Confirm `build_linux_`* parsing accepts new ARM64 input names without collisions.
- Acceptance: workflow target extraction maps new manual inputs to valid `electron-builder` Linux targets.

**Deliverable:** ARM64 packaging can be requested from CI without changing release publication logic.

### Phase 2: Release and metadata support

**Goal:** Make ARM64 artifacts visible and publishable in the existing release flow.

1. Extend release artifact summaries

- Update [.github/generate-build-summary.js](.github/generate-build-summary.js)
- Update [.github/generate-checksums-summary.js](.github/generate-checksums-summary.js)
- Add Linux ARM64 filename mappings for each supported artifact type
- Acceptance: release summaries/checksum output includes ARM64 desktop packages when present.

1. Extend AWS production tagging and public/latest promotion in [.github/workflows/aws-upload-prod.yml](.github/workflows/aws-upload-prod.yml)

- Add ARM64 Linux artifact/tag definitions alongside existing x64 definitions.
- Ensure download and upgrade object keys match actual ARM64 artifact filenames produced by `electron-builder`.
- Acceptance: production upload script can tag and expose ARM64 assets without regressing x64 assets.

1. Decide Snap handling in [.github/workflows/publish-stores.yml](.github/workflows/publish-stores.yml)

- Option A: keep Snapcraft x64-only initially and document that ARM64 desktop release support excludes snap for the first iteration.
- Option B: add ARM64 snap publication if the build pipeline can reliably produce and publish it.
- Acceptance: store publishing behavior is explicit and does not silently ignore new artifacts.

**Deliverable:** ARM64 artifacts flow through release publication and release-note metadata.

### Phase 3: Validation and rollout safety

**Goal:** Prove ARM64 builds are real, installable, and safe to release.

1. Validate native dependency behavior

- Confirm `keytar` and `sqlite3` resolve or rebuild correctly for Linux ARM64 in CI.
- If current x64 Linux runners cannot produce reliable ARM64 binaries, introduce a dedicated ARM64 runner/container path rather than forcing cross-arch output from the existing job.
- Acceptance: built artifacts launch without native module load errors.

1. Validate package naming and updater metadata

- Inspect generated `latest-linux.yml` and artifact names for ARM64 variants.
- Confirm release scripts that assume one Linux asset per format still behave correctly.
- Acceptance: generated metadata references correct ARM64 URLs and hashes.

1. Add release verification notes/tests

- Add focused workflow validation or release checklist coverage for ARM64 Linux packages.
- Reuse existing ARM64 precedent from macOS and Docker where helpful.
- Acceptance: release maintainers have a deterministic path to verify ARM64 outputs before production rollout.

**Deliverable:** release-ready ARM64 Linux support with documented verification steps.

## Recommended PR Stack

1. **PR 1: Packaging config only**

- Files: [electron-builder.json](electron-builder.json), [.github/workflows/manual-build.yml](.github/workflows/manual-build.yml), [.github/workflows/manual-build-enterprise.yml](.github/workflows/manual-build-enterprise.yml), [.github/workflows/pipeline-build-linux.yml](.github/workflows/pipeline-build-linux.yml)
- Outcome: ARM64 build targets are selectable and produced in CI/manual builds

1. **PR 2: Release publication and summaries**

- Files: [.github/workflows/aws-upload-prod.yml](.github/workflows/aws-upload-prod.yml), [.github/workflows/publish-stores.yml](.github/workflows/publish-stores.yml), [.github/generate-build-summary.js](.github/generate-build-summary.js), [.github/generate-checksums-summary.js](.github/generate-checksums-summary.js)
- Outcome: ARM64 assets are surfaced correctly in production release flows

1. **PR 3: Validation / documentation / follow-up fixes**

- Files likely include workflow docs or release docs plus any CI adjustments discovered during ARM64 trial builds
- Outcome: maintainers can confidently release and troubleshoot Linux ARM64 artifacts

## Testing Strategy

**Build validation**

- Manual workflow run for `build_linux_appimage_arm64`
- Manual workflow run for `build_linux_deb_arm64`
- Manual workflow run for `build_linux_rpm_arm64`
- Optional/manual workflow run for `build_linux_snap_arm64` only if explicitly supported

**Release validation**

- Confirm generated filenames match upload/tagging expectations
- Confirm ARM64 assets appear in build summary and checksum summary
- Confirm AWS promotion scripts can process mixed Linux x64 + ARM64 outputs

**Runtime validation**

- Smoke test launch on Ubuntu ARM64
- Verify no startup failures caused by `keytar` or `sqlite3`
- Verify install/uninstall behavior for supported package formats

## Risks And Mitigations

- **Runner architecture mismatch:** current `ubuntu-24.04` job may not reliably emit installable ARM64 desktop packages for all formats. Mitigation: validate on a dedicated ARM64 runner or containerized path before enabling production release.
- **Native module failures:** `keytar` / `sqlite3` may need rebuild or different binary-host behavior on ARM64. Mitigation: test artifact startup early in PR 1 before wiring production publishing.
- **Snapcraft complexity:** ARM64 snap may require separate store/publishing adjustments. Mitigation: decouple snap from initial ARM64 rollout if needed.
- **Release-script assumptions:** summaries/tagging scripts currently assume one Linux arch. Mitigation: extend mappings explicitly and test mixed-arch release contents.

## Open Questions To Resolve During Implementation

- Can the current Linux build job generate valid ARM64 `AppImage`, `deb`, and `rpm` artifacts from its existing runner environment?
- Does the team want issue #5637 solved with all Linux package types at once, or is `AppImage`/`deb`/`rpm` sufficient for the first milestone?
- Should ARM64 `snap` ship in the first iteration or follow after separate validation?

