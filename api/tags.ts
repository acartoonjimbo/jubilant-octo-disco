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
    switch (req.method) {
      case 'GET':
        // TODO: Connect to your Supabase database and fetch tags
        // Example with Supabase client:
        // const { data, error } = await supabase.from('tags').select('*');
        // if (error) throw error;
        // return res.status(200).json(data);
        
        // Placeholder response for now
        return res.status(200).json({
          message: "Get tags",
          data: [
            { id: 1, name: "Tag 1", color: "#FF5733" },
            { id: 2, name: "Tag 2", color: "#33FF57" },
            { id: 3, name: "Tag 3", color: "#3357FF" }
          ]
        });

      case 'POST':
        const { name, color, description } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: "Name is required" });
        }

        // TODO: Insert into your Supabase database
        // const { data, error } = await supabase
        //   .from('tags')
        //   .insert([{ name, color, description }])
        //   .select();
        // if (error) throw error;
        // return res.status(201).json(data[0]);
        
        // Placeholder response for now
        return res.status(201).json({
          message: "Create tag",
          data: {
            id: Date.now(),
            name,
            color: color || "#000000",
            description,
            created_at: new Date().toISOString()
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Tags API Error:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
