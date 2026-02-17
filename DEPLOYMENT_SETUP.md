# 🚀 Complete Deployment Guide

## Step 1: GitHub Actions CI/CD (✅ COMPLETE)

Your repository now has an automated CI/CD pipeline that:
- ✅ Runs on every push to `main` branch
- ✅ Checks out code and installs dependencies
- ✅ Runs ESLint for code quality
- ✅ Builds the Next.js project
- ✅ Type-checks with TypeScript
- ✅ Auto-deploys to Vercel on success

**Workflow file:** `.github/workflows/ci-cd.yml`

---

## Step 2: Setup Vercel Deployment (Next Steps)

### 2.1 Get Vercel Credentials

1. **Create Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name it: `github-actions-deploy`
   - Scope: "Full Access"
   - Copy the token (you'll only see it once!)

2. **Get Organization ID:**
   ```bash
   # Option 1: From Vercel CLI (if installed)
   vercel whoami
   
   # Option 2: From dashboard URL
   # https://vercel.com/[YOUR_ORG_ID] - this is your ORG_ID
   ```

3. **Get Project ID:**
   - If you already linked a Vercel project:
     ```bash
     vercel projects list
     ```
   - Or check `.vercel/project.json` in the repo

   - If NOT linked yet:
     ```bash
     vercel link --repo muuuez/calsyx
     ```

### 2.2 Add GitHub Secrets

1. Go to: **GitHub → Repository → Settings → Secrets and variables → Actions**

2. Click **New repository secret** and add:

   **Secret Name:** `VERCEL_TOKEN`
   **Value:** (paste your Vercel token from step 1)

   **Secret Name:** `VERCEL_ORG_ID`
   **Value:** (your organization ID)

   **Secret Name:** `VERCEL_PROJECT_ID`
   **Value:** (your project ID)

3. Click "Add secret" for each one

### 2.3 Configure Environment Variables in Vercel

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL: [your-supabase-url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY: [your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY: [your-service-key]
   OPENROUTER_API_KEY: [your-openrouter-key]
   NEXT_PUBLIC_APP_URL: https://[your-vercel-domain].vercel.app
   ```

3. Choose which environments they apply to (Production, Preview, Development)

### 2.4 Test the Pipeline

1. Make a small change to your project
2. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```

3. Watch the magic:
   - **GitHub:** Go to **Actions** tab → See workflow running
   - **Vercel:** Go to **Deployments** → See deployment in progress

4. Once complete, your app will be live at:
   ```
   https://[project-name].vercel.app
   ```

---

## Quick Command Reference

### Manual Vercel Commands (if needed)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link --repo muuuez/calsyx

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

---

## Workflow Diagram

```
    Push to main
         ↓
  GitHub Actions Triggered
         ↓
  ✓ Install dependencies
  ✓ Run ESLint
  ✓ Build Next.js
  ✓ Type-check
         ↓
   Success? → NO → Show error logs
         ↓ YES
   Deploy to Vercel
         ↓
  ✓ Build & deploy
  ✓ Generate URL
         ↓
   Live at https://[domain].vercel.app
```

---

## Troubleshooting

### Workflow Failed?
1. Check **GitHub Actions** tab for error logs
2. Common issues:
   - ❌ Missing environment variables → Add to `.env.local`
   - ❌ ESLint errors → Fix code issues
   - ❌ Build errors → Check TypeScript errors

### Vercel Deployment Failed?
1. Check **Vercel Dashboard → Deployments** for logs
2. Common issues:
   - ❌ Missing secrets → Add to Vercel Environment Variables
   - ❌ API key invalid → Verify in `.env.local` works locally
   - ❌ Database connection → Check Supabase credentials

### How to Debug Locally
```bash
# Build locally (same as CI)
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint

# Run dev server with env vars
npm run dev
```

---

## Security Best Practices

✅ **DO:**
- Keep tokens in GitHub Secrets (not in code)
- Rotate tokens regularly
- Use separate tokens for different services
- Enable branch protection rules

❌ **DON'T:**
- Commit `.env.local` to git
- Share tokens publicly
- Use personal access tokens for CI/CD
- Put secrets in workflow files

---

## Next Steps

1. ✅ Add the 3 GitHub Secrets (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
2. ✅ Configure environment variables in Vercel
3. ✅ Make a test commit to trigger the workflow
4. ✅ Verify deployment at `https://[project-name].vercel.app`
5. ✅ Share your live URL with others!

---

**Your app is now production-ready with CI/CD! 🚀**
