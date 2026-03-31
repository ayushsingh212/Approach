"use client";

import { useAuth } from "@/src/Hooks/Useauth";
import { useState } from "react";

export default function Dashboard() {
  const { user, updateCredentials } = useAuth();

  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateCredentials({
        senderEmail,
        googleAppPassword: appPassword,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="mb-2"><b>Name:</b> {user?.name}</div>
        <div><b>Email:</b> {user?.email}</div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="mb-4 font-semibold">Update Sender Credentials</h2>

        <input
          placeholder="Sender Gmail"
          onChange={(e) => setSenderEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          placeholder="Google App Password"
          onChange={(e) => setAppPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="bg-green-500 text-white px-5 py-2 rounded-lg"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}