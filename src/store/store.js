import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import eventReducer from "./eventSlice";
import bookingReducer from "./bookingSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    bookings: bookingReducer,
  },
});

export default store;
