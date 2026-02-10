import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate, Link } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === "organizer") navigate("/dashboard");
      else navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        dispatch(
          loginUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            role: userData.role,
          }),
        );

        if (userData.role === "organizer") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError("User profile not found! Please contact support.");
        setIsLoggingIn(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid Email or Password");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-110px)] bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-300 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-bold"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          New to Quetta Events?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
