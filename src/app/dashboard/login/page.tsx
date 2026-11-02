const MESSAGES: Record<string, string> = {
  no_access: 'That Google account does not have access to any business here. Ask TysonLabs to add your email, or sign in with a different account.',
  denied: 'Sign-in was cancelled.',
  failed: 'Sign-in could not be completed. Please try again.',
  busy: 'Too many attempts. Wait a minute and try again.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const msg = sp.e && Object.hasOwn(MESSAGES, sp.e) ? MESSAGES[sp.e] : null;
  return (
    <div className="max-w-sm space-y-4 pt-6">
      <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Reviews dashboard</h1>
      <p className="text-sm text-zinc-500">Sign in with the Google account your TysonLabs invitation was sent to. We only ask for your email address to identify you.</p>
      {msg && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{msg}</p>}
      <a href="/api/auth/google/start" className="inline-block rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">Sign in with Google</a>
      <p className="text-xs text-zinc-500">Not set up yet? Email <a className="underline" href="mailto:support@tysonlabs.in">support@tysonlabs.in</a>.</p>
    </div>
  );
}
