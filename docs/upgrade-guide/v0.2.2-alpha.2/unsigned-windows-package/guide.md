---
kind: upgrade-guide
description: "Unsigned Windows packaging ignores release configuration and omits mandatory-update services."
---

# Unsigned Windows packaging

English | [中文](guide.zh.md)

## Change

`pnpm run package:desktop:win:x64:unsigned` no longer reads `.env.windows` or machine presets. Like unsigned macOS builds, it uses `com.deepseek.harness`, excludes inherited release credentials and settings, and embeds neither automatic-update nor mandatory-update configuration. Existing unsigned Windows builds that depended on custom application IDs or mandatory-update policy must use the signed packaging path for those release features.

## Migration

1. Run the unsigned command on Windows x64 with Node 24 and the build tools listed in the [packaging guide](../../../../apps/desktop/packaging/README.md#unsigned-windows-test-installer); no release dotenv or policy service is needed.
2. For this fork, push to `master` or dispatch [Fork Windows installer](../../../../.github/workflows/fork-windows-package.yml). Download the installer and checksum from the run's Artifacts section after it succeeds.
3. Confirm that the filename ends in `-unsigned.exe` and the packaged metadata contains no `dshMandatoryUpdatePolicy` or update feed. Use manual installation for subsequent builds; unsigned artifacts cannot enter the signed publication workflow.
