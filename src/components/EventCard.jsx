import { Link } from "react-router";

const EventCard = ({ event }) => {
  // Format Date: 2026-02-12 -> 12 Feb 2026
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Format Time: 18:00 -> 6:00 PM
  const timeDate = event.time ? new Date(`1970-01-01T${event.time}`) : null;
  const formattedTime =
    timeDate && !isNaN(timeDate.getTime())
      ? timeDate
          .toLocaleTimeString("en-PK", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .toUpperCase()
      : "N/A";
  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg line-clamp-1 font-bold mb-2 text-gray-800">
          {event.title}
        </h3>

        <div className="space-y-2 text-gray-600 mb-4">
          <div className="flex items-center text-sm">
            <span>
              <strong>Date:</strong> {formattedDate} &nbsp;{" "}
              <strong>Time: </strong>
              {formattedTime}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm font-semibold text-green-700">
            <span>PKR {event.price}</span>
          </div>
        </div>

        <Link
          to={`/event/${event.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
