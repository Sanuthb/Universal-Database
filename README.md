📦 Connecta
A universal backend API to connect and perform CRUD operations on any database (PostgreSQL, MongoDB, etc.) using just the connection URL — no backend logic required. Think of it as a headless CMS powered by standard database URLs.

🚀 Features

<li>Connect to databases using just a connection string (NeonDB/Postgres, MongoDB, etc.)</li>
<li>Create tables or collections dynamically</li>
<li>Perform full CRUD:</li>
<li>Create,
  Read (select with filters),
  Update,
  Delete</li>
<li>
Simple REST API interface</li>
<li>Modern React frontend with intuitive UI</li>

<li>Built with Express.js and pg (Postgres), support for MongoDB coming soon</li>

## 🚀 Quick Start

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
PORT=9000
```

Start the backend server:

```bash
npm run dev
# or
node index.js
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173`

## 🎯 Usage

### Frontend Interface

1. **Connect to Database**: Enter your PostgreSQL connection URL
2. **View Tables**: All tables are automatically loaded in the sidebar
3. **Create Tables**: Use the "Create Table" button to add new tables
4. **Manage Data**: Click on any table to view, edit, add, or delete data
5. **Column Controls**: Toggle column visibility and sort data

### API Endpoints

🧱 Create Table (PostgreSQL)
POST /api/v1/db/create

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "columns": [
    { "name": "id", "type": "SERIAL PRIMARY KEY" },
    { "name": "name", "type": "VARCHAR(100)" },
    { "name": "email", "type": "VARCHAR(100)" },
    { "name": "created_at", "type": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" }
  ]
}
```

➕ Insert Row(s)
POST /api/v1/db/insert

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "values": [
    { "name": "Alice", "email": "alice@example.com" },
    { "name": "Bob", "email": "bob@example.com" }
  ]
}
```

📥 Select Rows
POST /api/v1/db/read

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "filters": {
    "name": "Alice"
  },
  "limit": 5
}
```

✏️ Update Row
POST /api/v1/db/update

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "id": 1,
  "updates": {
    "email": "new@email.com"
  }
}
```

❌ Delete Row
DELETE /api/v1/db/delete/:id

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "idColumn": "id"
}
```

🔌 Test Connection
POST /api/v1/db/connect

```bash
{
  "url": "<your-postgres-url>"
}
```

🗑️ Drop Table
POST /api/v1/db/drop

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample"
}
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (via pg)
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Routing

## 📚 Project Structure

```
UniversalDB/
├── backend/
│   ├── controllers/
│   │   └── Dbcontrollers.js    # API controllers
│   │   └── Dbroutes.js         # API routes
│   │   └── index.js                # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── Components/         # React components
│   │   ├── contexts/           # React context
│   │   ├── hooks/             # Custom hooks
│   │   └── pages/             # Page components
│   └── package.json
├── start-dev.js               # Development script
└── README.md
```

## 🚀 Roadmap

✅ PostgreSQL support (via URL)
✅ Modern React frontend
⏳ MongoDB (URL-based support)
🛡️ Field validation & schema introspection
🔐 Optional JWT auth
🧩 Enhanced UI features
📊 Data visualization
🔍 Advanced filtering and search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


# Connecta - Database Management Tool

A powerful, web-based PostgreSQL database management tool with an intuitive interface for managing tables, data, and database schema.

## Features

### 🔗 **Foreign Key Support**
- Create tables with foreign key constraints
- Add foreign keys to existing tables
- Drop foreign key constraints
- Visual foreign key relationship management

### 🏗️ **Database Schema Management**
- View complete database schema
- Add columns to existing tables
- Drop columns from tables
- Modify table structures
- Advanced column options (NOT NULL, DEFAULT values)

### 📊 **Data Management**
- Connect to PostgreSQL databases
- Create, read, update, and delete data
- Bulk data operations
- Real-time data viewing
- Column visibility controls

### 🎨 **Modern UI**
- Clean, responsive interface
- Intuitive table creation forms
- Advanced options for power users
- Real-time feedback and error handling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UniversalDB
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

This will start both the backend server (port 9000) and frontend development server (port 5173).

## Usage

### Connecting to a Database

1. Open the application in your browser
2. Enter your PostgreSQL connection string in the format:
   ```
   postgresql://username:password@host:port/database
   ```
3. Click "Connect"

### Creating Tables with Foreign Keys

1. **Basic Table Creation**
   - Click "Create Table" in the sidebar
   - Enter table name and add columns
   - Set column types, constraints, and default values

2. **Adding Foreign Keys**
   - In the table creation form, expand "Foreign Keys" section
   - Click "Add Foreign Key"
   - Select the column in your table
   - Choose the reference table and column
   - Optionally specify a constraint name

### Managing Database Schema

1. **Access Schema Manager**
   - Click the "Schema Manager" button in the main interface
   - View all tables and their relationships

2. **Modify Table Structure**
   - Select a table to view its schema
   - Add new columns with advanced options
   - Drop existing columns
   - Add or remove foreign key constraints

3. **View Relationships**
   - See all foreign key relationships
   - Understand table dependencies
   - Manage constraint names

## API Endpoints

### Table Management
- `POST /api/v1/db/create` - Create basic table
- `POST /api/v1/db/create-with-constraints` - Create table with foreign keys
- `POST /api/v1/db/drop` - Drop table
- `POST /api/v1/db/schema` - Get database schema

### Schema Modifications
- `POST /api/v1/db/add-column` - Add column to table
- `POST /api/v1/db/drop-column` - Drop column from table
- `POST /api/v1/db/add-foreign-key` - Add foreign key constraint
- `POST /api/v1/db/drop-foreign-key` - Drop foreign key constraint

### Data Operations
- `POST /api/v1/db/read` - Read table data
- `POST /api/v1/db/insert` - Insert data
- `POST /api/v1/db/update` - Update data
- `DELETE /api/v1/db/delete/:id` - Delete record

## Example: Creating Related Tables

### Using the UI
1. Create the `users` table first
2. Create the `posts` table with a foreign key to `users.id`
3. The UI will automatically show the relationship
4. Use the Schema Manager to view and modify these relationships

## Advanced Features

### Column Options
- **Data Types**: INTEGER, VARCHAR, TEXT, BOOLEAN, TIMESTAMP, JSON, UUID, etc.
- **Constraints**: NOT NULL, DEFAULT values, PRIMARY KEY
- **Foreign Keys**: Reference other tables and columns

### Schema Management
- **Visual Schema Viewer**: See all tables and their relationships
- **Column Management**: Add, modify, or drop columns
- **Constraint Management**: Add or remove foreign key constraints
- **Real-time Updates**: Changes reflect immediately in the UI

## Support

For issues and questions, please open an issue on GitHub.
