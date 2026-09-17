const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        replaceInDir(filePath);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('@rethen')) {
        content = content.replace(/@rethen/g, '@heed');
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'apps'));
replaceInDir(path.join(__dirname, 'packages'));
replaceInDir(path.join(__dirname, 'scripts'));
replaceInDir(path.join(__dirname, 'tests'));
console.log("Replaced @rethen with @heed in source files.");
