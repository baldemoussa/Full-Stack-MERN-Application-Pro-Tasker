import AppHeader from "../components/AppHeader";

export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My projects</h1>
        <p className="mt-2 text-stone-600">List of projects.</p>
      </main>
    </>
  );
}
