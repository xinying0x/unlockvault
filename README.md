# 🚀 UnlockVault - Premium Tools & Apps Platform

A modern, feature-rich platform for sharing premium tools, apps, games, and educational articles. Built with Next.js, MongoDB, and Tailwind CSS.

## ✨ Features

### 🎯 Core Features
- **Premium Content Sharing**: Tools, apps, games, and articles
- **Advanced Search**: Smart search with relevance scoring
- **Admin Dashboard**: Complete content management system
- **Blog System**: Full-featured article management
- **Analytics**: Detailed visitor and usage analytics
- **Security**: Bot protection, rate limiting, and authentication

### 🔧 Technical Features
- **MongoDB Integration**: With JSON fallback system
- **SEO Optimized**: Complete SEO setup with structured data
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Image optimization and caching
- **TypeScript**: Full type safety
- **Modern UI**: Tailwind CSS with custom components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, MongoDB
- **Styling**: Tailwind CSS, Custom Components
- **Authentication**: JWT-based admin system
- **Analytics**: Custom analytics system
- **Deployment**: Vercel, Railway, VPS compatible

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (optional - JSON fallback available)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/your-username/unlockvault.git
cd unlockvault
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

4. **Configure Environment Variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/unlockvault
MONGODB_DB=unlockvault

# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UnlockVault
```

5. **Database Setup (Optional)**
```bash
# If using MongoDB
npm run migrate

# Or use JSON fallback (no setup needed)
```

6. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🗄️ Database Setup

### MongoDB Setup
1. **Install MongoDB locally** or use **MongoDB Atlas**
2. **Run migration script**:
```bash
npm run migrate
```

### JSON Fallback
The system automatically falls back to JSON files if MongoDB is unavailable:
- `data/offers.json` - Offers/tools data
- `data/articles.json` - Blog articles
- `data/categories.json` - Categories
- `data/settings.json` - Site settings

## 🚀 Deployment

### Vercel Deployment
1. **Connect to Vercel**
```bash
npm i -g vercel
vercel
```

2. **Set Environment Variables** in Vercel dashboard
3. **Deploy**
```bash
vercel --prod
```

### Railway Deployment
1. **Connect to Railway**
```bash
railway login
railway init
```

2. **Set Environment Variables**
```bash
railway variables:set MONGODB_URI=your_mongodb_uri
railway variables:set ADMIN_PASSWORD=your_password
```

3. **Deploy**
```bash
railway up
```

### VPS/Docker Deployment
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use Docker
docker build -t unlockvault .
docker run -p 3000:3000 unlockvault
```

### Bitbucket Pipelines
The project includes automated deployment via Bitbucket Pipelines:
```yaml
# See bitbucket-pipelines.yml for full configuration
```

## 🎛️ Admin Panel

Access the admin panel at `/admin-xyz123` with your configured credentials.

### Admin Features
- **Dashboard**: Analytics and overview
- **Content Management**: Add/edit/delete offers
- **Blog Management**: Full article CRUD
- **User Analytics**: Visitor tracking
- **Security Settings**: Password changes
- **Site Settings**: Configuration management

## 📊 API Endpoints

### Public APIs
- `GET /api/offers` - Get all offers
- `GET /api/offers/[id]` - Get specific offer
- `GET /api/articles` - Get all articles
- `GET /api/articles/[slug]` - Get specific article
- `GET /api/search-v2` - Search offers and articles

### Admin APIs
- `POST /api/auth/login` - Admin login
- `POST/PUT/DELETE /api/offers` - Manage offers
- `POST/PUT/DELETE /api/articles` - Manage articles
- `GET /api/analytics` - Get analytics data

## 🔧 Configuration

### Site Settings
Edit `data/settings.json` or use the admin panel:
```json
{
  "siteName": "UnlockVault",
  "siteDescription": "Premium tools and apps platform",
  "siteUrl": "https://unlockvault.xyz",
  "adminEmail": "admin@unlockvault.xyz"
}
```

### SEO Configuration
The site includes comprehensive SEO setup:
- Meta tags optimization
- Structured data (JSON-LD)
- Sitemap generation
- Open Graph tags
- Twitter Cards

## 🛡️ Security Features

- **Bot Protection**: Automated bot detection
- **Rate Limiting**: API rate limiting
- **Input Sanitization**: XSS protection
- **JWT Authentication**: Secure admin sessions
- **CORS Protection**: Cross-origin request security

## 📈 Analytics

The platform includes built-in analytics:
- Page views and unique visitors
- Offer unlock tracking
- Geographic data
- Device and browser stats
- Traffic source analysis

## 🎨 Customization

### Themes
Modify `tailwind.config.js` for custom styling:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#06B6D4'
      }
    }
  }
}
```

### Components
All components are in `/components` directory:
- `UnlockCard.tsx` - Offer display cards
- `Navbar.tsx` - Navigation component
- `AdminLayout.tsx` - Admin panel layout

## 📝 Content Management

### Adding Offers
1. Access admin panel
2. Go to "Add New Offer"
3. Fill in details (title, description, image, etc.)
4. Set category and type
5. Add download links
6. Publish

### Managing Articles
1. Access "Articles & Blog" in admin
2. Create new articles with Markdown editor
3. Add images, links, and formatting
4. Set categories and tags
5. Publish or save as draft

## 🔍 Search System

The platform features advanced search:
- **Multi-content search**: Searches both offers and articles
- **Relevance scoring**: Smart ranking algorithm
- **Filters**: By type, category, and date
- **Real-time search**: Instant results as you type

## 🚦 Performance

### Optimization Features
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: API response caching
- **Lazy Loading**: Component lazy loading
- **Minification**: CSS and JS minification

### Performance Monitoring
- **Core Web Vitals**: Optimized for Google metrics
- **Bundle Analysis**: Use `npm run analyze`
- **Lighthouse**: Regular performance audits

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB URI in `.env.local`
   - Ensure MongoDB is running
   - System automatically falls back to JSON

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. **Admin Login Issues**
   - Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local`
   - Verify JWT_SECRET is set

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the deployment guide

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🔄 Updates

To update the project:
```bash
git pull origin main
npm install
npm run build
```

---

**Built with ❤️ for the community**
