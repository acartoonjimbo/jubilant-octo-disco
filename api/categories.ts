import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Players endpoint working',
      data: [
        { id: 1, name: 'Player 1', score: 100 },
        { id: 2, name: 'Player 2', score: 250 }
      ]
    });
  } else if (req.method === 'POST') {
    res.status(201).json({
      message: 'Player created',
      data: { id: 3, name: req.body?.name || 'New Player', score: 0 }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
