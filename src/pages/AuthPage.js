import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userRole = params.get("role");
    setRole(userRole === "manager" ? "manager" : "employee");
  }, [location.search]);

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const success = await auth.login(email, password);
        if (success) {
          const from = location.state?.from?.pathname || 
                      (auth.role === 'manager' ? '/manager/teams' : '/employee');
          navigate(from, { replace: true });
        } else {
          setError("Invalid email or password");
        }
      } else {
        const success = await auth.register(name, email, password, role);
        if (success) {
          const loginSuccess = await auth.login(email, password);
          if (loginSuccess) {
           const from = location.state?.from?.pathname || 
                      (auth.role === 'manager' ? '/manager' : '/employee');
          navigate(from, { replace: true });
          }
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          {isLogin ? "Login" : "Register"} as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
            required
            minLength="6"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleForm}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Register" : "Login"} here
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;