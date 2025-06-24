import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Article {
  id: string;
  slug: string;  
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  lastModified?: string;
}

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  addedAt: string;
}

const generateRSSFeed = (articles: Article[], offers: Offer[]) => {
  const baseUrl = 'https://unlockvault.xyz';
  const currentDate = new Date().toUTCString();

  // Combine and sort all content by date
  const allContent = [
    ...articles.filter(article => article.published).map(article => ({
      ...article,
      type: 'article',
      date: article.createdAt,
      url: `${baseUrl}/articles/${article.slug}`
    })),
    ...offers.map(offer => ({
      ...offer,
      type: 'offer',
      date: offer.addedAt,
      url: `${baseUrl}/offers/${offer.slug}`,
      summary: offer.description,
      content: offer.description
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 50); // Limit to latest 50 items

  const rssItems = allContent.map((item: any) => {
    const pubDate = new Date(item.date).toUTCString();
    const itemType = item.type === 'article' ? 'Article' : 'Software';
    const categoryTag = item.category ? `<category>${item.category}</category>` : '';
    const description = item.summary || item.description || '';
    
    return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${categoryTag}
      <source url="${baseUrl}/rss.xml">UnlockVault RSS Feed</source>
      <dc:creator><![CDATA[${item.author || 'UnlockVault Team'}]]></dc:creator>
      <content:encoded><![CDATA[
        <img src="${item.image}" alt="${item.title}" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />
        <p>${description}</p>
        ${item.type === 'article' ? `<p><strong>Category:</strong> ${item.category}</p>` : ''}
        ${item.type === 'offer' ? `<p><strong>Type:</strong> ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>` : ''}
        <p><a href="${item.url}" target="_blank">Read more on UnlockVault</a></p>
      ]]></content:encoded>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UnlockVault - Premium Software &amp; Digital Tools</title>
    <description>Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools.</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/logo.svg</url>
      <title>UnlockVault</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>support@unlockvault.xyz (UnlockVault Team)</managingEditor>
    <webMaster>support@unlockvault.xyz (UnlockVault Team)</webMaster>
    <category>Technology</category>
    <category>Software</category>
    <category>Gaming</category>
    <category>Productivity</category>
    <generator>UnlockVault RSS Generator</generator>
    <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
    <copyright>© 2024 UnlockVault. All rights reserved.</copyright>
    ${rssItems}
  </channel>
</rss>`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let articles: Article[] = [];
    let offers: Offer[] = [];

    // Try to read articles from file
    try {
      const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
      if (fs.existsSync(articlesPath)) {
        const articlesData = fs.readFileSync(articlesPath, 'utf8');
        articles = JSON.parse(articlesData);
      }
    } catch (error) {
      console.log('Could not read articles data:', error);
    }

    // Try to read offers from file
    try {
      const offersPath = path.join(process.cwd(), 'data', 'offers.json');
      if (fs.existsSync(offersPath)) {
        const offersData = fs.readFileSync(offersPath, 'utf8');
        offers = JSON.parse(offersData);
      }
    } catch (error) {
      console.log('Could not read offers data:', error);
    }

    const rssXml = generateRSSFeed(articles, offers);

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(rssXml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).json({ message: 'Error generating RSS feed' });
  }
} 