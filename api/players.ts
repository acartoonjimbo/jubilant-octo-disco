import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, TABLES } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all players - return raw array as frontend expects
      const { data, error } = await supabase
        .from(TABLES.PLAYERS)
        .select('id, name, number')  // Exact fields frontend expects
        .order('number', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          message: 'Database error', 
          error: error.message 
        });
      }

      // Frontend expects raw array, not wrapped in { data: ... }
      return res.status(200).json(data || []);

    } else if (req.method === 'POST') {
      // Create/Update player
      const { name, number } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          message: 'Name is required' 
        });
      }

      if (number === undefined || number === null) {
        return res.status(400).json({ 
          message: 'Number is required' 
        });
      }

      const { data, error } = await supabase
        .from(TABLES.PLAYERS)
        .insert([
          {
            id: crypto.randomUUID(), // Generate UUID for id
            name: name.trim(),
            number: parseInt(number) // Ensure it's an integer
          }
        ])
        .select('id, name, number')
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          message: 'Database error', 
          error: error.message 
        });
      }

      return res.status(201).json(data);

    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
