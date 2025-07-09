import React from 'react';
import { Table } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const TableView = () => {
  const { selectedTable, connection } = useDatabaseContext();

  if (!selectedTable || !connection) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Table className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">{selectedTable.name}</h2>
          <span className="text-sm text-gray-500">
            {connection.type === 'mongodb' ? 'Collection' : 'Table'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableView;
