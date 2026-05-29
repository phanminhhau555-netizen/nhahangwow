import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-soft-grid flex min-h-screen bg-[#eff1ea]">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="min-w-0 flex-1 overflow-auto px-5 py-4 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
