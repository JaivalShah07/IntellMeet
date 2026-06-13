import { useState } from "react";
import { User as UserIcon, Mail, Shield, Loader2, Save, Camera, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");
    try {
      const { data } = await api.post("/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.success && data.url) {
        setAvatar(data.url);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to get image URL from server", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.put("/auth/profile", {
        name: name.trim(),
        email: email.trim(),
        avatar: avatar.trim(),
      });
      
      updateUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Profile Details"
          subtitle="Manage your personal information and profile picture."
          icon={UserIcon}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card Left - Avatar display */}
          <div className="card-elevated rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div 
                className="relative group cursor-pointer overflow-hidden rounded-full w-28 h-28 border-4 border-sky-500/20 shadow-lg"
                onClick={() => document.getElementById("avatar-file-input")?.click()}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover transition-all group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                    {initials}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-sky-400 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </>
                  )}
                </div>
              </div>
              {/* Hidden Input file */}
              <input
                type="file"
                id="avatar-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">
                {user?.name}
              </h3>
              <p className="text-xs text-gray-400 font-medium">{user?.email}</p>
            </div>

            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 flex items-center gap-1 uppercase tracking-wide w-fit">
              <Shield className="w-3 h-3" />
              {user?.role} Account
            </span>
          </div>

          {/* Card Right - Form editor */}
          <div className="md:col-span-2 card-elevated rounded-3xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Avatar URL / Upload Photo</span>
                  <span className="text-[10px] text-gray-400 font-medium">PNG, JPG or WebP (max 2MB)</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/... or similar"
                    className="flex-1 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-medium text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-file-input")?.click()}
                    disabled={uploadingAvatar}
                    className="px-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:border-sky-500/30 font-bold text-sm rounded-xl flex items-center gap-2 transition-all shrink-0"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || uploadingAvatar}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold disabled:opacity-70 text-sm shadow-md"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
