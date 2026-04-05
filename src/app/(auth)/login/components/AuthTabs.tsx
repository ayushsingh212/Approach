"use client";

export default function AuthTabs({
  tab,
  setTab,
}: {
  tab: "login" | "register";
  setTab: (t: "login" | "register") => void;
}) {
  return (
    <div className="flex gap-8 mb-8 border-b border-slate-200">
      {(["login", "register"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`pb-4 text-sm font-medium transition-colors ${
            tab === t
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {t === "login" ? "Sign In" : "Create Account"}
        </button>
      ))}
    </div>
  );
}