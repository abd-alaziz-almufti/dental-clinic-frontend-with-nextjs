"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { settingsService } from "@/features/settings/services/settingsService";
import { Building2, Phone, Mail, MapPin, Receipt, Coins, CheckCircle2 } from "lucide-react";

export function GeneralSettingsTab() {
  const t = useTranslations("settings");
  const commonT = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currencyCode, setCurrencyCode] = useState("SAR");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await settingsService.getBranchProfile(1);
        const data = res.data || res || {};
        setName(data.name || "Lumina Dental Clinic");
        setPhone(data.phone || "+966 11 123 4567");
        setEmail(data.email || "info@luminadental.sa");
        setAddress(data.address || "123 Medical District");
        setCity(data.city || "Riyadh");
        setTaxNumber(data.tax_number || "310123456700003");
        setCurrencyCode(data.currency_code || "SAR");
      } catch (err) {
        console.error("Failed to load branch settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await settingsService.updateBranchProfile(1, {
        name,
        phone,
        email,
        address,
        city,
        tax_number: taxNumber || null,
        currency_code: currencyCode || "SAR",
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save branch settings", err);
      const msg = err?.response?.data?.message || "Failed to update branch profile settings.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-medium">Loading practice settings...</div>;
  }

  return (
    <Card className="p-6 md:p-8 shadow-xs max-w-4xl space-y-6">
      <div>
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          <span>{t("practiceProfile") || "Branch Practice Identity"}</span>
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {t("practiceSubtitle") || "Update official clinic details printed on invoice headers, receipts, and clinical records."}
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t("settingsSaved") || "Practice settings updated successfully."}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Clinic Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t("clinicName") || "Practice / Branch Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("phone") || "Phone Number"}</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("email") || "Email Address"}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("address") || "Address Street"}</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t("city") || "City"}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Tax Identification Number (Print-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("taxNumber") || "Tax Registration Number (VAT / CR)"}</span>
            </label>
            <input
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="e.g. 310123456700003 (Printed on Invoice)"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white font-mono"
            />
          </div>

          {/* Currency Display Symbol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("currency") || "Display Currency Code"}</span>
            </label>
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white font-semibold"
            >
              <option value="SAR">SAR (ر.س)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="EGP">EGP (ج.م)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving Changes..." : commonT("save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
