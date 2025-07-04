📦 Universal DB Connector
A universal backend API to connect and perform CRUD operations on any database (PostgreSQL, MongoDB, etc.) using just the connection URL — no backend logic required. Think of it as a headless CMS powered by standard database URLs.

🚀 Features

<li>Connect to databases using just a connection string (NeonDB/Postgres, MongoDB, etc.)</li>
<li>Create tables or collections dynamically</li>
<li>Perform full CRUD:</li>
<li>Create
  Read (select with filters)
  Update
  Delete</li>
<li>
Simple REST API interface</li>

<li>Built with Express.js and pg (Postgres), support for MongoDB coming soon</li>

<li>Installation</li>

```bash
git clone https://github.com/Sanuthb/Universal-Database.git
cd Universal-Database/backend
npm install
```

Create a .env file:

```bash
PORT=9000
```

▶️ Running the Server

```bash
npm run dev
# or
node server.js
```

🔗 Example Request Payloads
🧱 Create Table (PostgreSQL)
POST /create

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
POST /insert

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
POST /select

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
POST /update

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
POST /delete

```bash
{
  "url": "<your-postgres-url>",
  "tablename": "sample",
  "id": 1
}
```

🛠️ Tech Stack
Node.js

    Express.js

    PostgreSQL (via pg)

    MongoDB support coming soon

    NeonDB (serverless Postgres)

📚 Roadmap
✅ PostgreSQL support (via URL)

    ⏳ MongoDB (URL-based support)

    🛡️ Field validation & schema introspection

    🔐 Optional JWT auth

    🧩 CMS UI on top of APIs
