import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, login, googleLogin } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Google Authentication failed");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string } };
        code?: string;
        message?: string;
      };
      let msg = ax.response?.data?.message;
      if (!msg) {
        if (ax.code === "ERR_NETWORK" || ax.message?.includes("Network")) {
          msg =
            "Cannot reach the API. Start MongoDB, then run: npm run dev (from project root).";
        } else {
          msg = "Login failed. Check email/password or sign up for a new account.";
        }
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to your enterprise workspace."
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/15 px-4 py-3 rounded-xl border border-amber-200/80">
            {error}
          </p>
        )}

        <div className="text-xs text-gray-600 dark:text-gray-400 bg-sky-50 dark:bg-sky-500/10 px-3 py-3 rounded-lg border border-sky-100 dark:border-sky-500/20 space-y-1">
          <p>
            <strong>Demo:</strong> demo@intellmeet.com / demo123
          </p>
          <p>
            From project folder run <code className="text-sky-600">npm run dev</code> — database
            starts automatically (no MongoDB install needed).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Let&apos;s go <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <p className="text-sm text-gray-500">or</p>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
            theme="filled_black"
            shape="rectangular"
            size="large"
          />
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{" "}
        <Link to="/signup" className="text-sky-600 font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
