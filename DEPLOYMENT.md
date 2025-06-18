# 🚀 UnlockVault Deployment Guide

## Bitbucket Integration ✅

Your project is already connected to Bitbucket:
- **Repository**: `https://bitbucket.org/unlockvault/unlockvault.git`
- **Branch**: `main`
- **Pipelines**: Configured for automatic CI/CD

## Quick Deployment Options

### 1. 🔥 Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh vercel
```

### 2. 🌐 Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod --dir=.next

# Or use the deployment script
./deploy.sh netlify
```

### 3. 🖥️ VPS/Server Deployment
```bash
# Build the project
npm run build

# Upload to your server
rsync -avz --delete ./ user@your-server.com:/var/www/unlockvault/

# SSH to server and restart
ssh user@your-server.com "cd /var/www/unlockvault && npm install --production && pm2 restart unlockvault"
```

### 4. 🏠 Local Production Testing
```bash
npm run build
npm start
# Visit http://localhost:3000
```

## Bitbucket Pipelines Setup

### Enable Pipelines
1. Go to your Bitbucket repository
2. Navigate to **Pipelines** in the left sidebar
3. Click **Enable Pipelines**
4. The `bitbucket-pipelines.yml` file is already configured

### Environment Variables
Add these in Bitbucket Repository Settings > Pipelines > Repository variables:

```bash
# For Vercel deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# For Netlify deployment
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id

# Application environment variables
MONGODB_URI=mongodb+srv://unlockvault:HM1b5XXUeTQ8fkZK@unlockvault.maja2ph.mongodb.net/unlockvault.xyz?retryWrites=true&w=majority
JWT_SECRET=unlockvault-super-secure-jwt-secret-key-2024
NEXT_PUBLIC_GA_ID=G-DQE75NNT98
NEXT_PUBLIC_HOTJAR_ID=6438859
NEXT_PUBLIC_CLARITY_ID=s1facumamm
NEXT_PUBLIC_SITE_URL=https://unlockvault.xyz
```

## Automatic Deployment Workflow

### Main Branch (Production)
- Push to `main` branch triggers automatic deployment
- Builds and tests the application
- Deploys to production environment

### Pull Requests
- Creates preview deployments
- Runs tests and builds
- Perfect for testing before merging

### Manual Deployment
```bash
# Commit and push changes
git add .
git commit -m "Your commit message"
git push origin main

# Pipeline will automatically trigger
```

## 📊 Analytics & Monitoring

Your website includes comprehensive analytics:

### Google Analytics 4
- **Tracking ID**: `G-DQE75NNT98`
- **Dashboard**: https://analytics.google.com
- **Features**: Enhanced E-commerce, CPA tracking, conversion goals

### Hotjar
- **Site ID**: `6438859`
- **Dashboard**: https://insights.hotjar.com
- **Features**: Heatmaps, session recordings, user feedback

### Microsoft Clarity
- **Project ID**: `s1facumamm`
- **Dashboard**: https://clarity.microsoft.com
- **Features**: Click tracking, scroll maps, user behavior

## 🔒 Security Features

- SSL/TLS encryption
- Security headers (CSP, HSTS, XSS Protection)
- Bot protection and rate limiting
- CSRF protection
- Input validation and sanitization

## 🎯 CPA Marketing Features

- **Conversion Tracking**: GA4 Enhanced E-commerce events
- **Click Tracking**: CPA link monitoring and attribution
- **User Behavior**: Heat maps and interaction tracking
- **Bot Protection**: Advanced filtering for quality traffic
- **A/B Testing**: Ready for conversion optimization

## 🚨 Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Environment Issues
- Verify all environment variables are set
- Check MongoDB connection string
- Ensure domain matches in all configs

### Analytics Not Working
- Verify tracking IDs in environment variables
- Check browser console for errors
- Ensure scripts are loading properly

## 📞 Support

For deployment issues:
1. Check Bitbucket Pipelines logs
2. Verify environment variables
3. Test locally with production build
4. Check analytics dashboards for data flow

---

**Ready to deploy!** 🎉

Your UnlockVault CPA website is production-ready with all analytics and security features enabled. 