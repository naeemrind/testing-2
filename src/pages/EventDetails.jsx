// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { bookTicket, resetBookingStatus } from "../store/bookingSlice";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [event, setEvent] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { loading, error, bookingSuccess } = useSelector(
    (state) => state.bookings,
  );
  const isOrganizer = user?.role === "organizer";

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "events", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchEvent();

    dispatch(resetBookingStatus());
  }, [id, dispatch]);

  const handleBooking = () => {
    if (!user) {
      alert("Please login to book tickets.");
      navigate("/login");
      return;
    }

    dispatch(
      bookTicket({
        eventId: id,
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
      }),
    );
  };

  useEffect(() => {
    if (bookingSuccess) {
      alert("🎉 Ticket Booked Successfully! View it in My Tickets.");
      navigate("/my-tickets");
      dispatch(resetBookingStatus());
    }
  }, [bookingSuccess, navigate, dispatch]);

  if (!event)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500 font-bold">Loading Event Details...</div>
      </div>
    );

  const isSoldOut = event.bookedTickets >= event.totalTickets;
  const availableSeats = event.totalTickets - event.bookedTickets;

  // 1. CHECK IF EVENT IS EXPIRED
  // We set time to 00:00:00 so if the event is today, it is NOT expired.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  const isExpired = eventDate < today;

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-gray-300 overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="w-full h-56 md:h-auto md:w-5/12 relative bg-gray-100">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-bold text-gray-800 border border-gray-200">
            {event.price === 0 ? "FREE" : `PKR ${event.price}`}
          </div>
        </div>

        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="block text-xs font-bold text-gray-400 uppercase">
                  Date
                </span>
                <span className="font-medium text-gray-800">{event.date}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="block text-xs font-bold text-gray-400 uppercase">
                  Time
                </span>
                <span className="font-medium text-gray-800">{event.time}</span>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="block text-xs font-bold text-gray-400 uppercase">
                  Location
                </span>
                <span className="font-medium text-gray-800">
                  {event.location}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-sm text-gray-900 uppercase mb-2">
                About Event
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase text-gray-400">
                Tickets Left
              </span>
              <span
                className={`text-sm font-bold ${
                  availableSeats < 3 ? "text-red-500" : "text-green-600"
                }`}
              >
                {availableSeats} &nbsp; out of &nbsp; {event.totalTickets}
              </span>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-3 font-bold bg-red-50 p-2 rounded text-center border border-red-100">
                {error}
              </p>
            )}
            {!isOrganizer && (
              <button
                onClick={handleBooking}
                disabled={isSoldOut || loading || isExpired} // 2. DISABLE IF EXPIRED
                className={`w-full rounded-lg font-bold transition-colors cursor-pointer
                py-2.5 text-base md:py-3 md:text-lg
                ${
                  isSoldOut || isExpired
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                }`}
              >
                {/* 3. CHANGE TEXT IF EXPIRED */}
                {loading
                  ? "Processing..."
                  : isExpired
                    ? "Event Expired"
                    : isSoldOut
                      ? "Sold Out"
                      : "Book Ticket Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
