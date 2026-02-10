// src/store/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";

// --- THUNKS ---

// 1. Book a Ticket
export const bookTicket = createAsyncThunk(
  "bookings/bookTicket",
  async ({ eventId, userId, userEmail, userName }, { rejectWithValue }) => {
    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) throw "Event not found";
      const eventData = eventSnap.data();

      // --- NEW CHECK: PREVENT BOOKING EXPIRED EVENTS ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(eventData.date);

      if (eventDate < today) {
        throw "Event has already expired.";
      }
      // ------------------------------------------------

      if (eventData.bookedTickets >= eventData.totalTickets) {
        throw "Sold Out";
      }

      // Create Booking
      const bookingData = {
        eventId,
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventTime: eventData.time,
        eventLocation: eventData.location,
        userId,
        userEmail,
        userName,
        status: "valid", // valid, used
        bookingDate: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      // Update Event Count
      await updateDoc(eventRef, {
        bookedTickets: increment(1),
      });

      return { id: docRef.id, ...bookingData };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// 2. Fetch User Tickets
export const fetchUserTickets = createAsyncThunk(
  "bookings/fetchUserTickets",
  async (userId) => {
    const q = query(collection(db, "bookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({ bookingId: doc.id, ...doc.data() });
    });
    return tickets;
  },
);

// 3. Validate Ticket (Scanner)
export const validateTicket = createAsyncThunk(
  "bookings/validateTicket",
  async ({ ticketId, organizerId }, { rejectWithValue }) => {
    try {
      const ticketRef = doc(db, "bookings", ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) throw "Ticket ID not found in database.";

      const ticketData = ticketSnap.data();

      // Check if this ticket belongs to an event created by this organizer
      const eventRef = doc(db, "events", ticketData.eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        if (eventData.organizerId !== organizerId) {
          throw "This ticket belongs to another organizer's event.";
        }
      }

      if (ticketData.status === "used") throw "Ticket has already been used.";

      // Mark as used
      await updateDoc(ticketRef, { status: "used" });

      return { attendee: ticketData.userName || ticketData.userEmail };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// 4. Fetch Attendees for a specific Event
export const fetchEventAttendees = createAsyncThunk(
  "bookings/fetchEventAttendees",
  async (eventId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "bookings"),
        where("eventId", "==", eventId),
      );
      const querySnapshot = await getDocs(q);
      const attendees = [];
      querySnapshot.forEach((doc) => {
        attendees.push({ id: doc.id, ...doc.data() });
      });
      return attendees;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    userTickets: [],
    attendeesList: [],
    loading: false,
    error: null,
    bookingSuccess: false,
    validationMsg: null,
  },
  reducers: {
    resetBookingStatus: (state) => {
      state.bookingSuccess = false;
      state.error = null;
    },
    clearValidationMsg: (state) => {
      state.validationMsg = null;
      state.error = null;
    },
    clearAttendeesList: (state) => {
      state.attendeesList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Ticket
      .addCase(bookTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookTicket.fulfilled, (state) => {
        state.loading = false;
        state.bookingSuccess = true;
      })
      .addCase(bookTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Booking Failed";
      })
      // Fetch User Tickets
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.userTickets = action.payload;
      })
      // Validate Ticket
      .addCase(validateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationMsg = null;
      })
      .addCase(validateTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.validationMsg = action.payload;
      })
      .addCase(validateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Event Attendees
      .addCase(fetchEventAttendees.pending, (state) => {
        state.loading = true;
        state.attendeesList = [];
      })
      .addCase(fetchEventAttendees.fulfilled, (state, action) => {
        state.loading = false;
        state.attendeesList = action.payload;
      });
  },
});

export const { resetBookingStatus, clearValidationMsg, clearAttendeesList } =
  bookingSlice.actions;
export default bookingSlice.reducer;
