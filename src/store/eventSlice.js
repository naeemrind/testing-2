// src/store/eventSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

// --- THUNKS ---

// 1. Fetch All Events
export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  try {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    const events = [];
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (error) {
    throw new Error("Failed to fetch events: " + error.message);
  }
});

// 2. Create New Event
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, "events"), eventData);
      return { id: docRef.id, ...eventData };
    } catch (error) {
      throw new Error("Failed to create event: " + error.message);
    }
  },
);

// 3. Fetch Organizer's Events
export const fetchOrganizerEvents = createAsyncThunk(
  "events/fetchOrganizerEvents",
  async (organizerId) => {
    try {
      const q = query(
        collection(db, "events"),
        where("organizerId", "==", organizerId),
      );
      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      throw new Error("Failed to fetch organizer events: " + error.message);
    }
  },
);

// 4. Delete Event (Fixed & Robust)
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      return eventId; // Return ID to remove from UI
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// --- SLICE ---

const eventSlice = createSlice({
  name: "events",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Create
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch Organizer
      .addCase(fetchOrganizerEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrganizerEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete (Optimistic Update)
      .addCase(deleteEvent.fulfilled, (state, action) => {
        // Remove the event with the matching ID from the list
        state.list = state.list.filter((event) => event.id !== action.payload);
      });
  },
});

export default eventSlice.reducer;
