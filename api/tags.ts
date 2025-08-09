import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error || !Array.isArray(data)) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error?.message || 'Database error' });
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { categoryId, description, playerIds, videoUrl, timestamp } = req.body;

      if (!categoryId || typeof categoryId !== 'string') {
        return res.status(400).json({ error: 'categoryId is required and must be a string.' });
      }
      if (!description || typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ error: 'description is required and must be a non-empty string.' });
      }

      // Defensive: playerIds can be array or string; store as comma-separated string
      let playerIdsStr = '';
      if (Array.isArray(playerIds)) {
        playerIdsStr = playerIds.map(String).join(',');
      } else if (typeof playerIds === 'string') {
        playerIdsStr = playerIds;
      }

      const { data, error } = await supabase
        .from('tags')
        .insert([{ 
          categoryId, 
          description: description.trim(), 
          playerIds: playerIdsStr,
          videoUrl: typeof videoUrl === 'string' ? videoUrl : undefined,
          timestamp: typeof timestamp === 'number' && !isNaN(timestamp) ? timestamp : Math.floor(Date.now() / 1000),
          createdAt: new Date().toISOString()
        }])
        .select();

      if (error || !Array.isArray(data) || !data[0]) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error?.message || 'Database error' });
      }
      return res.status(201).json(data[0]);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
