# 🚀 UnlockVault Deployment Guide

This guide covers deploying UnlockVault with MongoDB database support.

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6.0+ (local or cloud)
- Git access to repository
- Deployment platform account (Vercel, Railway, VPS, etc.)

## 🗄️ Database Setup

### Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create new cluster
3. Get connection string
4. Add to environment variables

## 🔧 Environment Variables

Create `.env.local` file with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/unlockvault
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unlockvault?retryWrites=true&w=majority
MONGODB_DB=unlockvault

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# API Keys (optional)
ANALYTICS_ID=your-analytics-id
```

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://bitbucket.org/yourrepo/unlockvault.git
cd unlockvault

# Install dependencies
npm install

# Setup database with sample data
npm run migrate

# Build application
npm run build

# Start application
npm start
```

## 🔄 Database Migration

To migrate data from JSON files to MongoDB:

```bash
# Run migration script
npm run migrate

# Or manually
node scripts/migrate-to-mongodb.js
```

This will:
- Connect to MongoDB
- Clear existing collections
- Import data from JSON files
- Create proper indexes
- Display migration summary

## 🌐 Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Add MONGODB_URI and other required variables
```

### 2. Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variables in Railway dashboard
```

### 3. VPS/Server Deployment

```bash
# Upload files to server
rsync -avz --delete ./ user@server:/var/www/unlockvault/

# SSH into server
ssh user@server

# Navigate to project
cd /var/www/unlockvault

# Install dependencies
npm install --production

# Setup database
npm run migrate

# Start with PM2
npm install -g pm2
pm2 start npm --name "unlockvault" -- start
pm2 save
pm2 startup
```

### 4. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/unlockvault
      - MONGODB_DB=unlockvault
    depends_on:
      - mongo
    volumes:
      - ./data:/app/data

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=unlockvault

volumes:
  mongo_data:
```

## 🔄 Bitbucket Pipelines

The project includes automated deployment via Bitbucket Pipelines:

### Automatic Deployment
- Push to `main` branch triggers production build
- Includes MongoDB setup and data migration
- Configurable for multiple deployment targets

### Manual Pipelines
```bash
# Setup database only
bitbucket-pipelines run setup-database

# Migrate data only  
bitbucket-pipelines run migrate-data
```

### Pipeline Configuration
Update `bitbucket-pipelines.yml` with your deployment settings:

1. **Vercel**: Uncomment Vercel section, add `VERCEL_TOKEN`
2. **VPS**: Uncomment VPS section, add SSH keys and server details
3. **Railway**: Uncomment Railway section, add `RAILWAY_TOKEN`

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secrets
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable MongoDB connection encryption

## 📊 Monitoring & Maintenance

### Database Backups
```bash
# MongoDB backup
mongodump --uri="your-mongodb-uri" --out=backup/

# Restore backup
mongorestore --uri="your-mongodb-uri" backup/
```

### Performance Monitoring
- Monitor MongoDB performance
- Check API response times
- Monitor server resources
- Set up error tracking (Sentry)

### Regular Updates
```bash
# Update dependencies
npm update

# Re-run migration if needed
npm run migrate

# Rebuild application
npm run build
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MongoDB is running
- Verify connection string
- Check network connectivity
- Ensure database exists

**Migration Errors**
- Check JSON files exist
- Verify MongoDB permissions
- Check disk space
- Review error logs

**Build Failures**
- Clear `.next` folder
- Delete `node_modules` and reinstall
- Check Node.js version compatibility
- Verify environment variables

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check MongoDB connection
node -e "require('./lib/mongodb').connectToDatabase().then(() => console.log('Connected')).catch(console.error)"
```

## 📞 Support

For deployment issues:
1. Check logs for error details
2. Verify all environment variables
3. Test MongoDB connection separately
4. Review deployment platform documentation

## 🎯 Production Optimization

- Enable MongoDB connection pooling
- Configure caching (Redis)
- Set up CDN for static assets
- Enable gzip compression
- Optimize images and assets
- Configure monitoring and alerts

---

**Ready to deploy!** 🎉

Your UnlockVault CPA website is production-ready with all analytics and security features enabled. 