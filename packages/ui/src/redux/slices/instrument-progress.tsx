import { ProgressDto, ProgressType } from "@viewpoint/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type InstrumentProgressState = {
  [key: number]: ProgressDto;
};

const initialState: InstrumentProgressState = {};

const instrumentProgressSlice = createSlice({
  name: "instrumentProgress",
  initialState,
  reducers: {
    updateProgress: (
      state: InstrumentProgressState,
      actions: PayloadAction<ProgressDto>
    ) => {
      const progressEvent = actions.payload;
      // 0 or 100 indicate it's done and progress bar needs to be removed,
      if (progressEvent.progressType === ProgressType.PERCENT_COMPLETE) {
        if (progressEvent.progress <= 0 || progressEvent.progress >= 100) {
          delete state[progressEvent.instrumentId];
        } else {
          state[progressEvent.instrumentId] = progressEvent;
        }
      } else if (progressEvent.progressType === ProgressType.TIME_REMAINING) {
        if (progressEvent.progress <= 0) {
          delete state[progressEvent.instrumentId];
        } else {
          state[progressEvent.instrumentId] = progressEvent;
        }
      }
    },
  },
});

const { reducer } = instrumentProgressSlice;
const { updateProgress } = instrumentProgressSlice.actions;

export default reducer;
export { updateProgress };
