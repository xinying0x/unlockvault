#!/bin/bash

# 🚀 UnlockVault Deployment Script
# Supports: Vercel, Railway, VPS, Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
check_env() {
    if [ ! -f .env.local ]; then
        print_warning ".env.local not found. Creating template..."
        cat > .env.local << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/unlockvault
MONGODB_DB=unlockvault

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
        print_warning "Please update .env.local with your actual values before deploying"
    fi
}

# Test MongoDB connection
test_mongodb() {
    print_status "Testing MongoDB connection..."
    if node -e "require('./lib/mongodb').connectToDatabase().then(() => console.log('✅ MongoDB connected')).catch(() => process.exit(1))" 2>/dev/null; then
        print_success "MongoDB connection successful"
    else
        print_error "MongoDB connection failed. Please check your MONGODB_URI"
        return 1
    fi
}

# Run database migration
migrate_database() {
    print_status "Running database migration..."
    if npm run migrate; then
        print_success "Database migration completed"
    else
        print_error "Database migration failed"
        return 1
    fi
}

# Build application
build_app() {
    print_status "Building application..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        return 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
      npm install -g vercel
    fi
    
    print_status "Starting Vercel deployment..."
    if vercel --prod --yes; then
        print_success "Successfully deployed to Vercel!"
        print_status "Don't forget to set environment variables in Vercel dashboard"
    else
        print_error "Vercel deployment failed"
        return 1
    fi
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_status "Starting Railway deployment..."
    if railway up; then
        print_success "Successfully deployed to Railway!"
        print_status "Don't forget to set environment variables in Railway dashboard"
    else
        print_error "Railway deployment failed"
        return 1
    fi
}

# Deploy to VPS
deploy_vps() {
    print_status "Deploying to VPS..."
    
    if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
        print_error "VPS_HOST and VPS_USER environment variables are required"
        print_status "Example: export VPS_HOST=your-server.com && export VPS_USER=ubuntu"
        return 1
    fi
    
    print_status "Uploading files to $VPS_USER@$VPS_HOST..."
    rsync -avz --delete --exclude='.git' --exclude='node_modules' --exclude='.next' ./ $VPS_USER@$VPS_HOST:/var/www/unlockvault/
    
    print_status "Installing dependencies and starting application on VPS..."
    ssh $VPS_USER@$VPS_HOST << 'EOF'
        cd /var/www/unlockvault
        npm install --production
        npm run migrate
        npm run build
        
        # Start with PM2
        if command -v pm2 &> /dev/null; then
            pm2 restart unlockvault || pm2 start npm --name "unlockvault" -- start
            pm2 save
        else
            npm install -g pm2
            pm2 start npm --name "unlockvault" -- start
            pm2 save
            pm2 startup
        fi
EOF
    
    print_success "Successfully deployed to VPS!"
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        return 1
    fi
    
    print_status "Building Docker image..."
    docker build -t unlockvault .
    
    print_status "Starting containers..."
    docker-compose up -d
    
    print_success "Successfully deployed with Docker!"
    print_status "Application running at http://localhost:3000"
}

# Setup local development
setup_local() {
    print_status "Setting up local development environment..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Check MongoDB
    if test_mongodb; then
        migrate_database
    else
        print_warning "Skipping database migration due to MongoDB connection issues"
    fi
    
    # Build application
    build_app
    
    print_success "Local setup completed!"
    print_status "Run 'npm run dev' to start development server"
}

# Main deployment function
main() {
    print_status "🚀 UnlockVault Deployment Script"
    print_status "================================"
    
    # Check environment
    check_env
    
    case "${1:-help}" in
        "vercel")
            setup_local
            deploy_vercel
            ;;
        "railway")
            setup_local
            deploy_railway
            ;;
        "vps")
            setup_local
            deploy_vps
            ;;
        "docker")
            deploy_docker
            ;;
        "local")
            setup_local
            ;;
        "build")
            print_status "Building application only..."
            npm install
            build_app
            ;;
        "migrate")
            print_status "Running database migration only..."
            migrate_database
            ;;
        "test")
            print_status "Testing MongoDB connection..."
            test_mongodb
            ;;
        "help"|*)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  vercel    Deploy to Vercel"
            echo "  railway   Deploy to Railway"
            echo "  vps       Deploy to VPS (requires VPS_HOST and VPS_USER env vars)"
            echo "  docker    Deploy with Docker"
            echo "  local     Setup local development"
            echo "  build     Build application only"
            echo "  migrate   Run database migration only"
            echo "  test      Test MongoDB connection"
            echo "  help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./deploy.sh local"
            echo "  ./deploy.sh vercel"
            echo "  VPS_HOST=server.com VPS_USER=ubuntu ./deploy.sh vps"
    ;;
esac
}

# Run main function
main "$@" 