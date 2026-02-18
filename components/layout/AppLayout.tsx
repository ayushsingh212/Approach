import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-16 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
