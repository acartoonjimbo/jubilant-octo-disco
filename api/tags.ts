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
      // Get all tags - return raw array as frontend expects
      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .select(`
          id, 
          timestamp, 
          categoryId, 
          description, 
          playerIds, 
          videoUrl, 
          createAt
        `)
        .order('timestamp', { ascending: false }); // Most recent first

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          message: 'Database error', 
          error: error.message 
        });
      }

      // Process the data to match frontend expectations
      const processedData = (data || []).map(tag => ({
        id: tag.id,
        timestamp: tag.timestamp, // Already a number (seconds)
        categoryId: tag.categoryId,
        description: tag.description,
        playerIds: tag.playerIds ? tag.playerIds.split(',') : [], // Convert string to array
        videoUrl: tag.videoUrl,
        createdAt: tag.createAt // Note: frontend expects 'createdAt' but DB has 'createAt'
      }));

      // Frontend expects raw array, not wrapped in { data: ... }
      return res.status(200).json(processedData);

    } else if (req.method === 'POST') {
      // Create new tag from form data
      const { categoryId, description, playerIds, timestamp, videoUrl } = req.body;

      // Validation
      if (!categoryId || categoryId.trim() === '') {
        return res.status(400).json({ message: 'Category ID is required' });
      }

      if (!description || description.trim() === '') {
        return res.status(400).json({ message: 'Description is required' });
      }

      if (!Array.isArray(playerIds)) {
        return res.status(400).json({ message: 'Player IDs must be an array' });
      }

      if (!timestamp || typeof timestamp !== 'number') {
        return res.status(400).json({ message: 'Timestamp must be a number (seconds)' });
      }

      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .insert([
          {
            id: crypto.randomUUID(), // Generate UUID for id
            timestamp: timestamp, // Already a number (seconds)
            categoryId: categoryId.trim(),
            description: description.trim(),
            playerIds: playerIds.join(','), // Convert array to comma-separated string
            videoUrl: videoUrl?.trim() || null,
            createAt: new Date().toISOString() // Current timestamp
          }
        ])
        .select(`
          id, 
          timestamp, 
          categoryId, 
          description, 
          playerIds, 
          videoUrl, 
          createAt
        `)
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ 
          message: 'Database error', 
          error: error.message 
        });
      }

      // Process response to match frontend expectations
      const processedResponse = {
        id: data.id,
        timestamp: data.timestamp,
        categoryId: data.categoryId,
        description: data.description,
        playerIds: data.playerIds ? data.playerIds.split(',') : [],
        videoUrl: data.videoUrl,
        createdAt: data.createAt
      };

      return res.status(201).json(processedResponse);

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
