import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/SignUp";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {!userEmail && (
          <>
            <Route
              path="/login"
              element={<Login updateUserEmail={setUserEmail} />}
            />
            <Route
              path="/register"
              element={<Register updateUserEmail={setUserEmail} />}
            />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/*" element={<Navigate to="/login" />} />
          </>
        )}
        {userEmail && (
          <>
            <Route path="/" element={<Home userEmail={userEmail} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
