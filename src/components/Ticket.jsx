import { QRCodeCanvas } from "qrcode.react";

const Ticket = ({ booking }) => {
  const isValid = booking.status === "valid";

  // 1. Format Date: yyyy-mm-dd -> 12 Feb 2026
  const formattedDate = booking.eventDate
    ? new Date(booking.eventDate).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // 2. Format Time: 18:00 -> 6:00 PM
  const formattedTime = booking.eventTime
    ? new Date(`1970-01-01T${booking.eventTime}`)
        .toLocaleTimeString("en-PK", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase()
    : "N/A";

  return (
    <div className="bg-white rounded-xl border border-gray-300 flex flex-col">
      {/* 1. Header Section: Event Info */}
      <div
        className={`p-5 ${isValid ? "bg-blue-700" : "bg-zinc-700"} text-white rounded-t-xl`}
      >
        <h3 className="font-bold text-base line-clamp-1 mb-1 leading-normal">
          {booking.eventTitle || "Event Name Unavailable"}
        </h3>

        <div className="flex flex-col gap-2 text-blue-50 text-xs font-medium tracking-wider mt-2">
          <div className="flex items-center gap-3">
            <span>
              <strong>Date:</strong> {formattedDate}
            </span>
            <span>
              <strong>Time:</strong> {formattedTime}
            </span>
          </div>
          <div className="leading-relaxed">
            <strong>Venue:</strong> {booking.eventLocation || "Location N/A"}
          </div>
        </div>
      </div>

      {/* 2. Body Section: QR Code */}
      <div className="bg-gray-50 p-6 flex flex-col items-center justify-center flex-1 border-b border-gray-200">
        <div className="border border-gray-300 bg-white p-2 rounded-lg">
          <QRCodeCanvas
            value={booking.bookingId}
            size={140}
            level={"H"} // High error correction
          />
        </div>

        <p className="mt-4 text-[10px] text-gray-500 font-mono text-center break-all">
          ID: {booking.bookingId}
        </p>
      </div>

      {/* 3. Footer Section: Status */}
      <div
        className={`p-3 text-center rounded-b-xl ${isValid ? "bg-green-50" : "bg-red-50"}`}
      >
        <span
          className={`px-4 py-1 rounded-full text-xs font-bold uppercase border ${
            isValid
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300 line-through"
          }`}
        >
          {isValid ? "Active Ticket" : "Already Used"}
        </span>
      </div>
    </div>
  );
};

export default Ticket;
