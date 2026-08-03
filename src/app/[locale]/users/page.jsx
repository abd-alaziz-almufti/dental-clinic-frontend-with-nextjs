"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { UsersListTable } from "@/features/users/components/UsersListTable";
import { CreateUserModal } from "@/features/users/components/CreateUserModal";
import { PermissionsMatrix } from "@/features/users/components/PermissionsMatrix";
import { userService } from "@/features/users/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, ShieldAlert, Search, Filter, Users, ShieldCheck } from "lucide-react";

export default function UsersPage() {
  const t = useTranslations("users");
  const commonT = useTranslations("common");
  const { hasAnyRole } = useAuth();

  // Role guard: doctor is blocked
  const canAccess = hasAnyRole("super-admin", "admin");

  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'permissions'
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        page: 1,
        per_page: 25,
        search,
        role: roleFilter,
      });
      const list = res.data || res || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    if (canAccess) {
      fetchUsers();
    }
  }, [canAccess, fetchUsers]);

  if (!canAccess) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-3 my-8 max-w-xl mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold">Access Restricted</h2>
          <p className="text-xs">User management is reserved for System Super-Admins and Branch Administrators.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("title") || "Users & Permissions"}</h1>
            <p className="text-sm text-slate-500 font-medium">{t("subtitle") || "Manage clinic staff accounts, doctor profiles, and role access boundaries."}</p>
          </div>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <UserPlus className="w-4 h-4 me-1.5" />
            <span>{t("createUser") || "+ Add New User"}</span>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "list"
                ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t("userRegistry") || "User Registry"}</span>
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "permissions"
                ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t("permissionsMatrix") || "Role Permissions Matrix"}</span>
          </button>
        </div>

        {/* Tab 1: User Registry */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <Card className="p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={commonT("search")}
                  className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Roles</option>
                  <option value="super-admin">Super Admin</option>
                  <option value="admin">Branch Admin</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </Card>

            {/* Users Table */}
            <Card className="shadow-xs overflow-hidden">
              {loading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No staff user accounts found"
                  description="No user accounts match the selected role filter or search term."
                />
              ) : (
                <UsersListTable users={users} />
              )}
            </Card>
          </div>
        )}

        {/* Tab 2: Role Permissions Matrix */}
        {activeTab === "permissions" && <PermissionsMatrix />}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </DashboardLayout>
  );
}
