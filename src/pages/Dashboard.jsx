import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEvent,
  fetchOrganizerEvents,
  deleteEvent,
} from "../store/eventSlice";
import { validateTicket, clearValidationMsg } from "../store/bookingSlice";
import { Html5Qrcode } from "html5-qrcode";
import AttendeeModal from "../components/AttendeeModal";

const Dashboard = () => {
  const dispatch = useDispatch();

  // Safety: Use default values to prevent "cannot read property of undefined"
  const { user } = useSelector((state) => state.auth || {});
  const { list: myEvents = [] } = useSelector((state) => state.events || {});
  const {
    loading: ticketLoading = false,
    error: ticketError = null,
    validationMsg = null,
  } = useSelector((state) => state.bookings || {});

  // --- CONFIGURATION ---
  const CLOUD_NAME = "dgmxjkpp2";
  const UPLOAD_PRESET = "quetta_preset";

  const [activeTab, setActiveTab] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    price: "",
    totalTickets: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Validation & Scanner State
  const [ticketId, setTicketId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerInstanceRef = useRef(null);

  // --- GET TODAY'S DATE (YYYY-MM-DD) ---
  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch Events when tab changes to "list"
  useEffect(() => {
    if (activeTab === "list" && user?.uid) {
      dispatch(fetchOrganizerEvents(user.uid));
    }
  }, [activeTab, user?.uid, dispatch]);

  // --- SCANNER LOGIC ---
  const stopScanner = async () => {
    if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setShowScanner(false);
    setIsProcessing(false);
  };

  const handleResetScanner = () => {
    dispatch(clearValidationMsg());
    setTicketId("");
    setIsProcessing(false);
  };

  useEffect(() => {
    let html5QrCode;
    if (
      showScanner &&
      activeTab === "validate" &&
      !validationMsg &&
      !ticketError &&
      !isProcessing
    ) {
      html5QrCode = new Html5Qrcode("reader");
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      html5QrCode
        .start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            setIsProcessing(true);
            setTicketId(decodedText);

            if (scannerInstanceRef.current) {
              await scannerInstanceRef.current.stop().catch(() => {});
              scannerInstanceRef.current = null;
            }

            dispatch(clearValidationMsg());
            dispatch(
              validateTicket({ ticketId: decodedText, organizerId: user?.uid }),
            );
            if (navigator.vibrate) navigator.vibrate(100);
          },
          () => {}, // Silent failure for frame-by-frame scanning
        )
        .catch((err) => {
          console.error("Scanner Error:", err);
          setShowScanner(false);
        });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [
    showScanner,
    activeTab,
    validationMsg,
    ticketError,
    isProcessing,
    dispatch,
    user?.uid,
  ]);

  // --- HANDLERS ---
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async () => {
    if (!imageFile)
      return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000";

    setIsUploading(true);
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: data },
      );
      const uploadedImage = await res.json();
      setIsUploading(false);
      return (
        uploadedImage.secure_url ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000"
      );
    } catch (error) {
      setIsUploading(false);
      return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000";
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (formData.date < todayStr) {
      alert("You cannot schedule an event in the past!");
      return;
    }

    const imageUrl = await uploadToCloudinary();
    const eventData = {
      ...formData,
      image: imageUrl,
      price: Number(formData.price),
      totalTickets: Number(formData.totalTickets),
      bookedTickets: 0,
      organizerId: user?.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await dispatch(createEvent(eventData));
      alert("Event Created Successfully!");
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        price: "",
        totalTickets: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setActiveTab("list");
    } catch (error) {
      alert("Failed to create event: " + error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      try {
        await dispatch(deleteEvent(eventId)).unwrap();
        alert("Event deleted successfully.");
      } catch (error) {
        alert(`Failed to delete event: ${error}`);
      }
    }
  };

  const handleManualValidate = (e) => {
    if (e) e.preventDefault();
    if (!ticketId || !user?.uid) return;
    setIsProcessing(true);
    dispatch(clearValidationMsg());
    dispatch(validateTicket({ ticketId, organizerId: user.uid }));
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold animate-pulse">
          LOADING PROFILE...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {selectedEvent && (
        <AttendeeModal
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600">Manage events and verify attendees</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("create");
              stopScanner();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold border ${activeTab === "create" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 cursor-pointer"}`}
          >
            Create Event
          </button>
          <button
            onClick={() => setActiveTab("validate")}
            className={`px-4 py-2 rounded-lg text-sm font-bold border ${activeTab === "validate" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 cursor-pointer"}`}
          >
            Scan Tickets
          </button>
          <button
            onClick={() => {
              setActiveTab("list");
              stopScanner();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold border ${activeTab === "list" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 cursor-pointer"}`}
          >
            My Events
          </button>
        </div>

        {/* --- TAB: CREATE EVENT --- */}
        {activeTab === "create" && (
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-300">
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
              New Event Details
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                  onChange={handleChange}
                  placeholder="Event Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                  onChange={handleChange}
                  placeholder="Venue Name & Address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    min={todayStr}
                    value={formData.date}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Time
                  </label>
                  <input
                    name="time"
                    type="time"
                    value={formData.time}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Price (PKR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Capacity
                  </label>
                  <input
                    name="totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  required
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="border border-dashed border-gray-400 rounded-xl p-6 text-center bg-gray-50 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 mx-auto object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500 font-bold">
                    Click to Upload Banner
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
              >
                {isUploading ? "UPLOADING..." : "PUBLISH EVENT"}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB: SCANNER --- */}
        {activeTab === "validate" && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-black rounded-xl overflow-hidden relative aspect-square border-4 border-gray-200">
              {!showScanner ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-lg font-bold mb-4 uppercase">
                    Ticket Scanner
                  </h3>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold uppercase"
                  >
                    Start Scanning
                  </button>
                </div>
              ) : (
                <>
                  <div id="reader" className="w-full h-full object-cover"></div>
                  {(ticketLoading || validationMsg || ticketError) && (
                    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-20">
                      {ticketLoading ? (
                        <p className="text-white font-bold uppercase">
                          Verifying...
                        </p>
                      ) : (
                        <>
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${validationMsg ? "bg-green-600" : "bg-red-600"} text-white`}
                          >
                            {validationMsg ? "✓" : "✕"}
                          </div>
                          <h2
                            className={`text-xl font-bold uppercase mb-2 ${validationMsg ? "text-green-400" : "text-red-400"}`}
                          >
                            {validationMsg ? "Success" : "Invalid"}
                          </h2>
                          <p className="text-white mb-6">
                            {validationMsg
                              ? `Attendee: ${validationMsg.attendee}`
                              : ticketError}
                          </p>
                          <button
                            onClick={handleResetScanner}
                            className="bg-white text-black w-full py-3 rounded-lg font-bold uppercase"
                          >
                            Scan Next
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!isProcessing && (
                    <button
                      onClick={stopScanner}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-1 rounded-lg text-xs font-bold uppercase border border-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
            {!isProcessing && !validationMsg && !ticketError && (
              <div className="bg-white p-4 rounded-xl border border-gray-300">
                <form onSubmit={handleManualValidate} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER TICKET ID"
                    className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm border border-gray-300 outline-none"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                  />
                  <button
                    disabled={ticketLoading || !ticketId}
                    className="bg-gray-800 text-white px-4 rounded-lg font-bold uppercase text-xs"
                  >
                    Verify
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: MY EVENTS --- */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 gap-4">
            {myEvents.length === 0 ? (
              <p className="text-center py-10 text-gray-500 font-bold uppercase">
                No Events Found
              </p>
            ) : (
              [...myEvents]
                .sort((a, b) => {
                  // Safety: Handle missing createdAt field
                  const timeA = a.createdAt
                    ? new Date(a.createdAt).getTime()
                    : 0;
                  const timeB = b.createdAt
                    ? new Date(b.createdAt).getTime()
                    : 0;
                  return timeB - timeA;
                })
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-4 rounded-xl border border-gray-300 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={event?.image || "https://via.placeholder.com/64"}
                        alt="ev"
                        className="w-16 h-16 object-cover rounded-lg bg-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 uppercase text-xs">
                          {event?.title || "Untitled"}
                        </h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase">
                          {event?.date || "No Date"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-38">
                            <div
                              className="bg-blue-600 h-full"
                              style={{
                                width: `${Math.min(100, (event.bookedTickets / event.totalTickets) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600">
                            {event.bookedTickets}/{event.totalTickets}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end mt-2 sm:mt-0">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="bg-zinc-100 hover:bg-zinc-700 text-gray-700 hover:text-white px-3 cursor-pointer py-2 rounded-lg font-bold uppercase text-xs transition-colors"
                      >
                        Attendees
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-red-50 text-red-600 p-2 rounded-lg border border-red-100 hover:bg-red-100 text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
