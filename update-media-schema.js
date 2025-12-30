const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
  try {
    console.log('Creating media table...');
    
    // Create media table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS media (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'audio', 'video', 'document')),
          size BIGINT NOT NULL,
          folder VARCHAR(100),
          publicId TEXT,
          uploadedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('Error creating media table:', createError);
      return;
    }
    
    console.log('✅ Media table created successfully!');
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
        CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
        CREATE INDEX IF NOT EXISTS idx_media_uploadedAt ON media(uploadedAt);
      `
    });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully!');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE media ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public read access" ON media FOR SELECT USING (true);
        CREATE POLICY "Allow admin insert" ON media FOR INSERT WITH CHECK (true);
        CREATE POLICY "Allow admin update" ON media FOR UPDATE USING (true);
        CREATE POLICY "Allow admin delete" ON media FOR DELETE USING (true);
      `
    });
    
    if (rlsError) {
      console.error('Error setting up RLS:', rlsError);
    } else {
      console.log('✅ RLS policies created successfully!');
    }
    
    console.log('🎉 Media table setup complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateSchema();


