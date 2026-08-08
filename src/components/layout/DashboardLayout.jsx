"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Spinner } from "@/components/ui/Spinner";

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  // Fast path: if we have a stored token, show the shell immediately.
  // This prevents the "white flash + spinner" on every navigation.
  const hasStoredToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  if (loading && !hasStoredToken) {
    // Only show full-page spinner on a cold-start with no stored session
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ps-64 flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

