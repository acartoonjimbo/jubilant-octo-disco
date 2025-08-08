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
      message: 'Tags endpoint working',
      data: [
        { id: 1, name: 'Tag 1', color: '#FF0000' },
        { id: 2, name: 'Tag 2', color: '#00FF00' }
      ]
    });
  } else if (req.method === 'POST') {
    res.status(201).json({
      message: 'Tag created',
      data: { id: 3, name: req.body?.name || 'New Tag', color: '#0000FF' }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
