import {configureStore} from "@reduxjs/toolkit";
import sidebarReducer from "./Slice/sidebarslice";
import componentLoadReducer from "./Slice/ComponentLoad";
import projectsReducer from "./Slice/projectsSlice";
import dbReducer from "./Slice/dbSlice";

export const store = configureStore({
    reducer:{
        sidebar:sidebarReducer,
        componentLoad:componentLoadReducer,
        projects:projectsReducer,
        db:dbReducer,
    }
})