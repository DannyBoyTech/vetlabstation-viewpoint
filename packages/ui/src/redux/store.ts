import {
  combineReducers,
  configureStore,
  createSelector,
} from "@reduxjs/toolkit";
import { viewpointApi } from "../api/ApiSlice";
import userInputRequestsReducer from "./slices/user-input-requests";
import instrumentProgressReducer from "./slices/instrument-progress";

const rootReducer = combineReducers({
  [viewpointApi.reducerPath]: viewpointApi.reducer,
  userInputRequests: userInputRequestsReducer,
  instrumentProgress: instrumentProgressReducer,
});

export const setupStore = (preloadedState?: RootState) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(viewpointApi.middleware),
    preloadedState,
  });

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];

export const selectUserInputRequests = (state: RootState) =>
  state.userInputRequests;
export const selectNextUserInputRequest = createSelector(
  [selectUserInputRequests],
  (state) => state[0] as number | undefined
);

export const selectInstrumentProgress = (state: RootState) =>
  state.instrumentProgress;

export const selectInstrumentProgressFor = (instrumentId: number) =>
  createSelector([selectInstrumentProgress], (state) => state[instrumentId]);
