# Project Direct — Deployment & Infrastructure

## Database Strategy: Upstash Redis

While Vercel KV was initially considered, Vercel is in the process of sunsetting their first-party KV offering. To guarantee uninterrupted functionality and a robust free tier (10,000 commands/day), we have integrated directly with **Upstash Redis**. 

Upstash Redis is a 1-to-1 drop-in replacement that originally powered Vercel KV, utilizing identical native HTTP/REST APIs. 

### Local Development
Locally, the application expects `KV_REST_API_URL` and `KV_REST_API_TOKEN` to be seeded in `.env`. We can simulate the Redis connection against a local Homebrew Redis server to prevent consuming bandwidth or quotas during aggressive TDD cycles.

### Production Deployment (Vercel / GitHub Actions)
To configure the application for production deployment, simply expose the actual Upstash credentials to the environment. 

#### GitHub Secrets Configuration
If utilizing GitHub Actions or integrating Vercel deployment through GitHub pushing logic, you MUST configure the following Repository Secrets:
- `KV_REST_API_URL`: The Upstash REST Endpoint (e.g., `https://stirring-marten-*****.upstash.io`)
- `KV_REST_API_TOKEN`: The Upstash REST Token

Once these secrets are present within the Vercel Project settings or GitHub Action pipeline natively, the application will automatically hook into the remote Upstash index upon boot without requiring SDK reconfiguration.
