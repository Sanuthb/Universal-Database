# Universal DB Connector Frontend

A modern React-based frontend for the Universal DB Connector that allows you to connect to PostgreSQL databases and perform CRUD operations through a beautiful, intuitive interface.

## Features

- 🔌 **Database Connection**: Connect to any PostgreSQL database using connection URLs
- 📊 **Table Management**: View, create, and drop tables dynamically
- 📝 **CRUD Operations**: Create, read, update, and delete data with ease
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- 🔄 **Real-time Updates**: Automatic data refresh and real-time feedback
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:9000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Connecting to a Database

1. Enter your PostgreSQL connection URL in the format:
   ```
   postgresql://username:password@host:port/database
   ```

2. Click "Connect" to establish the connection

3. Once connected, you'll see all available tables in the sidebar

### Managing Tables

- **View Tables**: All tables are automatically loaded and displayed in the sidebar
- **Create Table**: Click "Create Table" to add a new table with custom columns
- **Drop Table**: Hover over a table in the sidebar and click the trash icon to delete it

### Working with Data

- **View Data**: Click on any table to view its data in a sortable, filterable table
- **Add Rows**: Use the "Add Row" button to insert new records
- **Edit Data**: Click the edit icon next to any row to modify values inline
- **Delete Rows**: Click the trash icon to remove records
- **Column Visibility**: Toggle column visibility using the controls above the table

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/v1/db/connect` - Test database connection
- `POST /api/v1/db/create` - Create new tables
- `POST /api/v1/db/drop` - Drop tables
- `POST /api/v1/db/insert` - Insert data
- `GET /api/v1/db/read` - Read data with filters
- `POST /api/v1/db/update` - Update records
- `DELETE /api/v1/db/delete/:id` - Delete records

## Project Structure

```
src/
├── Components/
│   ├── UI/           # Reusable UI components
│   ├── ConnectionForm.jsx
│   ├── CreateTableForm.jsx
│   ├── DataTable.jsx
│   ├── Maincontent.jsx
│   ├── Sidebar.jsx
│   ├── TableView.jsx
│   └── TopBar.jsx
├── contexts/
│   └── DatabaseContext.jsx  # Global state management
├── hooks/
│   └── useTableData.js      # API integration hook
└── pages/
    └── Dashboard.jsx        # Main dashboard page
```

## Technologies Used

- **React 19** - Modern React with hooks and context
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:9000/api/v1/db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 