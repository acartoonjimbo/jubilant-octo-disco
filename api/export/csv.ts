import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, TABLES } from '../../lib/supabase';

// Helper function to convert seconds to MM:SS format
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

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
        createAt
      `)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        message: 'Database error', 
        error: error.message 
      });
    }

    // Get categories and players for lookup
    const [categoriesResult, playersResult] = await Promise.all([
      supabase.from(TABLES.CATEGORIES).select('id, name'),
      supabase.from(TABLES.PLAYERS).select('id, name')
    ]);

    const categories = categoriesResult.data || [];
    const players = playersResult.data || [];

    // Create lookup maps
    const categoryMap = Object.fromEntries(
      categories.map(cat => [cat.id, cat.name])
    );
    const playerMap = Object.fromEntries(
      players.map(player => [player.id, player.name])
    );

    // Process data to match CSV export expectations
    const csvData = (tags || []).map(tag => {
      const playerNames = tag.playerIds 
        ? tag.playerIds.split(',')
            .map((id: string) => playerMap[id.trim()] || id.trim())
            .join(', ')
        : '';

      return {
        timestamp: tag.timestamp,
        formattedTime: formatTime(tag.timestamp), // MM:SS format
        category: categoryMap[tag.categoryId] || tag.categoryId,
        description: tag.description,
        players: playerNames,
        videoUrl: tag.videoUrl || '',
        createdAt: tag.createAt
      };
    });

    // Frontend expects raw array for CSV export
    return res.status(200).json(csvData);

  } catch (error) {
    console.error('CSV Export Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
