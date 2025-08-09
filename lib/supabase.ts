import { createClient } from '@supabase/supabase-js';

// YOU NEED TO REPLACE THESE WITH YOUR ACTUAL VALUES:
const supabaseUrl = process.env.SUPABASE_URL || 'https://tsycalihcemhpuebirrq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzeWNhbGloY2VtaHB1ZWJpcnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MzkxOTcsImV4cCI6MjA3MDAxNTE5N30.O2LUXRTLC1dBBD0Qq5siCVUniDYBbwOt9KfnhSHjLFo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Your actual table names:
export const TABLES = {
  CATEGORIES: 'categories',
  PLAYERS: 'players',
  TAGS: 'tags'
};
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export interface Category {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  number?: number;
}

export interface Tag {
  id: string;
  timestamp: number;
  categoryId: string;
  description: string;
  playerIds?: string;
  videoUrl?: string;
  createAt: string;
}
