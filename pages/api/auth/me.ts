import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from '../../../lib/jwt';
import { parse } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  console.log('me.ts: Received cookies:', cookies);
  const token = cookies['auth-token'];
  if (!token) {
    console.log('me.ts: auth-token cookie missing.');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('me.ts: Received auth-token:', token);
  const payload = verifyJwt(token);
  if (!payload) {
    console.log('me.ts: Invalid token.');
    return res.status(401).json({ error: 'Invalid token' });
  }
  console.log('me.ts: Token successfully verified, payload:', payload);
  return res.status(200).json({ user: payload });
} 