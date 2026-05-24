import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      // Must be logged in to accept invite
      navigate("/login", { replace: true });
      return;
    }

    if (!token) return;

    api
      .post("/teams/accept", { token })
      .then(() => {
        setStatus("success");
        setMessage("You have successfully joined the team!");
        setTimeout(() => navigate("/dashboard"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid or expired invitation link.");
      });
  }, [token, user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-4">
      <div className="card-elevated max-w-md w-full p-8 rounded-3xl text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold">Verifying Invitation...</h2>
          </div>
        )}
        
        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome!</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary px-6 py-3 rounded-xl font-bold"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
