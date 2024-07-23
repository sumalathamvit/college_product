import { configureStore } from "@reduxjs/toolkit";

import webSlice from "./web";
import lmsSlice from "./lms-clice";

const store = configureStore({
  devTools: false,
  reducer: {
    web: webSlice.reducer,
    lms: lmsSlice.reducer,
  },
});
export default store;
