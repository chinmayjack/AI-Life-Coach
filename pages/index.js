// pages/index.js
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [persona, setPersona] = useState("General"); // default persona
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [scenario, setScenario] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    setError("");

    setMessages((prev) => [...prev, { role: "user", content: scenario }]);
    setScenario("");

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await resp.json();

      if (resp.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.analysis }]);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="app-container">
        <h1>💡 Life Coach AI</h1>

        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <p className="error">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Choose Coach Persona:
          </label>
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="General">General Coach</option>
            <option value="Career">Career Coach</option>
            <option value="Finance">Finance Coach</option>
            <option value="Health">Health Coach</option>
          </select>
        </div>
        <div className="input-area">
          <textarea
            rows={2}
            placeholder="Type your situation..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>

      <style jsx>{`
        body, html {
          margin: 0;
          padding: 0;
        }

        .page {
          height: 100vh;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Inter', sans-serif;
        }

        .app-container {
          width: 600px;
          max-width: 90%;
          background: #1f1f2f;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        h1 {
          text-align: center;
          color: #fff;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #2b2b3b;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 350px;
          max-height: 500px;
        }

        .chat-bubble {
          padding: 12px 18px;
          border-radius: 20px;
          max-width: 80%;
          word-wrap: break-word;
          font-size: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }

        .chat-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .chat-bubble.ai {
          align-self: flex-start;
          background: linear-gradient(135deg, #434343, #5e5e6a);
          color: #f0f0f0;
          border-bottom-left-radius: 4px;
        }

        .input-area {
          display: flex;
          margin-top: 15px;
          gap: 10px;
        }

        textarea {
          flex: 1;
          padding: 12px;
          border-radius: 16px;
          border: none;
          background: #2b2b3b;
          color: #fff;
          font-size: 16px;
          resize: none;
          outline: none;
        }

        textarea::placeholder {
          color: #aaa;
        }

        button {
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          border: none;
          border-radius: 16px;
          padding: 0 25px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          color: #ff6b6b;
          margin-top: 10px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
