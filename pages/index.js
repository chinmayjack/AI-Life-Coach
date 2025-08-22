// pages/index.js
import { useState } from "react";

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [persona, setPersona] = useState("life");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, persona }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setResponse((prev) => prev + chunk); // live update
      }

      console.log("Final AI response:", result);
    } catch (err) {
      console.error("Fetch error:", err);
      setResponse("❌ Failed to fetch AI response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">AI Life Coach</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md"
      >
        <label className="block mb-4">
          <span className="font-medium">Choose Persona:</span>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="life">Life Coach</option>
            <option value="career">Career Coach</option>
            <option value="fitness">Fitness Coach</option>
            <option value="finance">Finance Coach</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className="font-medium">Your Scenario:</span>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
            rows="4"
            placeholder="Type your situation here..."
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask Coach"}
        </button>
      </form>

      <div className="w-full max-w-lg mt-6 bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">Coach Response:</h2>
        <div className="whitespace-pre-wrap text-gray-800">
          {response || "No response yet."}
        </div>
      </div>
    </div>
  );
}
