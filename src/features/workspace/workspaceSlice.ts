import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  selectedWorkspace: {
    unitName: string;
    unitId: number;
  };
}

const initialState: WorkspaceState = {
  selectedWorkspace: {
    unitName: 'All',
    unitId: null,
  },
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedWorkspace: (state, action: PayloadAction<{ unitName: string; unitId: number }>) => {
      state.selectedWorkspace = action.payload;
    },
  },
});

export const { setSelectedWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
