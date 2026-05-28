import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="admin-soft-grid flex min-h-screen bg-[#eff1ea]">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto px-5 py-4">
        {children}
      </main>
    </div>
  );
}
