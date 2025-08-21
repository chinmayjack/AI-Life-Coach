"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [persona, setPersona] = useState("General");
  const messagesEndRef = useRef(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: input, persona }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";
      setMessages(prev => [...prev, { role: "ai", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value);
        setMessages(prev =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, text: aiText } : msg
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="page">
      <div className="app-container">
        <h1>💡 Life Coach AI</h1>
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="input-area">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
            placeholder="Type your scenario..."
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
      {/* style jsx here strictly CSS */}
    </div>
  );
}
