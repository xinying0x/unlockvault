import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const OFFERS_FILE = path.resolve(process.cwd(), 'data', 'offers.json');

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  status: 'active' | 'draft' | 'archied';
  lastModified: string;
  useDummyStats: boolean;
}

async function readOffers(): Promise<Offer[]> {
  try {
    const content = await fs.readFile(OFFERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error in readOffers:', error);
    if (error instanceof SyntaxError) {
      console.error('This is a JSON syntax error. Check data/offers.json');
    } else if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('offers.json file not found!');
      return [];
    }
    console.error('Error reading or parsing offers file:', error);
    throw error;
  }
}

async function writeOffers(offers: Offer[]): Promise<void> {
  await fs.writeFile(OFFERS_FILE, JSON.stringify(offers, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // This will be the offer ID

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Offer ID is required' });
  }

  let offers = await readOffers();
  // First, try to find the offer by slug
  let offerIndex = offers.findIndex(o => o.slug === id);

  // If not found by slug, try to find by ID (for backward compatibility)
  if (offerIndex === -1) {
    offerIndex = offers.findIndex(o => o.id === id);
  }

  if (offerIndex === -1) {
    return res.status(404).json({ message: 'Offer not found' });
  }

  switch (req.method) {
    case 'GET':
      // Increment views count on GET request for an offer
      offers[offerIndex].views = (offers[offerIndex].views || 0) + 1;
      await writeOffers(offers);
      res.status(200).json(offers[offerIndex]);
      break;

    case 'PUT':
      const updatedOfferData = req.body;

      // Handle incrementing unlocks
      if (updatedOfferData.action === 'incrementUnlocks') {
        offers[offerIndex].unlocks = (offers[offerIndex].unlocks || 0) + 1;
        await writeOffers(offers);
        return res.status(200).json({ message: 'Unlock count incremented successfully' });
      }

      // Ensure ID and immutable fields are not changed via PUT if desired
      const existingOffer = offers[offerIndex];

      // Handle lockerLinks which might be stringified from frontend
      let parsedLockerLinks = existingOffer.lockerLinks;
      if (typeof updatedOfferData.lockerLinks === 'string') {
        try {
          parsedLockerLinks = JSON.parse(updatedOfferData.lockerLinks);
        } catch (e) {
          console.error('Error parsing lockerLinks in PUT:', e);
          return res.status(400).json({ message: 'Invalid lockerLinks format' });
        }
      } else if (typeof updatedOfferData.lockerLinks === 'object') {
          parsedLockerLinks = updatedOfferData.lockerLinks;
      }

      const updatedOffer = {
        ...existingOffer,
        ...updatedOfferData,
        lockerLinks: parsedLockerLinks,
        lastModified: new Date().toISOString(),
        id: existingOffer.id, // Ensure ID remains the same
      };

      // Basic XSS prevention - sanitize strings if needed
      const sanitizeString = (str: string) => {
        return str ? str.replace(/[<>]/g, '').trim() : str;
      };
      updatedOffer.title = sanitizeString(updatedOffer.title);
      updatedOffer.description = sanitizeString(updatedOffer.description);
      updatedOffer.category = sanitizeString(updatedOffer.category);
      // Sanitize keywords array elements
      if (Array.isArray(updatedOffer.keywords)) {
        updatedOffer.keywords = updatedOffer.keywords.map(sanitizeString);
      }

      offers[offerIndex] = updatedOffer;
      await writeOffers(offers);
      res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
      break;

    case 'DELETE':
      offers.splice(offerIndex, 1);
      await writeOffers(offers);
      res.status(200).json({ message: 'Offer deleted successfully' });
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 