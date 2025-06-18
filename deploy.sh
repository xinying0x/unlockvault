#!/bin/bash

# UnlockVault Deployment Script
# Usage: ./deploy.sh [vercel|netlify|vps|local]

set -e

echo "🚀 UnlockVault Deployment Script"
echo "================================="

# Default deployment type
DEPLOY_TYPE=${1:-"vercel"}

# Build the project
echo "📦 Building project..."
npm run build

case $DEPLOY_TYPE in
  "vercel")
    echo "🔥 Deploying to Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm install -g vercel
    fi
    vercel --prod
    ;;
    
  "netlify")
    echo "🌐 Deploying to Netlify..."
    if ! command -v netlify &> /dev/null; then
      echo "Installing Netlify CLI..."
      npm install -g netlify-cli
    fi
    netlify deploy --prod --dir=.next
    ;;
    
  "vps")
    echo "🖥️  Deploying to VPS..."
    echo "Please configure your VPS details in this script"
    # Uncomment and configure these lines for your VPS:
    # rsync -avz --delete ./ user@your-server.com:/var/www/unlockvault/
    # ssh user@your-server.com "cd /var/www/unlockvault && npm install --production && pm2 restart unlockvault"
    ;;
    
  "local")
    echo "🏠 Starting local production server..."
    npm start
    ;;
    
  *)
    echo "❌ Unknown deployment type: $DEPLOY_TYPE"
    echo "Usage: ./deploy.sh [vercel|netlify|vps|local]"
    exit 1
    ;;
esac

echo "✅ Deployment completed!"
echo ""
echo "🎯 Your UnlockVault CPA website features:"
echo "   • Google Analytics 4 with Enhanced E-commerce"
echo "   • Hotjar & Microsoft Clarity integration"
echo "   • Advanced bot protection"
echo "   • PWA with service worker"
echo "   • SEO optimization with structured data"
echo "   • Security headers and SSL indicators"
echo "   • Countdown timers and enhanced CPA buttons"
echo ""
echo "📊 Monitor your analytics at:"
echo "   • Google Analytics: https://analytics.google.com"
echo "   • Hotjar: https://insights.hotjar.com"
echo "   • Microsoft Clarity: https://clarity.microsoft.com" 