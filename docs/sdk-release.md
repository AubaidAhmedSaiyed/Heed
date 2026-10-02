# SDK Release Guide

The `@heed-ai/runtime` SDK is maintained in the `packages/runtime-sdk` directory. 

## Build Process
We use `tsup` to compile the TypeScript source into dual CommonJS (`.js`) and ESM (`.mjs`) exports to maximize compatibility across modern and legacy Node.js environments.

```bash
cd packages/runtime-sdk
npm install
npm run build
```

## Packaging and Local Testing
Before publishing a new version to npm, always verify the package tarball using a clean consumer project:

```bash
npm pack
# Generates heed-runtime-X.Y.Z.tgz
```

In a test directory outside the monorepo:
```bash
npm install /path/to/heed-runtime-X.Y.Z.tgz
```

## Publishing
Releases to the public npm registry are performed strictly via CI/CD pipelines when a new semantic version tag is pushed. Do not manually `npm publish` from local developer machines.
