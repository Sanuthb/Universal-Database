import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const DB_API = "http://localhost:9000/api/v1/db";

export const testConnection = createAsyncThunk("db/testConnection", async ({ url }, thunkAPI) => {
  try {
    const res = await fetch(`${DB_API}/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || "Failed to connect");
    return { url, type: json.type };
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const fetchSchema = createAsyncThunk("db/fetchSchema", async ({ url }, thunkAPI) => {
  try {
    const res = await fetch(`${DB_API}/schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch schema");
    return json.data || [];
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

const dbSlice = createSlice({
  name: "db",
  initialState: {
    connection: JSON.parse(localStorage.getItem('dbConnection')) || null,
    tables: JSON.parse(localStorage.getItem('dbTables')) || [],
    selectedTable: JSON.parse(localStorage.getItem('selectedTable')) || null,
    loading: false,
    error: null,
    supportedDatabases: null,
  },
  reducers: {
    setSelectedTable(state, action) {
      state.selectedTable = action.payload;
      localStorage.setItem('selectedTable', JSON.stringify(action.payload));
    },
    disconnect(state) {
      state.connection = null;
      state.tables = [];
      state.selectedTable = null;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('dbConnection');
      localStorage.removeItem('dbTables');
      localStorage.removeItem('selectedTable');
    },
    clearDbError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(testConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.loading = false;
        state.connection = { 
          url: action.payload.url, 
          type: action.payload.type,
          connected: true 
        };
        // Persist to localStorage
        localStorage.setItem('dbConnection', JSON.stringify(state.connection));
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to connect";
      })
      .addCase(fetchSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload.map((t) => ({
          name: t.name, 
          type: t.type || 'table', 
          schema: t.columns || [],
          foreignKeys: t.foreignKeys || []
        }));
        // Persist to localStorage
        localStorage.setItem('dbTables', JSON.stringify(state.tables));
      })
      .addCase(fetchSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch schema";
      });
  },
});

export const { setSelectedTable, disconnect, clearDbError } = dbSlice.actions;
export default dbSlice.reducer;


