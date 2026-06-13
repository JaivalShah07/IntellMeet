import { useState } from "react";
import { Settings as SettingsIcon, Key, Bell, ShieldAlert, Loader2, Save } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Preference Mocks
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [meetingSummaryReminders, setMeetingSummaryReminders] = useState(true);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setSubmittingPassword(true);
    try {
      await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Workspace Settings"
          subtitle="Manage passwords, workspace options, and notifications."
          icon={SettingsIcon}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left - Preferences section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-elevated rounded-3xl p-6 space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-500" /> Notifications
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Email updates</p>
                    <p className="text-[10px] text-gray-400">Receive weekly summaries and team activity.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingSummaryReminders}
                    onChange={(e) => setMeetingSummaryReminders(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-gray-300"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Meeting analytics</p>
                    <p className="text-[10px] text-gray-400">Get reminders when AI post-meeting insights are ready.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="card-elevated rounded-3xl p-6 flex flex-col items-center justify-between h-28">
              <div className="w-full flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Theme Preference</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Toggle light & dark theme mode.</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Right - Password Security Editor */}
          <div className="lg:col-span-2 card-elevated rounded-3xl p-6 md:p-8">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-6">
              <Key className="w-4 h-4 text-indigo-500" /> Security Credentials
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-left">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-left">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-left">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold disabled:opacity-70 text-sm shadow-md"
                >
                  {submittingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
