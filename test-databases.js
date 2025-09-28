// Test script for multi-database support
// Run with: node test-databases.js

import { DatabaseAdapterFactory } from './backend/lib/DatabaseAdapterFactory.js';

async function testDatabaseAdapters() {
  console.log('🚀 Testing UniversalDB Multi-Database Support\n');

  // Test 1: Get supported database types
  console.log('📋 Supported Database Types:');
  const supportedTypes = DatabaseAdapterFactory.getSupportedTypes();
  supportedTypes.forEach(type => console.log(`  - ${type}`));
  console.log();

  // Test 2: Get connection string examples
  console.log('📝 Connection String Examples:');
  const examples = DatabaseAdapterFactory.getConnectionStringExamples();
  Object.entries(examples).forEach(([type, example]) => {
    console.log(`  ${type}: ${example}`);
  });
  console.log();

  // Test 3: Test connection string parsing
  console.log('🔍 Testing Connection String Parsing:');
  
  const testConnections = [
    'postgresql://user:pass@localhost:5432/test',
    'mongodb://user:pass@localhost:27017/test',
    'firebase://project-id:api-key@auth-domain/storage-bucket',
    'supabase://project-ref.supabase.co:anon-key@service-role-key'
  ];

  testConnections.forEach(connStr => {
    try {
      const result = DatabaseAdapterFactory.getDatabaseType(connStr);
      console.log(`  ✅ ${connStr.split('://')[0]} -> ${result}`);
    } catch (error) {
      console.log(`  ❌ ${connStr} -> Error: ${error.message}`);
    }
  });
  console.log();

  // Test 4: Test adapter creation (without actual connection)
  console.log('🏗️  Testing Adapter Creation:');
  
  for (const connStr of testConnections) {
    try {
      const adapter = DatabaseAdapterFactory.createAdapter(connStr);
      console.log(`  ✅ ${adapter.constructor.name} created for ${connStr.split('://')[0]}`);
    } catch (error) {
      console.log(`  ❌ Failed to create adapter for ${connStr}: ${error.message}`);
    }
  }
  console.log();

  // Test 5: Test adapter statistics
  console.log('📊 Adapter Statistics:');
  const stats = DatabaseAdapterFactory.getStatistics();
  console.log(`  Total adapters in cache: ${stats.totalAdapters}`);
  console.log(`  Connected adapters: ${stats.connectedAdapters}`);
  console.log('  Adapters by type:');
  Object.entries(stats.adaptersByType).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });
  console.log();

  // Test 6: Test invalid connection strings
  console.log('❌ Testing Invalid Connection Strings:');
  const invalidConnections = [
    'invalid://connection',
    'ftp://not-a-database',
    'just-a-string'
  ];

  invalidConnections.forEach(connStr => {
    try {
      DatabaseAdapterFactory.getDatabaseType(connStr);
      console.log(`  ⚠️  ${connStr} -> Should have failed but didn't`);
    } catch (error) {
      console.log(`  ✅ ${connStr} -> Correctly rejected: ${error.message}`);
    }
  });
  console.log();

  console.log('✨ Multi-database support testing completed!');
  console.log('\n📖 For more information, see MULTI_DATABASE_GUIDE.md');
}

// Run the tests
testDatabaseAdapters().catch(console.error);