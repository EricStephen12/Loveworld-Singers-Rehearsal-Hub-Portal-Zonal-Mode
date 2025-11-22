import { supabase } from './supabase-client';

export async function debugSupportSystem() {
  console.log('🔍 Debugging Support System...');
  
  try {
    // Test 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Test 2: Check database connection
    console.log('2. Testing database connection...');
    const { data: testData, error: dbError } = await supabase
      .from('support_messages')
      .select('count(*)')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }
    
    console.log('✅ Database connection working');
    
    // Test 3: Check RLS policies
    console.log('3. Testing RLS policies...');
    const { data: userMessages, error: rlsError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (rlsError) {
      console.error('❌ RLS error:', rlsError);
      return;
    }
    
    console.log('✅ RLS policies working');
    
    // Test 4: Try to insert a test message
    console.log('4. Testing message insertion...');
    const testMessage = {
      user_id: user.id,
      user_name: 'Test User',
      user_email: user.email || 'test@example.com',
      subject: 'Test Message',
      message: 'This is a test message',
      category: 'general',
      priority: 'medium',
      status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('support_messages')
      .insert([testMessage])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return;
    }
    
    console.log('✅ Message insertion working:', insertData);
    
    // Clean up test message
    await supabase
      .from('support_messages')
      .delete()
      .eq('id', insertData.id);
    
    console.log('✅ All tests passed! Support system should work.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Call this function from browser console to debug
if (typeof window !== 'undefined') {
  (window as any).debugSupportSystem = debugSupportSystem;
}
