import ScenarioForm from "../components/ScenarioForm";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Scenario Analyzer</h1>
      <ScenarioForm />
    </main>
  );
}
