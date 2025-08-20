"use client"; // ensures React Hooks work

import { useEffect, useState } from "react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch("/api/feedback");
        if (!res.ok) throw new Error("Failed to fetch feedback");
        const data = await res.json();
        setFeedback(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  if (loading) return <p className="p-6">Loading feedback...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Feedback</h1>
      {feedback.length === 0 && <p>No feedback yet.</p>}
      <div className="space-y-4">
        {feedback.map(f => (
          <div key={f.id} className="p-4 bg-gray-50 border rounded-lg shadow-sm">
            <p><strong>Scenario:</strong> {f.scenario}</p>
            <p><strong>AI Result:</strong> {f.result}</p>
            {f.feedback && <p><strong>User Feedback:</strong> {f.feedback}</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
