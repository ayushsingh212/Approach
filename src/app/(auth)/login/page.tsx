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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Toaster />

      <MobileHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <LeftPanel mobileMenuOpen={mobileMenuOpen} />

      <div className="flex-1 flex justify-center items-center p-10">
        <div className="w-full max-w-md">
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
