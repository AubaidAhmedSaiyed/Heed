const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'package.json',
  'apps/api/package.json',
  'apps/demo-agent/package.json',
  'apps/web/package.json',
  'packages/connectors/package.json',
  'packages/core/package.json',
  'packages/policy-engine/package.json',
  'packages/runtime-sdk/package.json',
  'packages/security/package.json',
  'packages/types/package.json',
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/@rethen/g, '@heed');
    content = content.replace(/rethen-monorepo/g, 'heed-monorepo');
    fs.writeFileSync(filePath, content);
  }
});

console.log("Replaced names in package.json files.");
