# Multi-Database Support Documentation

## Overview

UniversalDB now supports multiple database types through a unified interface. You can connect to and manage PostgreSQL, MongoDB, Firebase Firestore, and Supabase databases using the same API and frontend interface.

## Supported Database Types

### 1. PostgreSQL / NeonDB
- **Connection String Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://user:pass@localhost:5432/mydb`
- **Features**: Full SQL support, ACID transactions, foreign keys, advanced queries

### 2. MongoDB
- **Connection String Format**: `mongodb://username:password@host:port/database` or `mongodb+srv://...`
- **Example**: `mongodb://user:pass@localhost:27017/mydb`
- **Features**: Document storage, dynamic schema, flexible queries

### 3. Firebase Firestore
- **Connection String Format**: `firebase://project-id:api-key@auth-domain/storage-bucket`
- **Example**: `firebase://my-project:AIzaSyC123...@my-project.firebaseapp.com/my-project.appspot.com`
- **Features**: Real-time updates, offline support, auto-scaling

### 4. Supabase
- **Connection String Format**: `supabase://project-ref.supabase.co:anon-key@service-role-key`
- **Example**: `supabase://abc123.supabase.co:eyJ...@eyJ...`
- **Features**: PostgreSQL + real-time, row-level security, built-in auth

## Installation and Setup

### Backend Dependencies
The following packages have been added to support multi-database functionality:

```json
{
  "@supabase/supabase-js": "^2.48.0",
  "firebase": "^12.0.0",
  "mongoose": "^8.18.0",
  "pg": "^8.16.3"
}
```

### Installation
```bash
cd backend
npm install
```

## API Endpoints

### Connection Management
- `POST /api/v1/db/connect` - Test database connection
- `GET /api/v1/db/supported-databases` - Get supported database types and examples
- `GET /api/v1/db/stats` - Get adapter statistics

### CRUD Operations
- `POST /api/v1/db/create` - Create table/collection
- `POST /api/v1/db/create-with-constraints` - Create table with foreign keys
- `POST /api/v1/db/drop` - Drop table/collection
- `POST /api/v1/db/insert` - Insert data
- `POST /api/v1/db/read` - Read data with filters
- `POST /api/v1/db/update` - Update data
- `DELETE /api/v1/db/delete/:id` - Delete data

### Schema Management
- `POST /api/v1/db/schema` - Get database schema
- `POST /api/v1/db/add-column` - Add column to table
- `POST /api/v1/db/drop-column` - Drop column from table
- `POST /api/v1/db/add-foreign-key` - Add foreign key constraint
- `POST /api/v1/db/drop-foreign-key` - Drop foreign key constraint

## Frontend Usage

### Database Connection
The frontend now includes a unified database connection form that automatically detects the database type and provides appropriate examples.

```jsx
import DatabaseConnectionForm from './Components/DatabaseConnectionForm';

// Use the component
<DatabaseConnectionForm onConnect={handleConnect} />
```

### Context API
The DatabaseContext has been enhanced to support multiple database types:

```jsx
import { useDatabaseContext } from './contexts/DatabaseContext';

const { 
  connection, 
  tables, 
  supportedDatabases, 
  connect, 
  fetchSupportedDatabases 
} = useDatabaseContext();
```

## Architecture

### Database Adapter Pattern
The system uses an adapter pattern to provide a unified interface for different database types:

```
DatabaseAdapterFactory
├── PostgreSQLAdapter (PostgreSQL, NeonDB)
├── MongoDBAdapter (MongoDB)
├── FirebaseAdapter (Firestore)
└── SupabaseAdapter (Supabase)
```

### Key Components

#### 1. DatabaseAdapter (Base Class)
Defines the common interface that all adapters must implement:
- `connect()` / `disconnect()`
- `testConnection()`
- `createTable()` / `dropTable()`
- `insert()` / `read()` / `update()` / `delete()`
- `getSchema()`
- Schema modification methods

#### 2. DatabaseAdapterFactory
Manages adapter creation and caching:
- Parses connection strings
- Creates appropriate adapters
- Caches connections for reuse
- Provides utility methods

#### 3. Enhanced Controllers
Controllers now use the adapter factory instead of direct database connections:
```javascript
const adapter = await DatabaseAdapterFactory.createAndConnect(url);
const result = await adapter.createTable(tableName, columns);
```

## Database-Specific Features

### PostgreSQL/NeonDB
- Full SQL DDL/DML support
- Foreign key constraints
- Complex queries with joins
- Transaction support

### MongoDB
- Dynamic schema creation
- Document-based operations
- Field removal operations
- Flexible data types

### Firebase Firestore
- Collection metadata management
- Real-time capabilities
- Subcollection support
- Built-in security rules

### Supabase
- PostgreSQL features plus:
- Real-time subscriptions
- Row-level security (RLS)
- Policy management
- Enhanced error handling

## Error Handling

The system includes comprehensive error handling:
- Connection validation
- Database-specific error mapping
- Graceful fallbacks
- User-friendly error messages

## Connection String Examples

### PostgreSQL/NeonDB
```
postgresql://user:password@host:5432/database
postgres://user:password@host:5432/database
```

### MongoDB
```
mongodb://user:password@host:27017/database
mongodb+srv://user:password@cluster.mongodb.net/database
```

### Firebase
```
firebase://project-id:api-key@auth-domain/storage-bucket
```

### Supabase
```
supabase://project-ref.supabase.co:anon-key@service-role-key
```

## Configuration Notes

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore
3. Get configuration from Project Settings
4. Format as connection string

### Supabase Setup
1. Create a Supabase project
2. Get project URL and API keys
3. Format as connection string
4. Ensure proper permissions

### MongoDB Setup
1. Set up MongoDB instance
2. Create user with appropriate permissions
3. Configure network access
4. Use connection string from MongoDB Atlas or local instance

## Testing

To test the implementation:

1. **Start the backend server**:
```bash
cd backend
npm run dev
```

2. **Start the frontend**:
```bash
cd frontend
npm run dev
```

3. **Test connection endpoints**:
```bash
# Get supported databases
curl http://localhost:9000/api/v1/db/supported-databases

# Test PostgreSQL connection
curl -X POST http://localhost:9000/api/v1/db/connect \
  -H "Content-Type: application/json" \
  -d '{"url": "postgresql://user:pass@host:5432/db"}'
```

## Migration from Single Database

If you're migrating from the previous PostgreSQL-only version:

1. **Backend**: The API endpoints remain the same, but now support multiple database types
2. **Frontend**: Replace old connection forms with `DatabaseConnectionForm`
3. **Configuration**: Update environment variables if needed
4. **Testing**: Verify all existing functionality works with PostgreSQL connections

## Performance Considerations

- Connection pooling is maintained for PostgreSQL/Supabase
- MongoDB connections are cached and reused
- Firebase connections are lightweight and shared
- Consider connection limits for your database provider

## Security Notes

- Never expose database credentials in frontend code
- Use environment variables for sensitive configuration
- Implement proper authentication and authorization
- Follow database-specific security best practices
- Consider using read-only connections where appropriate

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check network connectivity and firewall settings
2. **Authentication Failed**: Verify credentials and connection string format
3. **Permission Denied**: Ensure database user has necessary permissions
4. **Schema Not Found**: Verify database/collection exists

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=1 npm run dev
```

## Future Enhancements

Planned improvements:
- Additional database support (SQLite, Redis, etc.)
- Advanced query builder interface
- Database migration tools
- Performance monitoring
- Backup and restore functionality