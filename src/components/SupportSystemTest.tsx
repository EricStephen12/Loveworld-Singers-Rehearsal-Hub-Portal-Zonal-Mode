'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase-client';

export default function SupportSystemTest() {
  const { user, profile } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Running tests...\n');
    
    try {
      // Test 1: Check authentication
      setTestResult(prev => prev + '1. Checking authentication...\n');
      
      if (!user) {
        setTestResult(prev => prev + '❌ No user from useAuth hook\n');
        return;
      }
      
      setTestResult(prev => prev + `✅ User from hook: ${user.uid}\n`);
      
      // Test 2: Check Supabase auth
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setTestResult(prev => prev + `❌ Supabase auth error: ${authError.message}\n`);
        return;
      }
      
      if (!supabaseUser) {
        setTestResult(prev => prev + '❌ No user from Supabase\n');
        return;
      }
      
      setTestResult(prev => prev + `✅ Supabase user: ${supabaseUser.id}\n`);
      
      // Test 3: Check if user IDs match
      if (user.uid !== supabaseUser.id) {
        setTestResult(prev => prev + '⚠️ User ID mismatch between hook and Supabase\n');
      } else {
        setTestResult(prev => prev + '✅ User IDs match\n');
      }
      
      // Test 4: Test database connection
      setTestResult(prev => prev + '2. Testing database connection...\n');
      
      const { data: testData, error: dbError } = await supabase
        .from('support_messages')
        .select('count(*)')
        .limit(1);
      
      if (dbError) {
        setTestResult(prev => prev + `❌ Database error: ${dbError.message}\n`);
        setTestResult(prev => prev + `   Details: ${dbError.details}\n`);
        setTestResult(prev => prev + `   Hint: ${dbError.hint}\n`);
        setTestResult(prev => prev + `   Code: ${dbError.code}\n`);
        return;
      }
      
      setTestResult(prev => prev + '✅ Database connection working\n');
      
      // Test 5: Test simple insert
      setTestResult(prev => prev + '3. Testing message insertion...\n');
      
      const testMessage = {
        user_id: supabaseUser.id,
        user_name: profile?.first_name || 'Test User',
        user_email: profile?.email || supabaseUser.email || 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message from the debug component',
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
        setTestResult(prev => prev + `❌ Insert error: ${insertError.message}\n`);
        setTestResult(prev => prev + `   Details: ${insertError.details}\n`);
        setTestResult(prev => prev + `   Hint: ${insertError.hint}\n`);
        setTestResult(prev => prev + `   Code: ${insertError.code}\n`);
        return;
      }
      
      setTestResult(prev => prev + `✅ Message inserted successfully: ${insertData.id}\n`);
      
      // Clean up test message
      await supabase
        .from('support_messages')
        .delete()
        .eq('id', insertData.id);
      
      setTestResult(prev => prev + '✅ Test message cleaned up\n');
      setTestResult(prev => prev + '\n🎉 All tests passed! Support system should work.\n');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to test the support system.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Support System Test</h3>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? 'Running Tests...' : 'Run Tests'}
      </button>
      
      {testResult && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <pre className="text-sm whitespace-pre-wrap font-mono">{testResult}</pre>
        </div>
      )}
    </div>
  );
}
