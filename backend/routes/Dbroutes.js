import express from 'express';
import { connectionString, createtable, deleteById, droptable, inserttable, readtable, updateById } from '../controllers/Dbcontrollers.js';

const dbrouter = express.Router();

dbrouter.post('/connect',connectionString);
dbrouter.post('/create',createtable);
dbrouter.post('/drop',droptable);
dbrouter.post('/insert',inserttable);
dbrouter.get('/read',readtable);
dbrouter.delete('/delete/:id',deleteById);
dbrouter.post('/update',updateById);



export default dbrouter;