import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "diasense_chat_history_v1";
const API_BASE = "http://localhost:5000/api";

// ✅ Change this to your real chatbot endpoint if you have one
// Example: "/chat" or "/ai/chat" etc.
const CHAT_ENDPOINT = "/chatbot"; // -> POST http://localhost:5000/api/chatbot

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  // ---------- Fallback (local reply) ----------
  const localBotReply = (text) => {
    const t = text.toLowerCase();

    if (t.includes("diabetes") || t.includes("blood sugar")) {
      return "Diabetes is a condition where blood glucose is too high. If you want, tell me your symptoms or test values and I can guide you on general next steps (not a medical diagnosis).";
    }
    if (t.includes("appointment") || t.includes("book")) {
      return "To book an appointment, go to Doctors → select a doctor → Book → choose date & time slot → confirm.";
    }
    if (t.includes("login") || t.includes("register")) {
      return "Use Register to create an account, then Login to get access to the dashboard features.";
    }
    if (t.includes("help")) {
      return "I can help with: appointments, doctors, dashboard navigation, and general diabetes-related guidance.";
    }

    return "Thanks! Tell me more—what exactly do you need help with?";
  };

  // ---------- API call ----------
  const callChatApi = async (userMessage) => {
    // Expected backend response formats supported:
    // 1) { reply: "..." }
    // 2) { message: "..." }
    // 3) { output: "..." }
    // 4) plain text response
    const res = await fetch(`${API_BASE}${CHAT_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const contentType = res.headers.get("content-type") || "";

    let data;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const msg =
        (typeof data === "object" && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        "Chat request failed";
      throw new Error(msg);
    }

    // normalize output
    if (typeof data === "string") return data;
    return data.reply || data.message || data.output || "No reply received.";
  };

  const sendMessage = async () => {
    if (!canSend) return;

    const userText = input.trim();
    setInput("");
    setError("");

    const newUserMsg = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      role: "user",
      text: userText,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      // Try API first
      let botText = "";
      try {
        botText = await callChatApi(userText);
      } catch (apiErr) {
        // If API is not ready or endpoint doesn't exist, fallback locally
        botText = localBotReply(userText);
      }

      const newBotMsg = {
        id: crypto?.randomUUID?.() || String(Date.now() + 1),
        role: "bot",
        text: botText,
        time: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
            <p className="text-gray-600 mt-1">
              Ask about appointments, doctors, or general diabetes-related guidance.
            </p>
          </div>

          <button
            onClick={clearChat}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Chat Box */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {/* Messages area */}
          <div className="h-[65vh] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p className="font-medium">No messages yet.</p>
                <p className="text-sm mt-1">
                  Try: “How to book an appointment?” or “What is diabetes?”
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-gray-50 text-gray-900 border-gray-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div
                      className={`mt-1 text-[11px] ${
                        m.role === "user" ? "text-indigo-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(m.time).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading bubble */}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm border bg-gray-50 text-gray-900 border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                    <span className="text-gray-500 ml-1">Typing…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4 bg-white">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                className="flex-1 min-h-[48px] max-h-[140px] resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {token
                ? "Authenticated session detected (token found)."
                : "No token found — chatbot still works in fallback mode."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;