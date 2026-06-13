import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, register, googleLogin } = useAuth();

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Signup failed. Try a different email.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Join IntellMeet"
      subtitle="Create your account — built for enterprise teams."
    >
      <form onSubmit={handleSignup} className="space-y-5">
        {error && (
          <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/15 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
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
              <Loader2 className="w-5 h-5 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Start your journey
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
            text="signup_with"
          />
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already with us?{" "}
        <Link to="/login" className="text-sky-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
