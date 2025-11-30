# 🚀 DedlyFi Deployment Guide

Complete step-by-step guide to deploy DedlyFi to production.

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Railway account (free)
- [ ] MongoDB Atlas account (free)
- [ ] WalletConnect Project ID
- [ ] RPC URLs (Alchemy/Infura)

---

## 1️⃣ MongoDB Atlas Setup

### Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Choose a region close to your users
4. Wait for cluster to be created (~5 minutes)

### Configure Access
1. **Database Access**: Create a user with read/write permissions
2. **Network Access**: Add `0.0.0.0/0` (allow from anywhere)
3. **Get Connection String**: Click "Connect" → "Connect your application"
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dca-prod
   ```

---

## 2️⃣ Railway Backend Deployment

### Initial Setup
1. Go to [Railway](https://railway.app/)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose `backend` directory as root

### Environment Variables
Add these in Railway dashboard:

```env
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # From Atlas
RPC_URL=https://polygon-rpc.com
RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
DCA_ACCOUNTING_ADDRESS=0x...
USDC_ADDRESS=0x...
WBTC_ADDRESS=0x...
WETH_ADDRESS=0x...
REDIS_HOST=${{REDIS.RAILWAY_PRIVATE_DOMAIN}}
REDIS_PORT=${{REDIS.RAILWAY_PRIVATE_PORT}}
ZERO_X_API_KEY=your_0x_key
```

### Add Redis
1. In Railway project, click "New" → "Database" → "Add Redis"
2. Redis will auto-configure with Railway

### Deploy
1. Railway will auto-deploy on push to `main`
2. Get your backend URL: `https://your-app.railway.app`
3. Test: `curl https://your-app.railway.app/health`

---

## 3️⃣ Vercel Frontend Deployment

### Initial Setup
1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Select `frontend-app` as root directory

### Build Configuration
```
Framework Preset: Next.js
Build Command: yarn build
Output Directory: .next
Install Command: yarn install
```

### Environment Variables
Add these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_KEY
```

### Deploy
1. Click "Deploy"
2. Wait for build to complete (~2 minutes)
3. Get your frontend URL: `https://your-app.vercel.app`
4. Test by visiting the URL

---

## 4️⃣ GitHub Actions CI/CD Setup

### Create Secrets
Go to GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

#### Frontend Secrets
- `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
- `VERCEL_ORG_ID`: Get from Vercel project settings
- `VERCEL_PROJECT_ID`: Get from Vercel project settings
- `NEXT_PUBLIC_API_URL`: Your Railway backend URL
- `NEXT_PUBLIC_WC_PROJECT_ID`: WalletConnect Project ID

#### Backend Secrets
- `RAILWAY_TOKEN`: Get from Railway → Account → Tokens
- `MONGODB_URI_TEST`: Test database (can be same as prod for now)
- `RPC_URL`: Polygon RPC URL

### Enable Workflows
1. Go to Actions tab
2. Enable workflows if disabled
3. Push to `develop` branch to trigger first run

---

## 5️⃣ Branch Protection Rules

### Protect `main` branch
1. Go to Settings → Branches
2. Add rule for `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

### Protect `develop` branch
1. Add rule for `develop`
2. Enable:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

## 6️⃣ Custom Domains (Optional)

### Frontend (Vercel)
1. Go to Vercel project → Settings → Domains
2. Add your domain: `app.dedlyfi.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (~5 minutes)

### Backend (Railway)
1. Go to Railway project → Settings → Domains
2. Add your domain: `api.dedlyfi.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (~5 minutes)

---

## 7️⃣ Post-Deployment Checklist

### Verify Deployment
- [ ] Frontend loads at production URL
- [ ] Backend health check passes
- [ ] Database connection works
- [ ] Wallet connection works
- [ ] DCA plan creation works
- [ ] Plan execution works
- [ ] Real-time updates work

### Monitor
- [ ] Check Railway logs for errors
- [ ] Check Vercel deployment logs
- [ ] Monitor MongoDB Atlas metrics
- [ ] Check Bull Board for job queue

### Security
- [ ] All secrets are in environment variables
- [ ] No `.env` files in git
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (TODO)

---

## 8️⃣ Continuous Deployment Workflow

### Development Flow
```
1. Create feature branch: feature/new-feature
2. Make changes and commit
3. Push to GitHub
4. Create PR to develop
5. CI runs tests automatically
6. Merge PR after review
7. Auto-merge to main (if tests pass)
8. Auto-deploy to production
```

### Rollback
If deployment fails:
```bash
# Vercel
vercel rollback

# Railway
railway rollback
```

---

## 9️⃣ Monitoring & Alerts

### Vercel Analytics
1. Enable in Vercel dashboard
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### Railway Metrics
1. View in Railway dashboard
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

### MongoDB Atlas
1. View in Atlas dashboard
2. Monitor:
   - Connection count
   - Operation count
   - Storage usage

---

## 🆘 Troubleshooting

### Frontend won't build
- Check environment variables are set
- Verify API URL is correct
- Check build logs in Vercel

### Backend won't start
- Check MongoDB connection string
- Verify Redis is running
- Check Railway logs

### CI/CD fails
- Check GitHub Actions logs
- Verify all secrets are set
- Check test failures

### Database connection fails
- Verify MongoDB Atlas whitelist
- Check connection string
- Verify user permissions

---

## 📊 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | 100GB bandwidth/month |
| Railway | ✅ $5/month credit | ~500 hours/month |
| MongoDB Atlas | ✅ Free | 512MB storage |
| GitHub Actions | ✅ 2000 minutes/month | Public repos |

**Total Cost**: $0/month (within free tiers)

---

## 🎉 Success!

Your DedlyFi app is now live! 🚀

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app
- **Docs**: https://your-backend.railway.app/docs

Share your deployment and get feedback from the community!
