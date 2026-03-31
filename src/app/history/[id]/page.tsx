"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService } from "@/src/services/User.service";

export default function EmailDetailsPage() {
  const { id } = useParams();
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await userService.getSentEmails();
      const found = res.data.find((l: any) => l._id === id);
      setLog(found);
    };

    fetch();
  }, [id]);

  if (!log) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      <h1 className="text-2xl font-semibold mb-4">{log.subject}</h1>

      {/* BODY */}
      <div
        className="p-6 bg-white rounded-xl shadow mb-6"
        dangerouslySetInnerHTML={{ __html: log.body }}
      />

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          Sent: {log.totalSent}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          Failed: {log.totalFailed}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          Status: {log.status}
        </div>
      </div>

      {/* RECIPIENTS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="mb-3 font-semibold">Recipients</h2>

        {log.deliveryResults.map((r: any) => (
          <div
            key={r.companyEmail}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span>{r.companyName}</span>
            <span
              className={
                r.status === "sent"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}