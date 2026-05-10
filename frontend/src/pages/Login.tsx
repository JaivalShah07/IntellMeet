import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    login(email); // fake login
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="p-6 bg-white shadow rounded">
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 mb-2 w-full"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-500 text-white px-4 py-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
}