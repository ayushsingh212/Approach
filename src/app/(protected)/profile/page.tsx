"use client";

import { useAuth } from "@/src/Hooks/Useauth";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isLoading, error, fetchProfile, updateCredentials } = useAuth();

  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile().catch((err) => {
      console.error("Profile fetch failed:", err.message);
    });
  }, [fetchProfile]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateCredentials({
        senderEmail,
        googleAppPassword: appPassword,
      });
      setSenderEmail("");
      setAppPassword("");
      // Optionally refetch profile to see updated data
      await fetchProfile();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>

      <h2 className="text-2xl font-semibold mb-6 mt-8">Profile</h2>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="mb-4">
          <span className="font-semibold">Name:</span> {user?.name || "—"}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user?.email || "—"}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="mb-4 font-semibold">Update Sender Credentials</h2>

        <input
          type="email"
          placeholder="Sender Gmail"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Google App Password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleUpdate}
          disabled={updating || !senderEmail || !appPassword}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg transition"
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}
