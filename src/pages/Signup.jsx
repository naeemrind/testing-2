// src/pages/Signup.jsx
// import { useState } from "react";
// import { auth, db } from "../firebase/config";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { useNavigate, Link } from "react-router";

// const Signup = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState(""); // New State
//   const [name, setName] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false); // UI feedback

//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     // 1. UX Validation: Check if passwords match
//     if (password !== confirmPassword) {
//       setError("Passwords do not match!");
//       setLoading(false);
//       return;
//     }

//     // 2. UX Validation: Password strength (optional but good)
//     if (password.length < 6) {
//       setError("Password should be at least 6 characters.");
//       setLoading(false);
//       return;
//     }

//     try {
//       // 3. Create user in Firebase Auth
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password,
//       );
//       const user = userCredential.user;

//       // 4. Save user details to Firestore
//       // SECURITY: We force the role to be 'attendee'
//       await setDoc(doc(db, "users", user.uid), {
//         uid: user.uid,
//         name: name,
//         email: email,
//         role: "attendee", // Hardcoded for security
//         createdAt: new Date().toISOString(),
//       });

//       alert("Account created successfully!");
//       navigate("/login");
//     } catch (err) {
//       // Handle Firebase specific errors (like "email already in use")
//       if (err.code === "auth/email-already-in-use") {
//         setError("This email is already registered.");
//       } else {
//         setError(err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
//           Join Quetta Events
//         </h2>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSignup} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <input
//               type="text"
//               required
//               className="w-full p-2 border rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               required
//               className="w-full p-2 border rounded mt-1"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               className="w-full p-2 border rounded mt-1"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               required
//               className="w-full p-2 border rounded mt-1"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full text-white p-2 rounded transition duration-200 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
//           >
//             {loading ? "Creating Account..." : "Sign Up"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600">
//           Already have an account?
//           <Link to="/login" className="text-blue-600 font-medium">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;
// ===========================================

import { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "attendee",
        createdAt: new Date().toISOString(),
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-300 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Join Quetta Events
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded-lg font-bold mt-2 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
