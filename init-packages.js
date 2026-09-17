const fs = require('fs');
const path = require('path');

const packages = ['core', 'connectors', 'policy-engine', 'security', 'types'];

packages.forEach(pkg => {
  const dir = path.join(__dirname, 'packages', pkg);
  
  const packageJson = {
    name: `@rethen/${pkg}`,
    version: "1.0.0",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: {
      build: "tsc"
    },
    dependencies: {},
    devDependencies: {
      typescript: "^5.5.0"
    }
  };

  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "CommonJS",
      declaration: true,
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true
    },
    include: ["src/**/*"]
  };

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
  }
  fs.writeFileSync(path.join(srcDir, 'index.ts'), `export const ${pkg.replace('-', '')} = true;`);
});
