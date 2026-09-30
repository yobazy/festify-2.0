import { SettingsNav } from "@/components/settings/SettingsNav";

interface SettingsShellProps {
  children: React.ReactNode;
  userEmail: string | null;
}

export function SettingsShell({ children, userEmail }: SettingsShellProps) {
  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="display text-6xl text-paper sm:text-8xl">Settings</h1>
        {userEmail && (
          <p className="meta-strong max-w-full truncate sm:text-right">{userEmail}</p>
        )}
      </div>

      <SettingsNav />

      <div className="pt-8">{children}</div>
    </div>
  );
}
