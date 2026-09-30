import { signOut } from "@/app/auth/login/actions";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default async function AccountSettingsPage() {
  const user = await requireUser();

  const rows = [
    { label: "Email", value: user.email ?? "No email on file" },
    { label: "User ID", value: user.id },
    {
      label: "Joined",
      value: new Date(user.created_at).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
  ];

  return (
    <section>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-b border-line py-3 sm:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <dt className="meta">{row.label}</dt>
            <dd className="break-all text-sm text-paper">{row.value}</dd>
          </div>
        ))}
      </dl>

      <form action={signOut} className="mt-8">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </section>
  );
}
