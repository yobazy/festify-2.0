import { requireUser } from "@/lib/auth";
import { SettingsShell } from "@/components/settings/SettingsShell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return <SettingsShell userEmail={user.email ?? null}>{children}</SettingsShell>;
}
