import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, getToken } from "@/lib/api";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      type: "bot",
      content:
        "Hello! I'm your DiaSense AI assistant. Ask me about diabetes, prediction help, diet, exercise, or booking a doctor.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const addMessage = (type: "user" | "bot", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (isTyping) return;

    // add user message immediately
    addMessage("user", text);
    setInput("");
    setIsTyping(true);

    try {
      // If route is protected and user not logged in
      const token = getToken?.();
      if (!token) {
        addMessage(
          "bot",
          "You need to login to use the chatbot. Please login and try again."
        );
        setIsTyping(false);
        return;
      }

      const data = await api.chatbotMessage(text);

      // Show the bot reply
      addMessage("bot", data.reply);

      // (Optional) you can also show intent/confidence for debugging:
      // addMessage("bot", `Intent: ${data.intent} (${Math.round(data.confidence * 100)}%)\n\n${data.reply}`);

    } catch (err: any) {
      const msg = String(err?.message || "");

      if (msg.toLowerCase().includes("access denied") || msg.toLowerCase().includes("token")) {
        addMessage("bot", "Access denied. Please login again and try.");
      } else {
        addMessage("bot", "Sorry, chatbot service is not available right now.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              variant="chat"
              size="iconLg"
              onClick={() => setIsOpen(true)}
              className="animate-bounce-gentle"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-card rounded-2xl shadow-strong border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">DiaSense AI</h3>
                  <p className="text-xs text-primary-foreground/80">
                    Your health assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-primary-foreground/20 transition-colors"
              >
                <X className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </div>

                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-full"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* small helper */}
              <div className="mt-2 text-xs text-muted-foreground">
                Tip: Login is required for chatbot.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;