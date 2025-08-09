import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase-client';

const TABLES = {
  TAGS: 'tags',
  CATEGORIES: 'categories',
  PLAYERS: 'players'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all tags with related data
    const { data: tags, error } = await supabase
      .from(TABLES.TAGS)
      .select(`
        timestamp, 
        categoryId, 
        description, 
        playerIds, 
        videoUrl, 
        createdAt
      `)
      .order('timestamp', { ascending: true });

    if (error || !Array.isArray(tags)) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        message: 'Database error', 
        error: error?.message || 'Failed to fetch tags'
      });
    }

    // Get categories and players for lookup
    const [categoriesResult, playersResult] = await Promise.all([
      supabase.from(TABLES.CATEGORIES).select('id, name'),
      supabase.from(TABLES.PLAYERS).select('id, name')
    ]);

    const categories = Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
    const players = Array.isArray(playersResult.data) ? playersResult.data : [];

    // Create lookup maps
    const categoryMap = Object.fromEntries(
      categories.map(cat => [cat.id, cat.name])
    );
    const playerMap = Object.fromEntries(
      players.map(player => [player.id, player.name])
    );

    // Process data to match CSV export expectations
    const csvData = (tags || []).map(tag => {
      // Defensive: playerIds may be string or array
      let playerNames = '';
      if (tag.playerIds) {
        const idsArray = Array.isArray(tag.playerIds)
          ? tag.playerIds
          : typeof tag.playerIds === 'string'
            ? tag.playerIds.split(',').map(s => s.trim())
            : [];
        playerNames = idsArray
          .map((id: string) => playerMap[id] || id)
          .join(', ');
      }

      return {
        timestamp: typeof tag.timestamp === 'number' ? tag.timestamp : '',
        category: categoryMap[tag.categoryId] || tag.categoryId || '',
        description: tag.description || '',
        players: playerNames,
        videoUrl: tag.videoUrl || '',
        createdAt: tag.createdAt || ''
      };
    });

    // Convert to CSV
    const csvHeader = ['timestamp', 'category', 'description', 'players', 'videoUrl', 'createdAt'];
    const csvRows = [
      csvHeader.join(','),
      ...csvData.map(row =>
        csvHeader.map(key => `"${String(row[key]).replace(/"/g, '""')}"`).join(',')
      )
    ];
    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
