import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../store/eventSlice";
import EventCard from "../components/EventCard";
import { Link } from "react-router";

const Home = () => {
  const dispatch = useDispatch();
  const { list: events, loading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  return (
    <div className="min-h-[calc(100vh-110px)] bg-gray-50 flex flex-col items-center py-5 pt-16 px-4">
      {/* 1. HERO / INTRODUCTION SECTION */}
      <div className="max-w-2xl text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Discover Events in Quetta
        </h1>
        <p className="text-gray-600 text-md md:text-xl leading-relaxed">
          The easiest way to find, book, and organize local experiences. From
          tech conferences to food festivals, secure your spot in seconds.
        </p>
      </div>

      {/* 2. EVENTS DISPLAY SECTION */}
      <div className="w-full max-w-6xl">
        {loading ? (
          <div className="text-center py-10">
            <div className="text-2xl font-bold text-gray-400 animate-pulse">
              Loading events...
            </div>
          </div>
        ) : (
          <>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events?.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              /* Empty State - Centered and Clean */
              <div className="text-center py-6 bg-white rounded-xl border border-gray-200 max-w-md mx-auto">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-500 px-6">
                  There are currently no upcoming events scheduled in Quetta.
                  Please check back later!
                </p>
                {user && user.role === "organizer" && (
                  <Link
                    to="/dashboard"
                    className="inline-block mt-6 text-blue-600 font-bold hover:underline"
                  >
                    Create the first event &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
