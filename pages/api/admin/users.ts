import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { verifyJwt } from '../../../lib/jwt';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = verifyJwt(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('users');

    switch (req.method) {
      case 'GET':
        const users = await collection
          .find({ role: 'admin' }, { projection: { passwordHash: 0 } })
          .toArray();
        
        const cleanUsers = users.map(({ _id, ...user }) => user);
        res.status(200).json(cleanUsers);
        break;

      case 'POST':
        const { email, password, role = 'admin' } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await collection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = {
          email,
          role,
          passwordHash: await hashPassword(password),
          createdAt: new Date().toISOString(),
          lastLogin: null
        };

        await collection.insertOne(newUser);
        res.status(201).json({ message: 'User created successfully' });
        break;

      case 'PUT':
        const { currentEmail, newEmail, newPassword } = req.body;
        
        if (!currentEmail) {
          return res.status(400).json({ message: 'Current email is required' });
        }

        const updateData: any = {};
        
        if (newEmail) {
          // Check if new email already exists
          const emailExists = await collection.findOne({ 
            email: newEmail, 
            email: { $ne: currentEmail } 
          });
          
          if (emailExists) {
            return res.status(400).json({ message: 'Email already in use' });
          }
          
          updateData.email = newEmail;
        }
        
        if (newPassword) {
          updateData.passwordHash = await hashPassword(newPassword);
        }
        
        updateData.lastModified = new Date().toISOString();

        const result = await collection.updateOne(
          { email: currentEmail, role: 'admin' },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 