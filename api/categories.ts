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
        // TODO: Connect to your Supabase database and fetch categories
        // Example with Supabase client:
        // const { data, error } = await supabase.from('categories').select('*');
        // if (error) throw error;
        // return res.status(200).json(data);
        
        // Placeholder response for now
        return res.status(200).json({
          message: "Get categories",
          data: [
            { id: 1, name: "Category 1", description: "Sample category" },
            { id: 2, name: "Category 2", description: "Another category" }
          ]
        });

      case 'POST':
        const { name, description } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: "Name is required" });
        }

        // TODO: Insert into your Supabase database
        // const { data, error } = await supabase
        //   .from('categories')
        //   .insert([{ name, description }])
        //   .select();
        // if (error) throw error;
        // return res.status(201).json(data[0]);
        
        // Placeholder response for now
        return res.status(201).json({
          message: "Create category",
          data: {
            id: Date.now(),
            name,
            description,
            created_at: new Date().toISOString()
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Categories API Error:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
