"use client";

import { AccountManagement } from "@/components/profile/account-management";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account, security and preferences.</p>
      </div>
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <AccountManagement />
      </div>
    </div>
  );
}
