# 🔓 UnlockVault - Premium Software & Digital Tools Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://bitbucket.org/unlockvault/unlockvault)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)

> **Discover premium software, games, applications, and digital tools. Your trusted source for professional software, gaming, and productivity solutions.**

## ✨ **Latest Major Enhancement (v2.0)**

### 🎨 **Premium Article Details Page**
- **Advanced UI/UX**: Reading progress bar, floating back button, smooth animations
- **Social Media Integration**: Facebook, X (Twitter), Instagram, TikTok, YouTube sharing
- **Enhanced Content Processing**: LTR support, rich typography, interactive elements
- **Responsive Design**: Mobile-first approach with touch-optimized interactions

### 🔍 **Complete SEO Optimization**
- **Structured Data**: Comprehensive schema markup for articles, products, organization
- **Meta Tags**: Open Graph, Twitter Cards, comprehensive search engine optimization
- **Sitemap Generation**: Dynamic sitemap with proper priorities and frequencies
- **RSS Feed**: Full content syndication with articles and offers
- **Performance**: Optimized Core Web Vitals and loading speeds

## 🚀 **Features**

### 📄 **Content Management**
- **Articles & Blog System**: Full CRUD operations with rich text editor
- **Software Offers**: Games, applications, and professional tools
- **Category Management**: Dynamic categorization with filtering
- **Search & Discovery**: Advanced search with relevance scoring

### 🛠️ **Technical Features**
- **MongoDB Integration**: Scalable database with fallback to JSON files
- **Admin Dashboard**: Complete content management interface
- **User Analytics**: Visit tracking and engagement metrics
- **Security**: Bot protection, rate limiting, secure authentication

### 🎯 **User Experience**
- **Responsive Design**: Works perfectly on all devices
- **Progressive Web App**: Installable with offline capabilities
- **Fast Loading**: Optimized assets and caching strategies
- **Accessibility**: WCAG compliant with proper ARIA labels

## 📁 **Project Structure**

```
unlockvault/
├── 📁 components/           # Reusable React components
│   ├── AdminLayout.tsx      # Admin dashboard layout
│   ├── Navbar.tsx          # Navigation component
│   ├── UnlockCard.tsx      # Content card component
│   └── ...
├── 📁 pages/               # Next.js pages and API routes
│   ├── 📁 api/            # API endpoints
│   │   ├── articles/       # Articles API
│   │   ├── offers/         # Offers API
│   │   ├── categories.ts   # Categories API
│   │   ├── search-v2.ts    # Enhanced search API
│   │   └── rss.ts          # RSS feed generator
│   ├── 📁 articles/        # Article pages
│   ├── 📁 admin-xyz123/    # Admin dashboard
│   ├── index.tsx           # Homepage
│   └── ...
├── 📁 lib/                 # Utility libraries
│   ├── mongodb.ts          # Database connection
│   ├── structuredData.ts   # SEO schema markup
│   ├── analytics.ts        # User analytics
│   └── ...
├── 📁 data/                # JSON data files
│   ├── articles.json       # Sample articles
│   ├── offers.json         # Software offers
│   ├── categories.json     # Content categories
│   └── ...
└── 📁 scripts/             # Utility scripts
    ├── migrate-to-mongodb.js # Database migration
    └── seed-articles.js     # Sample data seeding
```

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ 
- MongoDB 6.0+ (optional - falls back to JSON files)
- Git

### **Quick Start**

```bash
# Clone the repository
git clone https://bitbucket.org/unlockvault/unlockvault.git
cd unlockvault

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database (optional)
npm run setup-db

# Start development server
npm run dev
```

### **Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/unlockvault
MONGODB_DB=unlockvault

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_PASSWORD=your-secure-admin-password

# External APIs (optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SITE_URL=https://unlockvault.xyz

# Security
RATE_LIMIT_MAX=100
BOT_PROTECTION_ENABLED=true
```

## 📊 **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Migrate data to MongoDB |
| `npm run setup-db` | Setup database with sample data |

## 🚀 **Deployment**

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **VPS/Server Deployment**

```bash
# Build the project
npm run build

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start npm --name "unlockvault" -- start

# Setup reverse proxy (Nginx)
# Configure SSL certificate
# Setup MongoDB connection
```

### **Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

## 📈 **SEO Features**

### **Structured Data**
- Article schema markup
- Product/Software schema
- Organization schema
- Breadcrumb navigation
- FAQ schema support

### **Meta Tags**
- Open Graph for social sharing
- Twitter Cards optimization
- Canonical URLs
- Mobile-friendly viewport
- Theme color configuration

### **Performance**
- Next.js automatic optimization
- Image optimization
- Static generation where possible
- Caching strategies
- Core Web Vitals optimization

## 🔧 **API Documentation**

### **Articles API**
```bash
GET /api/articles              # Get all articles
GET /api/articles/[slug]       # Get article by slug
POST /api/articles             # Create new article (admin)
PUT /api/articles/[slug]       # Update article (admin)
DELETE /api/articles/[slug]    # Delete article (admin)
```

### **Search API**
```bash
GET /api/search-v2?q=query&type=all&category=tech&sort=relevance
```

### **RSS Feed**
```bash
GET /api/rss                   # Get RSS feed with latest content
```

## 🎨 **Customization**

### **Styling**
- Built with Tailwind CSS
- Custom design system in `styles/globals.css`
- Responsive breakpoints configured
- Dark theme optimized

### **Content**
- Edit content in `data/` directory
- Customize categories in `data/categories.json`
- Update site configuration in `next-seo.config.js`

## 🔐 **Security Features**

- **Bot Protection**: Advanced bot detection and prevention
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based request validation

## 📱 **Progressive Web App**

- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality
- **App Shortcuts**: Quick access to main sections
- **Theme Integration**: Matches system theme preferences

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📊 **Analytics & Monitoring**

- **Google Analytics**: User behavior tracking
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Built-in error logging
- **User Engagement**: Page views and interaction tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [View full documentation](DEPLOYMENT.md)
- **Issues**: [Report bugs or request features](https://bitbucket.org/unlockvault/unlockvault/issues)
- **Email**: support@unlockvault.xyz

## 🌟 **Changelog**

### **v2.0.0** - Latest Release
- ✨ Premium article details page with enhanced UI/UX
- 🔍 Complete SEO optimization with structured data
- 📱 Social media sharing integration
- 🚀 RSS feed and sitemap generation
- 🛠️ Enhanced admin dashboard
- 📊 Improved analytics and monitoring

### **v1.0.0** - Initial Release
- 🎯 Basic content management system
- 🔐 Admin authentication
- 📄 Article and offer management
- 🎨 Responsive design
- 🔍 Basic search functionality

---

<div align="center">

**Made with ❤️ by the UnlockVault Team**

[🌐 Website](https://unlockvault.xyz) • [📧 Contact](mailto:support@unlockvault.xyz) • [🐦 Twitter](https://twitter.com/UnlockVault)

</div>
# unlockvault
# unlockvault
# unlockvault
