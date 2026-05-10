import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = (e) => {
    e.preventDefault();

    login(email); // auto login after signup
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignup} className="p-6 bg-white shadow rounded">
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="bg-green-500 text-white px-4 py-2 w-full">
          Signup
        </button>
      </form>
    </div>
  );
}