export interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  type: 'tool' | 'app' | 'game';
  category: string;
  views: number;
  unlocks: number;
  addedAt: string;
  keywords: string[];
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  lockerLinks: {
    [key: string]: string;
  };
  lastModified?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  href: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
}

export interface Stats {
  totalViews: number;
  totalUnlocks: number;
  totalTools: number;
  totalCategories: number;
  topTools: Tool[];
  recentUnlocks: {
    toolId: string;
    timestamp: string;
    country: string;
  }[];
}

export interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  link: string;
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating?: number;
  gallery?: string[];
  showInDashboard?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: 'Android Games' | 'Android Apps' | 'iOS Software' | 'How-to' | 'Reviews' | 'News';
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
} 