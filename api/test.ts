import { type VercelRequest, type VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test endpoint - accepts any method
    return res.status(200).json({
      message: "Test endpoint working!",
      method: req.method,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      query: req.query,
      body: req.body || null,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({ 
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
