import { NextApiRequest, NextApiResponse } from 'next';
import { validateCredentials, checkRateLimit, logFailedAttempt, createDefaultAdmin } from '../../../lib/auth';
import { signJwt } from '../../../lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Rate limiting
  if (!checkRateLimit(clientIP as string)) {
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    });
  }

  try {
    console.log('Login attempt:', { email, clientIP });
    
    // Ensure default admin exists
    await createDefaultAdmin();
    
    const isValid = await validateCredentials(email, password);
    
    if (!isValid) {
      logFailedAttempt(clientIP as string, email);
      return res.status(401).json({ 
        error: 'Invalid email or password',
        message: 'Please check your credentials and try again'
      });
    }

    const user = {
      email,
      role: 'admin',
      loginTime: new Date().toISOString()
    };

    const token = signJwt({ email: user.email, role: user.role });

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `auth-token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    console.log('Login successful:', { email, clientIP });

    res.status(200).json({ 
      success: true, 
      user: { email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
} 