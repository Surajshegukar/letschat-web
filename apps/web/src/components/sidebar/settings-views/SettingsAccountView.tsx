import React, { useState } from "react";
import { Shield, ShieldCheck, Smartphone, Archive, Trash2, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { useChangePassword } from "@/hooks/api/use-user";
import { toast } from "sonner";

interface SettingsAccountViewProps {
  securityAlerts: boolean;
  setSecurityAlerts: (checked: boolean) => void;
  twoStepEnabled: boolean;
  setTwoStepEnabled: (checked: boolean) => void;
  handleDeleteAccount: () => void;
}

export function SettingsAccountView({
  securityAlerts,
  setSecurityAlerts,
  twoStepEnabled,
  setTwoStepEnabled,
  handleDeleteAccount,
}: SettingsAccountViewProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setIsChangePasswordOpen(false);
        },
      }
    );
  };

  return (
    <div className="p-4 space-y-4 text-left">
      {/* Security Alerts option */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Security Notifications
            </span>
          </div>
          <input
            type="checkbox"
            checked={securityAlerts}
            onChange={(e) => setSecurityAlerts(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          Show security notifications when a contact's security code changes. We encrypt all chats end-to-end natively.
        </p>
      </div>

      {/* 2-Step verification */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Two-step Verification
            </span>
          </div>
          <input
            type="checkbox"
            checked={twoStepEnabled}
            onChange={(e) => setTwoStepEnabled(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-zinc-350 dark:border-zinc-800 text-emerald-500 focus:ring-[#19E68C] transition"
          />
        </div>
        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-relaxed font-semibold">
          For added security, enable two-step verification to require a PIN when registering your account details.
        </p>
      </div>

      {/* Change number / request report links */}
      <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm divide-y divide-zinc-100 dark:divide-zinc-900/60">
        <button
          onClick={() => alert("Change Phone Number wizard is starting...")}
          className="w-full flex items-center justify-between py-3 text-left hover:text-emerald-655 dark:hover:text-[#19E68C] transition"
        >
          <div className="flex items-center gap-3 text-slate-850 dark:text-zinc-200 hover:text-inherit">
            <Smartphone className="h-4.5 w-4.5" />
            <span className="text-xs font-bold">Change Phone Number</span>
          </div>
        </button>
        <button
          onClick={() => alert("Requested account report has been scheduled. Check back in 72h!")}
          className="w-full flex items-center justify-between pt-3 pb-1 text-left hover:text-emerald-655 dark:hover:text-[#19E68C] transition"
        >
          <div className="flex items-center gap-3 text-slate-855 dark:text-zinc-200 hover:text-inherit">
            <Archive className="h-4.5 w-4.5" />
            <span className="text-xs font-bold">Request Account Report Info</span>
          </div>
        </button>
      </div>

      {/* Change Password option */}
      <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-150/40 dark:border-zinc-900 rounded-3xl shadow-sm space-y-3">
        <button
          onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
          className="w-full flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-[#19E68C]" />
            <span className="text-sm font-bold text-slate-855 dark:text-zinc-200">
              Change Password
            </span>
          </div>
          <span className="text-zinc-400 dark:text-zinc-600 text-xs font-bold">
            {isChangePasswordOpen ? "Hide" : "Show"}
          </span>
        </button>

        {isChangePasswordOpen && (
          <form onSubmit={handleSubmitPassword} className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs outline-none transition focus:border-[#19E68C] dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs outline-none transition focus:border-[#19E68C] dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs outline-none transition focus:border-[#19E68C] dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full py-2.5 bg-emerald-600 dark:bg-[#19E68C] hover:bg-emerald-700 dark:hover:bg-[#15c577] text-white dark:text-zinc-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Delete Account */}
      <button
        onClick={handleDeleteAccount}
        className="w-full flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/15 rounded-3xl shadow-sm transition text-left"
      >
        <Trash2 className="h-5 w-5" />
        <div className="min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-wide">Delete My Account</h4>
          <p className="text-[9px] text-rose-500/80 mt-1 font-semibold">
            Instantly wipe profile logs, communities access, and chat history.
          </p>
        </div>
      </button>
    </div>
  );
}

export default SettingsAccountView;
