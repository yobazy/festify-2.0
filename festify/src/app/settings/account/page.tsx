import { signOut } from "@/app/auth/login/actions";
import { requireUser } from "@/lib/auth";

export default async function AccountSettingsPage() {
  const user = await requireUser();

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <h2 className="font-brand text-2xl text-white">Account</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Your Festify account is currently tied to the email below.
        </p>
      </div>

      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Email
            </p>
            <p className="mt-2 text-sm text-white">{user.email}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              User ID
            </p>
            <p className="mt-2 break-all text-sm text-muted-foreground">
              {user.id}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Joined
            </p>
            <p className="mt-2 text-sm text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
