import { Link, Outlet } from "@tanstack/react-router";

const navItems = [
  { label: "Home", to: "/" },
  { label: "MiniERP", to: "/sandbox/erp" },
  { label: "Capture (demo)", to: "/capture/$sid", params: { sid: "demo" } },
] as const;

function AppSidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          S
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          Sidekik
        </span>
      </div>

      <nav className="mt-2 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            params={"params" in item ? item.params : undefined}
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <p className="px-3 text-xs text-muted-foreground">More coming soon</p>
      </div>
    </aside>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
