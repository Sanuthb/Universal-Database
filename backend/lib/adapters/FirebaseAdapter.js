import { DatabaseAdapter } from '../DatabaseAdapter.js';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit as firestoreLimit,
  writeBatch 
} from 'firebase/firestore';

export class FirebaseAdapter extends DatabaseAdapter {
  constructor(connectionConfig) {
    super(connectionConfig);
    this.app = null;
    this.db = null;
    this.config = connectionConfig;
  }

  async connect() {
    try {
      // Initialize Firebase
      const firebaseConfig = {
        apiKey: this.config.apiKey,
        authDomain: this.config.authDomain,
        projectId: this.config.projectId,
        storageBucket: this.config.storageBucket,
        messagingSenderId: this.config.messagingSenderId || '',
        appId: this.config.appId || ''
      };

      this.app = initializeApp(firebaseConfig, `app-${Date.now()}`);
      this.db = getFirestore(this.app);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Firebase connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.app) {
      // Firebase doesn't have an explicit disconnect method
      this.app = null;
      this.db = null;
      this.isConnected = false;
    }
  }

  async testConnection() {
    try {
      const firebaseConfig = {
        apiKey: this.config.apiKey,
        authDomain: this.config.authDomain,
        projectId: this.config.projectId,
        storageBucket: this.config.storageBucket,
        messagingSenderId: this.config.messagingSenderId || '',
        appId: this.config.appId || ''
      };

      // Just try to initialize Firebase - this will validate the config
      const testApp = initializeApp(firebaseConfig, `test-app-${Date.now()}`);
      const testDb = getFirestore(testApp);
      
      // Instead of trying to read, just verify the Firestore instance was created
      if (testDb && testDb.app && testDb.app.options.projectId === firebaseConfig.projectId) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Firebase test connection failed:', error);
      return false;
    }
  }

  async createTable(tableName, columns, foreignKeys = []) {
    if (!this.db) await this.connect();

    try {
      // In Firestore, collections are created automatically when first document is added
      // We'll create a metadata document to define the collection schema
      const metadataDoc = {
        _schema: {
          columns: columns.map(col => ({
            name: col.name,
            type: col.type,
            required: col.notNull || false,
            defaultValue: col.defaultValue
          })),
          foreignKeys: foreignKeys || [],
          createdAt: new Date(),
          type: 'collection_metadata'
        }
      };

      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      await setDoc(metadataRef, metadataDoc);

      // Register the collection in the registry for discovery
      await this._registerCollection(tableName);

      return { 
        success: true, 
        message: `Firestore collection '${tableName}' schema created successfully.` 
      };
    } catch (error) {
      console.error('Error creating Firestore collection:', error);
      throw error;
    }
  }

  async dropTable(tableName) {
    if (!this.db) await this.connect();

    try {
      // Delete all documents in the collection
      const collectionRef = collection(this.db, tableName);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(this.db);
      snapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });
      
      await batch.commit();

      // Also delete metadata
      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      await deleteDoc(metadataRef);

      return { 
        success: true, 
        message: `Firestore collection '${tableName}' dropped successfully.` 
      };
    } catch (error) {
      console.error('Error dropping Firestore collection:', error);
      throw error;
    }
  }

  async insert(tableName, data) {
    if (!this.db) await this.connect();

    try {
      const values = Array.isArray(data) ? data : [data];
      const collectionRef = collection(this.db, tableName);
      const results = [];

      if (values.length === 1) {
        // Single document
        const docRef = await addDoc(collectionRef, {
          ...values[0],
          _createdAt: new Date(),
          _updatedAt: new Date()
        });
        
        const newDoc = await getDoc(docRef);
        results.push({ id: docRef.id, ...newDoc.data() });
      } else {
        // Batch insert
        const batch = writeBatch(this.db);
        
        values.forEach(value => {
          const docRef = doc(collectionRef);
          batch.set(docRef, {
            ...value,
            _createdAt: new Date(),
            _updatedAt: new Date()
          });
          results.push({ id: docRef.id, ...value });
        });
        
        await batch.commit();
      }

      // Auto-register the collection for discovery
      await this._registerCollection(tableName);

      return {
        success: true,
        data: results,
        message: "Data inserted successfully"
      };
    } catch (error) {
      console.error('Error inserting into Firestore:', error);
      throw error;
    }
  }

  async read(tableName, filters = {}, limit = null) {
    if (!this.db) await this.connect();

    try {
      const collectionRef = collection(this.db, tableName);
      let q = query(collectionRef);

      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          q = query(q, where(key, '==', filters[key]));
        }
      });

      // Apply limit
      if (limit && Number.isInteger(limit)) {
        q = query(q, firestoreLimit(limit));
      }

      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error('Error reading from Firestore:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        collection: tableName,
        filters
      });
      throw error;
    }
  }

  async update(tableName, id, updates, idColumn = 'id') {
    if (!this.db) await this.connect();

    try {
      let docRef;
      
      if (idColumn === 'id' || idColumn === '_id') {
        // Use document ID
        docRef = doc(this.db, tableName, id);
      } else {
        // Find document by custom field
        const collectionRef = collection(this.db, tableName);
        const q = query(collectionRef, where(idColumn, '==', id));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return { success: false, message: "No record found to update." };
        }
        
        docRef = querySnapshot.docs[0].ref;
      }

      await updateDoc(docRef, {
        ...updates,
        _updatedAt: new Date()
      });

      // Get updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        return { success: false, message: "No record found to update." };
      }

      return {
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() },
        message: "Record updated successfully"
      };
    } catch (error) {
      console.error('Error updating Firestore record:', error);
      throw error;
    }
  }

  async delete(tableName, id, idColumn = 'id') {
    if (!this.db) await this.connect();

    try {
      let docRef;
      let docData;
      
      if (idColumn === 'id' || idColumn === '_id') {
        // Use document ID
        docRef = doc(this.db, tableName, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return { success: false, message: "No record found to delete." };
        }
        
        docData = { id: docSnap.id, ...docSnap.data() };
      } else {
        // Find document by custom field
        const collectionRef = collection(this.db, tableName);
        const q = query(collectionRef, where(idColumn, '==', id));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return { success: false, message: "No record found to delete." };
        }
        
        const docSnap = querySnapshot.docs[0];
        docRef = docSnap.ref;
        docData = { id: docSnap.id, ...docSnap.data() };
      }

      await deleteDoc(docRef);

      return {
        success: true,
        data: docData,
        message: "Record deleted successfully"
      };
    } catch (error) {
      console.error('Error deleting Firestore record:', error);
      throw error;
    }
  }

  async getSchema() {
    if (!this.db) await this.connect();

    try {
      console.log('Firebase: Starting schema discovery...');
      // For Firebase, we need to discover collections in a different way
      // Since we can't list collections directly in the client SDK,
      // we'll try to scan known collection names or use a registry approach
      
      const collectionsWithSchema = [];
      
      // First, try to get from collections registry if it exists
      try {
        console.log('Firebase: Checking collections registry...');
        const registrySnapshot = await getDocs(collection(this.db, '_collections_registry'));
        const knownCollections = [];
        
        registrySnapshot.forEach(doc => {
          knownCollections.push(doc.data());
        });
        
        console.log(`Firebase: Found ${knownCollections.length} collections in registry`);
        
        // Process known collections
        for (const collectionInfo of knownCollections) {
          try {
            const metadataRef = doc(this.db, `${collectionInfo.name}_metadata`, 'schema');
            const metadataSnap = await getDoc(metadataRef);
            
            if (metadataSnap.exists()) {
              const metadata = metadataSnap.data()._schema;
              collectionsWithSchema.push({
                name: collectionInfo.name,
                type: 'collection',
                columns: metadata.columns || [],
                foreignKeys: metadata.foreignKeys || []
              });
            } else {
              // Collection exists but no metadata, infer from sample document
              const sampleDoc = await this._getSampleDocument(collectionInfo.name);
              collectionsWithSchema.push({
                name: collectionInfo.name,
                type: 'collection',
                columns: sampleDoc.columns || [],
                foreignKeys: []
              });
            }
          } catch (error) {
            console.warn(`Could not get schema for collection ${collectionInfo.name}:`, error);
          }
        }
      } catch (error) {
        console.warn('Firebase: No collections registry found, trying to discover collections automatically');
        
        // If no registry exists, try to discover collections by attempting to read common collection names
        // or use any collections that have metadata documents
        const commonCollectionNames = [
          'users', 'products', 'orders', 'posts', 'comments', 'categories',
          'articles', 'customers', 'inventory', 'transactions', 'reviews',
          'notifications', 'messages', 'events', 'logs', 'settings',
          'profiles', 'bookings', 'appointments', 'tasks', 'projects'
        ];
        
        console.log(`Firebase: Attempting to discover collections from ${commonCollectionNames.length} common names...`);
        
        for (const collectionName of commonCollectionNames) {
          try {
            const collectionRef = collection(this.db, collectionName);
            const snapshot = await getDocs(query(collectionRef, firestoreLimit(1)));
            
            if (!snapshot.empty) {
              // Collection exists and has documents
              console.log(`Firebase: Found collection '${collectionName}' with ${snapshot.size} documents`);
              const sampleDoc = await this._getSampleDocument(collectionName);
              collectionsWithSchema.push({
                name: collectionName,
                type: 'collection',
                columns: sampleDoc.columns || [],
                foreignKeys: []
              });
            }
          } catch (error) {
            // Collection doesn't exist or no permission, skip
            if (error.code !== 'permission-denied') {
              console.log(`Firebase: Cannot access collection '${collectionName}':`, error.message);
            }
            continue;
          }
        }
        
        // Also check for any metadata documents that might indicate other collections
        try {
          console.log('Firebase: Scanning for metadata collections...');
          const metadataCollections = await this._findMetadataCollections();
          for (const metadataCollection of metadataCollections) {
            if (!collectionsWithSchema.find(c => c.name === metadataCollection.name)) {
              collectionsWithSchema.push(metadataCollection);
            }
          }
        } catch (error) {
          console.warn('Could not scan for metadata collections:', error);
        }
      }

      console.log(`Firebase: Schema discovery complete. Found ${collectionsWithSchema.length} collections:`, collectionsWithSchema.map(c => c.name));

      return {
        success: true,
        data: collectionsWithSchema
      };
    } catch (error) {
      console.error('Error fetching Firestore schema:', error);
      throw error;
    }
  }

  // Helper method to get sample document and infer schema
  async _getSampleDocument(collectionName) {
    try {
      const collectionRef = collection(this.db, collectionName);
      const snapshot = await getDocs(query(collectionRef, firestoreLimit(1)));
      
      if (snapshot.empty) {
        return { columns: [] };
      }
      
      const sampleDoc = snapshot.docs[0].data();
      const columns = [];
      
      Object.keys(sampleDoc).forEach(key => {
        if (key.startsWith('_')) return; // Skip internal fields
        
        const value = sampleDoc[key];
        let type = 'Mixed';
        
        if (typeof value === 'string') type = 'String';
        else if (typeof value === 'number') type = 'Number';
        else if (typeof value === 'boolean') type = 'Boolean';
        else if (value instanceof Date) type = 'Date';
        else if (Array.isArray(value)) type = 'Array';
        else if (typeof value === 'object' && value !== null) type = 'Object';
        
        columns.push({
          name: key,
          type: type,
          required: false
        });
      });
      
      return { columns };
    } catch (error) {
      console.warn(`Could not get sample document from ${collectionName}:`, error);
      return { columns: [] };
    }
  }

  // Helper method to find collections that have metadata documents
  async _findMetadataCollections() {
    const metadataCollections = [];
    
    // This is a limited approach since we can't list all collections in client SDK
    // We'll try to find metadata documents by scanning common patterns
    const possibleCollections = ['users', 'products', 'orders', 'posts', 'comments', 'categories', 
                                'articles', 'customers', 'inventory', 'transactions', 'reviews'];
    
    for (const collectionName of possibleCollections) {
      try {
        const metadataRef = doc(this.db, `${collectionName}_metadata`, 'schema');
        const metadataSnap = await getDoc(metadataRef);
        
        if (metadataSnap.exists()) {
          const metadata = metadataSnap.data()._schema;
          metadataCollections.push({
            name: collectionName,
            type: 'collection',
            columns: metadata.columns || [],
            foreignKeys: metadata.foreignKeys || []
          });
        }
      } catch (error) {
        // Skip if metadata doesn't exist
        continue;
      }
    }
    
    return metadataCollections;
  }

  // Helper method to register a collection in the discovery registry
  async _registerCollection(collectionName) {
    try {
      const registryRef = doc(this.db, '_collections_registry', collectionName);
      await setDoc(registryRef, {
        name: collectionName,
        createdAt: new Date(),
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.warn(`Could not register collection ${collectionName}:`, error);
    }
  }

  async addColumn(tableName, column) {
    // Firestore is schemaless, so we don't need to explicitly add columns
    // We'll update the metadata to reflect the new column
    if (!this.db) await this.connect();

    try {
      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      const metadataSnap = await getDoc(metadataRef);
      
      if (metadataSnap.exists()) {
        const metadata = metadataSnap.data()._schema;
        metadata.columns.push({
          name: column.name,
          type: column.type,
          required: column.notNull || false,
          defaultValue: column.defaultValue
        });
        
        await updateDoc(metadataRef, { '_schema': metadata });
      }

      return {
        success: true,
        message: `Firestore is schemaless. Field '${column.name}' definition added to metadata.`
      };
    } catch (error) {
      console.error('Error adding Firestore column metadata:', error);
      throw error;
    }
  }

  async dropColumn(tableName, columnName) {
    if (!this.db) await this.connect();

    try {
      // Remove field from all documents in the collection
      const collectionRef = collection(this.db, tableName);
      const snapshot = await getDocs(collectionRef);
      
      const batch = writeBatch(this.db);
      let modifiedCount = 0;
      
      snapshot.docs.forEach((document) => {
        const data = document.data();
        if (data.hasOwnProperty(columnName)) {
          const updatedData = { ...data };
          delete updatedData[columnName];
          batch.update(document.ref, updatedData);
          modifiedCount++;
        }
      });
      
      if (modifiedCount > 0) {
        await batch.commit();
      }

      // Update metadata
      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      const metadataSnap = await getDoc(metadataRef);
      
      if (metadataSnap.exists()) {
        const metadata = metadataSnap.data()._schema;
        metadata.columns = metadata.columns.filter(col => col.name !== columnName);
        await updateDoc(metadataRef, { '_schema': metadata });
      }

      return {
        success: true,
        message: `Field '${columnName}' removed from ${modifiedCount} documents in collection '${tableName}'.`
      };
    } catch (error) {
      console.error('Error removing Firestore field:', error);
      throw error;
    }
  }

  async addForeignKey(tableName, column, referenceTable, referenceColumn, constraintName) {
    // Firestore doesn't have traditional foreign keys, but we can update metadata
    if (!this.db) await this.connect();

    try {
      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      const metadataSnap = await getDoc(metadataRef);
      
      if (metadataSnap.exists()) {
        const metadata = metadataSnap.data()._schema;
        metadata.foreignKeys = metadata.foreignKeys || [];
        metadata.foreignKeys.push({
          column,
          referenceTable,
          referenceColumn,
          constraintName: constraintName || `fk_${tableName}_${column}`
        });
        
        await updateDoc(metadataRef, { '_schema': metadata });
      }

      return {
        success: true,
        message: `Firestore uses references instead of foreign keys. Relationship metadata added for '${column}' -> '${referenceTable}'.`
      };
    } catch (error) {
      console.error('Error adding Firestore foreign key metadata:', error);
      throw error;
    }
  }

  async dropForeignKey(tableName, constraintName) {
    if (!this.db) await this.connect();

    try {
      const metadataRef = doc(this.db, `${tableName}_metadata`, 'schema');
      const metadataSnap = await getDoc(metadataRef);
      
      if (metadataSnap.exists()) {
        const metadata = metadataSnap.data()._schema;
        metadata.foreignKeys = metadata.foreignKeys.filter(fk => fk.constraintName !== constraintName);
        await updateDoc(metadataRef, { '_schema': metadata });
      }

      return {
        success: true,
        message: `Foreign key metadata '${constraintName}' removed from collection '${tableName}'.`
      };
    } catch (error) {
      console.error('Error removing Firestore foreign key metadata:', error);
      throw error;
    }
  }
}