# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Git repository synced
- All environment variables configured

## Environment Variables Setup

1. Copy `.env.example` to see required variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   GOOGLE_API_KEY
   NEXT_PUBLIC_APP_URL
   ```

2. In Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable from `.env.example`
   - **Important:** `NEXT_PUBLIC_*` variables are public (visible in browser)
   - Service keys must be kept private (server-only)

## Deployment Steps

### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. In Vercel Dashboard: Import Project → Select Repository
3. Framework: Next.js 14
4. Deploy with environment variables set

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Build logs show "Build successful"
- [ ] Authentication works (Supabase session)
- [ ] AI chat responds (Google API working)
- [ ] Chat history persists (database queries working)
- [ ] Rate limiting active (20 msgs/min per user)
- [ ] HTTPS only enabled

## Key Configuration Files

- `vercel.json` - Vercel-specific settings
  - Node.js version: 20.x
  - Function memory: 512MB
  - Max duration: 60s per request
  - Region: IAD (US East)

- `next.config.ts` - Next.js production optimizations
  - Strict TypeScript enabled
  - SWC minification active
  - Security headers configured
  - API request size limits

- `.vercelignore` - Files excluded from deployment

## Database Setup (Supabase)

Required tables before deploying:
- `chats` table with RLS enabled
- `messages` table with RLS enabled
- Row Level Security policies configured
- Service role key has full access

## Monitoring

After deployment, monitor:
- Vercel Analytics dashboard
- Supabase database usage
- Google API quota
- Function execution times

## Troubleshooting

**Build fails:**
- Check Node.js version in `package.json`
- Verify all TypeScript errors resolved
- Review build logs in Vercel Dashboard

**Runtime errors:**
- Check environment variables are set
- Verify Supabase connection strings
- Check API key permissions

**Slow responses:**
- Monitor database query times
- Check Google API rate limits
- Review Network tab in browser DevTools

## Production Performance Tips

1. **Caching Strategy** - Already implemented in:
   - Chat page uses 5-min sessionStorage cache
   - API responses have cache-control headers
   - Static pages cached at edge

2. **Database Optimization**:
   - Enable Supabase Replication
   - Set up connection pooling
   - Add indexes on frequently queried columns

3. **Error Monitoring**:
   - Set up Sentry or similar service
   - Monitor API error rates
   - Track user session errors
