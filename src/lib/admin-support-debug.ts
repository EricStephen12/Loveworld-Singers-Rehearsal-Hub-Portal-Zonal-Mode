import { supabase } from './supabase-client';

export async function debugAdminSupport() {
  console.log('🔍 ADMIN DEBUG: Starting admin support debug...');
  
  try {
    // Test 1: Check authentication
    console.log('1️⃣ Checking admin authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }
    
    console.log('✅ Admin user:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Test 2: Try to get count of all messages
    console.log('2️⃣ Testing message count...');
    const { count, error: countError } = await supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log('✅ Total messages in database:', count);
    }
    
    // Test 3: Try to get messages with different approaches
    console.log('3️⃣ Testing different query approaches...');
    
    // Approach 1: Simple select all
    console.log('   Approach 1: Simple select all');
    const { data: allData, error: allError } = await supabase
      .from('support_messages')
      .select('*');
    
    if (allError) {
      console.error('   ❌ Simple select error:', allError);
    } else {
      console.log('   ✅ Simple select result:', allData?.length || 0, 'messages');
    }
    
    // Approach 2: Select with specific columns
    console.log('   Approach 2: Select specific columns');
    const { data: specificData, error: specificError } = await supabase
      .from('support_messages')
      .select('id, subject, user_name, user_email, status, created_at');
    
    if (specificError) {
      console.error('   ❌ Specific select error:', specificError);
    } else {
      console.log('   ✅ Specific select result:', specificData?.length || 0, 'messages');
    }
    
    // Approach 3: Try with RLS bypass (if service role is available)
    console.log('   Approach 3: Check RLS policies');
    const { data: policyData, error: policyError } = await supabase
      .rpc('get_support_messages_admin'); // This won't exist, just testing
    
    if (policyError) {
      console.log('   ℹ️ RPC not available (expected):', policyError.message);
    }
    
    // Test 4: Check user's own messages
    console.log('4️⃣ Testing user\'s own messages...');
    const { data: userMessages, error: userError } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', user.id);
    
    if (userError) {
      console.error('❌ User messages error:', userError);
    } else {
      console.log('✅ User\'s own messages:', userMessages?.length || 0);
      if (userMessages && userMessages.length > 0) {
        console.log('📋 User messages:', userMessages);
      }
    }
    
    // Test 5: Try to create a test message to see if that works
    console.log('5️⃣ Testing message creation...');
    const testMessage = {
      user_id: user.id,
      user_name: 'Admin Test',
      user_email: user.email || 'admin@test.com',
      subject: 'Admin Test Message',
      message: 'This is a test message from admin debug',
      category: 'general',
      priority: 'low',
      status: 'pending'
    };
    
    const { data: createData, error: createError } = await supabase
      .from('support_messages')
      .insert([testMessage])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Create test message error:', createError);
    } else {
      console.log('✅ Test message created:', createData);
      
      // Clean up test message
      await supabase
        .from('support_messages')
        .delete()
        .eq('id', createData.id);
      
      console.log('🧹 Test message cleaned up');
    }
    
    console.log('🎉 Admin debug completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error in admin debug:', error);
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugAdminSupport = debugAdminSupport;
}
