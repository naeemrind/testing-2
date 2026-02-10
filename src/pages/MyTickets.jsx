// src/pages/MyTickets.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTickets } from "../store/bookingSlice";
import Ticket from "../components/Ticket";
import { Link } from "react-router";

const MyTickets = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userTickets, loading } = useSelector((state) => state.bookings);

  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (user) {
      dispatch(fetchUserTickets(user.uid));
    }
  }, [dispatch, user]);

  // --- SORTING HELPER ---
  // Sorts tickets by Date (Newest first)
  const sortTicketsDesc = (tickets) => {
    return [...tickets].sort((a, b) => {
      // Combine date and time for accurate sorting
      // Assuming eventDate is "YYYY-MM-DD" and eventTime is "HH:MM"
      const dateA = new Date(`${a.eventDate}T${a.eventTime || "00:00"}`);
      const dateB = new Date(`${b.eventDate}T${b.eventTime || "00:00"}`);
      return dateB - dateA; // Descending order
    });
  };

  // 1. Filter tickets by status
  const rawActiveTickets = userTickets.filter((t) => t.status === "valid");
  const rawUsedTickets = userTickets.filter((t) => t.status === "used");

  // 2. Sort them
  const activeTickets = sortTicketsDesc(rawActiveTickets);
  const usedTickets = sortTicketsDesc(rawUsedTickets);

  // 3. Determine which list to display
  const displayedTickets = activeTab === "active" ? activeTickets : usedTickets;

  return (
    <div className="min-h-[calc(100vh-110px)] bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Tickets
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your bookings and view ticket history
            </p>
          </div>
          <Link
            to="/"
            className="underline underline-offset-4 text-blue-700 hover:text-blue-800"
          >
            Go to Home
          </Link>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b border-gray-300 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide border-b-2 ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800 cursor-pointer"
            }`}
          >
            Active ({activeTickets.length})
          </button>
          <button
            onClick={() => setActiveTab("used")}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide border-b-2 ${
              activeTab === "used"
                ? "border-gray-600 text-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-800 cursor-pointer"
            }`}
          >
            History ({usedTickets.length})
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading your passes...
          </div>
        ) : (
          <div>
            {displayedTickets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-300">
                <div className="text-5xl mb-4">
                  {activeTab === "active" ? "🎫" : "📂"}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {activeTab === "active"
                    ? "No Active Tickets"
                    : "No Ticket History"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "active"
                    ? "You don't have any upcoming events."
                    : "You haven't used any tickets yet."}
                </p>
                {activeTab === "active" && (
                  <Link
                    to="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                  >
                    Find an Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTickets.map((ticket) => (
                  <div key={ticket.bookingId} className="flex flex-col gap-3">
                    <Ticket booking={ticket} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
