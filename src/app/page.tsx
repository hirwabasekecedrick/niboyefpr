import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-red-100 bg-white shadow-sm">
        <Link className="flex items-center justify-center font-bold text-xl tracking-tight text-primary gap-2" href="/">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Niboye Sector FPR</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors text-foreground" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors text-foreground" href="/about">
            About
          </Link>
          <Link
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            href="/dashboard"
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-red-50 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-100/50 mix-blend-multiply blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-200/30 mix-blend-multiply blur-3xl" />

          <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-slate-900">
                  FPR Inkotanyi <span className="text-primary block mt-2">Management System</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-6">
                  Empowering the Niboye Sector. A unified digital solution transforming party management from village to sector level.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2 mt-8">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full"
                  href="/dashboard"
                >
                  Access Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-red-50 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-red-50">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Hierarchical Integration</h3>
                <p className="text-sm text-slate-600">
                  Seamlessly connecting Members, Village Leaders, Cell Administrators, and Sector levels.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-red-50 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-red-50">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Data-Driven Insights</h3>
                <p className="text-sm text-slate-600">
                  Track member participation, attendance records, and activity performance.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border border-red-50 bg-white shadow-sm hover:shadow-md transition-shadow lg:col-start-2 lg:col-span-1 sm:col-span-2">
                <div className="p-3 rounded-full bg-red-50">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure Management</h3>
                <p className="text-sm text-slate-600">
                  Digital registration and centralized database capturing full information securely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-red-100 bg-slate-50">
        <p className="text-xs text-slate-500">
          © 2026 FPR Inkotanyi Management System (Niboye Sector). All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-primary transition-colors text-slate-500" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-primary transition-colors text-slate-500" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
