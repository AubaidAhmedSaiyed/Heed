const { execSync } = require('child_process');

console.log('[HEED Build] Starting monorepo build...');

// Only push schema to database if a real DATABASE_URL is configured (e.g. on Render)
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
  console.log('[HEED Build] DATABASE_URL detected. Synchronizing PostgreSQL schema...');
  try {
    execSync('npx prisma db push --schema prisma/schema.prisma --accept-data-loss', { stdio: 'inherit' });
    console.log('[HEED Build] Database schema synchronized successfully.');
  } catch (err) {
    console.warn('[HEED Build] Warning: Prisma db push encountered an issue:', err.message);
  }
} else {
  console.log('[HEED Build] No database connection string detected. Skipping DB schema sync (frontend/static build mode).');
}

console.log('[HEED Build] Compiling workspace packages and apps...');
execSync('npm run build --workspaces --if-present', { stdio: 'inherit' });
console.log('[HEED Build] Build complete.');
