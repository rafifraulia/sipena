"use client";

import Link from "next/link";
import { Home, Calendar, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Untuk mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // Untuk desktop collapse

  const toggleSidebar = () => {
    // Mobile: toggle show/hide
    // Desktop: toggle collapse/expand
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Overlay untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-slate-900 flex flex-col fixed h-full z-50 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          w-64
          lg:translate-x-0
        `}
      >
        {/* Logo/Brand */}
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? "lg:justify-center lg:p-4" : "justify-between"}`}>
          <div className={isCollapsed ? "lg:hidden" : ""}>
            <h1 className="text-white font-bold text-xl tracking-tight">SIPENA</h1>
            <p className="text-slate-400 text-xs mt-1">Admin Dashboard</p>
          </div>
          {/* Icon untuk collapsed state */}
          {isCollapsed && (
            <div className="hidden lg:block">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
          )}
          {/* Tombol Close untuk Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
            title="Home"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>Home</span>
          </Link>

          <Link
            href="/dashboard/kegiatan"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
            title="Kegiatan"
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className={isCollapsed ? "lg:hidden" : ""}>Kegiatan</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-800 ${isCollapsed ? "lg:hidden" : ""}`}>
          <p className="text-xs text-slate-500 text-center">
            © 2026 SIPENA
          </p>
        </div>
      </aside>

      {/* Main Content Area with Topbar */}
      <div className={`flex-1 w-full transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Topbar */}
        <header className={`bg-white h-16 shadow-sm flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 left-0 z-30 transition-all duration-300 ${isCollapsed ? "lg:left-20" : "lg:left-64"}`}>
          {/* Left Side - Menu Button & Brand (Mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden">
              <h1 className="text-slate-900 font-bold text-lg">SIPENA</h1>
            </div>
          </div>

          {/* Right Side - Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 min-h-screen bg-slate-50">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

