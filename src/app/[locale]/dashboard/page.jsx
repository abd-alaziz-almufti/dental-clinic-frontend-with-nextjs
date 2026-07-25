"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { DoctorDashboard } from "@/features/dashboard/components/DoctorDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { hasRole } = useAuth();

  // Doctor role sees DoctorDashboard if they don't have Admin privileges
  const isOnlyDoctor = hasRole("doctor") && !hasRole("admin") && !hasRole("super-admin");

  return (
    <DashboardLayout>
      {isOnlyDoctor ? <DoctorDashboard /> : <AdminDashboard />}
    </DashboardLayout>
  );
}
