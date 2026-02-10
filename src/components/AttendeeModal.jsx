// src/components/AttendeeModal.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventAttendees, clearAttendeesList } from "../store/bookingSlice";

const AttendeeModal = ({ eventId, eventTitle, onClose }) => {
  const dispatch = useDispatch();
  const { attendeesList, loading } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventAttendees(eventId));
    }
    // Cleanup when modal closes
    return () => {
      dispatch(clearAttendeesList());
    };
  }, [eventId, dispatch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Attendee List</h2>
            <p className="text-sm text-gray-500 font-medium">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer"
          ></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Loading Data...</p>
            </div>
          ) : attendeesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>No tickets booked for this event yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendeesList.map((attendee, index) => (
                    <tr
                      key={attendee.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-400 font-mono">
                        {(index + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-800">
                        {attendee.userName || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {attendee.userEmail}
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-500">
                        {attendee.id}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            attendee.status === "valid"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-500 border-gray-200 line-through"
                          }`}
                        >
                          {attendee.status === "valid"
                            ? "Active"
                            : "Checked In"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
          <span>Total Attendees: {attendeesList.length}</span>
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 cursor-pointer"
          >
            Close List
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeModal;
