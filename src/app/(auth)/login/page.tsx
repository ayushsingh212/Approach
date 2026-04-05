"use client";

import { useState, useEffect } from "react";
import MobileHeader from "./components/MobileHeader";
import LeftPanel from "./components/LeftPanel";
import AuthTabs from "./components/AuthTabs";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Toaster } from "react-hot-toast";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 lg:bg-white">
      <Toaster />

      <MobileHeader />

      <LeftPanel mobileMenuOpen={false} />

      {/* Right panel — white card on mobile, plain flex on desktop */}
      <div className="flex-1 flex justify-center items-start lg:items-center px-5 py-8 lg:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-7 lg:shadow-none lg:rounded-none lg:p-0 lg:bg-transparent">
          <AuthTabs tab={tab} setTab={setTab} />
          {tab === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm onSwitchTab={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}