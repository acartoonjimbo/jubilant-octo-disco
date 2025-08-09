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
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      if (error || !Array.isArray(data)) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error?.message || 'Database error' });
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, number } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string.' });
      }
      if (typeof number !== 'number' || isNaN(number)) {
        return res.status(400).json({ error: 'Number is required and must be numeric.' });
      }

      const { data, error } = await supabase
        .from('players')
        .insert([{ name: name.trim(), number }])
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
