import express from 'express';
import { 
  connectionString, 
  createtable, 
  createTableWithConstraints,
  deleteById, 
  droptable, 
  inserttable, 
  readtable, 
  updateById,
  getDatabaseSchema,
  addColumn,
  dropColumn,
  addForeignKey,
  dropForeignKey
} from '../controllers/Dbcontrollers.js';

const dbrouter = express.Router();

dbrouter.post('/connect',connectionString);
dbrouter.post('/create',createtable);
dbrouter.post('/create-with-constraints',createTableWithConstraints);
dbrouter.post('/drop',droptable);
dbrouter.post('/insert',inserttable);
dbrouter.post('/read',readtable);
dbrouter.delete('/delete/:id',deleteById);
dbrouter.post('/update',updateById);
dbrouter.post('/schema',getDatabaseSchema);
dbrouter.post('/add-column',addColumn);
dbrouter.post('/drop-column',dropColumn);
dbrouter.post('/add-foreign-key',addForeignKey);
dbrouter.post('/drop-foreign-key',dropForeignKey);



export default dbrouter;