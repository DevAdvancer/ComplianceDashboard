import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="glass-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.34em] text-sky-200">
            <ShieldCheck className="size-4" />
            Compliance OS
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
              Dark-mode compliance workflow for marketing and admin teams.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Create candidate compliance records, review references, approve
              requests, and open audit-ready reports from one premium workspace.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Supabase Auth with role-aware routing",
              "Live dashboard metrics and pending queues",
              "Printable reports with CSV, Excel, and PDF exports",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <LockKeyhole className="size-4 text-violet-200" />
                </div>
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ArrowRight className="size-4 text-sky-300" />
            Admins create users directly in Supabase Auth. There is no public
            signup path.
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
