// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import { loginUser, logoutUser, setLoading } from "./store/authSlice";

// Import Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import MyTickets from "./pages/MyTickets";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            dispatch(
              loginUser({
                uid: currentUser.uid,
                email: currentUser.email,
                name: userData.name,
                role: userData.role,
              }),
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          dispatch(logoutUser());
        }
      } else {
        dispatch(logoutUser());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logoutUser());
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-bold text-blue-600">
          Loading Quetta Events...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-zinc-700 text-white sticky top-0 z-50 border-b border-blue-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* LOGO SECTION */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-blue-100 transition-colors"
          >
            <span className="font-bold text-lg tracking-tight" title="Home">
              Quetta Events
            </span>
          </Link>

          {/* NAVIGATION LINKS */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* ATTENDEE LINKS */}
                {user.role === "attendee" && (
                  <Link
                    to="/my-tickets"
                    className="text-white hover:bg-zinc-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    My Tickets
                  </Link>
                )}

                {/* ORGANIZER LINKS */}
                {user.role === "organizer" && (
                  <Link
                    to="/dashboard"
                    className="bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                )}

                {/* LOGOUT BUTTON */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 cursor-pointer text-white text-sm px-3 py-2 rounded-lg font-bold transition"
                >
                  Logout
                </button>
              </>
            ) : (
              /* GUEST LINKS */
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium hover:text-blue-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Grows to push footer down */}
      <div className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event/:id" element={<EventDetails />} />

          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute allowedRoles={["attendee"]}>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4 text-center mt-auto">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Quetta Events. Developed by{" "}
          <span className="font-semibold text-gray-600">M. Naeem</span>.
        </p>
      </footer>
    </div>
  );
}

export default App;
