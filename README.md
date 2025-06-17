# UnlockVault - Premium Tools & Apps Platform

🔓 **UnlockVault** is a modern web platform for accessing premium tools, applications, and games. Built with Next.js and TypeScript, it features a complete admin dashboard, visitor analytics, and content management system.

## ✨ Features

### 🎯 Core Features
- **Premium Content Access**: Tools, apps, and games with unlock mechanisms
- **Real-time Visitor Tracking**: IP-based analytics with country detection
- **Content Management**: Full CRUD operations for offers and content
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🛡️ Security & Analytics
- **JWT Authentication**: Secure admin access
- **IP Tracking**: Real visitor data with country/device information
- **VPN Detection**: Advanced security features
- **Bot Detection**: Automated traffic filtering

### 🎨 User Experience
- **Modern UI**: Beautiful gradients and animations
- **Search Functionality**: Advanced filtering and search
- **Categories**: Organized content structure
- **Testimonials**: User feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unlockvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   ADMIN_EMAIL=admin@unlockvault.com
   ADMIN_PASSWORD=your-secure-password
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
unlockvault/
├── components/          # Reusable UI components
│   ├── AdminLayout.tsx  # Admin dashboard layout
│   ├── UnlockCard.tsx   # Content cards
│   ├── ActivityFeed.tsx # Real-time activity
│   └── ...
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── admin-xyz123/   # Admin dashboard
│   └── ...
├── data/               # JSON data storage
│   ├── offers.json     # Content offers
│   ├── visits.json     # Visitor analytics
│   └── ...
├── lib/                # Utility libraries
├── hooks/              # React hooks
└── styles/             # CSS styles
```

## 🔧 Admin Access

### Login Credentials
- **URL**: `/admin-xyz123/login`
- **Email**: Set in `ADMIN_EMAIL` environment variable
- **Password**: Set in `ADMIN_PASSWORD` environment variable

### Admin Features
- **Dashboard**: Real-time analytics and visitor data
- **Content Management**: Create, edit, delete offers
- **Visitor Analytics**: Detailed IP tracking and statistics
- **Settings**: Site configuration
- **Testimonials**: Manage user feedback

## 📊 Analytics & Tracking

### Visitor Tracking
- **Real IP Addresses**: Tracks actual visitor IPs
- **Country Detection**: GeoIP-based location tracking
- **Device Information**: Browser, OS, device type
- **VPN Detection**: Security analysis
- **Traffic Sources**: Referrer analysis

### Data Storage
- **JSON-based**: Lightweight file storage
- **Real-time**: Instant data updates
- **Scalable**: Handles up to 2000 visitor records

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
```

### Key Technologies
- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT
- **Analytics**: Custom IP tracking
- **Deployment**: Vercel-ready

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
JWT_SECRET=production-jwt-secret
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=secure-production-password
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 📈 Performance

- **Build Size**: ~104KB First Load JS
- **Static Generation**: 26 static pages
- **SEO Optimized**: Automatic sitemap generation
- **Fast Loading**: Optimized images and code splitting

## 🔒 Security Features

- **JWT Authentication**: Secure admin sessions
- **IP Validation**: Real visitor tracking
- **Bot Detection**: Automated traffic filtering
- **VPN Detection**: Advanced security analysis
- **CORS Protection**: API security

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and questions:
- Check the `ADMIN_GUIDE.md` for detailed admin instructions
- Review the codebase for implementation details
- Contact the development team for technical support

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**# unlockvault
# unlockvault
