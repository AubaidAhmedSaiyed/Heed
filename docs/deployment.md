# Deployment Options

HEED separates the `runtime-sdk` from the Control Plane API to allow versatile deployment models.

## 1. Managed SaaS (Default)
Developers use the public `@heed-ai/runtime` SDK and point `runtimeUrl` to the managed HEED platform. Authentication is handled via API keys generated in the SaaS Control Plane.

## 2. Self-Hosted
Organizations with strict data-residency requirements can host the HEED API and Control Plane entirely within their own VPC.

### Requirements
- Node.js 18+
- PostgreSQL Database

### Start Commands
```bash
npx prisma generate
npm run build
npm run dev --workspace=api # Backend API
npm run dev --workspace=web # Frontend Dashboard
```

In self-hosted environments, update the `runtimeUrl` in the SDK to point to your internal load balancer or Kubernetes service ingress.
