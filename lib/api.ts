import { Offer, Category, Stats } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getOffers(): Promise<Offer[]> {
  const response = await fetch(`${API_URL}/api/offers`);
  if (!response.ok) throw new Error('Failed to fetch offers');
  return response.json();
}

export async function getOffer(id: string): Promise<Offer> {
  const response = await fetch(`${API_URL}/api/offers/${id}`);
  if (!response.ok) throw new Error('Failed to fetch offer');
  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_URL}/api/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  const response = await fetch(`${API_URL}/api/offers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update offer');
  return response.json();
}

export async function deleteOffer(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/offers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete offer');
}

export async function createOffer(data: Omit<Offer, 'id' | 'views' | 'unlocks' | 'addedAt' | 'lastModified' | 'status'>): Promise<Offer> {
  const response = await fetch(`${API_URL}/api/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create offer');
  return response.json();
} 