"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { userService } from "@/features/users/services/userService";

export function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const t = useTranslations("users");
  const commonT = useTranslations("common");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("admin"); // Only 'admin' or 'doctor'
  const [branchId, setBranchId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      async function loadBranches() {
        try {
          const res = await userService.getBranches();
          const list = res.data || res || [];
          setBranches(Array.isArray(list) ? list : []);
          if (list.length > 0) setBranchId(list[0].id);
        } catch (err) {
          console.error("Failed to load branches", err);
        }
      }
      loadBranches();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError(t("passwordMismatch") || "Passwords do not match.");
      return;
    }

    if (role === "doctor" && !licenseNumber) {
      setError(t("licenseRequired") || "License number is required for doctors.");
      return;
    }

    setLoading(true);
    try {
      await userService.createUser({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role, // 'admin' or 'doctor' only
        branch_id: branchId ? parseInt(branchId, 10) : undefined,
        license_number: role === "doctor" ? licenseNumber : undefined,
        specialty_id: role === "doctor" && specialtyId ? parseInt(specialtyId, 10) : undefined,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create user.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setRole("admin");
    setLicenseNumber("");
    setSpecialtyId("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("createUser")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("fullName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Ahmed Hassan"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@clinic.com"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Password & Password Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("password")} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Role Selection (Strictly admin or doctor - NO super-admin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("role")} <span className="text-red-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            >
              <option value="admin">Branch Admin</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            >
              {branches.length === 0 ? (
                <option value="">Main Branch</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Doctor-Specific Fields (Only shown when role === 'doctor') */}
        {role === "doctor" && (
          <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl space-y-3">
            <p className="text-xs font-bold text-teal-800">Doctor Profile Details</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required={role === "doctor"}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. DOC-98745"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            {commonT("cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating..." : t("createUser")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
