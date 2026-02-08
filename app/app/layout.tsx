import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-semibold">Mini CRM</p>
            <p className="text-sm text-slate-500">Welcome, {user.email}</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-slate-700 hover:text-slate-900" href="/app">
              Pipeline
            </Link>
            <Link
              className="text-slate-700 hover:text-slate-900"
              href="/app/followup"
            >
              Follow-Up Generator
            </Link>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-2 text-white"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
