# GitHub Secrets Configuration

To enable the CI/CD pipeline and automatic Vercel deployment, you need to configure the following secrets in your GitHub repository.

## Steps to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

## Required Secrets

### Vercel Deployment Secrets

- **VERCEL_TOKEN**: Your Vercel authentication token
  - Get it from: https://vercel.com/account/tokens
  - Scope: Full access for CI/CD deployments

- **VERCEL_ORG_ID**: Your Vercel organization ID
  - Found in Vercel dashboard URL: `vercel.com/[ORG_ID]`
  - Or run: `vercel whoami`

- **VERCEL_PROJECT_ID**: Your Vercel project ID
  - Found in `.vercel/project.json` or Vercel dashboard
  - Or run: `vercel projects list` after linking

### Example Environment Variables (Optional - if you want to pass them via secrets)

These can also be set directly in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Testing the Workflow

1. Commit and push your changes to `main` branch
2. Go to **Actions** tab in GitHub
3. View the workflow run in progress
4. If successful, Vercel will automatically deploy

## Troubleshooting

If the workflow fails:
- Check **Actions** → **CI/CD Pipeline** for build logs
- Verify all environment variables are set correctly
- Ensure Node.js version matches (20.x)
- Check that Vercel secrets are valid
