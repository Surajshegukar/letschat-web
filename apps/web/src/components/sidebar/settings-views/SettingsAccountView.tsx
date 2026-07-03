import React from "react";
import { Shield, ShieldCheck, Smartphone, Archive, Trash2 } from "lucide-react";

interface SettingsAccountViewProps {
  securityAlerts: boolean;
  setSecurityAlerts: (checked: boolean) => void;
  twoStepEnabled: boolean;
  setTwoStepEnabled: (checked: boolean) => void;
}

export function SettingsAccountView({
  securityAlerts,
  setSecurityAlerts,
  twoStepEnabled,
  setTwoStepEnabled,
}: SettingsAccountViewProps) {
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

      {/* Delete Account */}
      <button
        onClick={() => {
          if (confirm("Are you sure you want to delete your Let's Chat account? This is irreversible.")) {
            alert("Account deleted.");
          }
        }}
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
