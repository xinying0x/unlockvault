# Articles & Blog System

A complete articles/blog module for the UnlockVault website built with Next.js, React, and MongoDB.

## Features

### Public Features
- **Articles Page** (`/articles`): Browse all published articles with search and category filters
- **Article Details** (`/articles/[slug]`): Read full articles with related content suggestions
- **Search & Filters**: Real-time search by title, content, and tags with category filtering
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **SEO Optimized**: Meta tags, structured data, and social sharing

### Admin Features
- **Articles Management** (`/admin-xyz123/articles`): View, edit, and delete articles
- **Rich Text Editor**: Markdown-based editor with live preview
- **Article Creation** (`/admin-xyz123/articles/new`): Create new articles with rich content
- **Article Editing** (`/admin-xyz123/articles/edit/[slug]`): Edit existing articles
- **Publishing Control**: Save as draft or publish immediately
- **Analytics**: View article statistics and performance

## File Structure

```
pages/
├── articles.tsx                          # Main articles listing page
├── articles/[slug].tsx                   # Individual article page
├── admin-xyz123/
│   ├── articles.tsx                      # Admin articles management
│   └── articles/
│       ├── new.tsx                       # Create new article
│       └── edit/[slug].tsx               # Edit existing article
└── api/
    └── articles/
        ├── index.ts                      # Articles API (GET/POST)
        ├── [slug].ts                     # Individual article API (GET/PUT/DELETE)
        └── [slug]/view.ts                # Track article views

components/
└── (existing components used)

data/
└── articles.json                         # Sample articles data

scripts/
└── seed-articles.js                     # Database seeding script

types/
└── index.ts                             # Article TypeScript interface
```

## Database Schema

The articles are stored in MongoDB with the following structure:

```typescript
interface Article {
  id: string;                   // Unique identifier
  slug: string;                // URL-friendly slug
  title: string;               // Article title
  summary: string;             // Brief description
  content: string;             // Full HTML content
  image: string;               // Featured image URL
  author: string;              // Author name
  category: string;            // Article category
  tags: string[];              // Array of tags
  published: boolean;          // Publication status
  views: number;               // View count
  createdAt: string;           // Creation timestamp
  updatedAt: string;           // Last update timestamp
}
```

## Categories

- Android Games
- Android Apps
- iOS Software
- How-to
- Reviews
- News

## API Endpoints

### Public Endpoints

- `GET /api/articles` - Get all published articles
  - Query params: `category`, `limit`, `exclude`
- `GET /api/articles/[slug]` - Get specific article
- `POST /api/articles/[slug]/view` - Track article view

### Admin Endpoints

- `POST /api/articles` - Create new article
- `PUT /api/articles/[slug]` - Update article
- `DELETE /api/articles/[slug]` - Delete article

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Database Setup**
   Make sure MongoDB is running and the connection string is configured in your environment variables.

3. **Seed Sample Data**
   ```bash
   npm run seed-articles
   # or
   yarn seed-articles
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the System**
   - Public articles: `http://localhost:3000/articles`
   - Admin panel: `http://localhost:3000/admin-xyz123/articles`

## Usage Guide

### Creating Articles

1. Go to Admin Dashboard → Articles & Blog
2. Click "New Article"
3. Fill in the article details:
   - Title and author
   - Category and tags
   - Featured image URL
   - Summary
4. Write content using Markdown syntax
5. Use the preview mode to see how it will look
6. Save as draft or publish immediately

### Markdown Support

The editor supports standard Markdown syntax:

- **Bold**: `**text**`
- *Italic*: `*text*`
- Headers: `# H1`, `## H2`, `### H3`
- Links: `[text](URL)`
- Images: `![alt text](IMAGE_URL)`
- Code: `` `code` ``
- Code blocks: ``` ```code``` ```
- Lists: `- item`
- Quotes: `> quote`

### Managing Articles

- **Edit**: Click the edit icon in the articles table
- **Delete**: Click the delete icon (requires confirmation)
- **Toggle Published**: Click the status badge to publish/unpublish
- **View**: Click the view icon to see the public article page

## Customization

### Styling
The system uses Tailwind CSS with a dark theme matching the existing site design. Customize colors and styles in the component files.

### Categories
Add or modify categories in:
- `pages/admin-xyz123/articles/new.tsx`
- `pages/admin-xyz123/articles/edit/[slug].tsx`
- `pages/articles.tsx`

### Content Types
The system is flexible and can be extended to support different content types by modifying the Article interface and forms.

## Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Lazy Loading**: Images and content are optimized for performance
- **Caching**: Built-in Next.js caching for better performance
- **Search Optimization**: Efficient search across title, content, and tags

## SEO Features

- **Meta Tags**: Automatic generation of title, description, and OG tags
- **Structured Data**: JSON-LD for better search engine understanding
- **Social Sharing**: Twitter, Facebook, and LinkedIn sharing buttons
- **URL Structure**: SEO-friendly URLs with slugs

## Security

- **Admin Authentication**: All admin endpoints require authentication
- **Input Validation**: Proper validation of all inputs
- **XSS Protection**: HTML content is properly sanitized
- **CSRF Protection**: Built-in Next.js CSRF protection

## Troubleshooting

### Common Issues

1. **Articles not loading**: Check MongoDB connection and ensure articles collection exists
2. **Images not displaying**: Verify image URLs are accessible and valid
3. **Search not working**: Ensure database indexes are created
4. **Admin access denied**: Verify authentication is working properly

### Database Commands

```javascript
// Create indexes manually in MongoDB shell
db.articles.createIndex({ slug: 1 }, { unique: true })
db.articles.createIndex({ published: 1 })
db.articles.createIndex({ category: 1 })
db.articles.createIndex({ createdAt: -1 })
db.articles.createIndex({ tags: 1 })
```

## Future Enhancements

- Comment system for articles
- Article bookmarking
- Advanced analytics dashboard
- Content scheduling
- Multi-author support
- Article templates
- Import/export functionality

## Support

For issues or questions about the articles system, please check the existing documentation or create an issue in the project repository. 