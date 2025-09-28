import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:9000/api/v1/projects";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

export const fetchProjects = createAsyncThunk("projects/fetchAll", async (_, thunkAPI) => {
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to fetch projects");
    return json.projects || [];
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const createProject = createAsyncThunk(
  "projects/create",
  async ({ name, description, databaseType, connectionString, dbName, serviceAccount, extra }, thunkAPI) => {
    try {
      const connection = {
        type: databaseType,
        url: connectionString,
        dbName,
        serviceAccount,
        extra,
      };
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, description, connection }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create project");
      return json.project;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    items: [],
    selectedId: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectProject(state, action) {
      state.selectedId = action.payload;
    },
    clearProjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch projects";
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create project";
      });
  },
});

export const { selectProject, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;


