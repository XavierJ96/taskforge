import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase_config";

function Login({ updateUserEmail }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      updateUserEmail(user.email);
      navigate("/");
    } catch (error) {
      console.error("Login failed", error.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="text-[#E4E4E4] flex justify-center h-screen">
      <div
        className="my-auto max-w-xs min-w-[260px]
      "
      >
        <div>
          <h2 className="text-center text-xl font-bold leading-9 tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col mt-3 gap-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-left"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block text-[#424242] p-2 w-full rounded-md border-0 py-1.5 white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 white"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="block w-full p-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
        <p className="mt-3 text-center">
          Not a member?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign up here
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link
            to="/forgot_password"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
