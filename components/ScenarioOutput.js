export default function ScenarioOutput({ result }) {
  if (!result) return null;

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-200 transform transition hover:scale-102 duration-300 mt-6">
      <h2 className="text-3xl font-bold mb-4 text-indigo-700">AI Recommendations</h2>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
        {result}
      </p>
    </div>
  );
}
