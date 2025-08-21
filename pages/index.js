"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [persona, setPersona] = useState("General");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Add user's message
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    // Clear input
    setInput("");

    // Send to API
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: input, persona }),
    });

    if (!res.ok) return;

    // Stream AI response
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";
    setMessages((prev) => [...prev, { role: "ai", text: "" }]); // placeholder

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      aiText += decoder.decode(value);
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, text: aiText } : msg
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 flex flex-col p-4">
      <h1 className="text-3xl font-bold text-center mb-4">AI Life Context Coach</h1>

      {/* Persona Selector */}
      <div className="mb-4 flex justify-center">
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

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-white rounded-2xl shadow-lg">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[75%] p-3 rounded-2xl ${
              msg.role === "user"
                ? "bg-indigo-500 text-white ml-auto"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          rows={2}
          placeholder="Describe your scenario..."
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
