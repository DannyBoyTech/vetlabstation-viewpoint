import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserInputRequestsState = number[];

const initialState: UserInputRequestsState = [];

const userInputRequestsSlice = createSlice({
  name: "userInputRequests",
  initialState,
  reducers: {
    enqueue: (state, action: PayloadAction<number>) => {
      state.push(action.payload);
      return state;
    },
    dequeue: (state, action: PayloadAction<number>) => {
      if (state[0] === action.payload) {
        state.shift();
      }
      return state;
    },
  },
});

const { reducer } = userInputRequestsSlice;
const { dequeue, enqueue } = userInputRequestsSlice.actions;

export default reducer;
export { dequeue, enqueue };
