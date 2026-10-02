# HEED Deployment Guide

## 1. Prerequisites
- **PostgreSQL Database**: A managed PostgreSQL database (e.g., Render, Supabase, Neon).
- **Backend Hosting**: A Node.js runtime environment (e.g., Render, Railway, AWS).
- **Frontend Hosting**: Static hosting for Vite apps (e.g., Vercel, Netlify, Render).

## 2. Environment Variables

### API (Backend)
- `DATABASE_URL`: Full connection string to your PostgreSQL database (e.g. `postgresql://user:pass@host:5432/db`).
- `PORT`: (Injected automatically by Render/Railway).
- `FRONTEND_URL`: The deployed URL of your dashboard (e.g., `https://heed-dashboard.vercel.app`) to restrict CORS.
- `JWT_SECRET`: A secure, random string for dashboard authentication.

### Web (Frontend)
- `VITE_API_URL`: The deployed URL of your API (e.g., `https://heed-api.onrender.com/api/v1`).

## 3. Database Migration
HEED uses Prisma for database management. The initial migration baseline has been generated.

During your first deployment (or build step on Render):
```bash
npx prisma migrate deploy
```
*Note: Do NOT use `prisma db push` in production as it can lead to accidental data loss.*

## 4. API Deployment (Render)
1. Connect your repository to Render as a **Web Service**.
2. **Root Directory**: `.` (or leave blank).
3. **Build Command**: `npm install && npm run build --workspaces --if-present`
4. **Start Command**: `npm run start -w apps/api` (Wait, we should define this script if it's not there, or use `cd apps/api && npm start`).
5. Set the Environment Variables listed above.
6. The service will automatically listen on the assigned `$PORT`.

### Health Check
Render will automatically monitor the API via the `/health` endpoint, which is configured to verify database connectivity.

## 5. Dashboard Deployment (Vercel)
1. Import the repository into Vercel.
2. **Root Directory**: `apps/web`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Set the `VITE_API_URL` environment variable.

## 6. SDK Publication
The runtime SDK (`@heed-ai/runtime`) is published separately to npm.

1. Navigate to the SDK package:
   ```bash
   cd packages/runtime-sdk
   ```
2. Build and verify the artifact:
   ```bash
   npm run build
   npm pack
   ```
3. Publish to npm:
   ```bash
   npm publish --access public
   ```

## 7. External Integration Smoke Test
To verify the deployment from an external application:
1. Generate an API Key via the HEED Dashboard.
2. Register an Agent via the Dashboard to get an `agentId`.
3. In an empty external project:
   ```bash
   npm install @heed-ai/runtime
   ```
4. Write a test script (`test.js`):
   ```javascript
   import { Heed } from '@heed-ai/runtime';

   const heed = new Heed({
     apiKey: 'YOUR_API_KEY',
     agentId: 'YOUR_AGENT_ID',
     runtimeUrl: 'https://heed-api.onrender.com'
   });

   async function test() {
     const result = await heed.execute({
       system: 'fs',
       operation: 'read_file',
       capability: 'file.read',
       resource: '/etc/passwd',
       arguments: {}
     });
     console.log('Result:', result.decision);
   }
   test();
   ```
5. Run the script. The action should successfully appear in the HEED Dashboard Execution logs, allowing you to trace the policy evaluation and apply overrides.

## 8. Security Considerations
- **CORS**: The API strictly enforces CORS against `FRONTEND_URL`. Ensure this matches exactly.
- **Fail-Closed**: If the database goes down during runtime, the SDK is designed to fail-closed (`BLOCK` or throw) to prevent unchecked agent executions.
- **Credentials**: Ensure `JWT_SECRET` and `DATABASE_URL` are strictly kept in the hosting provider's Secrets Manager and never checked into source control.
