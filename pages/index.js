"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [persona, setPersona] = useState("General");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: userInput, persona }),
      });

      if (!res.ok) throw new Error("API error");

      // Placeholder for streaming response
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
      let fullResponse = "";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="app-container">
        <h1>💡 AI Life Coach</h1>

        {/* Persona selector */}
        <div className="persona-selector">
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            <option value="General">General Coach</option>
            <option value="Career">Career Coach</option>
            <option value="Finance">Finance Coach</option>
            <option value="Health">Health Coach</option>
          </select>
        </div>

        {/* Chat window */}
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="error">{error}</p>}

        {/* Input area */}
        <div className="input-area">
          <textarea
            rows={2}
            placeholder="Type your scenario..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .page {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-family: 'Inter', sans-serif;
        }
        .app-container {
          width: 600px;
          max-width: 90%;
          background: #1f1f2f;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        h1 {
          color: #fff;
          text-align: center;
          margin-bottom: 15px;
        }
        .persona-selector {
          margin-bottom: 10px;
          text-align: center;
        }
        .chat-window {
          flex: 1;
          min-height: 350px;
          max-height: 500px;
          overflow-y: auto;
          padding: 15px;
          background: #2b2b3b;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chat-bubble {
          padding: 12px 18px;
          border-radius: 20px;
          max-width: 75%;
          word-wrap: break-word;
        }
        .chat-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.assistant {
          align-self: flex-start;
          background: linear-gradient(135deg, #434343, #5e5e6a);
          color: #f0f0f0;
          border-bottom-left-radius: 4px;
        }
        .input-area {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        textarea {
          flex: 1;
          padding: 12px;
          border-radius: 16px;
          border: none;
          outline: none;
          resize: none;
          font-size: 16px;
        }
        button {
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          border: none;
          border-radius: 16px;
          padding: 0 25px;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          color: #ff6b6b;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
