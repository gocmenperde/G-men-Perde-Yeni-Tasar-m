"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/sidebar";

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-sm lg:hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
              aria-label="Menüyü aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight">GÖÇMEN</span>
              <span className="text-zinc-600 text-sm">·</span>
              <span className="text-zinc-400 text-sm">Admin</span>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
