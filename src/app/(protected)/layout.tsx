"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Calendar,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parse/new", label: "New Parse", icon: Plus },
  { href: "/calendars", label: "Calendars", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-sidebar border-r border-border p-4 sticky top-0 h-screen">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 mb-8 cursor-pointer"
        >
          <Calendar className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-text">ParseCal</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-bg hover:text-text"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-text-muted hover:bg-bg hover:text-error cursor-pointer w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border flex items-center justify-around py-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[10px] cursor-pointer ${
                isActive ? "text-primary" : "text-text-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-1.5 text-text-muted cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}
