import React, { useState } from "react";

const ScenarioForm = () => {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await res.json();
      setResult(data.analysis || data.error);
    } catch (err) {
      setResult("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-lg font-semibold">
          Enter Scenario:
        </label>
        <input
          type="text"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Type your scenario..."
          required
        />
        <button
          type="submit"
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h2 className="font-semibold">Analysis:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default ScenarioForm;
