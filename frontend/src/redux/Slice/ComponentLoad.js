import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    ComponentLoad : "Dashboard"
};

const ComponentLoadSlice = createSlice({
    name:"componentLoad",
    initialState,
    reducers:{
        setComponentLoad:(state,action)=>{
            state.ComponentLoad = action.payload
        }
    }
});

export const {setComponentLoad} = ComponentLoadSlice.actions;
export default ComponentLoadSlice.reducer;
